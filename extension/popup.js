/**
 * Speakable Browser Extension — Popup Script
 *
 * Communicates with the content script to get page HTML,
 * then runs the Speakable analysis pipeline and displays results.
 *
 * NOTE: In production, this would import the bundled analyzer.
 * For the scaffold, it sends HTML to the web analyzer API or
 * uses an inline build of the analysis engine.
 */

const analyzeBtn = document.getElementById('analyze-btn');
const readerSelect = document.getElementById('reader-select');
const formatSelect = document.getElementById('format-select');
const selectorInput = document.getElementById('selector-input');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const outputEl = document.getElementById('output');
const resultsTitleEl = document.getElementById('results-title');
const copyBtn = document.getElementById('copy-btn');
const pageInfoEl = document.getElementById('page-info');
const pageTitleEl = document.getElementById('page-title');
const pageUrlEl = document.getElementById('page-url');

function showStatus(message, type = 'loading') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove('hidden');
}

function hideStatus() {
  statusEl.classList.add('hidden');
}

function showResults(text, title = 'Results') {
  resultsTitleEl.textContent = title;
  outputEl.textContent = text;
  resultsEl.classList.remove('hidden');
}

function hideResults() {
  resultsEl.classList.add('hidden');
}

function showPageInfo(title, url) {
  pageTitleEl.textContent = title;
  pageUrlEl.textContent = url;
  pageInfoEl.classList.remove('hidden');
}

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputEl.textContent).then(() => {
    copyBtn.textContent = '✓';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
  });
});

// Main analyze handler
analyzeBtn.addEventListener('click', async () => {
  const reader = readerSelect.value;
  const format = formatSelect.value;
  const selector = selectorInput.value.trim() || null;

  hideResults();
  showStatus('Analyzing page…', 'loading');
  analyzeBtn.disabled = true;

  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      showStatus('No active tab found.', 'error');
      return;
    }

    // Request HTML from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_PAGE_HTML',
      selector,
    });

    if (!response?.success) {
      showStatus(response?.error || 'Failed to get page HTML.', 'error');
      return;
    }

    showPageInfo(response.title, response.url);

    // Run the analyzer
    const result = window.SpeakableAnalyzer.analyze(
      response.html,
      reader,
      format,
      selector
    );

    // Show warnings if any
    if (result.warnings.length > 0) {
      console.warn('Speakable warnings:', result.warnings);
    }

    hideStatus();

    const scope = selector ? `"${selector}" (${result.elementCount} elements)` : 'Full page';
    showStatus(`Analysis complete — ${scope}`, 'success');
    showResults(result.output, `${reader.toUpperCase()} — ${format}`);

  } catch (err) {
    showStatus(`Error: ${err.message}`, 'error');
  } finally {
    analyzeBtn.disabled = false;
  }
});
