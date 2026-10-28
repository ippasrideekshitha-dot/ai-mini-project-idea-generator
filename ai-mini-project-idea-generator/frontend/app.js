const API = "/api";
const $ = (selector) => document.querySelector(selector);
const authSection = $("#authSection");
const appSection = $("#appSection");
const authForm = $("#authForm");
const authMessage = $("#authMessage");
const ideasGrid = $("#ideasGrid");
const savedIdeas = $("#savedIdeas");
let authMode = "login";
let token = sessionStorage.getItem("ideaSparkToken") || "";
let currentIdeas = [];
let savedIds = new Set();
let toastTimer;

const ideaCatalog = [
 {id:"campus-helper",title:"Campus Companion Portal",domain:"web",description:"A simple portal where students can find campus notices, useful links, and frequently asked questions in one place.",difficulty:"beginner",technologies:["HTML/CSS/JS","Node.js","PostgreSQL"],steps:["Create a responsive notice board","Add category and keyword search","Store notices in a database"],icon:"⌂",keywords:"campus college student notices"},
 {id:"study-planner",title:"Smart Study Planner",domain:"education",description:"Plan study sessions by subject, set deadlines, and see which tasks need attention first.",difficulty:"beginner",technologies:["HTML/CSS/JS","PostgreSQL"],steps:["Add subjects and tasks","Sort tasks by deadline","Show completed and pending tasks"],icon:"▤",keywords:"study notes exam timetable student"},
 {id:"waste-sorter",title:"Waste Segregation Guide",domain:"environment",description:"Help people decide whether everyday items belong in wet, dry, recyclable, or e-waste categories.",difficulty:"beginner",technologies:["HTML/CSS/JS","C"],steps:["Create a searchable item list","Show disposal guidance","Add a community tips page"],icon:"♻",keywords:"waste recycle environment sustainability"},
 {id:"expense-buddy",title:"Student Expense Buddy",domain:"productivity",description:"Track daily spending, organise expenses by category, and understand where a monthly allowance goes.",difficulty:"beginner",technologies:["HTML/CSS/JS","Node.js","PostgreSQL"],steps:["Add amount and category","Filter expenses by date","Calculate totals on the server"],icon:"₹",keywords:"money budget expense finance"},
 {id:"health-habit",title:"Healthy Habit Tracker",domain:"health",description:"Record simple daily habits such as water breaks, walks, and sleep routines with a weekly progress view.",difficulty:"beginner",technologies:["HTML/CSS/JS","PostgreSQL"],steps:["Create daily habit entries","Show a weekly summary","Add a streak indicator"],icon:"♡",keywords:"health wellness habit fitness"},
 {id:"quiz-builder",title:"Topic-wise Quiz Builder",domain:"education",description:"Let students practise a subject with multiple-choice questions and review their scores after each quiz.",difficulty:"intermediate",technologies:["HTML/CSS/JS","Node.js","PostgreSQL"],steps:["Store questions and choices","Score answers on the server","Show topic-wise performance"],icon:"?",keywords:"quiz learning education test"},
 {id:"phishing-awareness",title:"Phishing Awareness Trainer",domain:"security",description:"Teach users to spot suspicious messages through safe example scenarios and a checklist of warning signs.",difficulty:"intermediate",technologies:["HTML/CSS/JS","Node.js"],steps:["Create harmless sample messages","Ask users to identify red flags","Explain the correct answer"],icon:"⌁",keywords:"security cyber phishing safety"},
 {id:"iot-plant",title:"Plant Care Reminder",domain:"iot",description:"A prototype dashboard for recording plant moisture checks and scheduling watering reminders; hardware can be added later.",difficulty:"intermediate",technologies:["HTML/CSS/JS","C","PostgreSQL"],steps:["Register plants and care needs","Record manual moisture readings","Display care history"],icon:"♧",keywords:"iot plant agriculture smart garden"},
 {id:"sentiment-lite",title:"Review Mood Classifier",domain:"ai",description:"Explore a beginner-friendly text classification project that labels sample reviews as positive, neutral, or negative using a small local keyword model.",difficulty:"intermediate",technologies:["Python","HTML/CSS/JS"],steps:["Prepare a small labelled dataset","Build a transparent keyword baseline","Compare predictions with labels"],icon:"✧",keywords:"ai machine learning sentiment text review"},
 {id:"lost-found",title:"Campus Lost & Found Board",domain:"web",description:"Post lost or found item descriptions, search listings, and mark an item as returned.",difficulty:"beginner",technologies:["HTML/CSS/JS","Node.js","PostgreSQL"],steps:["Create a listing form","Add filters by item and location","Add a returned status"],icon:"⌕",keywords:"campus college lost found search"},
 {id:"traffic-counter",title:"Traffic Count Visualiser",domain:"ai",description:"Use a supplied sample dataset to chart traffic counts by hour and compare busy periods without needing a live camera or paid API.",difficulty:"intermediate",technologies:["HTML/CSS/JS","Python"],steps:["Load a sample CSV dataset","Group counts by hour","Compare weekday and weekend patterns"],icon:"⌁",keywords:"ai data analysis traffic smart city"},
 {id:"password-checker",title:"Password Strength Coach",domain:"security",description:"Give local feedback on password length and variety, with safe guidance. The page never sends typed passwords to the server.",difficulty:"beginner",technologies:["HTML/CSS/JS"],steps:["Evaluate password rules locally","Explain missing strength criteria","Offer passphrase safety tips"],icon:"⌑",keywords:"security password privacy"},
 {id:"library-lending",title:"Mini Library Lending Register",domain:"web",description:"Keep a catalogue of books and record check-outs and returns, with safeguards against lending unavailable copies.",difficulty:"intermediate",technologies:["Node.js","PostgreSQL","HTML/CSS/JS"],steps:["Add books and copy counts","Record issue and return events","Prevent negative available counts"],icon:"▥",keywords:"library books database management"},
 {id:"water-watch",title:"Household Water Use Diary",domain:"environment",description:"Log estimated daily water usage and show simple trends to encourage conservation.",difficulty:"beginner",technologies:["HTML/CSS/JS","PostgreSQL"],steps:["Record daily usage estimates","Display weekly totals","Suggest practical conservation tips"],icon:"≈",keywords:"water environment sustainability"},
 {id:"accessibility-audit",title:"Website Accessibility Checklist",domain:"productivity",description:"A guided checklist to help student teams manually review contrast, labels, keyboard access, and image alternatives on a website.",difficulty:"beginner",technologies:["HTML/CSS/JS"],steps:["Create an audit checklist","Track pass or needs-review items","Export a plain-text summary"],icon:"◎",keywords:"accessibility website design"},
 {id:"attendance-summary",title:"Attendance Percentage Calculator",domain:"education",description:"Enter attended and conducted classes to calculate attendance percentage and explore how future classes affect it.",difficulty:"beginner",technologies:["HTML/CSS/JS","C"],steps:["Validate class counts","Calculate percentages accurately","Explain what-if scenarios"],icon:"✓",keywords:"attendance student college calculator"},
 {id:"local-food-map",title:"Local Food Donation Directory",domain:"environment",description:"Maintain a directory of community food donation points and their accepted item types, managed by project users.",difficulty:"intermediate",technologies:["Node.js","PostgreSQL","HTML/CSS/JS"],steps:["Create donation point records","Filter by accepted item type","Add contact and opening notes"],icon:"♡",keywords:"food donation community environment"},
 {id:"circuit-notes",title:"Electronics Lab Notes Vault",domain:"iot",description:"Organise lab observations, component lists, and circuit notes by experiment so students can revise efficiently.",difficulty:"beginner",technologies:["HTML/CSS/JS","PostgreSQL"],steps:["Add experiment entries","Search by component or topic","Export notes for revision"],icon:"⌘",keywords:"iot electronics lab circuit"},
 {id:"career-skill-map",title:"Student Skill Roadmap",domain:"productivity",description:"Map a career goal to skills, learning tasks, and project milestones in a manageable checklist.",difficulty:"beginner",technologies:["HTML/CSS/JS","PostgreSQL"],steps:["Choose a goal template","Add milestones and tasks","Track progress over time"],icon:"↗",keywords:"career skill learning roadmap"},
 {id:"clinic-queue",title:"Clinic Queue Display Prototype",domain:"health",description:"A demo queue board that records token numbers and statuses for a small clinic simulation, without handling real medical records.",difficulty:"advanced",technologies:["Node.js","PostgreSQL","HTML/CSS/JS"],steps:["Create queue tokens","Update waiting and served states","Display the next token safely"],icon:"＋",keywords:"health clinic queue appointment"},
 {id:"feedback-analyser",title:"Course Feedback Theme Finder",domain:"ai",description:"Group sample course feedback by common keywords and display the most frequent themes as a simple explainable baseline.",difficulty:"intermediate",technologies:["Python","HTML/CSS/JS"],steps:["Prepare anonymised sample feedback","Count theme keywords","Show limitations of keyword grouping"],icon:"✧",keywords:"ai text feedback education analytics"}
];

function showToast(message, error = false) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.toggle("error", error);
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
async function request(path, options = {}) {
  const headers = {"Content-Type":"application/json", ...(options.headers || {})};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, {...options, headers});
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) signOut(false);
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  return body;
}
function setAuthMode(mode) {
  authMode = mode;
  const register = mode === "register";
  $("#loginTab").classList.toggle("active", !register);
  $("#registerTab").classList.toggle("active", register);
  $("#authTitle").textContent = register ? "Create your account" : "Welcome back";
  $("#authSubtitle").textContent = register ? "Start building your personal project shortlist." : "Log in to revisit your saved project ideas.";
  $("#authSubmit").innerHTML = register ? 'Create account <span>→</span>' : 'Log in <span>→</span>';
  $("#authName").classList.toggle("hidden", !register);
  $("#nameLabel").classList.toggle("hidden", !register);
  $("#authName").required = register;
  $("#authPassword").autocomplete = register ? "new-password" : "current-password";
  authMessage.textContent = "";
}
$("#loginTab").addEventListener("click", () => setAuthMode("login"));
$("#registerTab").addEventListener("click", () => setAuthMode("register"));
authForm.addEventListener("submit", async event => {
  event.preventDefault();
  authMessage.className = "form-message";
  authMessage.textContent = "Please wait…";
  $("#authSubmit").disabled = true;
  try {
    const payload = {email:$("#authEmail").value.trim(), password:$("#authPassword").value};
    if (authMode === "register") payload.name = $("#authName").value.trim();
    const result = await request(`/auth/${authMode}`, {method:"POST", body:JSON.stringify(payload)});
    token = result.token;
    sessionStorage.setItem("ideaSparkToken", token);
    authForm.reset();
    await enterApp();
    showToast(authMode === "register" ? "Account created. Welcome to IdeaSpark!" : "You are logged in.");
  } catch (error) {
    authMessage.textContent = error.message;
  } finally {
    $("#authSubmit").disabled = false;
  }
});
async function enterApp() {
  authSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  $("#logoutBtn").classList.remove("hidden");
  try { await loadSaved(); }
  catch (error) { showToast(error.message, true); }
}
function signOut(showMessage = true) {
  token = "";
  sessionStorage.removeItem("ideaSparkToken");
  savedIds = new Set();
  appSection.classList.add("hidden");
  authSection.classList.remove("hidden");
  $("#logoutBtn").classList.add("hidden");
  if (showMessage) showToast("You have logged out.");
}
$("#logoutBtn").addEventListener("click", () => signOut());

function chooseIdeas() {
  const domain = $("#domain").value;
  const level = $("#level").value;
  const technology = $("#technology").value;
  const keyword = $("#keyword").value.trim().toLowerCase();
  const preferredTech = {
    html:["HTML/CSS/JS"], c:["C"], python:["Python"], node:["Node.js"], database:["PostgreSQL"]
  };
  let scored = ideaCatalog.map(idea => {
    let score = 0;
    if (domain !== "any") score += idea.domain === domain ? 5 : -2;
    if (level === idea.difficulty) score += 3;
    else if (level === "beginner" && idea.difficulty === "intermediate") score += 0;
    else score -= 1;
    if (technology !== "any" && idea.technologies.some(t => preferredTech[technology]?.some(p => t.toLowerCase().includes(p.toLowerCase())))) score += 3;
    if (keyword) {
      const haystack = `${idea.title} ${idea.description} ${idea.domain} ${idea.technologies.join(" ")} ${idea.keywords}`.toLowerCase();
      score += haystack.includes(keyword) ? 7 : -2;
    }
    return {...idea, score};
  });
  scored.sort((a,b) => b.score - a.score || a.title.localeCompare(b.title));
  const results = scored.slice(0, 6);
  currentIdeas = results;
  return results;
}
$("#generatorForm").addEventListener("submit", event => {
  event.preventDefault();
  const results = chooseIdeas();
  $("#resultsCaption").textContent = `Matched to ${$("#domain").selectedOptions[0].text.toLowerCase()} and your preferences.`;
  $("#resultCount").textContent = `${results.length} ideas`;
  renderIdeas();
});
function renderIdeas() {
  if (!currentIdeas.length) {
    ideasGrid.innerHTML = '<div class="empty-state"><strong>No matches found</strong><p>Try a broader keyword or choose “Surprise me”.</p></div>';
    return;
  }
  ideasGrid.innerHTML = currentIdeas.map(idea => {
    const saved = savedIds.has(idea.id);
    const domainLabel = idea.domain === "ai" ? "AI & ML" : idea.domain.charAt(0).toUpperCase()+idea.domain.slice(1);
    return `<article class="idea-card">
      <div class="idea-card-top"><span class="idea-icon">${escapeHtml(idea.icon)}</span><span class="difficulty ${escapeHtml(idea.difficulty)}">${escapeHtml(idea.difficulty)}</span></div>
      <h4>${escapeHtml(idea.title)}</h4><p class="idea-desc">${escapeHtml(idea.description)}</p>
      <div class="tag-row"><span class="tag">${escapeHtml(domainLabel)}</span>${idea.technologies.slice(0,2).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      <div class="idea-actions"><button class="button button-outline" data-save="${escapeHtml(idea.id)}" ${saved?"disabled":""}>${saved?"✓ Saved":"♡ Save idea"}</button><button class="button button-small-quiet" data-details="${escapeHtml(idea.id)}">View plan</button></div>
    </article>`;
  }).join("");
}
ideasGrid.addEventListener("click", async event => {
  const saveButton = event.target.closest("[data-save]");
  const detailsButton = event.target.closest("[data-details]");
  if (saveButton) {
    const idea = currentIdeas.find(item => item.id === saveButton.dataset.save);
    if (!idea) return;
    try {
      await request("/ideas", {method:"POST",body:JSON.stringify({catalogId:idea.id,title:idea.title,description:idea.description,domain:idea.domain,difficulty:idea.difficulty,technologies:idea.technologies,steps:idea.steps})});
      savedIds.add(idea.id);
      renderIdeas();
      await loadSaved();
      showToast("Idea saved to your shortlist.");
    } catch (error) { showToast(error.message, true); }
  }
  if (detailsButton) {
    const idea = currentIdeas.find(item => item.id === detailsButton.dataset.details);
    if (idea) showToast(`${idea.title}: ${idea.steps.join(" • ")}`);
  }
});
async function loadSaved() {
  const result = await request("/ideas");
  const rows = result.ideas || [];
  savedIds = new Set(rows.map(row => row.catalog_id).filter(Boolean));
  $("#savedCount").textContent = rows.length;
  if (!rows.length) {
    savedIdeas.innerHTML = '<div class="empty-state compact"><div class="empty-illustration">♡</div><strong>No saved ideas yet</strong><p>Tap “Save idea” on a result to keep it here.</p></div>';
  } else {
    savedIdeas.innerHTML = rows.map(row => `<article class="saved-item"><h4>${escapeHtml(row.title)}</h4><p>${escapeHtml(row.description)}</p><div class="saved-item-bottom"><span class="tag">${escapeHtml(row.domain)} · ${escapeHtml(row.difficulty)}</span><button type="button" data-delete="${escapeHtml(row.id)}" aria-label="Remove ${escapeHtml(row.title)}">Remove</button></div></article>`).join("");
  }
  renderIdeas();
}
savedIdeas.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  if (!confirm("Remove this idea from your shortlist?")) return;
  try {
    await request(`/ideas/${encodeURIComponent(button.dataset.delete)}`, {method:"DELETE"});
    await loadSaved();
    showToast("Idea removed from your shortlist.");
  } catch (error) { showToast(error.message, true); }
});
(async function initialise() {
  if (!token) return;
  try {
    await request("/auth/me");
    await enterApp();
  } catch { signOut(false); }
})();
