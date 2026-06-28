document.addEventListener('DOMContentLoaded', () => {
  // --- ACCESSIBLE DYNAMIC LIGHT/DARK THEME SWITCHING ---
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  
  // Accessibility Live Announcer for Theme Shifts
  const announceThemeChange = (newTheme) => {
    let announcer = document.getElementById('global-theme-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'global-theme-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = `Visual theme changed to ${newTheme} mode.`;
  };

  // Get current theme from localStorage or default to dark
  let currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  themeToggleBtns.forEach(btn => {
    btn.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`);
    
    btn.addEventListener('click', () => {
      const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      
      // Update HTML node attribute
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('theme', targetTheme);
      
      // Sync all switcher buttons dynamic aria descriptions
      document.querySelectorAll('.theme-toggle-btn').forEach(button => {
        button.setAttribute('aria-label', `Switch to ${targetTheme === 'dark' ? 'light' : 'dark'} theme`);
      });
      
      announceThemeChange(targetTheme);
    });
  });

  // --- SPATIAL UI: 3D CARD PARALLAX HOVER EFFECT ---
  const cards = document.querySelectorAll('.spatial-card');
  
  cards.forEach(card => {
    card.classList.add('spatial-tilt-active');
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = -(y - centerY) / (centerY / 8);
      const rotateY = (x - centerX) / (centerX / 8);
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
      
      // Glow color adaptation according to theme
      const glowColorRGB = document.documentElement.getAttribute('data-theme') === 'light' 
        ? 'var(--accent-cyan-rgb)' 
        : '6, 182, 212';
        
      card.style.backgroundImage = `
        radial-gradient(
          circle at ${x}px ${y}px, 
          rgba(${glowColorRGB}, 0.08) 0%, 
          rgba(168, 85, 247, 0.03) 50%, 
          transparent 80%
        )
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      card.style.backgroundImage = 'none';
    });
  });

  // --- RESPONSIVE MOBILE NAVIGATION WITH ACCESSIBILITY ---
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (navToggle && navMenu) {
    const focusableEls = navMenu.querySelectorAll('a, button');
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    const toggleMenu = () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      navMenu.classList.toggle('active');
      
      if (!isOpen) {
        setTimeout(() => firstFocusableEl.focus(), 100);
      } else {
        navToggle.focus();
      }
    };

    navToggle.addEventListener('click', toggleMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu();
      }
      
      if (navMenu.classList.contains('active')) {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // --- FOOTER: CURRENT YEAR ---
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- DYNAMIC ACCESSIBLE CONTACT FORM VALIDATION ---
  const contactForm = document.getElementById('portfolio-contact-form');
  const liveRegion = document.getElementById('form-live-feedback');
  
  if (contactForm) {
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const subjectInput = document.getElementById('form-subject');
    const messageInput = document.getElementById('form-message');
    const successBox = document.getElementById('success-announcement');

    const validateField = (input, errorId, validationMsg) => {
      const errorEl = document.getElementById(errorId);
      let isValid = true;

      if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(input.value.trim());
      } else {
        isValid = input.value.trim().length > 0;
      }

      if (!isValid) {
        input.setAttribute('aria-invalid', 'true');
        errorEl.textContent = validationMsg;
        errorEl.classList.add('active');
      } else {
        input.setAttribute('aria-invalid', 'false');
        errorEl.textContent = '';
        errorEl.classList.remove('active');
      }
      
      return isValid;
    };

    if (nameInput) nameInput.addEventListener('blur', () => validateField(nameInput, 'name-error', 'Full Name is required.'));
    if (emailInput) emailInput.addEventListener('blur', () => validateField(emailInput, 'email-error', 'Please enter a valid email address.'));
    if (subjectInput) subjectInput.addEventListener('blur', () => validateField(subjectInput, 'subject-error', 'Subject is required.'));
    if (messageInput) messageInput.addEventListener('blur', () => validateField(messageInput, 'message-error', 'Message cannot be empty.'));

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const isNameValid = validateField(nameInput, 'name-error', 'Full Name is required.');
      const isEmailValid = validateField(emailInput, 'email-error', 'Please enter a valid email address.');
      const isSubjectValid = validateField(subjectInput, 'subject-error', 'Subject is required.');
      const isMessageValid = validateField(messageInput, 'message-error', 'Message cannot be empty.');

      if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
        successBox.style.display = 'flex';
        successBox.focus();
        
        if (liveRegion) {
          liveRegion.textContent = 'Thank you Tharun! Your contact form message has been sent successfully.';
        }
        
        contactForm.reset();
        
        [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
          inp.removeAttribute('aria-invalid');
        });
      } else {
        const invalidInput = contactForm.querySelector('[aria-invalid="true"]');
        if (invalidInput) {
          invalidInput.focus();
        }

        if (liveRegion) {
          liveRegion.textContent = 'Form submission failed. Please correct the highlighted errors and try again.';
        }
      }
    });
  }
});
