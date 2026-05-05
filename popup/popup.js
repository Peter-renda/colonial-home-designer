import { parseBom } from "../lib/bom.js";

const fileInput = document.getElementById("file");
const summary = document.getElementById("summary");
const runBtn = document.getElementById("run");
const log = document.getElementById("log");

let bom = null;

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  try {
    bom = parseBom(text);
  } catch (err) {
    showSummary(`Could not parse CSV: ${err.message}`, true);
    runBtn.disabled = true;
    return;
  }
  showSummary(`${bom.length} item(s) loaded.`);
  runBtn.disabled = bom.length === 0;
});

runBtn.addEventListener("click", async () => {
  if (!bom) return;
  runBtn.disabled = true;
  log.innerHTML = "";

  const port = chrome.runtime.connect({ name: "bom-run" });
  port.postMessage({ type: "run", bom });
  port.onMessage.addListener((msg) => {
    if (msg.type === "progress") appendLog(msg.line, msg.ok);
    if (msg.type === "done") {
      appendLog(`Done — ${msg.succeeded}/${msg.total} added.`, msg.succeeded === msg.total);
      runBtn.disabled = false;
    }
  });
});

function showSummary(text, isError = false) {
  summary.textContent = text;
  summary.classList.remove("hidden");
  summary.style.background = isError ? "#fde8e8" : "#f1f6ff";
}

function appendLog(line, ok) {
  const li = document.createElement("li");
  li.textContent = line;
  li.className = ok ? "ok" : "err";
  log.appendChild(li);
  li.scrollIntoView({ block: "end" });
}
