/* ------------------------------
   Systems Thinking Dashboard
   Human Nature × Business Outcomes
---------------------------------*/

// Simple state
const state = {
  timeframe: 30,
  segment: "all",
  goal: "activation",
  delayDays: 4,
  intrinsicMotivation: 60,
  friction: 3,
  highlightLoops: true,
  keyword: ""
};

// Elements
const els = {
  timeframe: document.getElementById("timeframe"),
  segment: document.getElementById("segment"),
  goal: document.getElementById("goalSelect"),
  search: document.getElementById("search"),
  apply: document.getElementById("applyFilters"),
  delaySlider: document.getElementById("delaySlider"),
  incentiveSlider: document.getElementById("incentiveSlider"),
  frictionSlider: document.getElementById("frictionSlider"),
  delayVal: document.getElementById("delayVal"),
  incentiveVal: document.getElementById("incentiveVal"),
  frictionVal: document.getElementById("frictionVal"),
  highlightLoops: document.getElementById("highlightLoops"),

  kpiUsers: document.getElementById("kpiUsers"),
  kpiUsersTrend: document.getElementById("kpiUsersTrend"),
  kpiActivation: document.getElementById("kpiActivation"),
  kpiActivationTrend: document.getElementById("kpiActivationTrend"),
  kpiSessions: document.getElementById("kpiSessions"),
  kpiSessionsTrend: document.getElementById("kpiSessionsTrend"),
  kpiNPS: document.getElementById("kpiNPS"),
  kpiNPSTrend: document.getElementById("kpiNPSTrend"),

  heatmap: document.getElementById("heatmap"),
  insightsList: document.getElementById("insightsList"),
  interventionsList: document.getElementById("interventionsList"),
  regenInsights: document.getElementById("regenInsights"),

  loopMap: document.getElementById("loopMap"),
  loopTooltip: document.getElementById("loopTooltip"),

  exportJSON: document.getElementById("exportJSON")
};

// Mock data generator influenced by state
function seededRand(seed) {
  // deterministic-ish PRNG
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateMetrics() {
  const seed = JSON.stringify(state);
  const rnd = seededRand(seed);

  // Base multipliers by segment
  const segBase = { all: 1, creators: 0.85, browsers: 1.1, buyers: 0.7 }[state.segment] || 1;

  // Friction decreases activations, intrinsic motivation increases sessions & NPS
  const frictionFactor = Math.max(0.4, 1 - state.friction * 0.06);
  const intrinsicFactor = 0.8 + (state.intrinsicMotivation / 100) * 0.6;

  const users = Math.round(50000 * segBase * (0.8 + rnd() * 0.6));
  const activationRate = Math.min(
    0.9,
    Math.max(0.05, 0.22 * frictionFactor * (0.95 + rnd() * 0.3))
  );
  const sessions = +(1.6 * intrinsicFactor * (0.6 + rnd() * 1.2)).toFixed(2);
  const nps = Math.round(20 * intrinsicFactor + rnd() * 30 - state.friction * 2);

  // Trends
  const trend = () => (rnd() > 0.5 ? "+" : "-") + (rnd() * 8).toFixed(1) + "%";

  return {
    users,
    activationRate,
    sessions,
    nps,
    trends: {
      users: trend(),
      activation: trend(),
      sessions: trend(),
      nps: trend()
    }
  };
}

function generateFunnel() {
  // Funnel steps and conversion influenced by friction & purpose (goal)
  const steps = ["Visited", "Signed Up", "Activated", "Created", "Shared/Paid"];
  const base = 100;

  // Apply friction & motivation
  const f = Math.max(0.5, 1 - state.friction * 0.05);
  const m = 0.9 + (state.intrinsicMotivation / 100) * 0.2;

  // Goal nudges certain steps
  const goalWeight = {
    activation: [1, 1.1, 1.2, 1.05, 1.0],
    retention: [1, 1.05, 1.15, 1.2, 1.1],
    monetization: [1, 1.0, 1.05, 1.1, 1.25],
    virality: [1, 1.0, 1.05, 1.2, 1.3]
  }[state.goal];

  let values = [];
  let current = base;
  for (let i = 0; i < steps.length; i++) {
    const stepEff = f * m * goalWeight[i];
    current = i === 0 ? base : Math.max(2, Math.round(current * (0.45 + stepEff * 0.4)));
    values.push(current);
  }
  return { steps, values };
}

function generateHeatmapData() {
  // 7x7 matrix representing interaction strength between behaviors
  const behaviors = ["View", "Like", "Comment", "Create", "Share", "Follow", "Purchase"];
  const rnd = seededRand(JSON.stringify(state) + "|heat");
  const data = behaviors.map(() => behaviors.map(() => 0));
  for (let i = 0; i < behaviors.length; i++) {
    for (let j = 0; j < behaviors.length; j++) {
      let base = (i === j) ? 0 : (0.2 + rnd() * 0.8);
      // Motivation amplifies social actions; friction dampens early actions
      if (["Comment", "Share", "Follow"].includes(behaviors[j])) base *= 0.8 + state.intrinsicMotivation / 140;
      if (["View", "Sign Up", "Create"].includes(behaviors[i])) base *= Math.max(0.6, 1 - state.friction * 0.05);
      data[i][j] = +base.toFixed(2);
    }
  }
  return { behaviors, data };
}

function generateInsights(metrics) {
  const list = [];
  // Human nature + business combined
  if (metrics.activationRate < 0.15) {
    list.push("High friction is suppressing early wins—people need quick competence to stay.");
  } else {
    list.push("Early momentum is strong—reinforce intrinsic rewards and social proof.");
  }
  if (metrics.nps < 30) {
    list.push("Trust is fragile; elevate support responsiveness and reduce negative surprises.");
  } else {
    list.push("Strong perceived value—encode moments of pride and status in your UX.");
  }
  if (metrics.sessions > 2.2) {
    list.push("Habits are forming; add gentle streaks and community recognition.");
  } else {
    list.push("Increase return triggers with meaningful reminders, not nags.");
  }
  return list;
}

function generateInterventions() {
  const out = [];
  out.push("<strong>Shorten feedback loops</strong> — surface outcomes immediately after actions (micro-analytics, instant previews).");
  out.push("<strong>Reduce sign-up friction</strong> — progressive profiling & passwordless to preserve flow.");
  out.push("<strong>Build intrinsic hooks</strong> — highlight progress, mastery, and contribution (not just rewards).");
  out.push("<strong>Strengthen trust</strong> — clear pricing, predictable responses, and human support moments.");
  out.push("<strong>Amplify social proof</strong> — show real creations, comments, and appreciative feedback in-line.");
  return out;
}

/* ---------- Charts: Funnel (horizontal bar) ---------- */
let funnelChart;
function renderFunnel() {
  const { steps, values } = generateFunnel();
  const ctx = document.getElementById("funnelChart");
  if (funnelChart) funnelChart.destroy();
  funnelChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: steps,
      datasets: [{
        label: "Users",
        data: values,
        borderRadius: 12,
        backgroundColor: (ctx) => {
          const i = ctx.dataIndex;
          const alphas = [0.85, 0.78, 0.7, 0.62, 0.55];
          return `rgba(16,185,129,${alphas[i]})`;
        },
        borderColor: "#059669"
      }]
    },
    options: {
      indexAxis: "y",
      scales: {
        x: { grid: { color: "rgba(2,44,34,0.06)" } },
        y: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.raw} users`
          }
        }
      }
    }
  });
}

/* ---------- Heatmap ---------- */
function renderHeatmap() {
  const { behaviors, data } = generateHeatmapData();
  els.heatmap.innerHTML = "";
  // header row
  behaviors.forEach(lbl => {
    const cell = document.createElement("div");
    cell.className = "heat-cell";
    cell.style.aspectRatio = "3 / 1";
    cell.style.background = "transparent";
    cell.style.border = "0";
    cell.style.fontWeight = "700";
    cell.style.color = "#065f46";
    cell.textContent = lbl;
    els.heatmap.appendChild(cell);
  });
  // grid
  for (let i = 0; i < behaviors.length; i++) {
    for (let j = 0; j < behaviors.length; j++) {
      const v = data[i][j];
      const cell = document.createElement("div");
      cell.className = "heat-cell";
      const intensity = Math.min(1, v); // 0..1
      const bg = `rgba(16,185,129,${0.12 + intensity * 0.5})`;
      cell.style.background = bg;
      cell.title = `${behaviors[i]} → ${behaviors[j]}: ${Math.round(v*100)}%`;
      cell.addEventListener("click", () => {
        // On click, nudge leverage & re-render to simulate an intervention exploration
        state.intrinsicMotivation = Math.min(100, state.intrinsicMotivation + 2);
        els.incentiveSlider.value = state.intrinsicMotivation;
        els.incentiveVal.textContent = state.intrinsicMotivation;
        updateAll();
      });
      els.heatmap.appendChild(cell);
    }
  }
}

/* ---------- Causal Loop Map (SVG) ---------- */
function renderLoopMap() {
  const svg = els.loopMap;
  svg.innerHTML = "";

  // Gradients & markers
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", "nodeGradient");
  grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
  grad.setAttribute("x2", "1"); grad.setAttribute("y2", "1");
  const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", "#a7f3d0");
  const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s2.setAttribute("offset", "100%"); s2.setAttribute("stop-color", "#6ee7b7");
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", "arrow"); marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "9"); marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "8"); marker.setAttribute("markerHeight", "8");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  arrow.setAttribute("fill", "#047857");
  marker.appendChild(arrow);
  defs.appendChild(marker);

  svg.appendChild(defs);

  const nodes = [
    { id: "Motivation", x: 120, y: 70 },
    { id: "Perceived Value", x: 340, y: 60 },
    { id: "Friction", x: 580, y: 120 },
    { id: "Creation", x: 220, y: 220 },
    { id: "Sharing", x: 420, y: 240 },
    { id: "Trust", x: 520, y: 330 }
  ];

  const links = [
    { s: "Motivation", t: "Creation", type: "reinforcing", sign: "+" },
    { s: "Perceived Value", t: "Motivation", type: "reinforcing", sign: "+" },
    { s: "Creation", t: "Sharing", type: "reinforcing", sign: "+" },
    { s: "Sharing", t: "Perceived Value", type: "reinforcing", sign: "+" },
    { s: "Friction", t: "Creation", type: "balancing", sign: "−" },
    { s: "Trust", t: "Perceived Value", type: "reinforcing", sign: "+" },
    { s: "Friction", t: "Motivation", type: "balancing", sign: "−" },
    { s: "Sharing", t: "Trust", type: "reinforcing", sign: "+" }
  ];

  // Render links
  links.forEach((ln) => {
    const s = nodes.find(n => n.id === ln.s);
    const t = nodes.find(n => n.id === ln.t);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const midX = (s.x + t.x) / 2 + (s.y < t.y ? 20 : -20);
    const midY = (s.y + t.y) / 2 + (s.x < t.x ? -20 : 20);
    const d = `M ${s.x} ${s.y} Q ${midX} ${midY} ${t.x} ${t.y}`;
    path.setAttribute("d", d);
    path.setAttribute("class", `link ${ln.type}`);
    svg.appendChild(path);

    // Sign label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const lx = (s.x + t.x) / 2;
    const ly = (s.y + t.y) / 2;
    label.setAttribute("x", lx); label.setAttribute("y", ly);
    label.setAttribute("class", "link-label");
    label.textContent = ln.sign;
    svg.appendChild(label);
  });

  // Render nodes
  nodes.forEach((n) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("cx", n.x); circ.setAttribute("cy", n.y); circ.setAttribute("r", "32");
    circ.setAttribute("class", "node");
    g.appendChild(circ);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", n.x);
    text.setAttribute("y", n.y + 4);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "node-label");
    text.textContent = n.id;
    g.appendChild(text);

    // Hover tooltip
    g.addEventListener("mousemove", (e) => {
      showTooltip(e.clientX, e.clientY, nodeInsight(n.id));
    });
    g.addEventListener("mouseleave", hideTooltip);

    // Click lowers/raises friction or motivation for demo
    g.addEventListener("click", () => {
      if (n.id === "Friction") {
        state.friction = Math.max(0, state.friction - 1);
        els.frictionSlider.value = state.friction;
        els.frictionVal.textContent = state.friction;
      } else if (n.id === "Motivation") {
        state.intrinsicMotivation = Math.min(100, state.intrinsicMotivation + 5);
        els.incentiveSlider.value = state.intrinsicMotivation;
        els.incentiveVal.textContent = state.intrinsicMotivation;
      } else if (n.id === "Trust") {
        state.delayDays = Math.max(0, state.delayDays - 1);
        els.delaySlider.value = state.delayDays;
        els.delayVal.textContent = state.delayDays;
      }
      updateAll();
    });

    svg.appendChild(g);
  });

  // Toggle highlighting
  const allLinks = svg.querySelectorAll(".link");
  allLinks.forEach(el => {
    el.style.opacity = state.highlightLoops ? 1 : 0.35;
  });
}

function nodeInsight(id) {
  const map = {
    "Motivation": "Humans seek meaning & progress. Nudge mastery over extrinsic rewards.",
    "Perceived Value": "Show tangible outcomes & social proof to make value obvious.",
    "Friction": "Every extra step bleeds energy. Remove, batch, automate.",
    "Creation": "Creative output builds identity and commitment.",
    "Sharing": "Status + reciprocity: people share what they’re proud of.",
    "Trust": "Predictable, honest systems reduce cognitive load and churn."
  };
  return map[id] || id;
}

function showTooltip(x, y, text) {
  els.loopTooltip.hidden = false;
  els.loopTooltip.textContent = text;
  els.loopTooltip.style.left = x + "px";
  els.loopTooltip.style.top = y + "px";
}
function hideTooltip() {
  els.loopTooltip.hidden = true;
}

/* ---------- KPIs & Insights ---------- */
function renderKPIs() {
  const m = generateMetrics();
  els.kpiUsers.textContent = m.users.toLocaleString();
  els.kpiUsersTrend.textContent = m.trends.users;

  els.kpiActivation.textContent = (m.activationRate * 100).toFixed(1) + "%";
  els.kpiActivationTrend.textContent = m.trends.activation;

  els.kpiSessions.textContent = m.sessions.toFixed(2);
  els.kpiSessionsTrend.textContent = m.trends.sessions;

  els.kpiNPS.textContent = m.nps;
  els.kpiNPSTrend.textContent = m.trends.nps;

  // Insights
  const insights = generateInsights(m);
  els.insightsList.innerHTML = insights.map(i => `<li>${i}</li>`).join("");

  // Interventions
  const interventions = generateInterventions();
  els.interventionsList.innerHTML = interventions.map(i => `<li>${i}</li>`).join("");
}

/* ---------- Events ---------- */
function bindEvents() {
  els.apply.addEventListener("click", () => {
    state.timeframe = +els.timeframe.value;
    state.segment = els.segment.value;
    state.goal = els.goal.value;
    state.keyword = els.search.value.trim();
    updateAll();
  });

  els.delaySlider.addEventListener("input", (e) => {
    state.delayDays = +e.target.value;
    els.delayVal.textContent = state.delayDays;
    updateAll();
  });

  els.incentiveSlider.addEventListener("input", (e) => {
    state.intrinsicMotivation = +e.target.value;
    els.incentiveVal.textContent = state.intrinsicMotivation;
    updateAll();
  });

  els.frictionSlider.addEventListener("input", (e) => {
    state.friction = +e.target.value;
    els.frictionVal.textContent = state.friction;
    updateAll();
  });

  els.highlightLoops.addEventListener("change", (e) => {
    state.highlightLoops = e.target.checked;
    renderLoopMap();
  });

  els.regenInsights.addEventListener("click", () => {
    renderKPIs(); // deterministic but allows quick refresh
  });

  els.exportJSON.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "systems_state.json");
    dl.click();
  });
}

/* ---------- Update All ---------- */
function updateAll() {
  renderKPIs();
  renderFunnel();
  renderHeatmap();
  renderLoopMap();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  updateAll();
});

