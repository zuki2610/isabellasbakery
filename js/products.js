(function () {
  async function loadProducts() {
    const res = await fetch("./data/products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar products.json");
    return await res.json();
  }

function createCard(p) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="card__image-wrap">
      <img src="${p.img}" alt="${p.name}" class="card__image" />
      <span class="card__badge" data-badge-for="${p.id}">AGOTADO</span>
    </div>

    <h3 class="card__title">${p.name}</h3>
    <p class="card__description">${p.description || ""}</p>

    <div class="card__controls">
      <span class="price">${formatCLP(p.price)}</span>
      <div class="btn-group" role="group" aria-label="Agregar o quitar">
        <button class="btn btn-outline-secondary btn-sm" data-action="dec" data-id="${p.id}" title="Quitar uno">–</button>
        <button class="btn btn-outline-primary btn-sm"
                data-action="inc"
                data-id="${p.id}"
                data-price="${p.price}"
                data-stock="${p.stock}">+</button>
      </div>
    </div>

    <p class="stock-msg" data-stock-for="${p.id}"></p>
  `;


  return card;

}

  function formatCLP(n) {
    try {
      return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
    } catch {
      return "$" + (n|0).toLocaleString("es-CL");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    try {
      const products = await loadProducts();

      products.forEach(p => grid.appendChild(createCard(p)));

   
      window.dispatchEvent(new CustomEvent("catalog:ready"));
    } catch (e) {
      console.error(e);
      grid.innerHTML = `<p class="text-danger">No se pudieron cargar los productos.</p>`;
    }
  });
})();
