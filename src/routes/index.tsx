import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import {
  directorySize,
  loadPeople,
  lookup,
  suggest,
  type Person,
} from "@/lib/people";

export const Route = createFileRoute("/")({ component: Home });

function formatPhone(raw: string) {
  return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
}

function Home() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Person[]>([]);
  const [person, setPerson] = useState<Person | null>(null);
  const [miss, setMiss] = useState(false);
  const [count, setCount] = useState(0);
  const [clock, setClock] = useState("—");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setClock(
      new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date()),
    );
    loadPeople()
      .then(() => {
        setCount(directorySize());
        setReady(true);
      })
      .catch(() => setError("The register could not be opened."));
  }, []);

  function run(value: string) {
    const q = value.trim();
    setQuery(value);
    setMiss(false);
    if (q.length < 2) {
      setHits([]);
      return;
    }
    setHits(suggest(q));
  }

  function open(name: string) {
    const found = lookup(name);
    setPerson(found ?? null);
    setMiss(!found);
    setHits([]);
    if (found) setQuery(found.name);
  }

  function submit() {
    const exact = lookup(query);
    if (exact) {
      open(exact.name);
      return;
    }
    if (hits[0]) {
      open(hits[0].name);
      return;
    }
    setPerson(null);
    setMiss(query.trim().length > 0);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-16 pt-6 sm:px-8">
        <header className="flex items-center justify-between border-b border-line pb-4 text-xs tracking-widest text-mute uppercase">
          <span>Nām · Register</span>
          <span className="hidden sm:inline">Synthetic profiles · India</span>
          <span>{clock} IST</span>
        </header>

        <section className="pt-10 sm:pt-16">
          <p className="mb-4 text-xs tracking-widest text-ember uppercase">
            Directory {ready ? String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "—"} names
          </p>
          <h1 className="font-display text-6xl leading-none tracking-tight sm:text-8xl">
            Find a <em className="text-ember">person</em>.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-mute">
            Type a full name. If it sits in the register, the dossier opens — reference, phone, and a
            simulated Indian address. Every record is invented.
          </p>
        </section>

        <form
          className="relative mt-10"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="sr-only" htmlFor="q">
            Search by name
          </label>
          <div className="flex items-end gap-3 border-b border-ink pb-3">
            <Search className="mb-1 size-5 shrink-0 text-mute" strokeWidth={1.5} />
            <input
              id="q"
              ref={inputRef}
              value={query}
              disabled={!ready}
              autoComplete="off"
              placeholder={ready ? "Aarav Sharma" : "Opening the register…"}
              className="w-full bg-transparent font-display text-3xl text-ink outline-none placeholder:text-line sm:text-5xl"
              onChange={(e) => run(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setHits([]);
                  setMiss(false);
                }
              }}
            />
            <button
              type="submit"
              disabled={!ready}
              className="mb-1 inline-flex h-11 shrink-0 items-center gap-2 bg-ink px-4 text-xs tracking-widest text-paper uppercase disabled:opacity-40"
            >
              Search
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>

          {hits.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full border border-line bg-card">
              {hits.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-paper"
                    onClick={() => open(p.name)}
                  >
                    <span className="font-display text-2xl">{p.name}</span>
                    <span className="text-xs tracking-widest text-mute uppercase">{p.city}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {error && (
          <p className="mt-8 text-ember" role="alert">
            {error}
          </p>
        )}

        {miss && !person && (
          <p className="rise mt-10 border border-line bg-card px-6 py-8 font-display text-3xl" role="status">
            No records found
            <span className="mt-2 block font-sans text-base text-mute">
              Try a suggestion, or a name like Meera Nair.
            </span>
          </p>
        )}

        {person && (
          <article className="rise mt-12 border border-line bg-card">
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
              <p className="text-xs tracking-widest text-mute uppercase">Dossier</p>
              <p className="font-display text-xl text-ember">{person.id}</p>
            </div>
            <div className="px-6 py-8 sm:px-8">
              <h2 className="font-display text-5xl leading-none sm:text-7xl">{person.name}</h2>
              <p className="mt-3 text-sm tracking-widest text-mute uppercase">
                {person.city} · {person.state}
              </p>
              <dl className="mt-10 grid gap-8 sm:grid-cols-3">
                <div>
                  <dt className="text-xs tracking-widest text-mute uppercase">Reference</dt>
                  <dd className="mt-2 font-display text-2xl">{person.id}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-widest text-mute uppercase">Phone</dt>
                  <dd className="mt-2 font-display text-2xl">{formatPhone(person.phone)}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-widest text-mute uppercase">Residence</dt>
                  <dd className="mt-2 font-display text-2xl leading-snug">
                    {person.line}
                    <span className="mt-1 block text-lg text-mute">
                      {person.city} {person.pin}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            <p className="border-t border-line px-6 py-4 text-xs tracking-wide text-mute sm:px-8">
              Mock data only. Not a real resident, number, or address.
            </p>
          </article>
        )}

        <footer className="mt-auto pt-16 text-xs tracking-widest text-mute uppercase">
          Nām register · invented names, phones, and streets
        </footer>
      </div>
    </main>
  );
}
