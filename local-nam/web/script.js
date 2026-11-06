const form = document.getElementById("search-form");
const input = document.getElementById("q");
const hits = document.getElementById("hits");
const result = document.getElementById("result");

// Formats phone numbers nicely on the UI display layout card
function formatPhone(raw) {
  if (!raw) return "";
  return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
}

// Renders the full data dossier block onto the home screen interface
function showDossier(person) {
  result.hidden = false;
  result.innerHTML = `
    <article class="dossier">
      <div class="meta"><span>Dossier</span><span class="ref">${person.id}</span></div>
      <div class="body">
        <h2>${person.name}</h2>
        <p>${person.city} · ${person.state}</p>
        <dl class="grid">
          <div><dt>Reference</dt><dd>${person.id}</dd></div>
          <div><dt>Phone</dt><dd>${formatPhone(person.phone)}</dd></div>
          <div><dt>Residence</dt><dd>${person.line}<span style="display:block;font-size:1rem;color:#7a7065;margin-top:0.25rem;">${person.city}, ${person.state} - ${person.pin}</span></dd></div>
        </dl>
      </div>
      <p class="note">Mock data only. Generated for system testing from open-source repositories.</p>
    </article>`;
}

// Renders a message if no name records exist in the system files
function showMiss() {
  result.hidden = false;
  result.innerHTML = `<p class="miss">No records found inside the 300,000 register entries</p>`;
}

// Communicates with your Flask app backend API running locally
async function fetchQuery(q) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Network response was not stable");
    return await res.json();
  } catch (err) {
    console.error("Search fetch loop error:", err);
    return { exact: None, suggestions: [] };
  }
}

// Listens to keyboard input to trigger instant search dropdown suggestions
input.addEventListener("input", async () => {
  const q = input.value.trim();
  if (q.length < 2) {
    hits.hidden = true;
    hits.innerHTML = "";
    return;
  }
  
  const data = await fetchQuery(q);
  
  if (data.suggestions && data.suggestions.length > 0) {
    hits.innerHTML = data.suggestions
      .map(
        (p) => `<li><button type="button" data-name="${p.name.replaceAll('"', '&quot;')}">${p.name}</button></li>`
      )
      .join("");
    hits.hidden = false;
  } else {
    hits.hidden = true;
    hits.innerHTML = "";
  }
});

// Selection handling inside the active search recommendations box
hits.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  input.value = button.dataset.name;
  hits.hidden = true;
  form.requestSubmit();
});

// Form submission handler to display precise database card hits
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const q = input.value.trim();
  hits.hidden = true;
  if (!q) return;
  
  const data = await fetchQuery(q);
  
  if (data.exact) {
    showDossier(data.exact);
  } else if (data.suggestions && data.suggestions.length === 1 && data.suggestions[0].name.toLowerCase() === q.toLowerCase()) {
    showDossier(data.suggestions[0]);
  } else {
    showMiss();
  }
});
