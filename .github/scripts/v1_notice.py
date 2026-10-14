"""Mark the archived v1 build as superseded by v2.

The deploy workflow runs this on the assembled v1 directory, after the v1.0
tag is built, so the tag itself stays untouched. The site page gets a bar
above the React root, which React never re-renders; each deck gets the same
bar fixed to the top of the screen, inside the slides' empty top padding.

Usage: python3 v1_notice.py <v1-build-dir>
"""
import pathlib
import sys

V2_URL = "/agentic-se-course-early-2026/"

STYLE = (
    "<style>"
    ".v1-notice{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;"
    "justify-content:center;gap:4px 14px;margin:0;padding:10px 16px;background:#0A0A0A;"
    "color:#F5F5F5;font:500 14px/1.4 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',"
    "sans-serif;text-align:center}"
    ".v1-notice p{margin:0;padding:0;font:inherit;color:#F5F5F5}"
    ".v1-notice a{font:inherit;font-weight:600;color:#FFFFFF;text-decoration:underline;"
    "text-underline-offset:3px;border:0;padding:4px 0}"
    ".v1-notice a:hover{text-decoration-thickness:2px}"
    ".v1-notice a:focus-visible{outline:2px solid #FFFFFF;outline-offset:2px}"
    ".v1-notice--fixed{position:fixed;top:0;left:0;right:0;z-index:9;padding:6px 16px;"
    "border-bottom:1px solid #404040;"
    "font-size:13px}"
    "</style>"
)


def notice(fixed):
    cls = "v1-notice v1-notice--fixed" if fixed else "v1-notice"
    return (
        STYLE
        + f'<aside class="{cls}" aria-label="Archived version">'
        + "<p>This version of the course is superseded.</p>"
        + f'<a href="{V2_URL}">Go to version 2</a>'
        + "</aside>"
    )


def insert(path, marker, html):
    text = path.read_text(encoding="utf-8")
    if marker not in text:
        sys.exit(f"{path}: marker {marker!r} not found")
    path.write_text(text.replace(marker, html + marker, 1), encoding="utf-8")


def main(root):
    root = pathlib.Path(root)
    index = root / "index.html"
    insert(index, '<div id="root">', notice(fixed=False))
    text = index.read_text(encoding="utf-8")
    index.write_text(
        text.replace("<title>Agentic SE Course</title>",
                     "<title>Agentic SE Course, version 1 (archived)</title>", 1),
        encoding="utf-8",
    )
    decks = sorted((root / "slides").glob("*.html"))
    if not decks:
        sys.exit(f"{root / 'slides'}: no decks found")
    for deck in decks:
        insert(deck, '<div class="progress"', notice(fixed=True))


if __name__ == "__main__":
    main(sys.argv[1])
