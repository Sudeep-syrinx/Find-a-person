import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Search, r as ArrowUpRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C-FEkfOx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cache = null;
var byName = /* @__PURE__ */ new Map();
async function loadPeople() {
	if (cache) return cache;
	const res = await fetch("/directory.json");
	if (!res.ok) throw new Error("Directory failed to load");
	const data = await res.json();
	cache = data;
	byName.clear();
	for (const p of data) byName.set(p.name.toLowerCase(), p);
	return data;
}
function lookup(q) {
	return byName.get(q.trim().toLowerCase());
}
function suggest(q, limit = 6) {
	const needle = q.trim().toLowerCase();
	if (needle.length < 2 || !cache) return [];
	const out = [];
	for (const p of cache) if (p.name.toLowerCase().startsWith(needle)) {
		out.push(p);
		if (out.length >= limit) break;
	}
	return out;
}
function directorySize() {
	return cache?.length ?? 0;
}
function formatPhone(raw) {
	return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [person, setPerson] = (0, import_react.useState)(null);
	const [miss, setMiss] = (0, import_react.useState)(false);
	const [count, setCount] = (0, import_react.useState)(0);
	const [clock, setClock] = (0, import_react.useState)("—");
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setClock(new Intl.DateTimeFormat("en-IN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		}).format(/* @__PURE__ */ new Date()));
		loadPeople().then(() => {
			setCount(directorySize());
			setReady(true);
		}).catch(() => setError("The register could not be opened."));
	}, []);
	function run(value) {
		const q = value.trim();
		setQuery(value);
		setMiss(false);
		if (q.length < 2) {
			setHits([]);
			return;
		}
		setHits(suggest(q));
	}
	function open(name) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-paper text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-16 pt-6 sm:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between border-b border-line pb-4 text-xs tracking-widest text-mute uppercase",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nām · Register" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Synthetic profiles · India"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [clock, " IST"] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pt-10 sm:pt-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-4 text-xs tracking-widest text-ember uppercase",
							children: [
								"Directory ",
								ready ? String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "—",
								" names"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "font-display text-6xl leading-none tracking-tight sm:text-8xl",
							children: [
								"Find a ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "text-ember",
									children: "person"
								}),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-xl text-lg leading-relaxed text-mute",
							children: "Type a full name. If it sits in the register, the dossier opens — reference, phone, and a simulated Indian address. Every record is invented."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "relative mt-10",
					onSubmit: (e) => {
						e.preventDefault();
						submit();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "sr-only",
							htmlFor: "q",
							children: "Search by name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-3 border-b border-ink pb-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									className: "mb-1 size-5 shrink-0 text-mute",
									strokeWidth: 1.5
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "q",
									ref: inputRef,
									value: query,
									disabled: !ready,
									autoComplete: "off",
									placeholder: ready ? "Aarav Sharma" : "Opening the register…",
									className: "w-full bg-transparent font-display text-3xl text-ink outline-none placeholder:text-line sm:text-5xl",
									onChange: (e) => run(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Escape") {
											setHits([]);
											setMiss(false);
										}
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !ready,
									className: "mb-1 inline-flex h-11 shrink-0 items-center gap-2 bg-ink px-4 text-xs tracking-widest text-paper uppercase disabled:opacity-40",
									children: ["Search", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
										className: "size-4",
										strokeWidth: 1.5
									})]
								})
							]
						}),
						hits.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "absolute z-10 mt-2 w-full border border-line bg-card",
							children: hits.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-paper",
								onClick: () => open(p.name),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-2xl",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs tracking-widest text-mute uppercase",
									children: p.city
								})]
							}) }, p.id))
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-ember",
					role: "alert",
					children: error
				}),
				miss && !person && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rise mt-10 border border-line bg-card px-6 py-8 font-display text-3xl",
					role: "status",
					children: ["No records found", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 block font-sans text-base text-mute",
						children: "Try a suggestion, or a name like Meera Nair."
					})]
				}),
				person && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rise mt-12 border border-line bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-widest text-mute uppercase",
								children: "Dossier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl text-ember",
								children: person.id
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-8 sm:px-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-5xl leading-none sm:text-7xl",
									children: person.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-sm tracking-widest text-mute uppercase",
									children: [
										person.city,
										" · ",
										person.state
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-10 grid gap-8 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs tracking-widest text-mute uppercase",
											children: "Reference"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-2 font-display text-2xl",
											children: person.id
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs tracking-widest text-mute uppercase",
											children: "Phone"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-2 font-display text-2xl",
											children: formatPhone(person.phone)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs tracking-widest text-mute uppercase",
											children: "Residence"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "mt-2 font-display text-2xl leading-snug",
											children: [person.line, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 block text-lg text-mute",
												children: [
													person.city,
													" ",
													person.pin
												]
											})]
										})] })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "border-t border-line px-6 py-4 text-xs tracking-wide text-mute sm:px-8",
							children: "Mock data only. Not a real resident, number, or address."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "mt-auto pt-16 text-xs tracking-widest text-mute uppercase",
					children: "Nām register · invented names, phones, and streets"
				})
			]
		})
	});
}
//#endregion
export { Home as component };
