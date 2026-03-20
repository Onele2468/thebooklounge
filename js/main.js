document.addEventListener('DOMContentLoaded', () => {
    // --- Cart State Management ---
    let cart = JSON.parse(localStorage.getItem('book_lounge_cart')) || [];

    const updateCartStorage = () => {
        localStorage.setItem('book_lounge_cart', JSON.stringify(cart));
        updateCartUI();
    };

    const updateCartUI = () => {
        const cartCounts = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounts.forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });

        // Update Cart Page if active
        if (window.location.pathname.includes('cart.html')) {
            renderCartPage();
        }
    };

    window.addToCart = (id, title, author, price, imgSrc = 'images/placeholder.jpg') => {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, title, author, price, imgSrc, quantity: 1 });
        }
        updateCartStorage();
        showNotification(`${title} added to cart!`);
    };

    window.removeFromCart = (id) => {
        cart = cart.filter(item => item.id !== id);
        updateCartStorage();
    };

    window.updateQuantity = (id, delta) => {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                updateCartStorage();
            }
        }
    };

    const renderCartPage = () => {
        const cartItemsContainer = document.getElementById('cart-items-tbody');
        const cartSummaryContainer = document.getElementById('cart-summary');
        
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">Your cart is empty. <a href="products.html" style="color: var(--accent-color); font-weight: 600;">Browse Books</a></td></tr>';
            cartSummaryContainer.innerHTML = '';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <tr>
                <td>
                    <div class="cart-item-info">
                        <div class="cart-item-img"><img src="${item.imgSrc}" alt=""></div>
                        <div>
                            <h4 style="margin:0">${item.title}</h4>
                            <p style="margin:0; font-size: 0.85rem; color: var(--text-light)">${item.author}</p>
                            <span class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</span>
                        </div>
                    </div>
                </td>
                <td>R${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </td>
                <td>R${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50;

        cartSummaryContainer.innerHTML = `
            <div class="summary-row"><span>Subtotal:</span><span>R${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Shipping:</span><span>${shipping === 0 ? 'FREE' : 'R' + shipping.toFixed(2)}</span></div>
            <div class="summary-total"><div class="summary-row"><span>Total:</span><span>R${(subtotal + shipping).toFixed(2)}</span></div></div>
        `;
    };

    // --- Global Notifications ---
    const showNotification = (msg) => {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = 'var(--primary-color)';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '2000';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // --- Existing Functionality ---
    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < window.innerHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Forms
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Order placed successfully!');
            cart = [];
            updateCartStorage();
            window.location.href = 'index.html';
        });
    }

    // --- Preview Modal ---
    const createModal = () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-img-container"></div>
                <div class="modal-details">
                    <img src="" alt="">
                    <h2 class="title"></h2>
                    <p class="author"></p>
                    <p class="description"></p>
                    <p class="price"></p>
                    <div class="actions"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    };

    window.openPreview = (id, imgSrc, title, author, price, description, isOutOfStock) => {
        const modal = document.getElementById('preview-modal');
        if (!modal) return;

        modal.querySelector('.modal-img-container').innerHTML = `<img src="${imgSrc}" alt="">`;
        modal.querySelector('.title').textContent = title;
        modal.querySelector('.author').textContent = author;
        modal.querySelector('.description').textContent = description;
        modal.querySelector('.price').textContent = `R${price.toFixed(2)}`;
        
        const actions = modal.querySelector('.actions');
        if (isOutOfStock) {
            actions.innerHTML = `<button class="btn" disabled style="background:#999">Out of Stock</button>`;
        } else {
            actions.innerHTML = `<button class="btn" onclick="addToCart('${id}', '${title.replace(/'/g, "\\'")}', '${author.replace(/'/g, "\\'")}', ${price})">Add to Cart</button>`;
        }

        modal.classList.add('active');
    };

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }

    // Initialize UI
    updateCartUI();
    createModal();
});

const books = [
  {
    _id: 'book1',
    title: 'The Great Adventure',
    author: 'Jane Doe',
    price: 15.99,
    description: 'An exciting journey through unknown lands.',
    imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Book1'
  },
  {
    _id: 'book2',
    title: 'Coding for Dummies',
    author: 'John Smith',
    price: 25.00,
    description: 'A beginner-friendly guide to programming.',
    imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Book2'
  },
  {
    _id: 'book3',
    title: 'Mystery of the Old House',
    author: 'Emily White',
    price: 12.50,
    description: 'A thrilling mystery that will keep you guessing.',
    imageUrl: 'https://via.placeholder.com/150/008000/FFFFFF?text=Book3'
  }
];