#!/usr/bin/env python3
"""
Re-parse the original Elementor case study HTML for every portfolio slug
into clean MDX sections + bullets, preserving heroImage / wordmark /
gallery / order / featured / services from the existing MDX.

Source pattern (per /portfolio/<slug>/index.html):
  <h4>NN</h4>              -> section number
  <h4>Heading</h4>         -> section heading
  <p>Body paragraph</p>    -> section body
  <li style="font-weight: 400">...</li>...  -> bullets associated with the
                                              most recently opened section

Skips testimonial blockquotes and any section whose body is the page
footer ("Head Office Rooftop Twenty Two...").
"""
from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_source" / "mirror" / "portfolio"
MDX_DIR = ROOT / "website" / "src" / "content" / "portfolio"

NUMBER_RE = re.compile(r"^(0[1-9]|10|11|12)$")
FOOTER_MARKERS = ("Head Office", "Claremont Avenue", "D11 YNR2")
TESTIMONIAL_OPEN = ("“", '"', "“")
# Hand-curated set of strings that signal sidebar widget noise rather than
# real case study body content.
NOISE_SUBSTRINGS = (
    "Director of",
    "CEO of",
    "Founder of",
    "Find us on social",
    "Have a similar project",
    "Back to all projects",
    "Connect with us",
    "All rights reserved",
)


def is_attribution(body: str) -> bool:
    if len(body) < 60 and ("," in body) and any(s in body for s in (
        "Director", "CEO", "Founder", "Manager", "Partner", "Head ", "Chair",
    )):
        return True
    return any(s in body for s in NOISE_SUBSTRINGS)


# Heading H4s that aren't section labels but are widget chrome.
NOISE_HEADINGS = {
    "Social Media", "Photography", "Videography", "Web Design",
    "Web Development", "Brand Strategy", "Brand Identity", "Brand Naming",
    "Find us on social", "Have a similar project", "Back to all projects",
}


def clean(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    s = s.replace("—", ",")  # em-dash sweep
    s = re.sub(r"\s+", " ", s).strip()
    return s


def yaml_quote(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


TOKEN_RE = re.compile(
    r"<h4[^>]*>(?P<h4>.*?)</h4>"
    r"|<li[^>]*style=\"font-weight:\s*400\"[^>]*>(?P<li>.*?)</li>"
    r"|<div[^>]*elementor-widget-text-editor[^>]*>(?P<editor>.*?)</div>\s*</div>",
    re.DOTALL,
)


def parse_sections(html_text: str) -> list[dict]:
    raw: list[dict] = []
    current_number: str | None = None
    current_heading: str | None = None
    current_body: str | None = None
    current_bullets: list[str] = []

    pending_number: str | None = None

    def flush() -> None:
        nonlocal current_number, current_heading, current_body, current_bullets
        if current_number and current_heading and current_body is not None:
            if not any(m in current_body for m in FOOTER_MARKERS):
                body = current_body
                head = current_heading.strip()
                if body.startswith(head + " "):
                    body = body[len(head) + 1 :]
                raw.append(
                    {
                        "number": current_number,
                        "heading": head,
                        "body": body.strip(),
                        "bullets": list(current_bullets),
                    }
                )
        current_number = None
        current_heading = None
        current_body = None
        current_bullets = []

    for m in TOKEN_RE.finditer(html_text):
        if m.group("h4"):
            text = clean(m.group("h4"))
            if not text or text in NOISE_HEADINGS:
                continue
            if NUMBER_RE.fullmatch(text):
                flush()
                pending_number = text
                continue
            if pending_number and current_heading is None:
                current_number = pending_number
                current_heading = text
                pending_number = None
        elif m.group("editor"):
            body = clean(m.group("editor"))
            if not body or body.startswith("/*!"):
                continue
            if body.startswith(TESTIMONIAL_OPEN):
                continue
            if is_attribution(body):
                continue
            if current_heading and current_body is None:
                current_body = body
        elif m.group("li"):
            text = clean(m.group("li"))
            if not text:
                continue
            if current_heading is not None:
                current_bullets.append(text)

    flush()

    cleaned: list[dict] = [s for s in raw if s["body"]]
    for s in cleaned:
        intro, bullets = split_body_with_bullets(s["body"])
        s["body"] = intro
        if bullets and not s["bullets"]:
            s["bullets"] = bullets
    for i, s in enumerate(cleaned, start=1):
        s["number"] = f"{i:02d}"
    return cleaned


# Words/phrases that introduce a smushed bullet list in the body text.
BULLET_TRIGGERS = (
    "areas included:",
    "focus areas included:",
    "approach included:",
    "priorities included:",
    "deliverables included:",
    "objectives included:",
    "key objectives:",
    "key focus areas:",
    "focus areas:",
    "scope included:",
    "what we did:",
    "the work included:",
)


def split_body_with_bullets(body: str) -> tuple[str, list[str]]:
    """Detect bullets smushed into the body and extract them.

    Two patterns supported:
      A. Lead-in paragraph ending with "...included:" followed by bullet
         fragments separated by capital letters with no sentence punctuation.
      B. Lead-in paragraph followed by a sub-heading-style phrase
         ("Web Design & Development", "Content & UX") and then bullets.

    Returns (cleaned_body, bullets).
    """
    lower = body.lower()
    cut_idx = -1
    for trig in BULLET_TRIGGERS:
        pos = lower.find(trig)
        if pos != -1:
            cut_idx = pos + len(trig)
            break

    if cut_idx == -1:
        return body, []

    intro = body[:cut_idx].rstrip()
    tail = body[cut_idx:].strip()
    if not tail:
        return body, []

    # Split tail on the "lowercase-letter then space then capital-letter"
    # boundary. Then merge any over-split fragments (proper nouns mid-phrase
    # like "Tap brand identity" or "LAB@TAP" can trigger false splits).
    fragments = [f for f in re.split(r"(?<=[a-z])\s+(?=[A-Z])", tail) if f.strip()]
    merged: list[str] = []
    for f in fragments:
        f = f.strip().rstrip(".")
        if merged and len(merged[-1]) < 30:
            merged[-1] = merged[-1] + " " + f
        elif merged and len(f) < 18:
            merged[-1] = merged[-1] + " " + f
        else:
            merged.append(f)

    if len(merged) < 2:
        return body, []

    return intro, merged


FM_FIELD_RE = re.compile(r'^(\w+):\s*(.*)$', re.M)


def parse_frontmatter(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.DOTALL)
    if not m:
        return {}, text
    fm_block = m.group(1)
    rest = text[m.end():]
    fm: dict[str, str] = {}
    for fm_line_match in FM_FIELD_RE.finditer(fm_block):
        k = fm_line_match.group(1)
        v = fm_line_match.group(2).strip()
        if v:
            fm[k] = v
    return fm, rest


def existing_field(fm: dict, key: str) -> str | None:
    if key not in fm:
        return None
    v = fm[key]
    # Strip surrounding quotes
    if v.startswith('"') and v.endswith('"'):
        return v[1:-1]
    return v


def build_mdx(slug: str, sections: list[dict], orig_fm_text: str) -> str:
    fm, _ = parse_frontmatter(orig_fm_text)

    # Identify preserved fields from the existing MDX.
    name = existing_field(fm, "name") or slug.replace("-", " ").title()
    tagline = existing_field(fm, "tagline") or ""
    summary = existing_field(fm, "summary") or ""
    hero = existing_field(fm, "heroImage") or ""
    wordmark = existing_field(fm, "wordmark") or ""
    order = existing_field(fm, "order") or "100"
    featured = existing_field(fm, "featured") or "false"

    # services + gallery are list fields. Pull from the raw text.
    services_match = re.search(r"^services:\s*\[(.*?)\]\s*$", orig_fm_text, re.M)
    services_block = services_match.group(0) if services_match else 'services: []'
    gallery_match = re.search(r"^gallery:\n((?:  - .*\n)+)", orig_fm_text, re.M)
    gallery_block = gallery_match.group(0).rstrip() if gallery_match else 'gallery: []'

    out: list[str] = ["---"]
    out.append(f"name: {yaml_quote(name)}")
    out.append(f"slug: {yaml_quote(slug)}")
    if tagline:
        out.append(f"tagline: {yaml_quote(tagline)}")
    if summary:
        out.append(f"summary: {yaml_quote(summary)}")
    if hero:
        out.append(f"heroImage: {yaml_quote(hero)}")
    if wordmark:
        out.append(f"wordmark: {yaml_quote(wordmark)}")
    out.append(f"order: {order}")
    out.append(f"featured: {featured}")
    out.append(services_block)

    out.append("sections:")
    for sec in sections:
        out.append(f'  - number: {yaml_quote(sec["number"])}')
        out.append(f'    heading: {yaml_quote(sec["heading"])}')
        out.append(f'    body: {yaml_quote(sec["body"])}')
        if sec["bullets"]:
            out.append('    bullets:')
            for b in sec["bullets"]:
                out.append(f'      - {yaml_quote(b)}')
        else:
            out.append('    bullets: []')

    out.append(gallery_block)
    out.append("---")
    out.append("")
    return "\n".join(out)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source mirror missing: {SRC}")
    counts: list[tuple[str, int, int]] = []
    for src_dir in sorted(SRC.iterdir()):
        if not src_dir.is_dir():
            continue
        idx = src_dir / "index.html"
        if not idx.exists():
            continue
        slug = src_dir.name
        mdx_path = MDX_DIR / f"{slug}.mdx"
        if not mdx_path.exists():
            continue

        html_text = idx.read_text()
        sections = parse_sections(html_text)
        if not sections:
            print(f"  ! {slug}: 0 sections parsed, skipping")
            continue

        new_mdx = build_mdx(slug, sections, mdx_path.read_text())
        mdx_path.write_text(new_mdx)
        bullets_total = sum(len(s["bullets"]) for s in sections)
        counts.append((slug, len(sections), bullets_total))

    counts.sort()
    print(f"{'slug':<45}  sections  bullets")
    for slug, secs, bullets in counts:
        print(f"  {slug:<43}  {secs:>3}  {bullets:>5}")
    print(f"\nProcessed {len(counts)} files.")


if __name__ == "__main__":
    main()
