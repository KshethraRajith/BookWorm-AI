(() => {
  "use strict";

  const STORAGE_KEY = "bookworm.books.v1";
  const statuses = ["To read", "Reading", "Finished"];
  const coverColors = ["#78917b", "#a68b70", "#7f9690", "#9a9a75", "#8c8095", "#aa7d71"];
  const form = document.querySelector("#book-form");
  const titleInput = document.querySelector("#title");
  const authorInput = document.querySelector("#author");
  const statusInput = document.querySelector("#status");
  const searchInput = document.querySelector("#search");
  const bookList = document.querySelector("#book-list");
  const statusMessage = document.querySelector("#status-message");
  const resultCount = document.querySelector("#result-count");
  const showAllButton = document.querySelector("#show-all");
  const listHeading = document.querySelector("#list-heading");
  const shelfOptions = [...document.querySelectorAll(".shelf-option")];
  let activeFilter = "";
  let books = loadBooks();

  function loadBooks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) throw new Error("Saved book list is not an array.");
      return parsed.filter((book) =>
        book &&
        typeof book.id === "string" &&
        typeof book.title === "string" &&
        typeof book.author === "string" &&
        statuses.includes(book.status) &&
        Number.isFinite(book.createdAt)
      );
    } catch (error) {
      console.error("Unable to load the saved book list.", error);
      statusMessage.textContent = "Your saved book list could not be loaded. You can still add books during this visit.";
      return [];
    }
  }

  function saveBooks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      return true;
    } catch (error) {
      console.error("Unable to save the book list.", error);
      statusMessage.textContent = "Could not save your changes. Check that browser storage is available.";
      return false;
    }
  }

  function updateCounts() {
    document.querySelector("#count-reading").textContent = String(books.filter((book) => book.status === "Reading").length);
    document.querySelector("#count-finished").textContent = String(books.filter((book) => book.status === "Finished").length);
    document.querySelector("#count-wishlist").textContent = String(books.filter((book) => book.status === "To read").length);
  }

  function createEmptyState(isSearching) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isSearching ? "⌕" : "✦";

    const heading = document.createElement("h3");
    heading.textContent = isSearching || activeFilter ? "No books here yet" : "Your shelf is waiting";

    const description = document.createElement("p");
    if (isSearching) {
      description.textContent = "Try another title or author, and your book might turn up.";
    } else if (activeFilter === "Finished") {
      description.textContent = "Finish a book and it’ll find its way onto this shelf.";
    } else if (activeFilter === "Reading") {
      description.textContent = "Start reading a book to see it here.";
    } else if (activeFilter === "To read") {
      description.textContent = "Add a book you’re excited to read and it’ll show up here.";
    } else {
      description.textContent = "Add a book you’ve been meaning to read and it’ll show up here.";
    }

    empty.append(icon, heading, description);
    return empty;
  }

  function createBookCard(book) {
    const card = document.createElement("article");
    card.className = "book-card";

    const cover = document.createElement("div");
    cover.className = "book-thumb";
    cover.style.backgroundColor = coverColors[hashString(book.id) % coverColors.length];
    cover.setAttribute("aria-hidden", "true");
    cover.textContent = book.title.trim().charAt(0).toLocaleUpperCase();

    const info = document.createElement("div");
    info.className = "book-info";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = `by ${book.author}`;
    info.append(title, author);

    const actions = document.createElement("div");
    actions.className = "book-actions";

    const status = document.createElement("select");
    status.className = "status-select";
    status.dataset.status = book.status;
    status.setAttribute("aria-label", `Reading status for ${book.title}`);
    statuses.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.selected = value === book.status;
      status.append(option);
    });
    status.addEventListener("change", () => {
      book.status = status.value;
      status.dataset.status = book.status;
      saveBooks();
      render();
      statusMessage.textContent = `${book.title} marked ${book.status}.`;
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${book.title}`);
    deleteButton.title = "Delete book";
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
      books = books.filter((item) => item.id !== book.id);
      saveBooks();
      render();
      statusMessage.textContent = `${book.title} removed from your list.`;
    });

    actions.append(status, deleteButton);
    card.append(cover, info, actions);
    return card;
  }

  function hashString(value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  }

  function render() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const visibleBooks = books
      .slice()
      .sort((first, second) => second.createdAt - first.createdAt)
      .filter((book) => !activeFilter || book.status === activeFilter)
      .filter((book) =>
        book.title.toLocaleLowerCase().includes(query) ||
        book.author.toLocaleLowerCase().includes(query)
      );

    bookList.replaceChildren();
    if (visibleBooks.length === 0) {
      bookList.append(createEmptyState(query.length > 0));
    } else {
      visibleBooks.forEach((book) => bookList.append(createBookCard(book)));
    }

    resultCount.textContent = `${visibleBooks.length} ${visibleBooks.length === 1 ? "book" : "books"}`;
    listHeading.textContent = activeFilter === "Finished"
      ? "Books read."
      : activeFilter === "Reading"
        ? "Books reading."
        : activeFilter === "To read"
          ? "Wishlist."
          : "Your bookshelf.";
    shelfOptions.forEach((option) => {
      const isActive = option.dataset.filter === activeFilter;
      option.setAttribute("aria-pressed", String(isActive));
    });
    showAllButton.hidden = !activeFilter;
    updateCounts();
  }

  function setFieldError(input, message) {
    const error = document.querySelector(`#${input.id}-error`);
    error.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  [titleInput, authorInput].forEach((input) => {
    input.addEventListener("input", () => setFieldError(input, ""));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    setFieldError(titleInput, title ? "" : "Please enter a title");
    setFieldError(authorInput, author ? "" : "Please enter an author");
    if (!title || !author) {
      (title ? authorInput : titleInput).focus();
      return;
    }

    const book = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      author,
      status: statusInput.value,
      createdAt: Date.now()
    };

    books.unshift(book);
    saveBooks();
    searchInput.value = "";
    activeFilter = "";
    form.reset();
    render();
    statusMessage.textContent = `${title} by ${author} added to your list.`;
    titleInput.focus();
  });

  searchInput.addEventListener("input", render);

  shelfOptions.forEach((option) => {
    option.addEventListener("click", () => {
      activeFilter = activeFilter === option.dataset.filter ? "" : option.dataset.filter;
      render();
    });
  });

  showAllButton.addEventListener("click", () => {
    activeFilter = "";
    searchInput.value = "";
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      event.preventDefault();
      searchInput.focus();
    }
  });

  render();
})();
