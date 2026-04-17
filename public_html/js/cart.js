(function () {
  var STORAGE_KEY = 'myerman-cart';

  // Fallback map for cart items saved before slug was stored
  var SKU_TO_SLUG = {
    'BLOOD-CROW':    'blood-crow',
    'COYOTE-RAVEN':  'coyote-and-raven',
    'DAWN-EAGLE':    'dawn-eagle',
    'DETERMINED':    'determined',
    'ENCROACHMENT':  'encroachment',
    'FLAT-BUFFALO':  'flatirons-and-buffalo-road',
    'FLOWSOARBIRD':  'flowing-water-soaring-birds',
    'FRIENDS':       'friends',
    'GRIEF':         'grief',
    'GUARDIAN-EGL':  'guardian-eagle',
    'HAUDE-TURTLE':  'haudenosaunee-turtle-with-wampum-belt',
    'MANA':          'make-america-native-again',
    'NIGHTHAWK':     'night-hawk',
    'PALOMINO':      'palomino',
    'PETRO-RAVEN':   'petroglyph-raven',
    'RED-HAND':      'red-hand',
    'RIDE-HARD':     'ride-hard',
    'SOAR-TBIRD':    'soaring-thunderbird',
    'SUNRISE':       'sunrise',
    'SUPERB-OWL':    'superb-owl',
    'THUNDERBIRD':   'thunderbird',
    'TOMAHAWKCROW':  'tomahawk-crow',
    'WEGONNATREAD':  'we-gonna-tread',
    'WISE-OLD-OWL':  'wise-old-owl',
    'YEAROFHORSE':   'year-of-the-horse',
  };

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function addItem(sku, title, slug) {
    var cart = getCart();
    if (!cart.find(function (i) { return i.sku === sku; })) {
      cart.push({ sku: sku, title: title, slug: slug || sku.toLowerCase(), qty: 1 });
      saveCart(cart);
    }
  }

  function removeItem(sku) {
    saveCart(getCart().filter(function (i) { return i.sku !== sku; }));
  }

  function updateQty(sku, qty) {
    var cart = getCart();
    cart.forEach(function (i) { if (i.sku === sku) i.qty = qty; });
    saveCart(cart);
  }

  function updateSize(sku, size) {
    var cart = getCart();
    cart.forEach(function (i) { if (i.sku === sku) i.size = size; });
    saveCart(cart);
  }

  function cartTotal() {
    return getCart().reduce(function (sum, i) { return sum + (i.qty || 1) * 30; }, 0);
  }

  function updateBadge() {
    var count = getCart().length;
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    badge.textContent = count;
    badge.setAttribute('data-empty', count === 0 ? 'true' : 'false');
  }

  // ── Print page: wire up Add to Cart button ──────────────────
  var sku   = document.body.dataset.sku;
  var title = document.body.dataset.title;
  var slug  = document.body.dataset.slug;

  if (sku && title) {
    var btn = document.querySelector('.btn-add-to-cart');
    if (btn) {
      var inCart = !!getCart().find(function (i) { return i.sku === sku; });
      if (inCart) {
        btn.textContent = 'In your cart \u2713';
        btn.classList.add('in-cart');
      }
      btn.addEventListener('click', function () {
        addItem(sku, title, slug);
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
    var cart        = getCart();
    var wrap        = document.getElementById('cart-items');
    var emptyMsg    = document.getElementById('cart-empty');
    var orderForm   = document.getElementById('order-form');
    var totalEl     = document.getElementById('cart-total');

    if (cart.length === 0) {
      wrap.innerHTML = '';
      if (emptyMsg)  emptyMsg.style.display  = '';
      if (orderForm) orderForm.style.display = 'none';
      if (totalEl)   totalEl.style.display   = 'none';
      return;
    }

    if (emptyMsg)  emptyMsg.style.display  = 'none';
    if (orderForm) orderForm.style.display = '';
    if (totalEl) {
      totalEl.style.display = '';
      totalEl.textContent = 'Total: $' + cartTotal() + ' USD';
    }

    wrap.innerHTML = cart.map(function (item) {
      var slug  = SKU_TO_SLUG[item.sku] || item.slug || item.sku.toLowerCase();
      var thumb = '/prints/' + slug + '/' + slug + '-thumb.jpg';
      var qty   = item.qty || 1;
      return '<div class="cart-item" data-sku="' + item.sku + '">'
        + '<a href="/prints/' + slug + '/" class="cart-item-thumb">'
        + '<img src="' + thumb + '" alt="' + item.title + '" width="80" height="80" loading="lazy">'
        + '</a>'
        + '<div class="cart-item-info">'
        + '<span class="cart-item-title">' + item.title + '</span>'
        + '<span class="cart-item-price">$30 each</span>'
        + '</div>'
        + '<div class="cart-item-size">'
        + '<label>Size</label>'
        + '<select class="size-select" data-sku="' + item.sku + '">'
        + '<option value="12x9"'  + (item.size === '12x9'  || !item.size ? ' selected' : '') + '>12&Prime;&times;9&Prime;</option>'
        + '<option value="12x12"' + (item.size === '12x12' ? ' selected' : '') + '>12&Prime;&times;12&Prime;</option>'
        + '</select>'
        + '</div>'
        + '<div class="cart-item-qty">'
        + '<label>Qty</label>'
        + '<input type="number" class="qty-input" data-sku="' + item.sku + '" value="' + qty + '" min="1" max="99">'
        + '</div>'
        + '<button class="cart-remove-btn" data-sku="' + item.sku + '">Remove</button>'
        + '</div>';
    }).join('');

    wrap.querySelectorAll('.size-select').forEach(function (select) {
      select.addEventListener('change', function () {
        updateSize(this.dataset.sku, this.value);
      });
    });

    wrap.querySelectorAll('.qty-input').forEach(function (input) {
      input.addEventListener('change', function () {
        var qty = Math.max(1, parseInt(this.value, 10) || 1);
        this.value = qty;
        updateQty(this.dataset.sku, qty);
        if (totalEl) totalEl.textContent = 'Total: $' + cartTotal() + ' USD';
      });
    });

    wrap.querySelectorAll('.cart-remove-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        removeItem(this.dataset.sku);
        renderCart();
        updateBadge();
      });
    });
  }

  // ── Order form submission ───────────────────────────────────
  var form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var errorEl = document.getElementById('form-error');
      if (!form.checkValidity()) {
        form.querySelectorAll('[required]').forEach(function (el) {
          el.classList.toggle('field-error', !el.value.trim());
        });
        if (errorEl) errorEl.style.display = '';
        return;
      }
      if (errorEl) errorEl.style.display = 'none';

      var cart = getCart();
      var orderData = {
        items:     cart.map(function (i) { return 'x' + (i.qty || 1) + ' ' + i.title + ' [' + i.sku + '] — ' + (i.size || '12x9'); }).join('\n'),
        total:     '$' + cartTotal() + ' USD',
        firstName: document.getElementById('order-first-name').value.trim(),
        lastName:  document.getElementById('order-last-name').value.trim(),
        email:     document.getElementById('order-email').value.trim(),
        phone:     document.getElementById('order-phone').value.trim(),
        address:   document.getElementById('order-address').value.trim(),
        city:      document.getElementById('order-city').value.trim(),
        province:  document.getElementById('order-province').value.trim(),
        postal:    document.getElementById('order-postal').value.trim(),
        country:   document.getElementById('order-country').value.trim(),
        notes:     document.getElementById('order-notes').value.trim(),
      };

      var submitBtn = form.querySelector('[type="submit"]');
      submitBtn.textContent = 'Sending\u2026';
      submitBtn.disabled = true;

      emailjs.send('service_z8x6ali', 'template_5jmckrk', {
        first_name: orderData.firstName,
        last_name:  orderData.lastName,
        reply_to:   orderData.email,
        phone:      orderData.phone,
        items:      orderData.items,
        total:      orderData.total,
        address:    orderData.address,
        city:       orderData.city,
        province:   orderData.province,
        postal:     orderData.postal,
        country:    orderData.country,
        notes:      orderData.notes || 'None',
      }).then(function () {
        // Clear cart and show confirmation
        saveCart([]);
        updateBadge();
        form.style.display = 'none';
        document.getElementById('cart-items').innerHTML = '';
        document.getElementById('cart-total').style.display = 'none';
        var confirm = document.createElement('div');
        confirm.className = 'order-confirm';
        confirm.innerHTML = '<h2>Order received!</h2>'
          + '<p>Thanks, ' + orderData.firstName + '. We\'ll email you at <strong>' + orderData.email + '</strong> within 24 hours to confirm and arrange payment.</p>'
          + '<p style="margin-top:1rem;"><a href="/prints/" class="btn btn-ghost">Keep browsing &rarr;</a></p>';
        form.parentNode.insertBefore(confirm, form);
      }, function (err) {
        submitBtn.textContent = 'Place Order \u2192';
        submitBtn.disabled = false;
        if (errorEl) {
          errorEl.textContent = 'Something went wrong — please try again or email us directly.';
          errorEl.style.display = '';
        }
        console.error('EmailJS error:', err);
      });
    });
  }

  // ── Mark in-cart cards on grid pages ───────────────────────
  function markCartedCards() {
    var cart = getCart();
    var cartSlugs = new Set(cart.map(function (i) {
      return SKU_TO_SLUG[i.sku] || i.slug || i.sku.toLowerCase();
    }));

    document.querySelectorAll('.work-card').forEach(function (card) {
      // Extract slug from href: "/prints/blood-crow/" → "blood-crow"
      var match = card.getAttribute('href').match(/\/prints\/([^/]+)\//);
      if (!match) return;
      var slug = match[1];
      var linkEl = card.querySelector('.work-card-link');
      if (cartSlugs.has(slug)) {
        card.classList.add('in-cart');
        if (linkEl) linkEl.textContent = 'In your cart \u2713';
      } else {
        card.classList.remove('in-cart');
        if (linkEl) linkEl.innerHTML = 'Buy print &#8594;';
      }
    });
  }

  markCartedCards();

  updateBadge();
})();
