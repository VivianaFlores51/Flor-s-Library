// Flor's Library - interacciones de la Biblioteca

document.addEventListener("DOMContentLoaded", () => {
  // Navegación responsive
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      siteNav.classList.toggle("open");
    });
  }

  // Solo ejecutar lógica de biblioteca en la página de biblioteca
  const body = document.body;
  if (!body || body.dataset.page !== "library") return;

  const cards = Array.from(document.querySelectorAll(".card--book"));
  const searchInput = document.getElementById("library-search");
  const categoryFilters = document.querySelectorAll("[data-filter]");
  const statusFilters = document.querySelectorAll("[data-status]");

  let activeCategory = "all";
  let activeStatus = "all";
  let searchTerm = "";

  function applyFilters() {
    cards.forEach((card) => {
      const category = card.getAttribute("data-category") || "";
      const status = card.getAttribute("data-status") || "";
      const title = (card.querySelector("h3")?.textContent || "").toLowerCase();
      const author = (card.querySelector("p strong")?.textContent || "").toLowerCase();

      const matchesCategory = activeCategory === "all" || category === activeCategory;
      const matchesStatus = activeStatus === "all" || status === activeStatus;
      const matchesSearch =
        !searchTerm ||
        title.includes(searchTerm) ||
        author.includes(searchTerm);

      if (matchesCategory && matchesStatus && matchesSearch) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Filtros por categoría
  categoryFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-filter") || "all";
      categoryFilters.forEach((b) =>
        b.classList.toggle("is-active", b === btn)
      );
      applyFilters();
    });
  });

  // Filtros por estado
  statusFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeStatus = btn.getAttribute("data-status") || "all";
      statusFilters.forEach((b) =>
        b.classList.toggle("is-active", b === btn)
      );
      applyFilters();
    });
  });

  // Búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Lector de PDFs
  const reader = document.getElementById("reader");
  const readerFrame = reader?.querySelector(".reader__frame");
  const readerTitle = document.getElementById("reader-title");
  const readerClose = reader?.querySelector(".reader__close");
  const readerBackdrop = reader?.querySelector(".reader__backdrop");
  const readerFinish = reader?.querySelector(".reader__finish");
  const readerOpenLink = reader?.querySelector(".reader__openlink");

  function openReader(card) {
    const doc = card.getAttribute("data-doc");
    const title = card.querySelector("h3")?.textContent || "Lector";
    if (!reader || !readerFrame || !doc) return;

    readerFrame.src = doc;
    if (readerTitle) readerTitle.textContent = title;
    if (readerOpenLink) readerOpenLink.href = doc;
    reader.hidden = false;
  }

  function closeReader() {
    if (!reader || !readerFrame) return;
    reader.hidden = true;
    readerFrame.src = "";
  }

  if (readerClose) readerClose.addEventListener("click", closeReader);
  if (readerBackdrop)
    readerBackdrop.addEventListener("click", closeReader);
  if (readerFinish)
    readerFinish.addEventListener("click", closeReader);

  // Click en botones "Leer"
  cards.forEach((card) => {
    const readBtn = card.querySelector(".btn.btn--ghost");
    if (readBtn) {
      readBtn.addEventListener("click", () => openReader(card));
    }
  });
});

