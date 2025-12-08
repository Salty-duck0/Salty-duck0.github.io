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


// Profile Image Long Press Feature
document.addEventListener('DOMContentLoaded', () => {
  const profilePic = document.querySelector('.profile-pic');
  const wrapper = document.querySelector('.profile-wrapper');

  if (!profilePic || !wrapper) return;

  let pressTimer;
  const PRESS_DURATION = 750; // 0.75 seconds
  const pixelDuck = 'public/pixel-duck.png';
  const coolDuck = 'public/cool-duck.png';

  function startPress(e) {
    // Prevent default context menu on long press for touch devices
    if (e.type === 'touchstart') {
      e.preventDefault(); // Prevent long-press context menu
    }

    wrapper.classList.add('loading');

    pressTimer = setTimeout(() => {
      swapImage();
      wrapper.classList.remove('loading');
      if (navigator.vibrate) navigator.vibrate(50);
    }, PRESS_DURATION);
  }

  // Block context menu (right-click / long-press menu) on profile image
  profilePic.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  function endPress() {
    clearTimeout(pressTimer);
    wrapper.classList.remove('loading');
  }

  function swapImage() {
    const currentSrc = profilePic.getAttribute('src');
    // Check if current src contains the filename (to handle absolute paths)
    if (currentSrc.includes('pixel-duck')) {
      profilePic.src = coolDuck;
    } else {
      profilePic.src = pixelDuck;
    }
  }

  // Mouse events
  profilePic.addEventListener('mousedown', startPress);
  profilePic.addEventListener('mouseup', endPress);
  profilePic.addEventListener('mouseleave', endPress);

  // Touch events
  profilePic.addEventListener('touchstart', startPress, { passive: true });
  profilePic.addEventListener('touchend', endPress);
  profilePic.addEventListener('touchcancel', endPress);
});
