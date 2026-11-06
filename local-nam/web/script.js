const form = document.getElementById("search-form");
const input = document.getElementById("q");
const hits = document.getElementById("hits");
const result = document.getElementById("result");
const counter = document.getElementById("directory-counter");

const DEBOUNCE_MS = 200;
let debounceTimer = null;
let requestId = 0;      // number of the newest request
let controller = null;  // lets us cancel the previous request

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPhone(raw) {
  if (!raw || raw.length < 6) return raw || "";
  return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
}

function showDossier(p) {
  result.hidden = false;
  result.innerHTML = `
    <article class="dossier">
      <div class="meta"><span>Dossier</span><span class="ref">${escapeHtml(p.id)}</span></div>
      <div class="body">
        <h2>${escapeHtml(p.name)}</h2>
        <p>${escapeHtml(p.city)} · ${escapeHtml(p.state)}</p>
        <dl class="grid">
          <div><dt>Reference</dt><dd>${escapeHtml(p.id)}</dd></div>
          <div><dt>Phone</dt><dd>${escapeHtml(formatPhone(p.phone))}</dd></div>
          <div><dt>Residence</dt><dd>${escapeHtml(p.line)}<span style="display:block;font-size:1rem;color:#7a7065;margin-top:0.25rem;">${escapeHtml(p.city)}, ${escapeHtml(p.state)} - ${escapeHtml(p.pin)}</span></dd></div>
        </dl>
      </div>
      <p class="note">Mock data only. Generated for system testing from open-source repositories.</p>
    </article>`;
}

function showMessage(text) {
  result.hidden = false;
  result.innerHTML = `<p class="miss">${escapeHtml(text)}</p>`;
}

function hideHits() {
  hits.hidden = true;
  hits.innerHTML = "";
}

function renderHits(list) {
  if (!list || list.length === 0) return hideHits();
  hits.innerHTML = list
    .map((p) => `<li><button type="button" data-name="${escapeHtml(p.name)}">${escapeHtml(p.name)}</button></li>`)
    .join("");
  hits.hidden = false;
}

async function fetchQuery(q) {
  if (controller) controller.abort();          // cancel the older request
  controller = new AbortController();
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadSuggestions(q) {
  const id = ++requestId;
  try {
    const data = await fetchQuery(q);
    if (id !== requestId) return;              // a newer request exists
    renderHits(data.suggestions);
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Suggestion request failed:", err);
      hideHits();
    }
  }
}

input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const q = input.value.trim();
  if (q.length < 2) return hideHits();
  debounceTimer = setTimeout(() => loadSuggestions(q), DEBOUNCE_MS);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideHits();
});

document.addEventListener("click", (event) => {
  if (!form.contains(event.target)) hideHits();
});

hits.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  input.value = button.dataset.name;
  hideHits();
  form.requestSubmit();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearTimeout(debounceTimer);
  const q = input.value.trim();
  hideHits();
  if (!q) return;

  const id = ++requestId;
  try {
    const data = await fetchQuery(q);
    if (id !== requestId) return;
    if (data.exact) showDossier(data.exact);
    else showMessage("No records found in the directory.");
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error("Search failed:", err);
    showMessage("Could not reach the server. Please try again.");
  }
});

async function loadCount() {
  try {
    const res = await fetch("/api/count");
    if (!res.ok) return;
    const { count } = await res.json();
    counter.textContent = `Directory · ${count.toLocaleString("en-US")} Names`;
  } catch (err) {
    /* keep the static text if the count is unavailable */
  }
}
loadCount();