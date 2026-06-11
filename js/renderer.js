/* exported renderResult, getPlainTextReport */

var SCORE_LABELS = {
  low: 'Below Average',
  mid: 'Average',
  high: 'Above Average',
};

var SCORE_DESCRIPTIONS = {
  low: 'This offer has significant concerns worth addressing before accepting.',
  mid: 'This offer is roughly in line with market expectations.',
  high: 'This offer is competitive and compares well to market rates.',
};

var FLAG_ICONS = {
  high: 'alert-triangle',
  medium: 'alert-circle',
  low: 'info',
};

function scoreRange(score) {
  if (score <= 4) return 'low';
  if (score <= 6) return 'mid';
  return 'high';
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

function renderDetailList(container, items) {
  container.innerHTML = '';
  items.forEach(function (item) {
    var dt = document.createElement('dt');
    dt.className = 'detail-term';
    dt.textContent = item.term;

    var dd = document.createElement('dd');
    dd.className = 'detail-value';
    dd.textContent = item.value;

    var wrapper = document.createElement('div');
    wrapper.className = 'detail-item';
    wrapper.appendChild(dt);
    wrapper.appendChild(dd);

    container.appendChild(wrapper);
  });
}

function renderResult(data) {
  var score = Number(data.score) || 1;
  var range = scoreRange(score);

  // Score card
  var scoreCard = document.querySelector('.score-card');
  scoreCard.setAttribute('data-score', range);
  scoreCard.setAttribute(
    'aria-label',
    'Overall score: ' + score + ' out of 10 — ' + SCORE_LABELS[range]
  );

  document.getElementById('score-number').textContent = score;
  document.getElementById('score-label').textContent = SCORE_LABELS[range];
  document.getElementById('score-description').textContent = SCORE_DESCRIPTIONS[range];

  // Compensation
  var comp = data.compensation || {};
  var verdictBadge = document.getElementById('comp-verdict');
  verdictBadge.textContent = comp.verdict || '';
  verdictBadge.setAttribute('data-verdict', (comp.verdict || '').toLowerCase());

  renderDetailList(document.getElementById('comp-details'), [
    { term: 'Base Salary', value: comp.base || '—' },
    { term: 'Bonus', value: comp.bonus || '—' },
    { term: 'Equity', value: comp.equity || '—' },
    { term: 'Notes', value: comp.notes || '—' },
  ]);

  // Benefits
  var ben = data.benefits || {};
  renderDetailList(document.getElementById('benefits-details'), [
    { term: 'PTO', value: ben.pto || '—' },
    { term: 'Health', value: ben.health || '—' },
    { term: 'Retirement', value: ben.retirement || '—' },
    { term: 'Remote Policy', value: ben.remote || '—' },
    { term: 'Notes', value: ben.notes || '—' },
  ]);

  // Flags
  var flagsList = document.getElementById('flags-list');
  flagsList.innerHTML = '';
  (data.flags || []).forEach(function (flag) {
    var severity = (flag.severity || 'low').toLowerCase();
    var iconName = FLAG_ICONS[severity] || 'info';

    var li = document.createElement('li');
    li.className = 'flag-item';
    li.setAttribute('data-severity', severity);

    li.innerHTML =
      '<div class="flag-header">' +
      '<i data-lucide="' +
      escapeHtml(iconName) +
      '" aria-hidden="true"></i>' +
      '<span class="flag-severity">' +
      escapeHtml(severity) +
      '</span>' +
      '<span class="flag-title">' +
      escapeHtml(flag.title || '') +
      '</span>' +
      '</div>' +
      '<p class="flag-detail">' +
      escapeHtml(flag.detail || '') +
      '</p>';

    flagsList.appendChild(li);
  });

  // Negotiation
  var negList = document.getElementById('negotiation-list');
  negList.innerHTML = '';
  (data.negotiation || []).forEach(function (item) {
    var li = document.createElement('li');
    li.className = 'negotiation-item';
    li.innerHTML =
      '<div class="negotiation-content">' +
      '<p class="negotiation-angle">' +
      escapeHtml(item.angle || '') +
      '</p>' +
      '<blockquote class="negotiation-example">' +
      escapeHtml(item.example || '') +
      '</blockquote>' +
      '</div>';
    negList.appendChild(li);
  });

  // Summary
  var summaryContainer = document.getElementById('summary-text');
  summaryContainer.innerHTML = '';
  var summaryText = data.summary || '';
  summaryText.split(/\n\n+/).forEach(function (para) {
    var p = document.createElement('p');
    p.textContent = para.trim();
    summaryContainer.appendChild(p);
  });

  // Re-run Lucide to render any newly injected icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function getPlainTextReport(data) {
  if (!data) return '';
  var lines = [];
  var comp = data.compensation || {};
  var ben = data.benefits || {};
  var score = data.score || '';

  lines.push('OFFER LENS REPORT');
  lines.push('=================\n');
  lines.push('Overall Score: ' + score + '/10\n');

  lines.push('COMPENSATION');
  lines.push('Verdict: ' + (comp.verdict || '—'));
  lines.push('Base: ' + (comp.base || '—'));
  lines.push('Bonus: ' + (comp.bonus || '—'));
  lines.push('Equity: ' + (comp.equity || '—'));
  lines.push('Notes: ' + (comp.notes || '—') + '\n');

  lines.push('BENEFITS');
  lines.push('PTO: ' + (ben.pto || '—'));
  lines.push('Health: ' + (ben.health || '—'));
  lines.push('Retirement: ' + (ben.retirement || '—'));
  lines.push('Remote Policy: ' + (ben.remote || '—'));
  lines.push('Notes: ' + (ben.notes || '—') + '\n');

  lines.push('RED FLAGS');
  (data.flags || []).forEach(function (flag, i) {
    lines.push(i + 1 + '. [' + (flag.severity || '').toUpperCase() + '] ' + (flag.title || ''));
    lines.push('   ' + (flag.detail || ''));
  });
  lines.push('');

  lines.push('NEGOTIATION ANGLES');
  (data.negotiation || []).forEach(function (item, i) {
    lines.push(i + 1 + '. ' + (item.angle || ''));
    lines.push('   "' + (item.example || '') + '"');
  });
  lines.push('');

  lines.push('SUMMARY');
  lines.push(data.summary || '');

  return lines.join('\n');
}
