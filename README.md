# Offer Lens

**Paste your job offer. Know if it's fair.**

An AI-powered job offer analyzer that gives you the senior compensation advisor you don't have in the room. Paste an offer letter, add your target salary and location, and get a structured breakdown covering compensation fairness, benefits quality, red flags, negotiation angles, and a plain-English verdict.

## Tech Stack

- Vanilla HTML / CSS / JS — no framework, no build step
- [Claude API](https://www.anthropic.com) (`claude-sonnet-4-20250514`) for analysis
- [Lucide](https://lucide.dev) icons via CDN
- Deployed on Netlify

## Running Locally

No build step required. Open `index.html` directly in your browser — or use any static file server:

```bash
npx serve .
# or
python -m http.server 8080
```

On first load, enter your [Anthropic API key](https://console.anthropic.com/settings/keys). It's stored in `sessionStorage` only and never leaves your device.

## Deploying to Netlify

1. Push to GitHub
2. Connect the repo in Netlify — publish directory is `/` (root)
3. No build command needed

Security headers and asset caching are configured in `netlify.toml`.

## Development

Install dev tooling (linting, formatting, pre-commit hooks):

```bash
npm install
```

Run linters manually:

```bash
npm run lint:css
npm run lint:js
npm run lint:html
npm run format
```

Pre-commit hooks run automatically via Husky.

## License

MIT
