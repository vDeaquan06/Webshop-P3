if (!localStorage.getItem("products")) {
  fetch("boeken.json")
    .then((res) => res.json())
    .then((data) => {
      lsSet("products", data);
      loadProducts();
    });
} else {
  loadProducts();
}

if (!localStorage.getItem("cart")) lsSet("cart", []);
if (!localStorage.getItem("orders")) lsSet("orders", []);

function lsGet(key, fallback = null) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : fallback;
}

function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadProducts() {
  let products = lsGet("products", []) || [];
  let container = document.getElementById("boeken");
  if (!container) return;

  container.innerHTML = "";
  products.forEach((product) => {
    let div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="img/boeken/book${product.id}.jpg" alt="${product.title}" class="product-img">
      <h3>${product.title}</h3>
      <p class="prijs">€${product.price}</p>
      <button onclick="addToCart(${product.id})">Toevoegen</button>
      <a href="product-${product.id}.html">Bekijk details</a>
    `;
    container.appendChild(div);
  });
  updateCartCount();
}

function addToCart(id) {
  let products = lsGet("products", []);
  let cart = lsGet("cart", []);
  let product = products.find((p) => p.id === id);

  cart.push(product);
  lsSet("cart", cart);
  alert("Toegevoegd aan winkelwagen!");
  updateCartCount();
  showCart();
}

function showCart() {
  let cart = lsGet("cart", []) || [];
  let container = document.getElementById("wagen-items");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>Je winkelwagen is leeg</p>";
    return;
  }

  let totaal = 0;
  container.innerHTML = "";

  cart.forEach((item, index) => {
    totaal += item.price;
    let div = document.createElement("div");
    div.className = "wagen-item";
    div.innerHTML = `
      <span>${item.title} - €${item.price}</span>
      <button onclick="deleteFromCart(${index})">Verwijder</button>
    `;
    container.appendChild(div);
  });

  container.innerHTML += `<div class="total"><strong>Totaal: €${totaal.toFixed(2)}</strong></div>`;
}

function deleteFromCart(index) {
  let cart = lsGet("cart", []);
  cart.splice(index, 1);
  lsSet("cart", cart);
  showCart();
  updateCartCount();
}

function clearCart() {
  if (confirm("Winkelwagen leegmaken?")) {
    lsSet("cart", []);
    showCart();
    updateCartCount();
  }
}

function placeOrder() {
  let cart = lsGet("cart", []);
  if (cart.length === 0) {
    alert("Je winkelwagen is leeg!");
    return;
  }

  let order = {
    id: Date.now(),
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price, 0),
    date: new Date().toLocaleDateString(),
  };

  let orders = lsGet("orders", []) || [];
  orders.push(order);
  lsSet("orders", orders);
  lsSet("cart", []);

  alert("Bestelling geplaatst! Bestelnummer: " + order.id);
  showCart();
  updateCartCount();
}

function updateCartCount() {
  let cart = lsGet("cart", []) || [];
  document
    .querySelectorAll(".aantal")
    .forEach((badge) => (badge.textContent = cart.length));
}

function showAdminProducts() {
  let products = lsGet("products", []) || [];
  let container = document.getElementById("admin-producten");
  if (!container) return;

  container.innerHTML = "";
  products.forEach((product) => {
    let div = document.createElement("div");
    div.className = "admin-item";
    div.innerHTML = `
      <span>${product.title} - €${product.price}</span>
      <div>
        <button onclick="editProduct(${product.id})">Bewerk</button>
        <button onclick="verwijderProduct(${product.id})">Verwijder</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function addProduct() {
  let title = document.getElementById("nieuwe-titel").value;
  let price = parseFloat(document.getElementById("nieuwe-prijs").value);
  if (!title || !price) {
    alert("Alles invullen A.U.B.");
    return;
  }

  let products = lsGet("products", []);
  let newId =
    products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

  products.push({ id: newId, title, price });
  lsSet("products", products);
  document.getElementById("nieuwe-titel").value = "";
  document.getElementById("nieuwe-prijs").value = "";
  showAdminProducts();
  alert("Product toegevoegd!");
}

function editProduct(id) {
  let products = lsGet("products", []);
  let product = products.find((p) => p.id === id);
  let nieuweTitel = prompt("Nieuwe titel:", product.title);
  let nieuwePrijs = prompt("Nieuwe prijs:", product.price);

  if (nieuweTitel && nieuwePrijs) {
    product.title = nieuweTitel;
    product.price = parseFloat(nieuwePrijs);
    lsSet("products", products);
    showAdminProducts();
    alert("Product bijgewerkt!");
  }
}

function verwijderProduct(id) {
  if (!confirm("Product verwijderen?")) return;
  let products = (lsGet("products", []) || []).filter((p) => p.id !== id);
  lsSet("products", products);
  showAdminProducts();
  alert("Product verwijderd!");
}

function showOrders() {
  let orders = lsGet("orders", []) || [];
  let container = document.getElementById("admin-bestellingen");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = "<p>Nog geen bestellingen</p>";
  } else {
    container.innerHTML = "";
  }
  orders.forEach((order) => {
    let div = document.createElement("div");
    div.className = "admin-item";
    div.innerHTML = `<span>Bestelling #${order.id} - ${order.date} - €${order.total.toFixed(2)} (${order.items.length} items)</span>`;
    container.appendChild(div);
  });
}

function resetProducts() {
  if (!confirm("Zeker alle producten resetten?")) return;
  fetch("boeken.json")
    .then((res) => res.json())
    .then((data) => {
      lsSet("products", data);
      showAdminProducts();
      alert("Producten gereset!");
    });
}

window.onload = function () {
  showCart();
  showAdminProducts();
  showOrders();
  updateCartCount();
};
