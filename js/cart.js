(function () {
  const STORAGE_KEY = "ib_cart_v1";
  const STOCK_KEY   = "ib_stock_v1";

  const state = {
    items: [],    
    stock: {},     
    meta: {}       
  };

  const el = {
    badge: null,
    list: null,
    total: null,
    clearBtn: null
  };


  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) state.items = parsed;
      }
    } catch (e) { console.warn("Cart: load error", e); }
  }
  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }
  function loadStock() {
    try {
      const raw = localStorage.getItem(STOCK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") state.stock = parsed;
      }
    } catch (e) { console.warn("Stock: load error", e); }
  }
  function saveStock() {
    localStorage.setItem(STOCK_KEY, JSON.stringify(state.stock));
  }


  function peso(n) {
    try {
      return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
    } catch {
      return "$" + (n|0).toLocaleString("es-CL");
    }
  }
  function findIndex(id) { return state.items.findIndex(x => x.id === id); }
  function items() { return state.items.slice(); }
  function count() { return state.items.reduce((a, b) => a + b.qty, 0); }
  function total() { return state.items.reduce((a, b) => a + b.qty * (b.price || 0), 0); }
  function dispatchUpdated(type) {
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: { type, items: items() } }));
  }

 
  function getStock(id) { return state.stock[id] ?? 0; }
  function setStock(id, val) {
    state.stock[id] = Math.max(0, parseInt(val || 0, 10));
    saveStock();
    updateStockUI(id);
  }
  function decStock(id, qty=1) { setStock(id, getStock(id) - qty); }
  function incStock(id, qty=1) { setStock(id, getStock(id) + qty); }

  function updateStockUI(id) {
    const s = getStock(id);
    const meta = state.meta[id];
    if (!meta) return;
    const { msgEl, plusBtn, name } = meta;

   
    if (msgEl) {
      if (s <= 0) {
        msgEl.textContent = `"${name}" está agotado.`;
        msgEl.className = "stock-msg text-danger";
      } else if (s === 1) {
        msgEl.textContent = `¡Último! Queda solo 1 de "${name}".`;
        msgEl.className = "stock-msg text-warning";
      } else if (s < 4) {
        msgEl.textContent = `Nos quedan solo ${s} de "${name}".`;
        msgEl.className = "stock-msg text-warning";
      } else {
        msgEl.textContent = `Stock disponible: ${s}`;
        msgEl.className = "stock-msg text-secondary";
      }
    }

   
    if (plusBtn) {
      plusBtn.disabled = s <= 0;
      plusBtn.classList.toggle("disabled", s <= 0);
    }

    
    if (meta.badgeEl) {
      if (s <= 0) meta.badgeEl.classList.add("visible");
      else meta.badgeEl.classList.remove("visible");
    }
    if (meta.cardEl) {
      meta.cardEl.classList.toggle("is-soldout", s <= 0);
    }
  }


  const Cart = {
    add({ id, name, price=0, qty=1, img="" }) {
      if (getStock(id) < qty) { buzz(); notifyLowStock(id); return; }
      const idx = findIndex(id);
      if (idx >= 0) {
        if (getStock(id) < 1) { buzz(); notifyLowStock(id); return; }
        state.items[idx].qty += 1;
        decStock(id, 1);
      } else {
        state.items.push({ id, name, price, qty, img });
        decStock(id, qty);
      }
      saveCart();
      dispatchUpdated("add");
    },
    remove(id) {
      const idx = findIndex(id);
      if (idx >= 0) {
        const q = state.items[idx].qty;
        state.items.splice(idx, 1);
        incStock(id, q);
        saveCart();
        dispatchUpdated("remove");
      }
    },
    setQty(id, qty) {
      qty = Math.max(1, parseInt(qty||1, 10));
      const idx = findIndex(id);
      if (idx < 0) return;

      const current = state.items[idx].qty;
      const diff = qty - current;

      if (diff > 0) {
        if (getStock(id) < diff) { buzz(); notifyLowStock(id); return; }
        state.items[idx].qty = qty;
        decStock(id, diff);
      } else if (diff < 0) {
        state.items[idx].qty = qty;
        incStock(id, -diff);
      }
      saveCart();
      dispatchUpdated("update");
    },
    dec(id) {
      const idx = findIndex(id);
      if (idx >= 0) {
        state.items[idx].qty -= 1;
        if (state.items[idx].qty <= 0) {
          state.items.splice(idx, 1);
          incStock(id, 1);
          saveCart();
          dispatchUpdated("remove");
        } else {
          incStock(id, 1);
          saveCart();
          dispatchUpdated("update");
        }
      }
    },
    clear() {
      for (const it of state.items) incStock(it.id, it.qty);
      state.items = [];
      saveCart();
      dispatchUpdated("clear");
    },
    count, total, items
  };
  window.Cart = Cart;

  function renderCart() {
    if (!el.list) return;
    el.list.innerHTML = "";
    const arr = Cart.items();

    if (arr.length === 0) {
      el.list.innerHTML = `<p class="text-secondary mb-0">Tu carrito está vacío.</p>`;
    } else {
      arr.forEach(it => {
        const row = document.createElement("div");
        row.className = "d-flex align-items-center mb-3";
        row.innerHTML = `
          <img src="${it.img || ''}" class="rounded me-2" style="width:48px;height:48px;object-fit:cover" alt="">
          <div class="flex-grow-1">
            <div class="fw-medium">${it.name}</div>
            <div class="small text-secondary">${peso(it.price || 0)}</div>
            <div class="btn-group btn-group-sm mt-1" role="group">
              <button class="btn btn-outline-secondary" data-action="dec" data-id="${it.id}">-</button>
              <input type="number" min="1" value="${it.qty}" class="form-control form-control-sm text-center" style="width:64px" data-action="qty" data-id="${it.id}">
              <button class="btn btn-outline-secondary" data-action="inc" data-id="${it.id}">+</button>
            </div>
          </div>
          <button class="btn btn-outline-danger btn-sm ms-2" title="Quitar" data-action="remove" data-id="${it.id}">
            <i class="bi bi-x-lg"></i>
          </button>
        `;
        el.list.appendChild(row);
      });
    }
    if (el.total) el.total.textContent = peso(Cart.total());
    if (el.badge) el.badge.textContent = Cart.count();
  }

  function attachCartDom() {
    el.badge    = document.getElementById("cartCount");
    el.list     = document.getElementById("cartItems");
    el.total    = document.getElementById("cartTotal");
    el.clearBtn = document.getElementById("cartClear");

    if (el.list) {
      el.list.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");

        if (action === "remove") Cart.remove(id);
        if (action === "inc") {
          const meta = state.meta[id];
          Cart.add({ id, name: meta?.name || id, price: meta?.price || 0, qty: 1, img: meta?.img || "" });
        }
        if (action === "dec") Cart.dec(id);
      });

      el.list.addEventListener("change", (e) => {
        const inp = e.target.closest('input[data-action="qty"]');
        if (!inp) return;
        const id = inp.getAttribute("data-id");
        const qty = parseInt(inp.value, 10) || 1;
        Cart.setQty(id, qty);
      });
    }
    if (el.clearBtn) {
      el.clearBtn.addEventListener("click", () => Cart.clear());
    }
  }


  function buzz() {
    const btn = document.getElementById("cartButton");
    if (!btn) return;
    btn.classList.remove("buzz");
    void btn.offsetWidth;
    btn.classList.add("buzz");
  }
  function notifyLowStock(id) {
    const meta = state.meta[id];
    if (meta?.plusBtn) {
      meta.plusBtn.classList.remove("buzz");
      void meta.plusBtn.offsetWidth;
      meta.plusBtn.classList.add("buzz");
    }
  }


  function initCatalogFromDOM() {
    document.querySelectorAll('.card button[data-action="inc"][data-id]').forEach((plusBtn) => {
      const id = String(plusBtn.dataset.id || "").trim();
      if (!id) return;

      const card = plusBtn.closest(".card");
      const name = (card?.querySelector(".card__title")?.textContent || id).trim();
      const img  = card?.querySelector("img")?.getAttribute("src") || "";
      const price = parseInt(plusBtn.dataset.price || "0", 10);
      const initialStock = parseInt(plusBtn.dataset.stock || "0", 10);

      const msgEl   = card?.querySelector(`.stock-msg[data-stock-for="${id}"]`) || null;
      const badgeEl = card?.querySelector(`.card__badge[data-badge-for="${id}"]`) || null;

      state.meta[id] = { name, price, img, plusBtn, msgEl, badgeEl, cardEl: card };

      if (state.stock[id] == null) state.stock[id] = initialStock;


      plusBtn.addEventListener("click", () => {
        Cart.add({ id, name, price, qty: 1, img });
      });


      const minusBtn = card?.querySelector('button[data-action="dec"][data-id="'+id+'"]');
      if (minusBtn) {
        minusBtn.addEventListener("click", () => Cart.dec(id));
      }

    
      updateStockUI(id);
    });

    saveStock();
  }


  window.CartCatalog = {
    initFromDOM: () => { initCatalogFromDOM(); refreshUI(); },
    refreshUI: () => refreshUI()
  };

  function refreshUI() {
    Object.keys(state.meta).forEach(updateStockUI);
    renderCart();
  }

  window.addEventListener("cart:updated", () => {
    renderCart();
    buzz();
  });


  window.addEventListener("catalog:ready", () => {
    initCatalogFromDOM();
    refreshUI();
  });


  document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    loadStock();
    attachCartDom();
    initCatalogFromDOM();
    renderCart();
  });
})();
