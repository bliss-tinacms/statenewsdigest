#!/usr/bin/env python3
"""Verify Tina/Astro island payloads are real, not fake empty visual-editing forms.

Usage:
  python scripts/verify-tina-islands.py \
    --check page:https://example.com/tina-island/page?slug=about:page \
    --check blog:https://example.com/tina-island/blog?slug=sample-post:blog

Optional field verification:
  python scripts/verify-tina-islands.py \
    --check home:https://example.com/tina-island/page?slug=home:page \
    --field buttonText
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from dataclasses import dataclass

import requests


@dataclass
class Check:
    name: str
    url: str
    root: str


def parse_check(value: str) -> Check:
    try:
        name, remainder = value.split(":", 1)
        url, root = remainder.rsplit(":", 1)
    except ValueError as exc:
        raise argparse.ArgumentTypeError("check must be name:url:root") from exc
    if not url.startswith(("http://", "https://")):
        raise argparse.ArgumentTypeError("url must start with http:// or https://")
    return Check(name=name, url=url, root=root)


def extract_payload(text: str) -> dict:
    match = re.search(r'data-tina-form="([^"]+)"', text)
    if not match:
        return {}
    return json.loads(html.unescape(match.group(1)))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="append", type=parse_check, required=True)
    parser.add_argument("--field", action="append", default=[], help="Field name that must appear in query and HTML")
    parser.add_argument("--timeout", type=int, default=180)
    args = parser.parse_args()

    headers = {
        "Content-Type": "application/x-tina-preview+json",
        "X-Tina-Prime": "1",
        "Cache-Control": "no-cache",
    }
    all_ok = True
    for check in args.check:
        response = requests.post(check.url, headers=headers, data="{}", timeout=args.timeout)
        payload = extract_payload(response.text)
        query = payload.get("query", "")
        data = payload.get("data", {})
        data_keys = list(data.keys()) if isinstance(data, dict) else []
        fake = (not query) or data_keys == ["_content_source"]
        fields_ok = all(field in query and field in response.text for field in args.field)
        ok = response.status_code == 200 and not fake and check.root in data and fields_ok
        all_ok = all_ok and ok
        print(
            check.name,
            "status", response.status_code,
            "query_len", len(query),
            "data_keys", data_keys,
            "fake", fake,
            "fields_ok", fields_ok,
            "OK", ok,
        )
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
