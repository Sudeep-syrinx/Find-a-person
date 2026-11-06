"""Nām — local name directory.

Run:  python app.py            (builds directory.db on first run only)
      python app.py --rebuild  (rebuild directory.db from names_list.txt)
"""

import argparse
import hashlib
import os
import sqlite3
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "directory.db"
WEB_DIR = ROOT / "web"
MAX_QUERY_LEN = 60
PORT = 8050

CITIES = [
    ("Bengaluru", "Karnataka", 560001), ("Mumbai", "Maharashtra", 400001),
    ("Delhi", "Delhi", 110001), ("Hyderabad", "Telangana", 500001),
    ("Chennai", "Tamil Nadu", 600001), ("Kolkata", "West Bengal", 700001),
    ("Pune", "Maharashtra", 411001), ("Ahmedabad", "Gujarat", 380001),
]
STREETS = ["MG Road", "Station Road", "Residency Road", "Park Street", "Civil Lines"]
LANES = ["Lane", "Cross", "Main", "Colony"]

app = Flask(__name__, static_folder=None)  # nothing is served automatically


def stable(name: str) -> int:
    """Same name -> same number, regardless of list order."""
    digest = hashlib.sha256(name.casefold().encode("utf-8")).hexdigest()
    return int(digest[:12], 16)


def find_names_file() -> Path | None:
    candidates = [
        ROOT / "names_list.txt",
        ROOT.parent / "names_list.txt",
        Path("~/Downloads/names_list.txt").expanduser(),
    ]
    return next((p for p in candidates if p.exists()), None)


def load_names(path: Path) -> list[str]:
    seen, names = set(), []
    with path.open(encoding="utf-8", errors="replace") as f:
        for raw in f:
            name = " ".join(raw.split())          # trim + collapse spaces
            key = name.casefold()
            if name and key not in seen:          # case-insensitive dedupe
                seen.add(key)
                names.append(name)
    return names


def make_row(n: int, name: str) -> tuple:
    h = stable(name)
    city, state, pin_base = CITIES[h % len(CITIES)]
    street = STREETS[(h // 7) % len(STREETS)]
    lane = LANES[(h // 11) % len(LANES)]
    house = 12 + (h % 480)
    pin = pin_base + (h % 80)
    phone = f"9{(h % 900000000) + 100000000:09d}"
    return (f"ID-{n + 10421:05X}", name, phone,
            f"{house}, {street} {lane}", city, state, str(pin))


def build_db() -> None:
    source = find_names_file()
    if source is None:
        raise SystemExit("names_list.txt not found in the project or Downloads folder.")
    print(f"Reading names from: {source}")
    rows = [make_row(n, name) for n, name in enumerate(load_names(source))]

    tmp = DB_PATH.with_suffix(".tmp")             # build aside, then swap in
    tmp.unlink(missing_ok=True)
    con = sqlite3.connect(tmp)
    con.execute("""
        CREATE TABLE people (
            id TEXT PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE,
            phone TEXT NOT NULL, line TEXT NOT NULL,
            city TEXT NOT NULL, state TEXT NOT NULL, pin TEXT NOT NULL
        )""")
    con.executemany("INSERT INTO people VALUES (?,?,?,?,?,?,?)", rows)
    con.execute("CREATE INDEX idx_people_name ON people(name)")
    con.commit()
    con.close()
    os.replace(tmp, DB_PATH)
    print(f"Indexed {len(rows):,} unique profiles into {DB_PATH.name}")


def to_dict(r: sqlite3.Row) -> dict:
    return {k: r[k] for k in ("id", "name", "phone", "line", "city", "state", "pin")}


@app.get("/")
def index():
    return send_from_directory(WEB_DIR, "index.html")


@app.get("/<path:filename>")
def assets(filename):
    return send_from_directory(WEB_DIR, filename)  # safe: stays inside web/


@app.get("/api/search")
def search():
    q = " ".join((request.args.get("q") or "").split())[:MAX_QUERY_LEN]
    if len(q) < 2:
        return jsonify({"exact": None, "suggestions": []})

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        exact = con.execute(
            "SELECT * FROM people WHERE name = ? LIMIT 1", (q,)).fetchone()
        # prefix search as a range: uses the index, no LIKE wildcards to escape
        suggestions = con.execute(
            "SELECT * FROM people WHERE name >= ? AND name < ? ORDER BY name LIMIT 5",
            (q, q + "\uffff")).fetchall()
    finally:
        con.close()

    return jsonify({
        "exact": to_dict(exact) if exact else None,
        "suggestions": [to_dict(r) for r in suggestions],
    })


@app.get("/api/count")
def count():
    con = sqlite3.connect(DB_PATH)
    try:
        n = con.execute("SELECT COUNT(*) FROM people").fetchone()[0]
    finally:
        con.close()
    return jsonify({"count": n})


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true")
    args = parser.parse_args()
    if args.rebuild or not DB_PATH.exists():
        build_db()
    app.run(host="127.0.0.1", port=PORT, debug=False)