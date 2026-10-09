/* DOM rendering, filtering, sorting, and local browser state. */
const STORAGE_KEY = "fetchstore-saved-product-ids";
const state = { products: [], activeCategory: "all", searchTerm: "", sortBy: "featured", savedIds: loadSavedIds() };
const el = {
  search: document.querySelector("#search-input"), sort: document.querySelector("#sort-select"),
  refresh: document.querySelector("#refresh-button"), tabs: document.querySelector("#category-tabs"),
  grid: document.querySelector("#product-grid"), status: document.querySelector("#status-message"),
  error: document.querySelector("#error-message"), productCount: document.querySelector("#product-count"),
  categoryCount: document.querySelector("#category-count"), savedCount: document.querySelector("#saved-count"),
  savedGrid: document.querySelector("#saved-grid")
};

function loadSavedIds() {
  try { const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(ids) ? ids : []; }
  catch (error) { console.warn("Could not read saved items from localStorage.", error); return []; }
}
function saveSavedIds() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedIds)); }
  catch (error) { el.error.hidden = false; el.error.textContent = "Your browser could not save items locally. You can still browse products."; }
}
function formatPrice(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value); }
function titleCase(value) { return value.replace(/\b\w/g, letter => letter.toUpperCase()); }
function setLoading(loading) {
  el.refresh.disabled = loading; el.refresh.textContent = loading ? "Loading…" : "Refresh products";
  if (loading) {
    el.status.textContent = "Fetching products from the public API…";
    el.grid.innerHTML = Array.from({length: 4}, () => '<div class="skeleton-card" aria-hidden="true"><div class="skeleton-image"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>').join("");
  }
}
async function loadProducts() {
  setLoading(true); el.error.hidden = true;
  try {
    state.products = await fetchProducts(); buildCategoryTabs(); renderProducts(); renderSavedItems();
    el.status.textContent = `Loaded ${state.products.length} products successfully.`;
  } catch (error) {
    console.error(error);
    el.grid.innerHTML = '<div class="empty-state"><strong>Products could not be loaded.</strong><br>Check your internet connection and try again.</div>';
    el.status.textContent = "Unable to connect to the product service.";
    el.error.hidden = false; el.error.textContent = `${error.message} Refresh the page when the connection is available.`;
  } finally { setLoading(false); }
}
function buildCategoryTabs() {
  const categories = [...new Set(state.products.map(p => p.category))].sort();
  el.categoryCount.textContent = categories.length; el.tabs.innerHTML = "";
  el.tabs.append(createCategoryButton("all", "All products"));
  categories.forEach(category => el.tabs.append(createCategoryButton(category, titleCase(category))));
  updateActiveTab();
}
function createCategoryButton(category, label) {
  const button = document.createElement("button");
  button.type = "button"; button.className = "category-tab"; button.dataset.category = category;
  button.textContent = label; button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => { state.activeCategory = category; updateActiveTab(); renderProducts(); });
  return button;
}
function updateActiveTab() {
  el.tabs.querySelectorAll(".category-tab").forEach(button => {
    const active = button.dataset.category === state.activeCategory;
    button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active));
  });
}
function getVisibleProducts() {
  const term = state.searchTerm.trim().toLowerCase();
  const visible = state.products.filter(p => {
    const categoryMatch = state.activeCategory === "all" || p.category === state.activeCategory;
    const searchMatch = !term || p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  });
  switch (state.sortBy) {
    case "price-asc": visible.sort((a,b) => a.price-b.price); break;
    case "price-desc": visible.sort((a,b) => b.price-a.price); break;
    case "rating-desc": visible.sort((a,b) => b.rating.rate-a.rating.rate); break;
    case "title-asc": visible.sort((a,b) => a.title.localeCompare(b.title)); break;
    default: visible.sort((a,b) => a.id-b.id);
  }
  return visible;
}
function renderProducts() {
  const products = getVisibleProducts(); el.productCount.textContent = products.length;
  if (!products.length) { el.grid.innerHTML = '<div class="empty-state"><strong>No products found.</strong><br>Try a different search term or category.</div>'; return; }
  const fragment = document.createDocumentFragment();
  products.forEach(product => fragment.append(createProductCard(product)));
  el.grid.replaceChildren(fragment);
}
function createProductCard(product) {
  const card = document.createElement("article"); card.className = "product-card";
  const imageWrap = document.createElement("div"); imageWrap.className = "product-image-wrap";
  const image = document.createElement("img"); image.className = "product-image"; image.src = product.image; image.alt = product.title; image.loading = "lazy";
  image.onerror = () => { image.hidden = true; imageWrap.append(document.createTextNode("Image unavailable")); };
  imageWrap.append(image);
  const category = document.createElement("p"); category.className = "product-category"; category.textContent = product.category;
  const title = document.createElement("h2"); title.className = "product-title"; title.textContent = product.title;
  const meta = document.createElement("div"); meta.className = "product-meta";
  const price = document.createElement("span"); price.className = "product-price"; price.textContent = formatPrice(product.price);
  const rating = document.createElement("span"); rating.className = "rating"; rating.textContent = `★ ${product.rating.rate} (${product.rating.count})`;
  meta.append(price, rating);
  const actions = document.createElement("div"); actions.className = "card-actions";
  const save = document.createElement("button"); const saved = state.savedIds.includes(product.id);
  save.className = saved ? "saved" : ""; save.textContent = saved ? "✓ Saved" : "♡ Save item"; save.setAttribute("aria-pressed", String(saved));
  save.addEventListener("click", () => toggleSaved(product.id));
  const details = document.createElement("button"); details.className = "button-light"; details.textContent = "Quick details";
  details.addEventListener("click", () => window.alert(`${product.title}\n\n${product.description}\n\nPrice: ${formatPrice(product.price)}`));
  actions.append(save, details); card.append(imageWrap, category, title, meta, actions); return card;
}
function toggleSaved(id) {
  state.savedIds = state.savedIds.includes(id) ? state.savedIds.filter(savedId => savedId !== id) : [...state.savedIds, id];
  saveSavedIds(); renderProducts(); renderSavedItems();
}
function renderSavedItems() {
  const products = state.savedIds.map(id => state.products.find(p => p.id === id)).filter(Boolean);
  el.savedCount.textContent = products.length; el.savedGrid.innerHTML = "";
  products.forEach(product => {
    const item = document.createElement("div"); item.className = "saved-item";
    const image = document.createElement("img"); image.src = product.image; image.alt = "";
    const title = document.createElement("span"); title.textContent = product.title; title.title = product.title;
    item.append(image, title); el.savedGrid.append(item);
  });
  if (state.products.length && !products.length) {
    const empty = document.createElement("p"); empty.className = "muted";
    empty.textContent = "No saved items yet. Select “Save item” on a product to add one here."; el.savedGrid.append(empty);
  }
}
el.search.addEventListener("input", event => { state.searchTerm = event.target.value; renderProducts(); });
el.sort.addEventListener("change", event => { state.sortBy = event.target.value; renderProducts(); });
el.refresh.addEventListener("click", loadProducts);
loadProducts();
