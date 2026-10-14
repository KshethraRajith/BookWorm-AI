# BookWorm AI — Modern Reading Sanctuary

A modern, responsive reading sanctuary and bookshelf tracker designed with rich aesthetics, fluid animations, and focused literary minimalism.

## Features & Highlights

- **Light & Dark Mode Toggle**:
  - Tactile sliding toggle switch in the top bar with Sun and Moon icons.
  - Automatically matches your system preferences or remembers your custom choice via `localStorage`.
  - Accessible shortcut: Press <kbd>Alt</kbd> + <kbd>T</kbd> anywhere to switch themes instantly.
  - Curated color systems: Warm Literary Paper in Light Mode, and Ethereal Midnight Sanctuary in Dark Mode.

- **Ambient 3D Turning Pages Background Animation**:
  - A subtle, slightly transparent background animation of an open book with continuous, realistic 3D turning pages and drifting leaves behind the content.
  - Gentle depth with non-intrusive opacity to preserve readability while offering an immersive literary ambiance.
  - Respects accessibility settings (`prefers-reduced-motion`).

- **Rich Card Animations & Micro-Interactions**:
  - **Staggered Arrival**: Books glide into view smoothly with a spring curve and staggered timing.
  - **3D Spine Tilt & Shimmer**: Hovering over a book card tilts its cover thumbnail with a glossy light reflection.
  - **Celebratory Arrival**: Newly added books highlight with an amber/emerald pulse.
  - **Smooth Exit & Undo**: Deleting a book slides it away with a sleek exit transition, with an instant **Undo** toast notification if removed by mistake.

- **Dynamic Curated Shelves & Reading Progress**:
  - Filter easily between **All Books**, **Books read** (Finished), **Books reading** (In-progress), and **Wishlist** (To read).
  - Live animated reading progress bar showing completion rate and counts across your collection.

- **Personal Book Ratings & Favorites**:
  - Rate books 1 to 5 stars directly from the card.
  - Mark books with a favorite heart (<kbd>♥</kbd>).

- **Instant Search & Sorting**:
  - Press <kbd>/</kbd> to jump straight into search, and <kbd>Esc</kbd> to clear.
  - Search matches title, author, or genre tags.
  - Sort by *Newest first*, *Oldest first*, *Title (A–Z)*, *Author (A–Z)*, or *Highest rated*.

- **Toast Notifications**:
  - Non-blocking, beautiful feedback for every action (adding, deleting, rating, or theme switching).

- **Load Sample Books**:
  - Quickly test and preview the bookshelf anytime with pre-curated titles using the *Load Sample Books* button in the hero banner or empty state.

## How to Open

Open [`index.html`](./index.html) in any modern browser. No build steps, bundlers, accounts, or databases are required.
Or
Click on the link in the "About Section"!

## Data & Privacy

All your books, ratings, and theme preferences are stored locally on your device in your browser's `localStorage`. No data leaves your machine.
