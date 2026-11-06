"""Tests for the Nām search API. Run from local-nam:  python -m pytest -v"""

import re
import sqlite3

import pytest

import app as nam

NAMES = ["Liliana Iris", "Liliana Irene", "Asha Rao", "He He", "Ravi Kumar"]


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """Flask test client backed by a small throwaway database."""
    db = tmp_path / "test.db"
    con = sqlite3.connect(db)
    con.execute("""
        CREATE TABLE people (
            id TEXT PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE,
            phone TEXT NOT NULL, line TEXT NOT NULL,
            city TEXT NOT NULL, state TEXT NOT NULL, pin TEXT NOT NULL
        )""")
    con.executemany("INSERT INTO people VALUES (?,?,?,?,?,?,?)",
                    [nam.make_row(i, n) for i, n in enumerate(NAMES)])
    con.commit()
    con.close()
    monkeypatch.setattr(nam, "DB_PATH", db)
    return nam.app.test_client()


def search(client, q):
    return client.get("/api/search", query_string={"q": q}).get_json()


def test_stable_ignores_case():
    assert nam.stable("He He") == nam.stable("he he")


def test_make_row_is_deterministic():
    assert nam.make_row(3, "Asha Rao") == nam.make_row(3, "Asha Rao")


def test_different_names_get_different_profiles():
    a = nam.make_row(0, "Liliana Iris")
    b = nam.make_row(1, "Liliana Irene")
    assert a[2:] != b[2:]


def test_phone_format():
    for i, name in enumerate(NAMES):
        assert re.fullmatch(r"9\d{9}", nam.make_row(i, name)[2])


def test_exact_match(client):
    data = search(client, "Asha Rao")
    assert data["exact"]["name"] == "Asha Rao"


def test_exact_match_ignores_case_and_spaces(client):
    assert search(client, "  asha   RAO ")["exact"]["name"] == "Asha Rao"


def test_unknown_name(client):
    data = search(client, "Nobody Here")
    assert data["exact"] is None and data["suggestions"] == []


def test_short_query_returns_nothing(client):
    assert search(client, "A") == {"exact": None, "suggestions": []}


def test_prefix_suggestions(client):
    names = [s["name"] for s in search(client, "Liliana")["suggestions"]]
    assert names == ["Liliana Irene", "Liliana Iris"]


def test_wildcards_are_not_special(client):
    assert search(client, "%%")["suggestions"] == []


def test_long_query_is_capped(client):
    assert search(client, "a" * 500)["exact"] is None


def test_project_files_are_not_served(client):
    assert client.get("/app.py").status_code == 404
    assert client.get("/directory.db").status_code == 404