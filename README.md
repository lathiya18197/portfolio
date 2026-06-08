# Viral Ghori — Developer Portfolio

A clean, fast, framework-free portfolio site — HTML, CSS, and vanilla JavaScript.
Dark/light mode, mobile responsive, and ready for GitHub Pages.

> **Before going live:** add your CV as `assets/Viral_Ghori_CV.pdf`, and create a
> free [Formspree](https://formspree.io) form and paste its id into the contact
> form's `action` in `index.html` (replaces `your-form-id`).

## Structure

```
portfolio/
├── index.html          # All page markup (semantic, accessible)
├── css/
│   └── style.css       # Design tokens + components, mobile-first
├── js/
│   └── script.js       # Theme toggle, nav, scroll-spy, form validation
├── assets/             # Images, icons, CV, og-image
│   └── favicon.svg
├── .nojekyll           # Tell GitHub Pages to serve files as-is
└── README.md
```

## Customising

Search-and-replace these placeholders across `index.html`:

| Placeholder            | Replace with                          |
| ---------------------- | ------------------------------------- |
| `Your Name`            | Your full name                        |
| `yourusername`         | Your GitHub / LinkedIn handle         |
| `you@example.com`      | Your contact email                    |
| Project cards          | Your real projects                    |
| Experience timeline    | Your real roles                       |

- **Brand initials:** edit `.brand-mark` text in `index.html` and the favicon.
- **Accent colours:** change `--accent` / `--accent-2` in `css/style.css` `:root`.
- **CV download:** drop `your-name-cv.pdf` into `assets/`.
- **Social preview:** add `assets/og-image.png` (1200×630).

## Contact form

The form validates on the client and currently simulates a send. To make it real,
open `js/script.js`, find `submitForm()`, and wire it to a service such as
[Formspree](https://formspree.io) or [Netlify Forms], or your own endpoint.

## Deploy to GitHub Pages

1. Create a repo named `yourusername.github.io` (or any repo name).
2. Push these files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/yourusername/yourusername.github.io.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Source → Deploy from a branch → `main` / root**.
4. Visit `https://yourusername.github.io` (give it a minute on first deploy).

## Local preview

Run the included script — it starts a static server and opens your browser:

```bash
./run.sh            # serves on http://localhost:8080
./run.sh 3000       # custom port
```

Stop it with `Ctrl-C`. It uses Python 3 if available, falling back to
`python`, `npx serve`, or `php`. (You can also just open `index.html` directly.)

## Notes

- No build step, no dependencies — what you see is what ships.
- Respects `prefers-reduced-motion` and `prefers-color-scheme`.
- Lighthouse-friendly: semantic HTML, deferred JS, system fonts fallback.
```
