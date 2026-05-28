#!/usr/bin/env python3
"""
Inject `gallery: [...]` frontmatter into each portfolio MDX, sourced from
_source/imagery-migration.json. The hero image is excluded from the gallery
(it's already rendered in the hero block). Idempotent: replaces any existing
gallery: block.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MDX_DIR = ROOT / "website" / "src" / "content" / "portfolio"
SUMMARY = ROOT / "_source" / "imagery-migration.json"


def update_mdx(slug: str, paths: list[str]) -> None:
    mdx = MDX_DIR / f"{slug}.mdx"
    if not mdx.exists():
        print(f"  ! missing MDX: {mdx}")
        return
    text = mdx.read_text()

    # Determine hero filename to exclude it from gallery.
    hero_match = re.search(r'heroImage:\s*"([^"]+)"', text)
    hero_path = hero_match.group(1) if hero_match else None
    gallery_paths = [p for p in paths if p != hero_path]

    # Build YAML block.
    if gallery_paths:
        gallery_block = "gallery:\n" + "\n".join(f'  - "{p}"' for p in gallery_paths) + "\n"
    else:
        gallery_block = "gallery: []\n"

    # Replace existing gallery: block if present (single-line or multi-line).
    pattern_multi = re.compile(r"^gallery:\s*\n(?:  - .*\n)+", re.MULTILINE)
    pattern_inline = re.compile(r"^gallery:\s*\[[^\]]*\]\s*\n", re.MULTILINE)

    if pattern_multi.search(text):
        new_text = pattern_multi.sub(gallery_block, text, count=1)
    elif pattern_inline.search(text):
        new_text = pattern_inline.sub(gallery_block, text, count=1)
    else:
        # Insert before the closing --- of frontmatter.
        # The frontmatter ends at the second `---` on its own line.
        lines = text.splitlines(keepends=True)
        delim_indices = [i for i, ln in enumerate(lines) if ln.rstrip() == "---"]
        if len(delim_indices) < 2:
            print(f"  ! could not find frontmatter end in {mdx.name}")
            return
        insert_at = delim_indices[1]
        lines.insert(insert_at, gallery_block)
        new_text = "".join(lines)

    if new_text != text:
        mdx.write_text(new_text)
        print(f"  updated {slug:<45} ({len(gallery_paths)} images)")
    else:
        print(f"  unchanged {slug:<45}")


def main() -> None:
    data = json.loads(SUMMARY.read_text())
    for slug in sorted(data):
        update_mdx(slug, data[slug])


if __name__ == "__main__":
    main()
