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
      cart.push({ sku: sku, title: title, slug: slug || sku.toLowerCase() });
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
      totalEl.textContent = 'Total: $' + (cart.length * 30) + ' USD';
    }

    wrap.innerHTML = cart.map(function (item) {
      var slug  = SKU_TO_SLUG[item.sku] || item.slug || item.sku.toLowerCase();
      var thumb = '/prints/' + slug + '/' + slug + '-thumb.jpg';
      return '<div class="cart-item" data-sku="' + item.sku + '">'
        + '<a href="/prints/' + slug + '/" class="cart-item-thumb">'
        + '<img src="' + thumb + '" alt="' + item.title + '" width="80" height="80" loading="lazy">'
        + '</a>'
        + '<div class="cart-item-info">'
        + '<span class="cart-item-title">' + item.title + '</span>'
        + '<span class="cart-item-price">$30</span>'
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
        items:     cart.map(function (i) { return i.title + ' [' + i.sku + ']'; }).join('\n'),
        total:     '$' + (cart.length * 30) + ' USD',
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

  updateBadge();
})();
