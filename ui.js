let panel;
let contentArea;

function createPanel(onSummarize) {
  if (document.querySelector(".ai-panel")) return;

  panel = document.createElement("div");
  panel.className = "ai-panel";

  panel.innerHTML = `
    <div class="ai-header">
      <div class="ai-header-content">
        <h2>🤖 AI Ticket Summary</h2>
        <p class="ai-subtitle">Powered by Google Gemini</p>
      </div>
      <button id="ai-close" class="ai-close-btn" title="Close panel">×</button>
    </div>

    <div class="ai-actions">
      <button id="ai-run" class="ai-run-btn">
        <span class="btn-icon">✨</span>
        Analyze Ticket
      </button>
    </div>

    <div id="ai-content" class="ai-content"></div>
  `;

  document.body.appendChild(panel);

  contentArea = document.getElementById("ai-content");

  document.getElementById("ai-run").onclick = onSummarize;
  document.getElementById("ai-close").onclick = () => {
    panel.style.display = "none";
  };
}

function showLoading() {
  contentArea.innerHTML = `
    <div class="ai-loading">
      <div class="loading-spinner"></div>
      <p>Analyzing ticket with AI...</p>
      <p class="loading-subtext">This may take a few seconds</p>
    </div>
  `;
}

function renderSummary(data) {
  contentArea.innerHTML = `
    <div class="summary-container">
      <div class="ai-section">
        <h3 class="section-title">
          <span class="section-icon">🎯</span>
          Customer Issue
        </h3>
        <p class="section-content">${escapeHtml(data.customer_issue)}</p>
      </div>

      <div class="ai-section">
        <h3 class="section-title">
          <span class="section-icon">🔍</span>
          Root Cause
        </h3>
        <p class="section-content">${escapeHtml(data.root_cause)}</p>
      </div>

      <div class="ai-section ${data.what_we_provided.length === 1 && data.what_we_provided[0].toLowerCase().includes("no response") ? "section-pending" : "section-provided"}">
        <h3 class="section-title">
          <span class="section-icon">✅</span>
          What We Provided
        </h3>
        ${data.what_we_provided.length === 1 && data.what_we_provided[0].toLowerCase().includes("no response")
          ? `<p class="section-content pending-text">⏳ ${escapeHtml(data.what_we_provided[0])}</p>`
          : `<ul class="bullet-list provided-list">
              ${data.what_we_provided.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>`
        }
      </div>

      <div class="ai-section">
        <h3 class="section-title">
          <span class="section-icon">💡</span>
          Customer Wants
        </h3>
        <ul class="bullet-list">
          ${data.what_customer_wants.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>

      <div class="ai-section">
        <h3 class="section-title">
          <span class="section-icon">⚡</span>
          Action Required
        </h3>
        <ul class="bullet-list action-list">
          ${data.action_required.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>

      <div class="ai-meta">
        <div class="meta-item">
          <span class="meta-label">Priority:</span>
          <span class="priority-badge ${data.priority.toLowerCase()}">${escapeHtml(data.priority)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Sentiment:</span>
          <span class="sentiment-badge">${escapeHtml(data.sentiment)}</span>
        </div>
      </div>
    </div>
  `;
}

function showError(msg) {
  contentArea.innerHTML = `
    <div class="ai-error">
      <div class="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p class="error-message">${escapeHtml(msg)}</p>
      <button onclick="location.reload()" class="retry-btn">Reload Extension</button>
    </div>
  `;
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}