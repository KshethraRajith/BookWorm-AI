# BookWorm AI — Prompts Log

> A full record of all prompts used to design, build, and enhance this project with an AI coding assistant (Google Antigravity / Gemini).

---

## 🛠️ Build Process

### Prompt 1 — Initial UI/UX Redesign
```
use the existing web app and design the ui/ux with latest features and style.
Add toggle switch for light and dark mode.
Animation for each cards.
And a slightly transparent animation behind the screen of the content, of book turning pages.
```

**What was built:**
- Full UI/UX redesign with a warm literary aesthetic (light mode) and an ethereal midnight sanctuary (dark mode)
- Tactile light/dark toggle switch with Sun/Moon icons and `Alt+T` keyboard shortcut
- `localStorage` persistence for theme preference and system preference detection
- Ambient 3D turning pages background animation with 6 fanning pages, gilded edges, and stardust particles
- Staggered entrance animations for book cards with spring curves
- 3D tilt + shimmer on card hover, celebratory pulse on newly added books
- Smooth slide-out delete with Undo toast notification

---

### Prompt 2 — Deploy & Push to GitHub
```
provide deployable link that can be shared to users and also push all the code here to github repo
```

**What was done:**
- Initialized git, created remote repository `KshethraRajith/BookWorm-AI` on GitHub
- Pushed all code to `main` branch
- Configured GitHub Pages auto-deployment from root `/` on `main`
- Live link: [https://kshethrarajith.github.io/BookWorm-AI/](https://kshethrarajith.github.io/BookWorm-AI/)

---

### Prompt 3 — Enhance Background Animation & Logo
```
make a beautiful logo and make the background book pages turning animation more visible and magical
```

**What was built:**
- Redesigned brand logo emblem: an open book with golden pages, ribbon bookmark, and sparkle stars, inside a deep green jewel shield
- Boosted background animation visibility — increased page opacity, added ambient aurora gradient and multi-layered glow halos
- Added `@keyframes` for logo sparkle effects on brand hover

---

### Prompt 4 — Floating Green Book Animation
```
Pls add an animation the floating green book.
It will open when the cursor touch it and close when the cursor moves away.
```

**What was built:**
- Added CSS `perspective: 1200px` container and `transform-style: preserve-3d` to the hero book wrapper
- Front cover swings open on hover with `rotateY(-155deg)` using `cubic-bezier(0.16, 1, 0.3, 1)` spring easing
- Fanning middle page leaves (`leaf-left`, `leaf-mid`) fan open with staggered delays on hover
- Book elevates, pauses its floating animation, and gains a deep drop shadow on hover
- Added `is-open` toggle on click/`Enter`/`Space` for touch/keyboard accessibility
- Inside of front cover revealed with dark green felt pattern and golden seal

---

### Prompt 5 — BIBLIOPHILE Word + Logo Redesign
```
Now, as the green floating book opens when cursor touches it,
the page opens and fades in the word BIBLIOPHILE on the page inside.

The logo should be letter B with a worm inside or a worm in the shape of small letter b.
```

**What was built:**
- **Logo redesign**: The golden letter **B** forms the outer spine, with a bookworm wearing golden spectacles and antennae peeking through the top loop; the worm's body curves into the lower loop forming a lowercase **b** around a mini open book
- Worm hover micro-animations: head bob (`@keyframes worm-head-bob`) and body wiggle (`@keyframes worm-body-wiggle`)
- Favicon updated to match the B-with-worm motif
- Added `BIBLIOPHILE` in amber serif lettering to the right page of the inner book spread with a smooth fade-in (`opacity: 0` → `opacity: 1`) triggered by hover/open state
- Added pronunciation `/ˈbɪb.li.ə.faɪl/` and definition *"a lover of books"*
- Applied `@keyframes bibliophile-glow` pulsing golden glow animation

---

### Prompt 6 — BIBLIOPHILE on the First White Page
```
I also need BIBLIOPHILE written here on the first white page. fade in animation for the word.
```

**What was built:**
- Replaced the previous two-page inner spread with a single **First White Page** (`first-white-page`) — a creamy parchment page fully revealed when the green cover swings open
- Page layout:
  - **Header**: `✦ EX LIBRIS ✦` in emerald green uppercase
  - **Centre**: `BIBLIOPHILE` in large bold gold gradient serif text with a glowing drop-shadow animation
  - **Sub**: phonetic `/ˈbɪb.li.ə.faɪl/` in italic green
  - **Ornament**: `─── ◆ ───` gilded divider
  - **Definition**: *"a lover of books"* in italic forest green
  - **Footer**: `p. 01` folio + `❦` fleuron flourish
- Fade-in: the entire `bibliophile-fade-wrapper` starts invisible and glides in (`translateY(8px)` → `0`, `scale(0.92)` → `1`) with an `0.85s` spring delay after the cover opens

---

### Prompt 7 — Push All Changes to GitHub
```
update the change in github repo.
```

**What was done:**
- `git add`, `git commit`, `git push origin main` for all pending changes
- GitHub Actions `pages-build-deployment` completed in ~40s
- All changes verified live at [https://kshethrarajith.github.io/BookWorm-AI/](https://kshethrarajith.github.io/BookWorm-AI/)

---

### Prompt 8 — Add PROMPTS.md
```
I also need a PROMPTS.md in the repo
```

**What was done:**
- Created this file documenting the full build journey prompt-by-prompt

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | Vanilla HTML5 (semantic) |
| Styling | Vanilla CSS3 (custom properties, animations, 3D transforms) |
| Logic | Vanilla JavaScript (ES2022, no frameworks) |
| Fonts | Google Fonts — Playfair Display, DM Sans, Plus Jakarta Sans |
| Storage | `localStorage` (no backend, no database) |
| Hosting | GitHub Pages (auto-deploy from `main`) |

---

## 🔗 Links

- **Live App**: [https://kshethrarajith.github.io/BookWorm-AI/](https://kshethrarajith.github.io/BookWorm-AI/)
- **Repository**: [https://github.com/KshethraRajith/BookWorm-AI](https://github.com/KshethraRajith/BookWorm-AI)
