#!/usr/bin/env python3
"""Extract, deduplicate, upload, and verify all images from raw demo authority."""
from __future__ import annotations
import base64, gzip, hashlib, json, mimetypes, os, re, shutil, time, urllib.parse, urllib.request, uuid
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'.migration/demo-authority/source'
PUBLIC=ROOT/'public/demo-assets'
MANIFEST=ROOT/'src/data/state-news-demo-assets.json'
FOLDER='statenewsdigest/demo-v2'

def load_env(path:Path):
 out={}
 for raw in path.read_text().splitlines():
  if '=' in raw and not raw.lstrip().startswith('#'):
   k,v=raw.split('=',1);out[k.strip()]=v.strip().strip('"\'')
 return out

def multipart(fields,file_name,content_type,body):
 boundary='----HermesMigration'+uuid.uuid4().hex;chunks=[]
 for k,v in fields.items():chunks += [f'--{boundary}\r\n'.encode(),f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode(),str(v).encode(),b'\r\n']
 chunks += [f'--{boundary}\r\n'.encode(),f'Content-Disposition: form-data; name="file"; filename="{file_name}"\r\n'.encode(),f'Content-Type: {content_type}\r\n\r\n'.encode(),body,b'\r\n',f'--{boundary}--\r\n'.encode()]
 return b''.join(chunks),boundary

def post(cloud,endpoint,fields,secret,file=None):
 signed={k:str(v) for k,v in fields.items()};base='&'.join(f'{k}={signed[k]}' for k in sorted(signed))+secret
 signed['signature']=hashlib.sha1(base.encode()).hexdigest();signed['api_key']=ENV['CLOUDINARY_API_KEY']
 if file:
  encoded,boundary=multipart(signed,*file);headers={'Content-Type':f'multipart/form-data; boundary={boundary}'}
 else:
  encoded=urllib.parse.urlencode(signed).encode();headers={'Content-Type':'application/x-www-form-urlencoded'}
 req=urllib.request.Request(f'https://api.cloudinary.com/v1_1/{cloud}/image/{endpoint}',data=encoded,headers={**headers,'User-Agent':'StateNewsDigest-Migration/1.0'},method='POST')
 with urllib.request.urlopen(req,timeout=120) as r:return json.load(r)

def fetch(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'StateNewsDigest-Migration/1.0'}),timeout=90) as r:return r.read()

def raw_images():
 assets={}
 for page in sorted(RAW.glob('*.html')):
  text=page.read_text(errors='ignore');match=re.search(r'<script type="__bundler/manifest">([\s\S]*?)</script>',text)
  if not match:raise SystemExit(f'missing manifest: {page.name}')
  for entry in json.loads(match.group(1)).values():
   mime=str(entry.get('mime',''))
   if not mime.startswith('image/'):continue
   body=base64.b64decode(entry['data']);body=gzip.decompress(body) if entry.get('compressed') else body
   guessed=mimetypes.guess_extension(mime) or '.bin'
   sha=hashlib.sha256(body).hexdigest();ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}.get(mime,guessed.lstrip('.'))
   assets[f'{sha}.{ext}']={'body':body,'mime':mime,'sha256':sha}
 return assets

ENV={**load_env(ROOT/'.env'),**os.environ}
cloud=ENV.get('CLOUDINARY_CLOUD_NAME','');secret=ENV.get('CLOUDINARY_API_SECRET','')
if not cloud or not secret:raise SystemExit('Cloudinary credentials missing')
assets=raw_images()
if len(assets)!=23:raise SystemExit(f'expected 23 deduplicated authority images, found {len(assets)}')
PUBLIC.mkdir(parents=True,exist_ok=True)
for p in PUBLIC.iterdir():
 if p.is_file() and p.name not in assets:p.unlink()
proof=[];document={'schema':'state-news-digest-demo-assets-v2','folder':FOLDER,'assets':{}}
for name,item in sorted(assets.items()):
 body=item['body'];(PUBLIC/name).write_bytes(body);public_id=f'{FOLDER}/{item["sha256"]}'
 result=post(cloud,'upload',{'overwrite':'true','public_id':public_id,'timestamp':int(time.time())},secret,(name,item['mime'],body))
 url=str(result.get('secure_url',''))
 if result.get('public_id')!=public_id or f'/{public_id}.' not in url:raise SystemExit(f'upload drift {name}')
 if hashlib.sha256(fetch(url)).hexdigest()!=item['sha256']:raise SystemExit(f'delivery drift {name}')
 document['assets'][name]={'bytes':len(body),'cloudinary_url':url,'mime':item['mime'],'sha256':item['sha256']}
 proof.append({'name':name,'public_id':public_id,'bytes':len(body),'sha256':item['sha256'],'delivery_verified':True})
 print(f'AUTHORITY_ASSET_PASS {name} {len(body)}')
# Remove stale assets from this migration-owned folder only.
key=ENV['CLOUDINARY_API_KEY'];auth=base64.b64encode(f'{key}:{secret}'.encode()).decode();cursor='';remote=[]
while True:
 q=urllib.parse.urlencode({'prefix':FOLDER+'/','max_results':500,**({'next_cursor':cursor} if cursor else {})})
 req=urllib.request.Request(f'https://api.cloudinary.com/v1_1/{cloud}/resources/image/upload?{q}',headers={'Authorization':f'Basic {auth}','User-Agent':'StateNewsDigest-Migration/1.0'})
 with urllib.request.urlopen(req,timeout=90) as r:data=json.load(r)
 remote += [x['public_id'] for x in data.get('resources',[])];cursor=data.get('next_cursor','')
 if not cursor:break
wanted={x['public_id'] for x in proof};deleted=[]
for public_id in sorted(set(remote)-wanted):
 result=post(cloud,'destroy',{'invalidate':'true','public_id':public_id,'timestamp':int(time.time())},secret)
 if result.get('result') not in {'ok','not found'}:raise SystemExit(f'destroy failed {public_id}')
 deleted.append(public_id)
logo_name=next((name for name in document['assets'] if name.startswith('ce9bb2415a7832722')),None)
if not logo_name:raise SystemExit('authoritative logo missing')
document['logo']=document['assets'][logo_name]['cloudinary_url']
MANIFEST.write_text(json.dumps(document,indent=2)+'\n')
evidence=ROOT/'.migration/evidence';evidence.mkdir(parents=True,exist_ok=True)
(evidence/'cloudinary-authoritative-assets.json').write_text(json.dumps({'folder':FOLDER,'count':len(proof),'deleted_stale_count':len(deleted),'assets':proof},indent=2)+'\n')
print(f'CLOUDINARY_AUTHORITY_PASS count={len(proof)} deleted_stale={len(deleted)}')
