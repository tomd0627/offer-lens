/* exported */

var lastResult = null;

var SAMPLE_OFFER =
  'OFFER OF EMPLOYMENT\n\n' +
  'Dear Candidate,\n\n' +
  'We are pleased to offer you the position of Senior Software Engineer at Acme Corp, Inc. ' +
  'This offer is contingent upon successful completion of a background check.\n\n' +
  'COMPENSATION\n' +
  'Base Salary: $118,000 per year, paid bi-weekly.\n' +
  'Performance Bonus: Eligible for up to 8% annual bonus at management discretion. No guaranteed minimum.\n' +
  'Equity: 5,000 RSUs vesting over 4 years with a 1-year cliff. Valuation based on last 409A at $3.20/share.\n\n' +
  'BENEFITS\n' +
  'Health Insurance: Medical, dental, and vision. Employee premium: $180/month. Coverage begins on the 1st of the month following 90 days of employment.\n' +
  '401(k): Available after 6 months. Company match: none at this time.\n' +
  'PTO: 12 days per year. No rollover. Use-it-or-lose-it policy.\n' +
  'Remote Work: In-office required Monday–Thursday. Remote Fridays at manager discretion.\n\n' +
  'LEGAL\n' +
  'Non-Compete: Employee agrees not to engage in competing business activities within a 50-mile radius for 24 months following termination.\n' +
  'IP Assignment: Any inventions, ideas, or creative works developed by Employee, whether during or outside of working hours, related or unrelated to Company business, are the sole property of Acme Corp.\n' +
  'At-Will Employment: Employment is at-will and may be terminated by either party at any time, with or without cause, without notice.\n\n' +
  'Start Date: August 1, 2026\n\n' +
  'Please sign and return by June 20, 2026.\n\n' +
  'Sincerely,\nHiring Manager, Acme Corp';

function showSection(id) {
  [
    'api-key-section',
    'input-section',
    'loading-section',
    'error-section',
    'output-section',
  ].forEach(function (sectionId) {
    var el = document.getElementById(sectionId);
    if (el) {
      if (sectionId === id) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

function showSections() {
  var args = Array.prototype.slice.call(arguments);
  [
    'api-key-section',
    'input-section',
    'loading-section',
    'error-section',
    'output-section',
  ].forEach(function (sectionId) {
    var el = document.getElementById(sectionId);
    if (el) {
      if (args.indexOf(sectionId) !== -1) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });
}

function setError(message) {
  document.getElementById('error-message').textContent = message;
  showSections('input-section', 'error-section');
  document.getElementById('error-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function friendlyError(err) {
  if (!err || !err.message) return 'An unexpected error occurred. Please try again.';
  if (err.message === 'NETWORK_ERROR') {
    return 'Could not reach the Claude API. Check your internet connection and try again.';
  }
  if (err.message === 'INVALID_KEY') {
    return 'Your API key was rejected. Please verify it at console.anthropic.com and update it below.';
  }
  if (err.message === 'PARSE_ERROR') {
    return 'The AI response could not be parsed. Please try again — this is usually transient.';
  }
  if (err.message === 'NO_KEY') {
    return 'No API key found. Please enter your key to continue.';
  }
  if (err.message.indexOf('API_ERROR:') === 0) {
    return 'API error: ' + err.message.replace('API_ERROR:', '').trim();
  }
  return err.message;
}

function copyReport() {
  if (!lastResult) return;
  var text = getPlainTextReport(lastResult);
  navigator.clipboard.writeText(text).then(function () {
    ['copy-btn', 'copy-btn-footer'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      var original = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="check" aria-hidden="true"></i> Copied!';
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      setTimeout(function () {
        btn.innerHTML = original;
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }, 2000);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Initialize Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Determine initial view
  var savedKey = window.sessionStorage.getItem('ol_api_key');
  if (savedKey) {
    showSection('input-section');
  } else {
    showSection('api-key-section');
  }

  // Save API key
  document.getElementById('save-key-btn').addEventListener('click', function () {
    var keyInput = document.getElementById('api-key-input');
    var key = keyInput.value.trim();
    if (!key) {
      keyInput.focus();
      return;
    }
    window.sessionStorage.setItem('ol_api_key', key);
    keyInput.value = '';
    showSection('input-section');
  });

  // Change key
  document.getElementById('change-key-btn').addEventListener('click', function () {
    window.sessionStorage.removeItem('ol_api_key');
    showSection('api-key-section');
    document.getElementById('api-key-input').focus();
  });

  // Sample offer
  document.getElementById('sample-btn').addEventListener('click', function () {
    document.getElementById('offer-text').value = SAMPLE_OFFER;
    document.getElementById('target-salary').value = '$135,000';
    document.getElementById('location').value = 'New York, NY';
    document.getElementById('experience').value = '7';
    document.getElementById('role-industry').value = 'Senior Software Engineer, SaaS';
    document.getElementById('offer-text').focus();
  });

  // Form submit
  document.getElementById('offer-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    var offerText = document.getElementById('offer-text').value.trim();
    var errorEl = document.getElementById('offer-text-error');

    if (!offerText) {
      errorEl.textContent = 'Please paste your offer letter or job description.';
      document.getElementById('offer-text').focus();
      return;
    }
    errorEl.textContent = '';

    var salary = document.getElementById('target-salary').value.trim();
    var location = document.getElementById('location').value.trim();
    var experience = document.getElementById('experience').value.trim();
    var role = document.getElementById('role-industry').value.trim();

    showSection('loading-section');

    try {
      var result = await analyzeOffer(offerText, salary, location, experience, role);
      lastResult = result;
      renderResult(result);
      showSection('output-section');
      var heading = document.getElementById('output-heading');
      if (heading) heading.focus();
    } catch (err) {
      if (err.message === 'INVALID_KEY') {
        window.sessionStorage.removeItem('ol_api_key');
      }
      setError(friendlyError(err));
    }
  });

  // Retry
  document.getElementById('retry-btn').addEventListener('click', function () {
    showSections('input-section');
  });

  // Analyze another
  document.getElementById('analyze-another-btn').addEventListener('click', function () {
    lastResult = null;
    document.getElementById('offer-form').reset();
    showSection('input-section');
    document.getElementById('offer-text').focus();
  });

  // Copy buttons
  document.getElementById('copy-btn').addEventListener('click', copyReport);
  document.getElementById('copy-btn-footer').addEventListener('click', copyReport);
});
