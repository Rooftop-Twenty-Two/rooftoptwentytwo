#!/usr/bin/env python3
"""
Per-slug image migration: copy non-thumbnail wp-content/uploads images that
match each slug's prefix into website/public/images/portfolio/<slug>/.

Outputs a JSON summary keyed by slug, listing the public paths of every
image migrated. The build step will consume this to update gallery fields
in each MDX.
"""
from __future__ import annotations
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_UPLOADS = ROOT / "_source" / "mirror" / "wp-content" / "uploads"
DEST_BASE = ROOT / "website" / "public" / "images" / "portfolio"

# slug -> list of filename prefixes (case-insensitive substring match)
SLUG_PREFIXES = {
    "abington-design-house": ["Abington"],
    "accounting-technicians-ireland-ati": ["Accounting-Technicians-Ireland", "ATI_"],
    "agri-aware": ["Agri-Aware", "Agri_Aware"],
    "antaris-consulting": ["Antaris"],
    "best4travel": ["Best4Travel"],
    "bloomfield-health-services": ["Bloomfield"],
    "breast-cancer-ireland": ["Breast-Cancer-Ireland", "BCI_"],
    "capella": ["Capella"],
    "european-milk-forum": ["European-Milk-Forum", "EMF_"],
    "funkk": ["Funkk"],
    "gourmet-food-parlour": ["GFP_", "GFP-", "Gourmet-Food-Parlour"],
    "guinness-cork-jazz": ["Guinness", "Cork-Jazz", "Macy-Gray"],
    "irish-chauffeurs": ["Irish-Chauffeurs"],
    "joseph-may": ["Joseph-May", "Heritage-project"],
    "kinore": ["Kinore"],
    "midlands-park-hotel": ["MPH_", "Midlands-Park"],
    "moo-crew": ["Moo-Crew"],
    "pluto": ["Pluto"],
    "shalford-interiors": ["Shalford"],
    "tap-creative": ["Tap_", "Tap-"],
    "tc-matthews-2": ["TC-Matthews", "TC_Matthews"],
    "the-1933-furniture-company": ["1933_", "1933-"],
    "the-irish-defence-forces": ["Irish-Defense-Forces", "Defence-Forces", "IDF_"],
    "think-group": ["Think_", "Think-"],
    "tradoodle": ["Tradoodle"],
    "turnua": ["Turnua"],
}

# Reject filenames that contain a size suffix like -300x300, -768x432, -212x300, etc.
SIZE_SUFFIX_RE = re.compile(r"-\d{2,4}x\d{2,4}(?=\.[A-Za-z]+$)")

# Image extensions we accept
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}


def is_thumbnail(name: str) -> bool:
    return bool(SIZE_SUFFIX_RE.search(name))


def find_uploads() -> list[Path]:
    return [p for p in SOURCE_UPLOADS.rglob("*") if p.is_file() and p.suffix.lower() in EXTENSIONS]


def main() -> None:
    if not SOURCE_UPLOADS.exists():
        raise SystemExit(f"Source uploads dir missing: {SOURCE_UPLOADS}")
    DEST_BASE.mkdir(parents=True, exist_ok=True)

    all_files = find_uploads()
    summary: dict[str, list[str]] = {}
    collisions: list[str] = []

    for slug, prefixes in SLUG_PREFIXES.items():
        dest_dir = DEST_BASE / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        copied: list[Path] = []
        seen_basenames: set[str] = set()

        for src in all_files:
            name = src.name
            if is_thumbnail(name):
                continue
            if not any(p.lower() in name.lower() for p in prefixes):
                continue
            if name in seen_basenames:
                continue
            dest = dest_dir / name
            if dest.exists():
                # Keep larger of the two
                if dest.stat().st_size >= src.stat().st_size:
                    seen_basenames.add(name)
                    copied.append(dest)
                    continue
            shutil.copy2(src, dest)
            seen_basenames.add(name)
            copied.append(dest)

        # Build web paths (relative to public/)
        web_paths = sorted(
            f"/images/portfolio/{slug}/{p.name}" for p in copied
        )
        summary[slug] = web_paths

    out = ROOT / "_source" / "imagery-migration.json"
    out.write_text(json.dumps(summary, indent=2, sort_keys=True))
    total = sum(len(v) for v in summary.values())
    print(f"Migrated {total} files across {len(summary)} slugs.")
    for slug, paths in summary.items():
        print(f"  {slug:<45} {len(paths):3d} files")
    print(f"Summary written to {out}")


if __name__ == "__main__":
    main()
