/////////////////////////////////////////////////////
// CART STORAGE
/////////////////////////////////////////////////////
let cart = JSON.parse(localStorage.getItem("bookLoungeCart")) || [];

/////////////////////////////////////////////////////
// ADD TO CART (works with your buttons)
/////////////////////////////////////////////////////
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("add-to-cart")) {
    const id = e.target.dataset.id; // Removed parseInt to support alphanumeric Sanity IDs
    addToCart(id);
  }
});

function addToCart(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  if (book.stock.toLowerCase() === "out of stock") {
    showNotification(book.title + " is out of stock", "error");
    return;
  }

  const existing = cart.find(item => item.id === bookId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...book, quantity: 1 });
  }

  saveCart();
  updateCartCount();
  showNotification(book.title + " added to cart!", "success");
}

/////////////////////////////////////////////////////
// SAVE + COUNT
/////////////////////////////////////////////////////
function saveCart() {
  localStorage.setItem("bookLoungeCart", JSON.stringify(cart));
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  el.textContent = total;
}

/////////////////////////////////////////////////////
// NOTIFICATION (replaces alert)
/////////////////////////////////////////////////////
function showNotification(message, type) {
  // Remove any existing notification
  const existing = document.querySelector(".cart-notification");
  if (existing) existing.remove();

  const notif = document.createElement("div");
  notif.className = "cart-notification " + (type || "success");
  notif.innerHTML = `
    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notif);

  // Animate in
  setTimeout(() => notif.classList.add("show"), 10);

  // Remove after 2.5s
  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 300);
  }, 2500);
}

/////////////////////////////////////////////////////
// RENDER BOOKS (dynamic rendering)
/////////////////////////////////////////////////////
function renderBooks(containerId, bookList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (bookList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <i class="fas fa-search" style="font-size: 2.5rem; color: #ddb892; margin-bottom: 12px;"></i>
        <h3 style="color: #4b2e2b; margin-bottom: 8px;">No books found</h3>
        <p style="color: #666;">Try a different search term or category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = bookList.map(book => {
    const isOutOfStock = book.stock.toLowerCase() === "out of stock";
    const cardClass = isOutOfStock ? "book-card out-of-stock-book" : "book-card";

    return `
      <div class="${cardClass}" onclick="window.location='book.html?id=${book._id}'" style="cursor:pointer;">
        <a href="book.html?id=${book._id}">
          <img src="${book.imageUrl || 'images/default-book.jpg'}" alt="${book.title}" />
        </a>
        <h3>${book.title}</h3>
        <p>${book.authorName || "Unknown"}</p>
        <p>R${book.price}</p>
        ${isOutOfStock
          ? '<span class="stock-badge out">Out of Stock</span>'
          : `<button class="add-to-cart" data-id="${book.id}" onclick="event.stopPropagation()">Add to Cart</button>`
        }
      </div>
    `;
  }).join("");
}

/////////////////////////////////////////////////////
// RENDER CART
/////////////////////////////////////////////////////
function renderCart() {
  const table = document.getElementById("cart-items-tbody");
  const summary = document.getElementById("cart-summary");
  const empty = document.getElementById("cart-empty");
  const content = document.getElementById("cart-content");

  if (!table) return;

  if (cart.length === 0) {
    empty.style.display = "block";
    content.style.display = "none";
    return;
  }

  empty.style.display = "none";
  content.style.display = "block";

  table.innerHTML = cart.map(item => `
    <tr>
      <td>
        <img src="${item.imageUrl || item.image || 'images/default-book.jpg'}" alt="${item.title}" />
        ${item.title}
      </td>
      <td>R${item.price}</td>
      <td>
        <button onclick="changeQty('${item.id}', -1)">−</button>
        ${item.quantity}
        <button onclick="changeQty('${item.id}', 1)">+</button>
      </td>
      <td>R${item.price * item.quantity}</td>
      <td><button onclick="removeItem('${item.id}')">Remove</button></td>
    </tr>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  summary.innerHTML = `
    <h3>Order Summary</h3>
    <p>Total Items: ${itemCount}</p>
    <p><strong>Total Price: R${total}</strong></p>
  `;
}

/////////////////////////////////////////////////////
// CART ACTIONS
/////////////////////////////////////////////////////
function changeQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  renderCart();
  updateCartCount();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateCartCount();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
}

/////////////////////////////////////////////////////
// SEARCH + FILTER
/////////////////////////////////////////////////////
function searchBooks() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const term = input.value.toLowerCase();

  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(term) ||
    (book.authorName || "").toLowerCase().includes(term) ||
    book.category.toLowerCase().includes(term)
  );

  renderBooks("booksGrid", filtered);
}

function filterByCategory(category) {
  if (category === "all") {
    renderBooks("booksGrid", books);
    return;
  }

  const filtered = books.filter(
    b => b.category.toLowerCase() === category.toLowerCase()
  );

  renderBooks("booksGrid", filtered);
}

/////////////////////////////////////////////////////
// MOBILE MENU + INIT
/////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", async () => {

  // FETCH FROM SANITY
  if (typeof window.loadSanityBooks === "function") {
    await window.loadSanityBooks();
  }

  updateCartCount();
  renderCart();

  // Check if we have a book detail to show
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  if (bookId) {
    showBookDetail(bookId); // Removed parseInt
  } else {
    // Render all books on books.html
    const booksGrid = document.getElementById("booksGrid");
    if (booksGrid) {
      renderBooks("booksGrid", books);
    }
  }

  // Render new arrivals on index.html
  const newArrivalsGrid = document.getElementById("newArrivalsGrid");
  if (newArrivalsGrid) {
    renderBooks("newArrivalsGrid", window.books.slice(0, 4));
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Clear cart button
  const clearBtn = document.getElementById("clear-cart-btn");
  if (clearBtn) clearBtn.addEventListener("click", clearCart);

  // Checkout form
  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        showNotification("Your cart is empty! Add some books first.", "error");
        return;
      }

      // Gather order details
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

      // Clear cart
      clearCart();

      // Show success message
      showOrderSuccess(itemCount, total);
    });
  }

  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", searchBooks);
  }

});

/////////////////////////////////////////////////////
// ORDER SUCCESS OVERLAY
/////////////////////////////////////////////////////
function showOrderSuccess(itemCount, total) {
  const overlay = document.createElement("div");
  overlay.className = "order-success-overlay";
  overlay.innerHTML = `
    <div class="order-success-card">
      <i class="fas fa-check-circle"></i>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase.</p>
      <div class="order-details">
        <p><strong>Items:</strong> ${itemCount}</p>
        <p><strong>Total:</strong> R${total}</p>
      </div>
      <p class="order-note">A confirmation will be sent to your email.</p>
      <a href="index.html" class="btn">Continue Shopping</a>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => overlay.classList.add("show"), 10);
}

/////////////////////////////////////////////////////
// BOOK DETAIL VIEW
/////////////////////////////////////////////////////
function showBookDetail(bookId) {
  const book = books.find(b => b.id === bookId);
  const detailContainer = document.getElementById("bookDetail");
  const booksGrid = document.getElementById("booksGrid");
  const pageHero = document.querySelector(".page-hero");

  if (!book || !detailContainer) return;

  // Hide the books grid and hero
  if (booksGrid) booksGrid.style.display = "none";
  if (pageHero) pageHero.style.display = "none";

  const isOutOfStock = book.stock.toLowerCase() === "out of stock";

  // Get related books (same category, excluding current)
  const related = books
    .filter(b => b.category === book.category && b.id !== book.id)
    .slice(0, 4);

  detailContainer.style.display = "block";
  detailContainer.innerHTML = `
    <div class="detail-back">
      <a href="books.html" class="back-link">
        <i class="fas fa-arrow-left"></i> Back to Books
      </a>
    </div>

    <div class="detail-grid">
      <div class="detail-image">
        <img src="${book.imageUrl || 'images/default-book.jpg'}" alt="${book.title}" />
      </div>

      <div class="detail-info">
        <span class="detail-category">${book.category}</span>
        <h2 class="detail-title">${book.title}</h2>
        <p class="detail-author">by ${book.authorName || "Unknown"}</p>
        <p class="detail-price">R${book.price}</p>
        <p class="detail-description">${book.description}</p>

        <div class="detail-stock ${isOutOfStock ? 'out' : 'in'}">
          <i class="fas ${isOutOfStock ? 'fa-times-circle' : 'fa-check-circle'}"></i>
          ${book.stock}
        </div>

        ${isOutOfStock
          ? '<button class="detail-btn disabled" disabled>Out of Stock</button>'
          : '<button class="detail-btn add-to-cart" data-id="' + book.id + '"><i class="fas fa-shopping-cart"></i> Add to Cart</button>'
        }
      </div>
    </div>

    ${related.length > 0 ? `
      <div class="detail-related">
        <h3>You Might Also Like</h3>
        <div class="books-grid">
          ${related.map(r => `
            <div class="book-card" onclick="window.location='book.html?id=${r._id}'" style="cursor:pointer;">
              <a href="book.html?id=${r._id}"><img src="${r.imageUrl || 'images/default-book.jpg'}" alt="${r.title}" /></a>
              <h3>${r.title}</h3>
              <p>${r.authorName || "Unknown"}</p>
              <p>R${r.price}</p>
              <button class="add-to-cart" data-id="${r.id}" onclick="event.stopPropagation()">Add to Cart</button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Update page title
  document.title = book.title + " | Book Lounge";

  // Scroll to top
  window.scrollTo(0, 0);
}