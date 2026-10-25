#!/usr/bin/env python3
"""Render the user-supplied self-unpacking demos and retain exact content fragments.

Requires the raw authority files under .migration/demo-authority/source and a local
HTTP server exposing that directory. Image blob URLs are replaced by the verified
destination Cloudinary URLs using SHA-256 byte identity.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index", "about", "team", "contact", "page", "sitemap", "404", "category", "author", "article"]


def run(args: list[str], *, timeout: int = 120) -> str:
    result = subprocess.run(args, text=True, capture_output=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError(f"command failed ({result.returncode}): {' '.join(args)}\n{result.stdout}\n{result.stderr}")
    return result.stdout.strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:8999")
    parser.add_argument("--session", default="snd-authority-extract")
    args = parser.parse_args()

    manifest = json.loads((ROOT / "src/data/state-news-demo-assets.json").read_text())
    image_urls = {item["sha256"]: item["cloudinary_url"] for item in manifest["assets"].values()}
    image_map = json.dumps(image_urls, separators=(",", ":"))
    output_dir = ROOT / "src/data/demo-html"
    output_dir.mkdir(parents=True, exist_ok=True)

    run(["agent-browser", "--session", args.session, "open", f"{args.base_url}/index.html"])
    run(["agent-browser", "--session", args.session, "set", "viewport", "1440", "900"])

    for page in PAGES:
        run(["agent-browser", "--session", args.session, "open", f"{args.base_url}/{page}.html"])
        run(["agent-browser", "--session", args.session, "wait", "1800"])
        expression = f"""(async()=>{{
          const urls={image_map};
          const hex=(buffer)=>Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
          for(const image of document.querySelectorAll('img')){{
            const bytes=await (await fetch(image.src)).arrayBuffer();
            const digest=hex(await crypto.subtle.digest('SHA-256',bytes));
            if(!urls[digest]) throw new Error('unmapped-image:'+digest);
            image.setAttribute('src',urls[digest]);
          }}
          const header=document.querySelector('header');
          const footer=document.querySelector('footer');
          if(!header||!footer||header.parentElement!==footer.parentElement) throw new Error('shared-chrome-not-found');
          const children=Array.from(header.parentElement.children);
          const start=children.indexOf(header)+1;
          const end=children.indexOf(footer);
          if(start<1||end<start) throw new Error('invalid-content-boundary');
          return children.slice(start,end).map(node=>node.outerHTML).join('');
        }})()"""
        encoded = run(["agent-browser", "--session", args.session, "eval", expression])
        html = json.loads(encoded)
        if not html.strip() or "blob:" in html or "State News Central" in html:
            raise RuntimeError(f"authority extraction failed for {page}")
        (output_dir / f"{page}.html").write_text(html, encoding="utf-8")
        print(json.dumps({"page": page, "bytes": len(html.encode()), "images": html.count("<img")}, separators=(",", ":")))

    run(["agent-browser", "--session", args.session, "close"])


if __name__ == "__main__":
    main()
