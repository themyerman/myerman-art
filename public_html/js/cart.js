(function () {
  var STORAGE_KEY = 'myerman-cart';
  var FORM_BASE = 'https://docs.google.com/forms/d/e/1FAIpQLSfM1UfM_2DGi_2ykP5bpgjuA6R6sOw1WY3PSLtfY1LwCPLy6A/viewform?usp=pp_url&entry.424622008=';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function addItem(sku, title) {
    var cart = getCart();
    if (!cart.find(function (i) { return i.sku === sku; })) {
      cart.push({ sku: sku, title: title });
      saveCart(cart);
    }
  }

  function removeItem(sku) {
    saveCart(getCart().filter(function (i) { return i.sku !== sku; }));
  }

  function updateBadge() {
    var count = getCart().length;
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    badge.textContent = count;
    badge.setAttribute('data-empty', count === 0 ? 'true' : 'false');
  }

  function buildCheckoutUrl() {
    var items = getCart().map(function (i) { return i.sku + ' (' + i.title + ')'; }).join(', ');
    return FORM_BASE + encodeURIComponent(items);
  }

  // ── Print page: wire up Add to Cart button ──────────────────
  var sku   = document.body.dataset.sku;
  var title = document.body.dataset.title;

  if (sku && title) {
    var btn = document.querySelector('.btn-add-to-cart');
    if (btn) {
      var inCart = !!getCart().find(function (i) { return i.sku === sku; });
      if (inCart) {
        btn.textContent = 'In your cart \u2713';
        btn.classList.add('in-cart');
      }
      btn.addEventListener('click', function () {
        addItem(sku, title);
        btn.textContent = 'In your cart \u2713';
        btn.classList.add('in-cart');
        updateBadge();
      });
    }
  }

  // ── Cart page ───────────────────────────────────────────────
  var cartWrap = document.getElementById('cart-items');
  if (cartWrap) { renderCart(); }

  function renderCart() {
    var cart       = getCart();
    var wrap       = document.getElementById('cart-items');
    var emptyMsg   = document.getElementById('cart-empty');
    var checkoutBtn = document.getElementById('checkout-btn');
    var totalEl    = document.getElementById('cart-total');

    if (cart.length === 0) {
      wrap.innerHTML = '';
      if (emptyMsg)    emptyMsg.style.display    = '';
      if (checkoutBtn) checkoutBtn.style.display  = 'none';
      if (totalEl)     totalEl.style.display      = 'none';
      return;
    }

    if (emptyMsg)    emptyMsg.style.display    = 'none';
    if (checkoutBtn) {
      checkoutBtn.style.display = '';
      checkoutBtn.href = buildCheckoutUrl();
    }
    if (totalEl) {
      totalEl.style.display = '';
      totalEl.textContent = 'Total: $' + (cart.length * 30);
    }

    wrap.innerHTML = cart.map(function (item) {
      return '<div class="cart-item" data-sku="' + item.sku + '">'
        + '<div class="cart-item-info">'
        + '<span class="cart-item-title">' + item.title + '</span>'
        + '<span class="cart-item-sku">' + item.sku + '</span>'
        + '</div>'
        + '<button class="cart-remove-btn" data-sku="' + item.sku + '">Remove</button>'
        + '</div>';
    }).join('');

    wrap.querySelectorAll('.cart-remove-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        removeItem(this.dataset.sku);
        renderCart();
        updateBadge();
      });
    });
  }

  updateBadge();
})();
