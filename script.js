document.addEventListener('DOMContentLoaded', () => {
  const masked = document.getElementById('masked-content');
  const wrapper = document.querySelector('.wrapper');
  const textContent = document.querySelector('.text-content');
  
  if (!masked || !wrapper || !textContent) return;
  
  let isMouseInside = false;
  let animationFrame;
  
  // Enhanced mouse tracking with smooth animation
  const updateMousePosition = (e) => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    
    animationFrame = requestAnimationFrame(() => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Ensure coordinates are within bounds
      const clampedX = Math.max(0, Math.min(rect.width, x));
      const clampedY = Math.max(0, Math.min(rect.height, y));
      
      masked.style.setProperty('--mouse-x', `${clampedX}px`);
      masked.style.setProperty('--mouse-y', `${clampedY}px`);
    });
  };
  
  // Mouse enter/leave events for better UX
  textContent.addEventListener('mouseenter', () => {
    isMouseInside = true;
    wrapper.style.cursor = 'crosshair';
  });
  
  textContent.addEventListener('mouseleave', () => {
    isMouseInside = false;
    wrapper.style.cursor = 'default';
    // Reset to center when mouse leaves
    masked.style.setProperty('--mouse-x', '50%');
    masked.style.setProperty('--mouse-y', '50%');
  });
  
  // Main mouse move handler
  wrapper.addEventListener('mousemove', updateMousePosition);
  
  // Touch support for mobile devices
  wrapper.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updateMousePosition(touch);
    }
  }, { passive: false });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (!isMouseInside) {
      masked.style.setProperty('--mouse-x', '50%');
      masked.style.setProperty('--mouse-y', '50%');
    }
  });
});
