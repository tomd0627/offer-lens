/* exported analyzeOffer */

var SYSTEM_PROMPT =
  'You are a senior compensation advisor with 20 years of recruiting and HR experience. ' +
  'A job seeker has shared their offer letter and personal context. ' +
  'Analyze the offer thoroughly and return ONLY valid JSON — no markdown, no explanation, no code fences. ' +
  'Never fabricate specific salary benchmarks; reason from the context clues in the offer and the candidate context provided. ' +
  'Flag non-compete clauses, IP assignment overreach, vague equity language, and at-will clauses with onerous carve-outs. ' +
  'The JSON must match this schema exactly:\n' +
  '{\n' +
  '  "score": <integer 1-10>,\n' +
  '  "compensation": {\n' +
  '    "verdict": "<above market|fair|below market>",\n' +
  '    "base": "<string>",\n' +
  '    "bonus": "<string>",\n' +
  '    "equity": "<string>",\n' +
  '    "notes": "<string>"\n' +
  '  },\n' +
  '  "benefits": {\n' +
  '    "pto": "<string>",\n' +
  '    "health": "<string>",\n' +
  '    "retirement": "<string>",\n' +
  '    "remote": "<string>",\n' +
  '    "notes": "<string>"\n' +
  '  },\n' +
  '  "flags": [\n' +
  '    { "severity": "<high|medium|low>", "title": "<string>", "detail": "<string>" }\n' +
  '  ],\n' +
  '  "negotiation": [\n' +
  '    { "angle": "<string>", "example": "<string>" }\n' +
  '  ],\n' +
  '  "summary": "<2-3 paragraph plain-English verdict>"\n' +
  '}';

function buildUserMessage(offerText, salary, location, experience, role) {
  var parts = ['Here is the job offer to analyze:\n\n---\n' + offerText + '\n---'];
  if (salary) parts.push('Candidate target salary: ' + salary);
  if (location) parts.push('Location / metro area: ' + location);
  if (experience) parts.push('Years of experience: ' + experience);
  if (role) parts.push('Role / industry: ' + role);
  parts.push(
    '\nPlease analyze this offer and return valid JSON only, matching the schema exactly.'
  );
  return parts.join('\n');
}

function stripJsonFences(text) {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

async function analyzeOffer(offerText, salary, location, experience, role) {
  var apiKey = window.localStorage.getItem('ol_api_key');
  if (!apiKey) {
    throw new Error('NO_KEY');
  }

  var body = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserMessage(offerText, salary, location, experience, role),
      },
    ],
  });

  var response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: body,
    });
  } catch {
    throw new Error('NETWORK_ERROR');
  }

  if (!response.ok) {
    var errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }
    var apiMsg =
      errorData && errorData.error && errorData.error.message
        ? errorData.error.message
        : 'Unknown API error';
    if (response.status === 401) {
      throw new Error('INVALID_KEY');
    }
    throw new Error('API_ERROR:' + apiMsg);
  }

  var data;
  try {
    data = await response.json();
  } catch {
    throw new Error('PARSE_ERROR');
  }

  var rawText = data.content && data.content[0] && data.content[0].text ? data.content[0].text : '';

  var cleaned = stripJsonFences(rawText);

  var result;
  try {
    result = JSON.parse(cleaned);
  } catch {
    throw new Error('PARSE_ERROR');
  }

  return result;
}
