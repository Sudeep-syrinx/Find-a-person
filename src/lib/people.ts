export type Person = {
  id: string;
  name: string;
  phone: string;
  line: string;
  city: string;
  state: string;
  pin: string;
};

let cache: Person[] | null = null;
const byName = new Map<string, Person>();

export async function loadPeople(): Promise<Person[]> {
  if (cache) return cache;
  const res = await fetch("/directory.json");
  if (!res.ok) throw new Error("Directory failed to load");
  const data = (await res.json()) as Person[];
  cache = data;
  byName.clear();
  for (const p of data) byName.set(p.name.toLowerCase(), p);
  return data;
}

export function lookup(q: string): Person | undefined {
  return byName.get(q.trim().toLowerCase());
}

export function suggest(q: string, limit = 6): Person[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2 || !cache) return [];
  const out: Person[] = [];
  for (const p of cache) {
    if (p.name.toLowerCase().startsWith(needle)) {
      out.push(p);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function directorySize(): number {
  return cache?.length ?? 0;
}
