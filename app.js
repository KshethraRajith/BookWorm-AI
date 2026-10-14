(() => {
  "use strict";

  const STORAGE_KEY = "bookworm.books.v1";
  const statuses = ["To read", "Reading", "Finished"];
  const coverColors = ["#71806a", "#b27857", "#6b7e88", "#a48b62", "#80728b", "#b36854"];
  const form = document.querySelector("#book-form");
  const titleInput = document.querySelector("#title");
  const authorInput = document.querySelector("#author");
  const statusInput = document.querySelector("#status");
  const searchInput = document.querySelector("#search");
  const bookList = document.querySelector("#book-list");
  const statusMessage = document.querySelector("#status-message");
  const resultCount = document.querySelector("#result-count");
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
    document.querySelector("#count-total").textContent = String(books.length);
    document.querySelector("#count-reading").textContent = String(books.filter((book) => book.status === "Reading").length);
    document.querySelector("#count-finished").textContent = String(books.filter((book) => book.status === "Finished").length);
  }

  function createEmptyState(isSearching) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("span");
    icon.className = "empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = isSearching ? "⌕" : "✦";

    const heading = document.createElement("h3");
    heading.textContent = isSearching ? "No books found" : "Your shelf is waiting";

    const description = document.createElement("p");
    description.textContent = isSearching
      ? "Try another title or author, and your book might turn up."
      : "Add a book you’ve been meaning to read and it’ll show up here.";

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
      updateCounts();
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
    form.reset();
    render();
    statusMessage.textContent = `${title} by ${author} added to your list.`;
    titleInput.focus();
  });

  searchInput.addEventListener("input", render);

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
