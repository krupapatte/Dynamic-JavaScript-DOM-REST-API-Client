/* API layer: network requests are kept separate from UI logic. */
const API_BASE_URL = "https://fakestoreapi.com";

async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error(`The product service returned an error (${response.status}).`);
  const products = await response.json();
  if (!Array.isArray(products)) throw new Error("The API response was not in the expected format.");
  return products;
}
