"""Nām — local name directory. Run: python app.py"""

import hashlib
import sqlite3
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory

# This automatically finds your project folder paths correctly
ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "directory.db"
NAMES_FILE = ROOT / "names_list.txt"

CITIES = [
    ("Bengaluru", "Karnataka", 560001), ("Mumbai", "Maharashtra", 400001),
    ("Delhi", "Delhi", 110001), ("Hyderabad", "Telangana", 500001),
    ("Chennai", "Tamil Nadu", 600001), ("Kolkata", "West Bengal", 700001),
    ("Pune", "Maharashtra", 411001), ("Ahmedabad", "Gujarat", 380001)
]
STREETS = ["MG Road", "Station Road", "Residency Road", "Park Street", "Civil Lines"]
LANES = ["Lane", "Cross", "Main", "Colony"]

app = Flask(__name__, static_folder=str(ROOT), static_url_path="")

def stable(name: str, n: int) -> int:
    digest = hashlib.sha256(f"{n}:{name}".encode()).hexdigest()
    return int(digest[:12], 16)

def build_db() -> None:
    # Look for your names list file automatically
    possible_paths = [NAMES_FILE, ROOT.parent / "names_list.txt", Path("~/Downloads/names_list.txt").expanduser()]
    source_file = None
    for p in possible_paths:
        if p.exists():
            source_file = p
            break
            
    if not source_file:
        print("Error: names_list.txt not found anywhere! Please make sure it is in your project or Downloads folder.")
        return

    print(f"Reading names from: {source_file}")
    seen = set()
    names = []
    for raw in source_file.read_text(encoding="utf-8", errors="replace").splitlines():
        name = raw.strip()
        if name and name not in seen:
            seen.add(name)
            names.append(name)

    if DB_PATH.exists():
        DB_PATH.unlink()
        
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE people (
            id TEXT PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE,
            phone TEXT NOT NULL, line TEXT NOT NULL,
            city TEXT NOT NULL, state TEXT NOT NULL, pin TEXT NOT NULL
        )
    """)
    con.execute("CREATE INDEX idx_people_name ON people(name)")
    
    rows = []
    for n, name in enumerate(names):
        h = stable(name, n)
        city, state, pin_base = CITIES[h % len(CITIES)]
        street = STREETS[(h // 7) % len(STREETS)]
        lane = LANES[(h // 11) % len(LANES)]
        house = 12 + (h % 480)
        pin = pin_base + (h % 80)
        phone = f"9{(h % 900000000) + 100000000:09d}"
        serial = f"{(n + 10421):05X}"
        rows.append((f"ID-{serial}", name, phone, f"{house}, {street} {lane}", city, state, str(pin)))
        
    con.executemany("INSERT INTO people VALUES (?,?,?,?,?,?,?)", rows)
    con.commit()
    con.close()
    print(f"Success! Indexed {len(rows):,} unique profiles into {DB_PATH.name}")

@app.get("/")
def index():
    return send_from_directory(ROOT, "index.html")

@app.get("/api/search")
def search():
    q = (request.args.get("q") or "").strip()
    if len(q) < 2:
        return jsonify({"exact": None, "suggestions": []})
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    exact = con.execute("SELECT * FROM people WHERE name = ? COLLATE NOCASE LIMIT 1", (q,)).fetchone()
    suggestions = con.execute("SELECT * FROM people WHERE name LIKE ? COLLATE NOCASE ORDER BY name LIMIT 5", (q + "%",)).fetchall()
    con.close()
    
    def to_dict(r):
        return {"id": r["id"], "name": r["name"], "phone": r["phone"], "line": r["line"], "city": r["city"], "state": r["state"], "pin": r["pin"]}
        
    return jsonify({
        "exact": to_dict(exact) if exact else None,
        "suggestions": [to_dict(r) for r in suggestions]
    })

if __name__ == "__main__":
    build_db()
    # We use a brand new unblocked network port (8050) to bypass permission errors
    app.run(host="127.0.0.1", port=8050, debug=False)
