(() => {
  "use strict";

  // Storage Keys
  const STORAGE_KEY = "bookworm.books.v1";
  const THEME_KEY = "bookworm.theme.v1";

  // Data Constants
  const statuses = ["To read", "Reading", "Finished"];
  const coverPalettes = [
    { bg: "#3d6b4f", text: "#f0f8f2" },
    { bg: "#a3673c", text: "#fff5ee" },
    { bg: "#4a6878", text: "#f0f5fa" },
    { bg: "#6d597a", text: "#faf4fc" },
    { bg: "#8a7d45", text: "#fcfaf0" },
    { bg: "#587d71", text: "#f2faf7" },
    { bg: "#9e5252", text: "#fdf3f3" },
    { bg: "#4e7055", text: "#f4f9f5" }
  ];

  const sampleBooks = [
    {
      id: "sample-1",
      title: "The Midnight Library",
      author: "Matt Haig",
      status: "Finished",
      genre: "Fiction",
      rating: 5,
      favorite: true,
      createdAt: Date.now() - 86400000 * 5
    },
    {
      id: "sample-2",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      status: "Reading",
      genre: "Sci-Fi & Fantasy",
      rating: 4,
      favorite: false,
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: "sample-3",
      title: "Atomic Habits",
      author: "James Clear",
      status: "Finished",
      genre: "Non-Fiction",
      rating: 5,
      favorite: true,
      createdAt: Date.now() - 86400000 * 8
    },
    {
      id: "sample-4",
      title: "Meditations",
      author: "Marcus Aurelius",
      status: "To read",
      genre: "Philosophy",
      rating: 0,
      favorite: false,
      createdAt: Date.now() - 86400000 * 1
    },
    {
      id: "sample-5",
      title: "Project Hail Mary",
      author: "Andy Weir",
      status: "Reading",
      genre: "Sci-Fi & Fantasy",
      rating: 5,
      favorite: true,
      createdAt: Date.now() - 86400000 * 2
    }
  ];

  // DOM Elements
  const form = document.querySelector("#book-form");
  const titleInput = document.querySelector("#title");
  const authorInput = document.querySelector("#author");
  const statusInput = document.querySelector("#status");
  const genreInput = document.querySelector("#genre");
  const ratingValInput = document.querySelector("#rating-val");
  const starRatingInput = document.querySelector("#star-rating-input");
  const searchInput = document.querySelector("#search");
  const searchClearBtn = document.querySelector("#search-clear-btn");
  const sortSelect = document.querySelector("#sort-select");
  const bookList = document.querySelector("#book-list");
  const statusMessage = document.querySelector("#status-message");
  const resultCount = document.querySelector("#result-count");
  const showAllButton = document.querySelector("#show-all");
  const listHeading = document.querySelector("#list-heading");
  const shelfOptions = [...document.querySelectorAll(".shelf-option")];
  const themeToggle = document.querySelector("#theme-toggle");
  const toastContainer = document.querySelector("#toast-container");
  const summaryTotalBooks = document.querySelector("#summary-total-books");
  const shelfProgressFill = document.querySelector("#shelf-progress-fill");
  const shelfProgressLabel = document.querySelector("#shelf-progress-label");
  const headerProgressText = document.querySelector("#header-progress-text");
  const heroSampleBtn = document.querySelector("#hero-sample-btn");

  // State
  let activeFilter = "";
  let currentSort = "newest";
  let newlyAddedId = null;
  let lastDeletedBook = null;
  let lastDeletedIndex = null;
  let books = loadBooks();

  /* --------------------------------------------------------------------------
     1. Theme Switcher (Light / Dark Mode)
     -------------------------------------------------------------------------- */
  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, showNotice = false) {
    document.documentElement.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    if (themeToggle) {
      themeToggle.setAttribute("aria-checked", String(isDark));
      themeToggle.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} mode (Alt+T)`);
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", isDark ? "#0e1411" : "#f6f8f4");
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn("Storage unavailable for theme preference.");
    }

    if (showNotice) {
      showToast(isDark ? "Switched to Dark Sanctuary" : "Switched to Warm Light", isDark ? "🌙" : "☀️");
    }
  }

  function initTheme() {
    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme, false);

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next, true);
      });
    }

    // Follow OS preference changes if user hasn't explicitly set preference
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? "dark" : "light", true);
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     2. Book Storage & Persistence
     -------------------------------------------------------------------------- */
  function loadBooks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Pre-populate with sample books on first visit for an impressive immediate feel
        return sampleBooks.slice();
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((book) =>
        book &&
        typeof book.id === "string" &&
        typeof book.title === "string" &&
        typeof book.author === "string" &&
        statuses.includes(book.status) &&
        Number.isFinite(book.createdAt)
      );
    } catch (error) {
      console.error("Unable to load books from localStorage.", error);
      return [];
    }
  }

  function saveBooks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      return true;
    } catch (error) {
      console.error("Unable to save books to localStorage.", error);
      showToast("Storage error: Could not save changes.", "⚠️");
      return false;
    }
  }

  /* --------------------------------------------------------------------------
     3. Helper Utilities & Hash
     -------------------------------------------------------------------------- */
  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function formatRelativeDate(timestamp) {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Added today";
    if (days === 1) return "Added yesterday";
    if (days < 30) return `Added ${days}d ago`;
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  /* --------------------------------------------------------------------------
     4. Toast Notifications System
     -------------------------------------------------------------------------- */
  function showToast(message, icon = "✦", action = null) {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";

    const iconEl = document.createElement("span");
    iconEl.className = "toast-icon";
    iconEl.textContent = icon;

    const messageEl = document.createElement("span");
    messageEl.className = "toast-message";
    messageEl.textContent = message;

    toast.append(iconEl, messageEl);

    if (action) {
      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "toast-undo-btn";
      actionBtn.textContent = action.label;
      actionBtn.addEventListener("click", () => {
        action.callback();
        dismiss();
      });
      toast.append(actionBtn);
    }

    function dismiss() {
      toast.classList.add("toast-exit");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }

    toastContainer.append(toast);
    setTimeout(dismiss, action ? 6000 : 3800);
  }

  /* --------------------------------------------------------------------------
     5. Shelf Counts & Progress Meter
     -------------------------------------------------------------------------- */
  function updateCounts() {
    const reading = books.filter((b) => b.status === "Reading").length;
    const finished = books.filter((b) => b.status === "Finished").length;
    const wishlist = books.filter((b) => b.status === "To read").length;
    const total = books.length;

    const countAll = document.querySelector("#count-all");
    const countReading = document.querySelector("#count-reading");
    const countFinished = document.querySelector("#count-finished");
    const countWishlist = document.querySelector("#count-wishlist");

    if (countAll) countAll.textContent = String(total);
    if (countReading) countReading.textContent = String(reading);
    if (countFinished) countFinished.textContent = String(finished);
    if (countWishlist) countWishlist.textContent = String(wishlist);
    if (summaryTotalBooks) summaryTotalBooks.textContent = String(total);

    // Progress bar calculation
    const percentage = total > 0 ? Math.round((finished / total) * 100) : 0;
    if (shelfProgressFill) {
      shelfProgressFill.style.width = `${percentage}%`;
    }
    if (shelfProgressLabel) {
      shelfProgressLabel.textContent = `${percentage}% completed (${finished}/${total})`;
    }
    if (headerProgressText) {
      headerProgressText.textContent = total > 0 ? `${finished} of ${total} finished` : "Reading Sanctuary";
    }
  }

  /* --------------------------------------------------------------------------
     6. Empty State Creation
     -------------------------------------------------------------------------- */
  function createEmptyState(isSearching) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isSearching ? "⌕" : "🕮";

    const heading = document.createElement("h3");
    heading.textContent = isSearching ? "No matching books found" : activeFilter ? `No books in ${activeFilter}` : "Your bookshelf is waiting";

    const description = document.createElement("p");
    if (isSearching) {
      description.textContent = "Try searching for a different title, author, or genre.";
    } else if (activeFilter === "Finished") {
      description.textContent = "Finish a book and mark it completed to celebrate your milestones here.";
    } else if (activeFilter === "Reading") {
      description.textContent = "Mark a book as currently reading to keep track of your active chapter.";
    } else if (activeFilter === "To read") {
      description.textContent = "Add titles you are yearning to explore next to your wishlist.";
    } else {
      description.textContent = "Begin by adding a favorite book or load our sample curated collection.";
    }

    empty.append(icon, heading, description);

    if (!isSearching && books.length === 0) {
      const sampleBtn = document.createElement("button");
      sampleBtn.type = "button";
      sampleBtn.className = "empty-sample-btn";
      sampleBtn.innerHTML = '<span aria-hidden="true">✨</span> Load Sample Collection';
      sampleBtn.addEventListener("click", () => {
        books = sampleBooks.slice();
        saveBooks();
        render();
        showToast("Loaded curated sample books!", "✨");
      });
      empty.append(sampleBtn);
    }

    return empty;
  }

  /* --------------------------------------------------------------------------
     7. Card Creation with Rich Interactions & Animations
     -------------------------------------------------------------------------- */
  function createBookCard(book, index) {
    const card = document.createElement("article");
    card.className = "book-card";
    card.style.setProperty("--card-index", String(index));

    if (book.id === newlyAddedId) {
      card.classList.add("just-added");
    }

    // Cover Thumbnail
    const cover = document.createElement("div");
    cover.className = "book-thumb";
    const palette = coverPalettes[hashString(book.id + book.title) % coverPalettes.length];
    cover.style.backgroundColor = palette.bg;
    cover.style.color = palette.text;
    cover.setAttribute("aria-hidden", "true");
    cover.textContent = (book.title.trim().charAt(0) || "B").toLocaleUpperCase();

    const ribbon = document.createElement("span");
    ribbon.className = "thumb-ribbon";
    cover.append(ribbon);

    // Book Information
    const info = document.createElement("div");
    info.className = "book-info";

    const titleRow = document.createElement("div");
    titleRow.className = "book-title-row";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;
    title.title = book.title;
    titleRow.append(title);

    if (book.genre) {
      const genre = document.createElement("span");
      genre.className = "genre-tag";
      genre.textContent = book.genre;
      titleRow.append(genre);
    }

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = `by ${book.author}`;

    // Meta row (Rating stars + date added)
    const metaRow = document.createElement("div");
    metaRow.className = "book-card-meta";

    // Star rating
    const starsContainer = document.createElement("div");
    starsContainer.className = "card-rating-stars";
    starsContainer.setAttribute("aria-label", `Rating: ${book.rating || 0} stars`);

    for (let star = 1; star <= 5; star += 1) {
      const starSpan = document.createElement("span");
      starSpan.className = `card-star ${star <= (book.rating || 0) ? "active" : ""}`;
      starSpan.textContent = "★";
      starSpan.title = `Rate ${star} star${star > 1 ? "s" : ""}`;
      starSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        book.rating = book.rating === star ? 0 : star;
        saveBooks();
        render();
        showToast(`Rated "${book.title}" ${book.rating} ★`, "⭐");
      });
      starsContainer.append(starSpan);
    }

    const dateAdded = document.createElement("span");
    dateAdded.className = "book-date-added";
    dateAdded.textContent = formatRelativeDate(book.createdAt);

    metaRow.append(starsContainer, dateAdded);
    info.append(titleRow, author, metaRow);

    // Book Actions
    const actions = document.createElement("div");
    actions.className = "book-actions";

    // Favorite Button
    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = `favorite-btn ${book.favorite ? "active" : ""}`;
    favBtn.setAttribute("aria-label", book.favorite ? `Unmark ${book.title} as favorite` : `Mark ${book.title} as favorite`);
    favBtn.title = book.favorite ? "Favorited" : "Mark favorite";
    favBtn.textContent = book.favorite ? "♥" : "♡";
    favBtn.addEventListener("click", () => {
      book.favorite = !book.favorite;
      saveBooks();
      render();
      showToast(book.favorite ? `Favorited "${book.title}"` : `Removed from favorites`, book.favorite ? "❤️" : "♡");
    });

    // Status Select Pill
    const status = document.createElement("select");
    status.className = "status-select";
    status.dataset.status = book.status;
    status.setAttribute("aria-label", `Reading status for ${book.title}`);

    statuses.forEach((val) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      opt.selected = val === book.status;
      status.append(opt);
    });

    status.addEventListener("change", () => {
      book.status = status.value;
      status.dataset.status = book.status;
      saveBooks();
      render();
      showToast(`Marked "${book.title}" as ${book.status}`, book.status === "Finished" ? "🎉" : "📖");
    });

    // Delete Button with Smooth Exit Animation
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-button";
    deleteBtn.setAttribute("aria-label", `Remove ${book.title} from bookshelf`);
    deleteBtn.title = "Remove from shelf";
    deleteBtn.textContent = "×";

    deleteBtn.addEventListener("click", () => {
      // Play card exit animation first
      card.classList.add("is-deleting");

      setTimeout(() => {
        lastDeletedIndex = books.findIndex((b) => b.id === book.id);
        lastDeletedBook = book;
        books = books.filter((item) => item.id !== book.id);
        saveBooks();
        render();

        showToast(`Removed "${book.title}"`, "🗑️", {
          label: "Undo",
          callback: () => {
            if (lastDeletedBook) {
              const insertAt = lastDeletedIndex !== null && lastDeletedIndex >= 0 ? lastDeletedIndex : 0;
              books.splice(insertAt, 0, lastDeletedBook);
              newlyAddedId = lastDeletedBook.id;
              saveBooks();
              render();
              showToast(`Restored "${lastDeletedBook.title}"`, "✨");
              lastDeletedBook = null;
              lastDeletedIndex = null;
            }
          }
        });
      }, 280);
    });

    actions.append(favBtn, status, deleteBtn);
    card.append(cover, info, actions);
    return card;
  }

  /* --------------------------------------------------------------------------
     8. Render Pipeline (Filtering, Sorting, and List Sync)
     -------------------------------------------------------------------------- */
  function render() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    if (searchClearBtn) {
      searchClearBtn.hidden = query.length === 0;
    }

    let filtered = books.slice();

    // Shelf filter
    if (activeFilter) {
      filtered = filtered.filter((book) => book.status === activeFilter);
    }

    // Search query filter (title, author, or genre)
    if (query) {
      filtered = filtered.filter((book) =>
        book.title.toLocaleLowerCase().includes(query) ||
        book.author.toLocaleLowerCase().includes(query) ||
        (book.genre && book.genre.toLocaleLowerCase().includes(query))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (currentSort === "newest") return b.createdAt - a.createdAt;
      if (currentSort === "oldest") return a.createdAt - b.createdAt;
      if (currentSort === "title") return a.title.localeCompare(b.title);
      if (currentSort === "author") return a.author.localeCompare(b.author);
      if (currentSort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    // Render cards
    bookList.replaceChildren();
    if (filtered.length === 0) {
      bookList.append(createEmptyState(query.length > 0));
    } else {
      filtered.forEach((book, idx) => {
        bookList.append(createBookCard(book, idx));
      });
    }

    // Reset newlyAddedId after rendering
    newlyAddedId = null;

    // Update Meta texts
    resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "book" : "books"}`;
    listHeading.textContent = activeFilter === "Finished"
      ? "Books read."
      : activeFilter === "Reading"
        ? "Books reading."
        : activeFilter === "To read"
          ? "Wishlist."
          : "Your bookshelf.";

    shelfOptions.forEach((option) => {
      const isTarget = option.dataset.filter === activeFilter;
      option.setAttribute("aria-pressed", String(isTarget));
      option.classList.toggle("active", isTarget);
    });

    showAllButton.hidden = !activeFilter && !query;
    updateCounts();
  }

  /* --------------------------------------------------------------------------
     9. Form Validation & Submission
     -------------------------------------------------------------------------- */
  function setFieldError(input, message) {
    const error = document.querySelector(`#${input.id}-error`);
    if (error) error.textContent = message;
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  [titleInput, authorInput].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => setFieldError(input, ""));
    }
  });

  // Star Rating Picker in Add Form
  if (starRatingInput) {
    const starButtons = [...starRatingInput.querySelectorAll(".star-btn")];
    starButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseInt(btn.dataset.value, 10);
        const current = parseInt(ratingValInput.value, 10);
        const nextVal = current === val ? 0 : val;
        ratingValInput.value = String(nextVal);
        starButtons.forEach((b) => {
          b.classList.toggle("selected", parseInt(b.dataset.value, 10) <= nextVal);
        });
      });
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const status = statusInput.value;
    const genre = genreInput ? genreInput.value : "General";
    const rating = ratingValInput ? parseInt(ratingValInput.value, 10) || 0 : 0;

    setFieldError(titleInput, title ? "" : "Please enter a book title");
    setFieldError(authorInput, author ? "" : "Please enter the author's name");

    if (!title || !author) {
      (title ? authorInput : titleInput).focus();
      return;
    }

    const newBook = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      author,
      status,
      genre,
      rating,
      favorite: false,
      createdAt: Date.now()
    };

    newlyAddedId = newBook.id;
    books.unshift(newBook);
    saveBooks();

    // Reset form fields
    form.reset();
    if (ratingValInput) ratingValInput.value = "0";
    if (starRatingInput) {
      starRatingInput.querySelectorAll(".star-btn").forEach((b) => b.classList.remove("selected"));
    }

    // Reset filters to show new book at the top
    activeFilter = "";
    if (searchInput) searchInput.value = "";
    render();

    showToast(`"${title}" added to your bookshelf!`, "📖");
    titleInput.focus();
  });

  /* --------------------------------------------------------------------------
     10. Event Listeners & Shortcuts
     -------------------------------------------------------------------------- */
  // Search interactions
  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      render();
      searchInput.focus();
    });
  }

  // Sorting
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value;
      render();
    });
  }

  // Shelf Filter Buttons
  shelfOptions.forEach((option) => {
    option.addEventListener("click", () => {
      activeFilter = option.dataset.filter;
      render();
    });
  });

  // Clear Filter / Show All Button
  if (showAllButton) {
    showAllButton.addEventListener("click", () => {
      activeFilter = "";
      searchInput.value = "";
      render();
    });
  }

  // Hero Sample Collection Button
  if (heroSampleBtn) {
    heroSampleBtn.addEventListener("click", () => {
      // Check if sample books are already present
      const hasSamples = sampleBooks.every((sb) => books.some((b) => b.title === sb.title));
      if (!hasSamples) {
        sampleBooks.forEach((sb) => {
          if (!books.some((b) => b.title === sb.title)) {
            books.push({ ...sb, id: `sample-${Date.now()}-${Math.random().toString(36).slice(2)}` });
          }
        });
      } else {
        books = sampleBooks.slice();
      }
      saveBooks();
      render();
      showToast("Curated sample library loaded!", "✨");
    });
  }

  // Global Keyboard Shortcuts
  document.addEventListener("keydown", (event) => {
    // Quick focus search with '/'
    if (
      event.key === "/" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      searchInput.focus();
      return;
    }

    // Clear search with 'Escape'
    if (event.key === "Escape" && document.activeElement === searchInput) {
      if (searchInput.value) {
        searchInput.value = "";
        render();
      } else {
        searchInput.blur();
      }
      return;
    }

    // Toggle theme with 'Alt+T'
    if (event.altKey && (event.key === "t" || event.key === "T")) {
      event.preventDefault();
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark", true);
    }
  });

  // Interactive Floating Green Book (Touch / Click & Keyboard toggle)
  const heroFloatingBook = document.querySelector("#hero-floating-book");
  if (heroFloatingBook) {
    heroFloatingBook.addEventListener("click", () => {
      heroFloatingBook.classList.toggle("is-open");
    });
    heroFloatingBook.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        heroFloatingBook.classList.toggle("is-open");
      }
    });
  }

  /* --------------------------------------------------------------------------
     11. Initialize
     -------------------------------------------------------------------------- */
  initTheme();
  render();
})();
