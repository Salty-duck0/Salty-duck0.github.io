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

