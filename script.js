document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('email');
  const messageEl = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');

  // Simple robust email regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const showMessage = (msg, type) => {
    messageEl.textContent = msg;
    messageEl.className = `form-message show ${type}`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Basic Validation
    if (!email) {
      showMessage('Please enter an email address.', 'error');
      emailInput.focus();
      return;
    }

    if (!validateEmail(email)) {
      showMessage('Please enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }

    // Simulate API call and success state
    submitBtn.disabled = true;

    // Save original configurations
    const originalBtnText = btnText.textContent;
    const iconSvg = submitBtn.querySelector('.btn-icon');
    const originalIcon = iconSvg ? iconSvg.outerHTML : '';

    // Show loading state
    btnText.textContent = 'Subscribing...';

    // Swap icon to spinner
    submitBtn.innerHTML = `
            <span class="btn-text">Subscribing...</span>
            <svg class="btn-icon spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" opacity="0.3"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
            </svg>
        `;

    // Real API call to subscribe.php
    fetch('subscribe.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    })
      .then(response => response.json())
      .then(data => {
        submitBtn.disabled = false;

        if (data.success) {
          showMessage(data.message, 'success');
          emailInput.value = ''; // Clear input on success
        } else {
          showMessage(data.message, 'error');
        }

        // Reset button to original state after 4 seconds
        setTimeout(() => {
          submitBtn.innerHTML = `
                    <span class="btn-text">${originalBtnText}</span>
                    ${originalIcon}
                `;
          if (data.success) messageEl.className = 'form-message'; // fade out message only on success
        }, 4000);
      })
      .catch(error => {
        submitBtn.disabled = false;
        showMessage('Network error. Please try again.', 'error');

        setTimeout(() => {
          submitBtn.innerHTML = `
                    <span class="btn-text">${originalBtnText}</span>
                    ${originalIcon}
                `;
        }, 4000);
      });
  });

  // Clear error message when user starts typing again
  emailInput.addEventListener('input', () => {
    if (messageEl.classList.contains('error')) {
      messageEl.classList.remove('show');
    }
  });
});
