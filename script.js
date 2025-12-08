document.addEventListener('DOMContentLoaded', () => {
  const noBsBtn = document.getElementById('no-bs-toggle');
  const body = document.body;
  const foreground = document.querySelector('.foreground');
  const background = document.querySelector('.background');
  let isNoBsMode = false;

  // --- Word-by-word typing utilities ---

  function wrapWordsKeepMarkup(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/); // keep spaces as tokens
      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
        }
      }
      return frag;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(false); // shallow clone to retain tag/attrs
      node.childNodes.forEach(child => clone.appendChild(wrapWordsKeepMarkup(child)));
      return clone;
    }
    return node.cloneNode(true);
  }

  function streamWordsInto(el, wpm = 720, jitter = 0.15) {
    const baseDelay = Math.max(1, Math.round(60000 / Math.max(1, wpm)));

    // Cache original HTML for instant restore
    if (!el.dataset.originalHtml) el.dataset.originalHtml = el.innerHTML;

    // Prepare wrapped markup once and reuse it on subsequent toggles
    if (!el.dataset.wrappedHtml) {
      const tmp = document.createElement('div');
      tmp.innerHTML = el.dataset.originalHtml;
      const container = document.createElement('div');
      Array.from(tmp.childNodes).forEach(n => container.appendChild(wrapWordsKeepMarkup(n)));
      el.dataset.wrappedHtml = container.innerHTML;
    }

    // Replace content and start typing
    el.innerHTML = el.dataset.wrappedHtml;
    el.classList.add('typing');

    const words = el.querySelectorAll('.word');
    let i = 0;
    let cancelled = false;
    let rafId = null;
    let timeoutId = null;

    function tick() {
      if (cancelled) return;
      if (i < words.length) {
        words[i].classList.add('visible');
        i++;
        const jitterScale = 1 + (Math.random() * 2 - 1) * jitter;
        timeoutId = setTimeout(() => {
          rafId = requestAnimationFrame(tick);
        }, Math.round(baseDelay * jitterScale));
      } else {
        el.classList.remove('typing');
      }
    }

    tick();

    // Cancel typing and restore original HTML instantly
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      el.classList.remove('typing');
      el.innerHTML = el.dataset.originalHtml;
    };
  }

  let cancelForegroundStream = null;
  let cancelBackgroundStream = null;

  function init() {
    if (foreground) foreground.style.display = '';
    if (background) background.style.display = 'none';
    if (noBsBtn) noBsBtn.textContent = 'NO BS';
  }

  function toggleNoBsMode() {
    isNoBsMode = !isNoBsMode;

    if (isNoBsMode) {
      body.classList.add('no-bs-mode');
      if (noBsBtn) noBsBtn.classList.add('active');

      // Stop any running stream on the foreground
      if (cancelForegroundStream) { cancelForegroundStream(); cancelForegroundStream = null; }

      if (foreground) foreground.style.display = 'none';
      if (background) {
        background.style.display = '';
        // Start new stream on background content
        cancelBackgroundStream = streamWordsInto(background, 9600);
      }

      if (noBsBtn) noBsBtn.textContent = 'BACK';
    } else {
      body.classList.remove('no-bs-mode');
      if (noBsBtn) noBsBtn.classList.remove('active');

      // Stop any running stream on the background
      if (cancelBackgroundStream) { cancelBackgroundStream(); cancelBackgroundStream = null; }

      if (background) background.style.display = 'none';
      if (foreground) {
        foreground.style.display = '';
        // Start new stream on foreground content
        cancelForegroundStream = streamWordsInto(foreground, 9600);
      }

      if (noBsBtn) noBsBtn.textContent = 'NO BS';
    }
  }

  if (noBsBtn) noBsBtn.addEventListener('click', toggleNoBsMode);
  init();

  // Optional: programmatic control
  window.NoBsToggle = {
    toggle: () => { const btn = document.getElementById('no-bs-toggle'); if (btn) btn.click(); },
    isActive: () => document.body.classList.contains('no-bs-mode')
  };
});


// Live footer clock
function startLiveClock() {
  const el = document.querySelector('.footer #live-now');
  if (!el) return null;

  const dateOptsDay = { day: '2-digit' };
  const dateOptsMonth = { month: 'long' };
  const dateOptsYear = { year: 'numeric' };
  const timeOpts = { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };

  function update() {
    const now = new Date();

    // Build "DD date Month YYYY year"
    const day = now.toLocaleDateString(undefined, dateOptsDay);
    const month = now.toLocaleDateString(undefined, dateOptsMonth);
    const year = now.toLocaleDateString(undefined, dateOptsYear);

    // Build "HH:MM:SS"
    const time = now.toLocaleTimeString(undefined, timeOpts);

    el.textContent = `${day} ${month} ${year} || ${time}`;
  }

  update();
  return setInterval(update, 1000);
}

// Start on load and pause when the tab is hidden
let clockTimerId = null;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    clockTimerId = startLiveClock();
  });
} else {
  clockTimerId = startLiveClock();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (clockTimerId) {
      clearInterval(clockTimerId);
      clockTimerId = null;
    }
  } else if (!clockTimerId) {
    clockTimerId = startLiveClock();
  }
});

