(function(){
  "use strict";

  /* ---------- data ---------- */
  var FLOWERS = [
    { id: 1, name: "White Roses", price: 18, petals: 8, color: "#F3EEE8", tag: "Bestseller", desc: "Full, ruffled ivory-white blooms with softly blushed centers — a graceful classic, sold by the bunch of six stems.", stock: "Checking stock\u2026", image: "flowers/White roses.jpg", fallback: "flowers/White roses.jpg", photoAlt: "Ivory-white roses with softly blushed centers" },
    { id: 2, name: "Tulip", price: 12, petals: 6, color: "#C9707A", tag: "Seasonal", desc: "Clean, cup-shaped blooms just opening, prized for their simple, elegant silhouette.", stock: "Checking stock\u2026", image: "flowers/tulips.jpg", fallback: "flowers/tulips.jpg", photoAlt: "A red tulip with a smooth cup-shaped bloom" },
    { id: 3, name: "Sunflower", price: 9, petals: 14, color: "#D9A441", tag: "Cheerful", desc: "Bold, sun-facing blooms with a deep centre — an instant lift for any room.", stock: "Checking stock\u2026", image: "flowers/Sunflowers.jpg", fallback: "flowers/Sunflowers.jpg", photoAlt: "A sunflower with a textured dark center" },
    { id: 4, name: "Peony", price: 22, petals: 10, color: "#E3AEB4", tag: "Limited", desc: "Lush, layered petals with a soft scent — a favourite for spring arrangements.", stock: "Checking stock\u2026", image: "flowers/Peonies.jpg", fallback: "flowers/Peonies.jpg", photoAlt: "A full pink peony with overlapping petals" },
    { id: 5, name: "Orchid", price: 28, petals: 5, color: "#9C6FA8", tag: "Exotic", desc: "Elegant, long-lasting blooms with a sculptural, architectural form.", stock: "Checking stock\u2026", image: "flowers/orchids_.jpg", fallback: "flowers/orchids_.jpg", photoAlt: "Purple and white orchid blooms" },
    { id: 6, name: "Lily", price: 16, petals: 6, color: "#F2F0E4", tag: "Fragrant", desc: "Trumpet-shaped blooms with a heady scent — striking in tall arrangements.", stock: "Checking stock\u2026", image: "flowers/lily.jpg", fallback: "flowers/lily.jpg", photoAlt: "A white Madonna lily with visible stamens" },
    { id: 7, name: "Red Roses", price: 32, petals: 8, color: "#A93342", tag: "Romantic", desc: "A hand-tied dozen of velvety red roses, chosen for their rich color and lasting impression.", stock: "Checking stock\u2026", image: "flowers/red rose.jpg", fallback: "flowers/red rose.jpg", photoAlt: "Velvety red roses arranged in a bouquet" },
    { id: 8, name: "Carnation", price: 14, petals: 12, color: "#D77A86", tag: "Long-lasting", desc: "Softly ruffled stems with a gentle, clove-like scent and a long vase life.", stock: "Checking stock\u2026", image: "flowers/carnations.jpg", fallback: "flowers/carnations.jpg", photoAlt: "Soft pink carnations with ruffled petals" },
    { id: 9, name: "Chrysanthemum", price: 18, petals: 16, color: "#E3AEB4", tag: "Full-bloom", desc: "A generous spray of layered blooms that brings lasting color to any arrangement.", stock: "Checking stock\u2026", image: "flowers/Chrysanthemums.jpg", fallback: "flowers/Chrysanthemums.jpg", photoAlt: "A full pink chrysanthemum in bloom" },
    { id: 10, name: "Gladiolus", price: 20, petals: 6, color: "#D77988", tag: "Statement", desc: "Tall, elegant flower spikes that add graceful height and color to a bouquet.", stock: "Checking stock\u2026", image: "flowers/gladiolus.jpg", fallback: "flowers/gladiolus.jpg", photoAlt: "A tall gladiolus flower spike" }
  ];
  var WRAPPING_DESIGNS = [
    { id: "pink-elegance", name: "Pink Elegance", color: "Blush pink", price: 75, detail: "Premium pink matte wrapping paper with satin ribbon.", image: "https://i.pinimg.com/1200x/10/3a/b7/103ab76c85c18521d5ba2addbd7689af.jpg" },
    { id: "classic-kraft", name: "Classic Kraft", color: "Natural brown", price: 50, detail: "Eco-friendly brown kraft paper with natural jute twine.", image: "https://i.pinimg.com/originals/a4/83/86/a48386d024d02f316231bb5b8635798f.png" },
    { id: "midnight-luxury", name: "Midnight Luxury", color: "Midnight navy", price: 80, detail: "Dark navy blue waterproof wrapping with gold ribbon accents.", image: "https://i.pinimg.com/736x/75/91/1e/75911ef1eea4d5bae6547dfc00504a82.jpg" },
    { id: "minimalist-white", name: "Minimalist White", color: "Clean white", price: 45, detail: "Clean white tissue paper with pastel ribbon.", image: "https://i.pinimg.com/736x/23/e6/57/23e657e50be60d5c493b63c62614aa92.jpg" }
  ];
  // Occasion records reference product IDs so FLOWERS remains the single product source of truth.
  var OCCASIONS = [
    { id: "valentines", startMonth: 2, startDay: 11, endMonth: 2, endDay: 15, name: "Valentine's Day", message: "Flowers for someone special.", recommendedFlowerIds: [1, 2, 4] },
    { id: "christmas", startMonth: 12, startDay: 22, endMonth: 12, endDay: 26, name: "Christmas", message: "Bring a little seasonal color to someone’s home.", recommendedFlowerIds: [3, 5, 6] },
    { id: "newyear", startMonth: 12, startDay: 28, endMonth: 1, endDay: 1, name: "New Year's Day", message: "Start the year with something bright and beautiful.", recommendedFlowerIds: [1, 3, 6] },
    { id: "mothersday", startMonth: 5, startDay: 1, endMonth: 5, endDay: 14, name: "Mother's Day", message: "Celebrate someone who makes life bloom.", recommendedFlowerIds: [1, 4, 6] },
    { id: "halloween", startMonth: 10, startDay: 25, endMonth: 11, endDay: 2, name: "Halloween", message: "A little seasonal magic for Halloween.", recommendedFlowerIds: [8, 9, 10] }
  ];
  // Weather recommendations are selected by the admin and shown to customers.
  var WEATHER_PRESETS = [
    { id: "sunny", label: "Sunny", message: "Bright, cheerful blooms for a sunny day.", recommendedFlowerIds: [3, 2, 1] },
    { id: "rainy", label: "Rainy", message: "Bring some color indoors on a rainy day.", recommendedFlowerIds: [5, 6, 4] }
  ];
  function loadCart(){
    try { var c = JSON.parse(sessionStorage.getItem("ph.cart") || "[]"); return Array.isArray(c) ? c.filter(function(l){ return l && l.qty > 0 && (l.id || (l.arrangementType === "custom" && Array.isArray(l.flowers) && l.flowers.length)); }) : []; } catch(e){ return []; }
  }
  function saveCart(){ try { sessionStorage.setItem("ph.cart", JSON.stringify(state.cart)); } catch(e){} }
  var STEP_LABELS = ["Browse", "Cart", "Account", "Fulfillment", "Payment", "Confirmed"];
  // REVISION 3: realistic estimates, kept in one place so the team can adjust them to the real process.
  var PICKUP_ESTIMATE = "Ready for pickup in about 2 hours at the Ilocos Sur branch";
  var DELIVERY_SHORT = "Same-day delivery, about 2\u20134 hours";
  var DELIVERY_NOTE = "Estimated 2\u20134 hours within Caoayan and nearby Ilocos Sur towns. Orders placed after 5:00 PM are delivered the next morning. Farther areas may take longer.";
  var CURRENCY = "\u20b1";
  /* ---------- server connection ---------- */
  var STATUS_FLOW = ["Pending", "Preparing", "Ready", "Completed"];
  var TOKEN = null;
  try { TOKEN = sessionStorage.getItem("ph.token"); } catch(e){}
  var db = { orders: [], users: [], products: [], riders: [], merchandising: null }; // admin view of server data, refreshed from the API
  // The backend is PHP (api.php) running under XAMPP's Apache. Requests go to <this folder>/api/... (via .htaccess);
  // if the server has no URL rewriting, they automatically switch to api.php?route=... instead.
  var API_BASE = location.pathname.replace(/[^\/]*$/, "");
  var API_MODE = "pretty";
  function apiUrl(url){
    var r = url.replace(/^\/api\//, "");
    return API_MODE === "query" ? API_BASE + "api.php?route=" + encodeURIComponent(r) : API_BASE + "api/" + r;
  }
  var SERVER_DOWN = "PetalHub could not connect to its service. Please check your connection and try again in a moment.";
  function api(method, url, body, retried){
    var headers = { "Content-Type": "application/json" };
    if (TOKEN){ headers.Authorization = "Bearer " + TOKEN; headers["X-Auth-Token"] = TOKEN; }
    return fetch(apiUrl(url), { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined }).then(function(r){
      return r.json().catch(function(){ return null; }).then(function(j){
        // no JSON back: either URL rewriting is off (try api.php?route=...) or this page is not served by Apache + PHP
        if (j === null){
          if (!retried && API_MODE === "pretty" && [403, 404, 405].indexOf(r.status) >= 0){ API_MODE = "query"; return api(method, url, body, true); }
          throw new Error(SERVER_DOWN);
        }
        if (r.status === 401 && TOKEN && url !== "/api/login") expireSession();
        if (!r.ok) throw new Error(j.error || "Something went wrong.");
        return j;
      });
    }, function(){ throw new Error(SERVER_DOWN); });
  }
  function flowerById(id){ return FLOWERS.filter(function(x){ return x.id === id; })[0]; }
  // Stock always comes from the server (set by the admin): "Out of stock" => 0, otherwise the quantity. null = not loaded yet.
  function stockQty(f){ if (f.available === false) return 0; return typeof f.qty === "number" ? f.qty : null; }
  function loadProducts(){
    return api("GET", "/api/products").then(function(list){
      state.serverError = "";
      var ids = {};
      list.forEach(function(p){
        ids[p.id] = true;
        var f = flowerById(p.id);
        if (!f){ f = { id: p.id, name: p.name, petals: 8, color: "var(--rose)", tag: "New", desc: p.desc || "Fresh flowers from PetalHub.", image: p.imagePath || "flowers/placeholder.svg", fallback: "flowers/placeholder.svg", photoAlt: p.name }; FLOWERS.push(f); }
        else if (p.imagePath) f.image = p.imagePath;
        f.price = p.price; f.stock = p.stock; f.qty = p.qty; f.available = p.available;
      });
      var removedFlowers = [];
      state.cart.forEach(function(line){
        lineFlowers(line).forEach(function(item){
          if (!ids[item.id]){
            var removed = flowerById(item.id);
            var name = removed ? removed.name : "A flower";
            if (removedFlowers.indexOf(name) < 0) removedFlowers.push(name);
          }
        });
      });
      FLOWERS = FLOWERS.filter(function(f){ return ids[f.id]; });
      if (removedFlowers.length){
        state.notice = removedFlowers.join(", ") + (removedFlowers.length === 1 ? " is no longer available and was removed from your cart." : " are no longer available and were removed from your cart.") + " Please review your cart.";
      }
      state.cart = state.cart.filter(function(l){
        return l.arrangementType === "custom" ?
          Array.isArray(l.flowers) && l.flowers.length && l.flowers.every(function(item){ return ids[item.id]; }) :
          ids[l.id];
      });
      // Re-cap every cart line against refreshed stock, including each flower in a custom bouquet.
      var remaining = {};
      FLOWERS.forEach(function(f){ remaining[f.id] = stockQty(f); });
      state.cart = state.cart.filter(function(line){
        var parts = lineFlowers(line), maxLineQty = 99;
        parts.forEach(function(item){
          var available = remaining[item.id];
          if (available !== null) maxLineQty = Math.min(maxLineQty, Math.floor(available / item.qty));
        });
        if (maxLineQty < 1) return false;
        if (line.qty > maxLineQty) line.qty = maxLineQty;
        parts.forEach(function(item){
          if (remaining[item.id] !== null) remaining[item.id] -= item.qty * line.qty;
        });
        return true;
      });
    });
  }
  function loadAdmin(resetOrderBaseline){
    return Promise.all([api("GET", "/api/admin/orders"), api("GET", "/api/admin/customers"), api("GET", "/api/admin/products"), api("GET", "/api/merchandising"), api("GET", "/api/admin/riders"), api("GET", "/api/payment-info")]).then(function(r){
      db.orders = r[0]; db.users = r[1]; db.products = r[2]; state.merchandising = r[3]; db.merchandising = r[3]; db.riders = r[4]; state.payInfo = r[5];
      if (resetOrderBaseline || knownAdminOrderCodes === null){
        knownAdminOrderCodes = {};
        r[0].forEach(function(order){ knownAdminOrderCodes[order.code] = true; });
      }
      updatePendingOrderBadge(r[0]);
    });
  }
  var knownAdminOrderCodes = null;
  var adminPollInFlight = false;
  function updatePendingOrderBadge(orders){
    var count = orders.filter(function(order){ return order.status === "Pending" || (order.paymentStatus === "awaiting" && order.status !== "Cancelled"); }).length;
    document.querySelectorAll(".pending-order-count").forEach(function(badge){
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = count === 0;
    });
  }
  function adminFormBusy(){ var el = document.activeElement; return !!el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName); }
  function announceNewOrders(orders){
    var added = orders.filter(function(order){ return !knownAdminOrderCodes[order.code]; });
    orders.forEach(function(order){ knownAdminOrderCodes[order.code] = true; });
    db.orders = orders;
    updatePendingOrderBadge(orders);
    if (!added.length || !state.isAdmin) return;
    var first = added[0], toVerify = added.filter(function(o){ return o.paymentStatus === "awaiting"; }).length;
    var message = added.length === 1 ?
      first.customer + " placed order " + first.code + (first.paymentStatus === "awaiting" ? " and paid with GCash. Please verify the payment." : ".") :
      added.length + " new orders were placed" + (toVerify ? " (" + toVerify + " GCash payment" + (toVerify === 1 ? "" : "s") + " to verify)." : ".");
    notify("info", message, "New order received", { duration: 10000, action: { label: "View orders", run: function(){
      state.adminTab = "orders"; state.adminOrderFilter = toVerify ? "verify" : "ongoing";
      if (state.screen === "admin") render(); else App.openAdmin();
    } } });
    if (state.screen === "admin" && state.adminTab === "orders" && !adminFormBusy()) render();
  }
  function pollAdminOrders(){
    if (!state.isAdmin || knownAdminOrderCodes === null || document.hidden || adminPollInFlight) return;
    adminPollInFlight = true;
    api("GET", "/api/admin/orders").then(announceNewOrders).catch(function(e){
      console.error("PetalHub order check failed:", e.message);
    }).then(function(){ adminPollInFlight = false; });
  }
  var customerOrderStatuses = null;
  var customerOrderPollInFlight = false;
  function rememberCustomerOrderStatuses(orders){
    customerOrderStatuses = {};
    orders.forEach(function(order){ customerOrderStatuses[order.code] = { status: order.status, pay: order.paymentStatus }; });
  }
  // The shop verifies a GCash payment or moves an order forward: tell the customer right away, on whichever page they are.
  function announceOrderChanges(orders){
    orders.forEach(function(order){
      var before = customerOrderStatuses && customerOrderStatuses[order.code];
      if (!before) return;
      if (before.pay === "awaiting" && order.paymentStatus === "verified"){
        notify("success", "Your GCash payment for " + order.code + " was verified. Your order is confirmed and the shop will start preparing it.", "Payment verified", { duration: 10000 });
      } else if (before.pay === "awaiting" && order.paymentStatus === "rejected"){
        notify("error", endSentence(order.paymentNote || "The shop could not verify your GCash payment") + " Order " + order.code + " was cancelled.", "Payment not verified", { duration: 14000 });
      } else if (before.status !== order.status){
        var text = { Preparing: "is now being prepared.", Ready: order.fulfillment === "delivery" ? "is ready and on its way to you." : "is ready for pickup.", Completed: "is complete. Thank you for shopping with PetalHub!", Cancelled: "was cancelled." }[order.status] || ("is now " + order.status + ".");
        notify(order.status === "Cancelled" ? "warning" : (order.status === "Ready" || order.status === "Completed" ? "success" : "info"), "Order " + order.code + " " + text, "Order update", { duration: 8000 });
      }
    });
  }
  function pollCustomerOrders(){
    if (!TOKEN || !state.authenticated || state.isAdmin || document.hidden || customerOrderPollInFlight) return;
    customerOrderPollInFlight = true;
    api("GET", "/api/orders/mine").then(function(orders){
      if (!state.authenticated || state.isAdmin) return;
      var firstLoad = customerOrderStatuses === null;
      if (!firstLoad) announceOrderChanges(orders);
      var changed = JSON.stringify(orders) !== JSON.stringify(state.myOrders);
      rememberCustomerOrderStatuses(orders);
      state.myOrders = orders;
      if (!firstLoad && changed && ["orders", "done"].indexOf(state.screen) >= 0) render();
    }).catch(function(e){
      console.error("PetalHub order check failed:", e.message);
    }).then(function(){ customerOrderPollInFlight = false; });
  }
  function loadMerchandising(){
    return api("GET", "/api/merchandising").then(function(settings){ state.merchandising = settings; return settings; });
  }
  function applyUser(u){ state.authenticated = true; state.userName = u.name; state.userEmail = u.email; state.isAdmin = u.role === "admin"; }
  function startSession(r, kind){
    TOKEN = r.token; try { sessionStorage.setItem("ph.token", TOKEN); } catch(e){}
    applyUser(r.user);
    customerOrderStatuses = null;
    var first = String(r.user.name || "").split(" ")[0] || "there";
    if (state.isAdmin){
      return loadAdmin(true).then(function(){
        var open = db.orders.filter(function(o){ return o.status === "Pending"; }).length, verify = db.orders.filter(function(o){ return o.paymentStatus === "awaiting"; }).length;
        notify("success", open ? open + " order" + (open === 1 ? " is" : "s are") + " waiting" + (verify ? ", " + verify + " with a GCash payment to verify." : ".") : "No orders are waiting right now.", "Welcome back, " + first);
        go("admin");
      });
    }
    notify("success", kind === "register" ? "Your account is ready. Happy shopping!" : (state.cart.length ? "Let\u2019s finish your order." : "Good to see you again."),
      kind === "register" ? "Welcome to PetalHub, " + first + "!" : "Welcome back, " + first + "!");
    pollCustomerOrders();
    return go(!state.cart.length ? "home" : (state.afterCheckout ? "fulfillment" : "cart"));
  }
  /* ---------- pop-up notifications (toasts) ---------- */
  // Every important action (login, add to cart, order placed, payment verified ...) ends in one of these.
  // They live outside #app, so re-rendering a screen never removes them.
  var TOAST_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var TOAST_ICONS = {
    success: TOAST_SVG + '<path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    error: TOAST_SVG + '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    warning: TOAST_SVG + '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.4v.1"/></svg>',
    info: TOAST_SVG + '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.9v.1"/></svg>'
  };
  var TOAST_TITLES = { success: "Done", error: "Something went wrong", warning: "Please check this", info: "Heads up" };
  var TOAST_MS = { success: 4200, info: 4800, warning: 7000, error: 9000 };
  var toastHostEl = null;
  function toastHost(){
    if (!toastHostEl){
      toastHostEl = document.createElement("div");
      toastHostEl.id = "toast-root";
      toastHostEl.className = "toast-stack";
      toastHostEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastHostEl);
    }
    return toastHostEl;
  }
  function notify(type, message, title, opts){
    opts = opts || {};
    if (!TOAST_ICONS[type]) type = "info";
    var host = toastHost(), key = type + "|" + (title || "") + "|" + (message || "");
    var kids = host.children, i;
    for (i = 0; i < kids.length; i++){
      if (kids[i]._key === key && !kids[i].classList.contains("leaving")){ kids[i]._restart(); return kids[i]; }
    }
    var ms = opts.duration || TOAST_MS[type] || 5000;
    var el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.setAttribute("role", type === "error" ? "alert" : "status");
    el._key = key;
    el.style.setProperty("--toast-ms", ms + "ms");
    el.innerHTML = '<span class="toast-icon">' + TOAST_ICONS[type] + '</span>' +
      '<div class="toast-body"><strong class="toast-title">' + esc(title || TOAST_TITLES[type]) + '</strong>' + (message ? '<span class="toast-msg">' + esc(message) + '</span>' : '') +
      (opts.action ? '<button type="button" class="toast-action">' + esc(opts.action.label) + '</button>' : '') + '</div>' +
      '<button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button><span class="toast-bar" aria-hidden="true"></span>';
    var timer = null, remaining = ms, started = 0;
    function close(){
      if (!el.parentNode || el.classList.contains("leaving")) return;
      clearTimeout(timer); el.classList.add("leaving");
      setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 240);
    }
    function start(){ started = Date.now(); clearTimeout(timer); timer = setTimeout(close, remaining); el.classList.remove("paused"); }
    function pause(){ clearTimeout(timer); remaining -= Date.now() - started; el.classList.add("paused"); }
    el._restart = function(){
      remaining = ms; var bar = el.querySelector(".toast-bar");
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; start();
    };
    el.addEventListener("mouseenter", pause); el.addEventListener("mouseleave", start);
    el.addEventListener("focusin", pause); el.addEventListener("focusout", start);
    el.querySelector(".toast-close").addEventListener("click", close);
    if (opts.action) el.querySelector(".toast-action").addEventListener("click", function(){ close(); opts.action.run(); });
    host.insertBefore(el, host.firstChild);
    while (host.children.length > 4) host.removeChild(host.lastChild);
    start();
    return el;
  }
  function clearToasts(){ var host = toastHostEl; if (host) while (host.firstChild) host.removeChild(host.firstChild); }
  var toast = {
    success: function(message, title, opts){ return notify("success", message, title, opts); },
    error: function(message, title, opts){ return notify("error", message, title, opts); },
    warning: function(message, title, opts){ return notify("warning", message, title, opts); },
    info: function(message, title, opts){ return notify("info", message, title, opts); }
  };
  function endSentence(text){ text = String(text || "").trim(); return !text || /[.!?]$/.test(text) ? text : text + "."; }
  function showWarning(message, title){ notify("warning", message, title); }
  function showErr(e){ notify("error", (e && e.message) || "Please try again in a moment.", "Couldn\u2019t complete that action"); }
  function showCartToast(message){
    render();
    notify("success", message, "Added to cart", { action: { label: "View cart", run: function(){ go("cart"); } } });
  }
  // A modal is kept only for questions that need an answer (for example: remove a flower, reject a payment).
  function showConfirm(message, onConfirm, title, confirmText){
    state.dialog = { title: title || "Please confirm", message: message, onConfirm: onConfirm, confirmText: confirmText };
    render();
  }
  // Older code paths set state.notice / state.loginError ... and call render(); each one is turned into a pop-up here.
  function flushNotices(){
    [["serverError", "error", "PetalHub needs attention"], ["notice", "warning", "Please review your cart"], ["deliveryError", "warning", "Delivery details needed"],
     ["gcashError", "warning", "GCash payment details needed"], ["registerError", "error", "Registration needs attention"], ["loginError", "error", "Login failed"]].forEach(function(it){
      var msg = state[it[0]];
      if (msg){ state[it[0]] = ""; notify(it[1], msg, it[2]); }
    });
  }

  /* ---------- state ---------- */
  var state = {
    screen: "home",
    detailId: null,
    qty: 1,
    arrangementType: "single",
    wrapChoice: "none",
    wrapDesign: WRAPPING_DESIGNS[0].id,
    customFlowers: {},
    customWrapColor: "",
    customWrapNotes: "",
    cart: loadCart(),
    shopSearch: "",
    shopSort: "featured",
    shopInStock: false,
    gcashRef: "",
    gcashProof: "",
    gcashProofName: "",
    gcashError: "",
    payInfo: null,
    qrDraft: "",
    lastPaymentMethod: null,
    notice: "",
    afterCheckout: false,
    lastOrder: null,
    serverError: "",
    dialog: null,
    authenticated: false,
    userName: "",
    userEmail: "",
    isAdmin: false,
    adminTab: "orders",
    adminOrderFilter: "ongoing",
    customerOrderFilter: "ongoing",
    merchandising: { weather: "", eventFlowers: {}, weatherFlowers: {} },
    myOrders: [],
    registerError: "",
    registerForm: { name: "", email: "", pass: "", pass2: "" },
    loginError: "",
    loginForm: { email: "", pass: "" },
    fulfillment: null,
    address: { street: "", city: "", zip: "", phone: "" },
    payment: null,
    orderCode: null,
    checkoutKey: null,
    deliveryError: "",
    placing: false
  };

  // REVISION 1 + 2: screens that only make sense in a certain state are redirected instead of showing stale data.
  var CHECKOUT_SCREENS = ["fulfillment", "delivery", "payment", "confirm", "gcash"];
  function resolveScreen(screen){
    if (screen === "admin" && !state.isAdmin) return "home";
    if (screen === "orders" && !state.authenticated) return "home";
    if (CHECKOUT_SCREENS.indexOf(screen) >= 0){
      if (!state.cart.length) return "cart";
      if (!state.authenticated) return "authGate";
      if (state.isAdmin) return "home";
      if ((screen === "payment" || screen === "confirm" || screen === "gcash") && !state.fulfillment) return "fulfillment";
      if ((screen === "confirm" || screen === "gcash") && !state.payment) return "payment";
      if (screen === "gcash" && state.payment !== "gcash") return "confirm";
    }
    if (screen === "done" && !state.orderCode) return "home";
    if (state.authenticated && ["authGate", "register", "login"].indexOf(screen) >= 0) return "home";
    return screen;
  }
  // REVISION 1: browser Back/Forward buttons now move between app screens instead of leaving the site.
  function go(screen, fromHistory){
    state.screen = resolveScreen(screen);
    if (state.screen !== "cart") state.notice = "";
    if (!fromHistory){ try { history.pushState({ ph: state.screen }, ""); } catch(e){} }
    window.scrollTo(0,0); render();
  }
  window.addEventListener("popstate", function(ev){
    go(ev.state && ev.state.ph ? ev.state.ph : "home", true);
  });
  try { history.replaceState({ ph: "home" }, ""); } catch(e){}
  function expireSession(){
    TOKEN = null; try { sessionStorage.removeItem("ph.token"); } catch(e){}
    state.authenticated = false; state.isAdmin = false; state.userName = ""; state.userEmail = ""; state.myOrders = [];
    state.loginError = "Your session expired. Please log in again.";
    go("login");
  }

  function cartCount(){
    return state.cart.reduce(function(s, l){ return s + l.qty; }, 0);
  }
  function flowerSubtotal(line){
    if (line.arrangementType === "custom") return line.flowers.reduce(function(total, item){
      var flower = flowerById(item.id);
      return total + (flower ? flower.price * item.qty : 0);
    }, 0) * line.qty;
    var flower = flowerById(line.id);
    return flower ? flower.price * line.qty : 0;
  }
  function wrapOption(line){ return WRAPPING_DESIGNS.filter(function(option){ return option.id === line.wrapDesign; })[0]; }
  function wrappingSubtotal(){
    return state.cart.reduce(function(total, line){
      var option = wrapOption(line);
      return total + (line.wrapChoice === "wrapped" && option ? option.price * line.qty : 0);
    }, 0);
  }
  function itemsSubtotal(){ return state.cart.reduce(function(total, line){ return total + flowerSubtotal(line); }, 0); }
  function lineTotal(line){
    var option = wrapOption(line);
    return flowerSubtotal(line) + (line.wrapChoice === "wrapped" && option ? option.price * line.qty : 0);
  }
  function cartTotal(){ return state.cart.reduce(function(total, line){ return total + lineTotal(line); }, 0); }
  function customFlowerSubtotal(){
    return FLOWERS.reduce(function(total, flower){ return total + flower.price * (state.customFlowers[flower.id] || 0); }, 0);
  }
  function customFlowerList(flowers, multiplier){
    return flowers.map(function(item){
      var flower = flowerById(item.id);
      return flower ? '<span class="custom-flower-item">' + esc(flower.name) + ' ×' + (item.qty * multiplier) + '</span>' : "";
    }).join("");
  }
  function customWrapNotes(line){
    var notes = [];
    if (line.wrapColor) notes.push("Requested color: " + esc(line.wrapColor));
    if (line.wrapNotes) notes.push("Notes: " + esc(line.wrapNotes));
    return notes.length ? '<small>' + notes.join(" · ") + '</small>' : "";
  }
  function wrappingColor(option){ return '<small class="wrap-design-color">Color: ' + esc(option.color) + '</small>'; }
  function wrappingImage(option, className){
    return '<img class="' + className + '" src="' + esc(option.image) + '" alt="' + esc(option.name) + ' wrapping preview" loading="lazy">';
  }
  function newLineId(){ return "line-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function lineFlowers(line){
    return line.arrangementType === "custom" ? line.flowers : [{ id: line.id, qty: 1 }];
  }
  function stockUsed(id, exceptLine){
    return state.cart.reduce(function(total, line){
      if (line === exceptLine) return total;
      var item = lineFlowers(line).filter(function(flower){ return flower.id === id; })[0];
      return total + (item ? item.qty * line.qty : 0);
    }, 0);
  }
  function canIncreaseLine(line){
    return lineFlowers(line).every(function(item){
      var flower = flowerById(item.id), max = flower ? stockQty(flower) : null;
      return max === null || max - stockUsed(item.id, line) >= item.qty;
    });
  }
  function money(n){ return CURRENCY + n.toFixed(2); }
  function flowerStock(id){ var f = flowerById(id); return f ? stockQty(f) : null; }
  function statusBadge(st){ return '<span class="order-status status-' + esc(String(st).toLowerCase()) + '">' + esc(st) + '</span>'; }
  // small reusable "Back" button used on every screen that needs one
  function backBtn(label, target, w){ return '<button type="button" class="back-link"' + (w ? ' style="display:flex;width:100%;max-width:' + w + 'px;margin:0 auto 14px;justify-content:flex-start;"' : '') + ' onclick="App.go(\'' + target + '\')">' + iconBack() + esc(label) + '</button>'; }
  // Availability is whatever the admin set on the server (In stock / Out of stock and quantity).
  function hasAvailableStock(flower){ var q = stockQty(flower); return q === null || q > 0; }
  // Use local calendar fields so occasion dates follow the visitor's local date and repeat every year.
  function occasionForDate(date){
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var dateKey = month * 100 + day;
    var event = OCCASIONS.filter(function(occasion){
      if (typeof occasion.startMonth !== "number") return false;
      var startKey = occasion.startMonth * 100 + occasion.startDay;
      var endKey = occasion.endMonth * 100 + occasion.endDay;
      return startKey <= endKey ? dateKey >= startKey && dateKey <= endKey :
        dateKey >= startKey || dateKey <= endKey;
    })[0];
    return event ? occasionWithFlowers(event) : null;
  }
  function occasionWithFlowers(occasion){
    var configured = state.merchandising.eventFlowers[occasion.id];
    return {
      id: occasion.id, name: occasion.name, message: occasion.message,
      recommendedFlowerIds: Array.isArray(configured) ? configured : occasion.recommendedFlowerIds
    };
  }
  function recommendationCards(source, reasonLabel){
    var candidates = source.recommendedFlowerIds.map(function(id){
      return FLOWERS.filter(function(flower){ return flower.id === id; })[0];
    });
    var available = candidates.filter(function(flower){ return flower && hasAvailableStock(flower); });
    var usedFallback = false;
    if (available.length === 0){
      available = FLOWERS.filter(function(flower){ return hasAvailableStock(flower); }).slice(0, 3);
      usedFallback = true;
    }
    if (!available.length) return '<p class="recommendation-empty">No flowers are currently available. Please check back soon.</p>';
    return '<div class="recommendation-grid">' + available.map(function(flower){
      return '<button class="recommendation-card" onclick="App.openDetail(' + flower.id + ')">' +
        '<span class="recommendation-photo">' + flowerPhoto(flower, "recommendation-image", true, false) + '</span>' +
        '<span class="recommendation-info"><span class="recommendation-name">' + esc(flower.name) + '</span>' +
          '<span class="recommendation-price">' + money(flower.price) + ' / bunch</span>' +
          '<span class="recommendation-stock">' + esc(flower.stock) + '</span>' +
          '<span class="recommendation-reason">' + (usedFallback ? "Fresh pick today" : "Recommended for " + esc(reasonLabel)) + '</span></span>' +
      '</button>';
    }).join("") + '</div>';
  }
  // Build recommendation cards from FLOWERS, retaining their real price, image, and live stock text.
  // Event picks take priority; admin-selected weather picks are shown alongside them.
  function screenRecommendations(){
    var occasion = occasionForDate(new Date());
    var weatherPreset = state.merchandising.weather ? WEATHER_PRESETS.filter(function(w){ return w.id === state.merchandising.weather; })[0] : null;
    var weather = weatherPreset ? {
      id: weatherPreset.id, label: weatherPreset.label, message: weatherPreset.message,
      recommendedFlowerIds: Array.isArray(state.merchandising.weatherFlowers[weatherPreset.id]) ?
        state.merchandising.weatherFlowers[weatherPreset.id] : weatherPreset.recommendedFlowerIds
    } : null;

    var source = occasion || weather;
    if (!source) return "";
    var reasonLabel = occasion ? occasion.name : weather.label + " weather";
    var heading = occasion ? occasion.name + " Picks" : weather.label + " Day Picks";
    var message = source.message;
    var eventRecommendations = occasion ?
      '<div class="recommendation-panel event-panel event-' + esc(occasion.id) + '">' +
        '<div class="recommendations-heading"><div><h2 id="recommendation-heading">' + esc(heading) + '</h2><p>' + esc(message) + '</p></div></div>' +
        recommendationCards(occasion, occasion.name) +
      '</div>' : '';

    var weatherRecommendations = weather ?
      '<div class="recommendation-panel weather-recommendations weather-' + esc(weather.id) + '">' +
        '<h3>' + esc(weather.label) + ' weather picks</h3><p>' + esc(weather.message) + '</p>' +
        recommendationCards(weather, weather.label + ' weather') +
      '</div>' : '';

    return '<section class="recommendations">' +
      eventRecommendations + weatherRecommendations +
      '</section>';
  }
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];
    });
  }

  /* ---------- icons ---------- */
  function flowerPhoto(flower, className, decorative, eager){
    return '<img class="' + className + '" src="' + esc(flower.image) + '" alt="' + (decorative ? '' : esc(flower.photoAlt)) + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async" onerror="if(!this.dataset.fb){this.dataset.fb=1;this.src=\'' + esc(flower.fallback || "flowers/placeholder.svg") + '\'}else{this.onerror=null;this.src=\'flowers/placeholder.svg\'}">';
  }
  function iconCart(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/></svg>';
  }
  function iconBack(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  }
  function iconStore(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/><path d="M9 20v-6h6v6"/></svg>';
  }
  function iconTruck(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="7" width="13" height="9"/><path d="M14.5 10h4l3.5 3.5V16h-7.5z"/><circle cx="6" cy="18.5" r="1.6"/><circle cx="17.5" cy="18.5" r="1.6"/></svg>';
  }
  function iconCard(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>';
  }
  function iconWallet(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-4a2.5 2.5 0 0 1 0-5h4"/></svg>';
  }
  function iconCash(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="1.5"/><circle cx="12" cy="12" r="3"/></svg>';
  }
  function iconCheck(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="rgba(124,152,133,0.12)"/><path d="M8 12.5l2.6 2.6L16 9.5"/></svg>';
  }
  function iconEmptyCart(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none"/><circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none"/><path d="M2.5 3h2l2.2 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"/></svg>';
  }
  function brandMark(){
    return '<svg class="brand-mark" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<g>' + petalFlowerMini() + '</g></svg>';
  }
  function petalFlowerMini(){
    var cx=12, cy=12, r=8.4, s="";
    for (var i=0;i<6;i++){
      var a = i*60;
      s += '<ellipse cx="'+cx+'" cy="'+(cy-r*0.55)+'" rx="'+(r*0.30)+'" ry="'+(r*0.58)+'" fill="var(--rose-deep)" transform="rotate('+a+' '+cx+' '+cy+')"/>';
    }
    s += '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.24)+'" fill="var(--gold)"/>';
    return s;
  }

  /* ---------- chrome ---------- */
  function stepIndexFor(screen){
    switch(screen){
      case "home": return 0;
      case "detail": return 0;
      case "cart": return 1;
      case "authGate": case "register": case "login": return 2;
      case "fulfillment": case "delivery": return 3;
      case "payment": case "confirm": case "gcash": return 4;
      case "done": return 5;
      default: return 0;
    }
  }
  function renderSteps(){
    var current = stepIndexFor(state.screen);
    var html = '<div class="steps">';
    STEP_LABELS.forEach(function(label, i){
      var cls = "step" + (i === current ? " active" : (i < current ? " done" : ""));
      html += '<div class="' + cls + '"><div class="step-bar"></div><div class="step-label">' + esc(label) + '</div></div>';
    });
    html += '</div>';
    return html;
  }
  /* ---------- shared pieces for the redesigned pages ---------- */
  var PICKUP_SHORT = "Ready in about 2 hours";
  function lineLabel(l){ var f = flowerById(l.id); return l.arrangementType === "custom" ? "Custom Bouquet" : (f ? f.name : "Flower"); }
  function lineKind(l){ return l.arrangementType === "custom" ? "Custom Bouquet" : (l.arrangementType === "bouquet" ? "Ready-Made Bouquet" : "Single Flower"); }
  function lineThumbFlower(l){ return flowerById(l.id) || (l.flowers && l.flowers[0] && flowerById(l.flowers[0].id)); }
  function paymentLabel(id, fulfillment){
    var f = fulfillment || state.fulfillment;
    return id === "gcash" ? "GCash (scan QR)" : (id === "cash" ? (f === "delivery" ? "Cash on delivery" : "Cash on pickup") : "\u2014");
  }
  function svgIcon(path, extra){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || "") + '>' + path + '</svg>'; }
  function iconQr(){ return svgIcon('<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 14h2.5M14 19h2.5v1.5M20.5 18v2.5h-2"/>'); }
  function iconSearch(){ return svgIcon('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'); }
  function iconClock(){ return svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>'); }
  function iconGift(){ return svgIcon('<rect x="3.5" y="8.5" width="17" height="11.5" rx="1.5"/><path d="M12 8.5V20M3.5 13h17M12 8.5C10 8.5 8 7.6 8 6a2 2 0 0 1 4 0M12 8.5c2 0 4-.9 4-2.5a2 2 0 0 0-4 0"/>'); }
  function iconLeaf(){ return svgIcon('<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19c3-4 6-7 10-9"/>'); }
  function iconTick(){ return svgIcon('<path d="M5 12.5l4.2 4.2L19 7"/>'); }

  /* ---------- chrome: top bar, footer ---------- */
  function renderTopbar(){
    var count = cartCount();
    var cartClickable = !state.isAdmin || count > 0;
    var pending = state.isAdmin ? db.orders.filter(function(o){ return o.status === "Pending" || o.paymentStatus === "awaiting"; }).length : 0;
    var initial = state.userName ? state.userName.trim().charAt(0).toUpperCase() : "?";
    var isShop = ["home", "detail"].indexOf(state.screen) >= 0;
    var nav = '<nav class="main-nav" aria-label="Main">' +
      '<button class="nav-link' + (isShop ? ' active' : '') + '" onclick="App.go(\'home\')">Shop</button>' +
      (state.authenticated && !state.isAdmin ? '<button class="nav-link' + (state.screen === "orders" ? ' active' : '') + '" onclick="App.openOrders()">My orders</button>' : '') +
      (state.isAdmin ? '<button class="nav-link' + (state.screen === "admin" ? ' active' : '') + '" onclick="App.openAdmin()">Dashboard<span class="pending-order-count admin-order-count" ' + (pending ? '' : 'hidden') + '>' + (pending > 99 ? "99+" : pending) + '</span></button>' : '') +
      '</nav>';
    var account = state.authenticated ?
      '<span class="account-chip" title="' + esc(state.userEmail) + '"><span class="avatar" aria-hidden="true">' + esc(initial) + '</span><span class="account-name">' + esc(state.userName) + '</span></span>' +
        (state.isAdmin ? '' : '<button class="logout-btn" onclick="App.logout()">Log out</button>') :
      '<button class="logout-btn" onclick="App.go(\'login\')">Log in</button><button class="btn btn-sm hide-sm" onclick="App.go(\'register\')">Create account</button>';
    return '' +
      (state.isAdmin ? '' : '<div class="announce" role="note"><span>' + iconTruck() + 'Same-day delivery in Caoayan &amp; nearby towns</span><span class="hide-sm">' + iconQr() + 'Pay with GCash or cash</span></div>') +
      '<div class="topbar">' +
        '<div class="topbar-inner">' +
          '<button class="brand" onclick="App.go(\'home\')">' + brandMark() + 'PetalHub</button>' + (state.isAdmin ? '' : nav) +
          '<div class="account-controls">' + (state.isAdmin ? nav + account + '<button class="logout-btn" onclick="App.logout()">Log out</button>' : account) +
            (state.isAdmin ? '' : '<button class="cart-pill" ' + (cartClickable ? 'onclick="App.openCart()"' : 'style="opacity:.55;cursor:default"') + ' aria-label="Cart, ' + count + ' item' + (count === 1 ? '' : 's') + '">' +
              iconCart() + '<span class="cart-label">Cart</span><span class="cart-count">' + count + '</span>' +
            '</button>') +
          '</div>' +
        '</div>' +
        (["home", "admin", "orders", "detail"].indexOf(state.screen) >= 0 ? "" : renderSteps()) +
      '</div>';
  }
  function renderFooter(){
    var signedIn = state.authenticated && !state.isAdmin;
    return '<footer class="site-footer"><div class="footer-inner">' +
      '<div class="footer-brand"><div class="footer-logo">' + brandMark() + 'PetalHub</div><p>Fresh flowers arranged to order and sent with care, by pickup or same-day delivery in Caoayan and nearby Ilocos Sur towns.</p></div>' +
      '<div class="footer-col"><h4>Shop</h4><button onclick="App.go(\'home\')">All flowers</button><button onclick="App.go(\'home\');App.browseCollection()">Browse the collection</button><button onclick="App.openCart()">Your cart</button></div>' +
      '<div class="footer-col"><h4>My account</h4>' + (signedIn ? '<button onclick="App.openOrders()">My orders</button><button onclick="App.logout()">Log out</button>' :
        (state.isAdmin ? '<button onclick="App.openAdmin()">Dashboard</button>' : '<button onclick="App.go(\'login\')">Log in</button><button onclick="App.go(\'register\')">Create an account</button>')) + '</div>' +
      '<div class="footer-col"><h4>Orders &amp; payment</h4><p>Pickup: ' + esc(PICKUP_SHORT.toLowerCase()) + '.</p><p>Delivery: about 2\u20134 hours. Orders placed after 5:00 PM go out the next morning.</p>' +
        '<p class="pay-badges"><span class="pay-badge gcash">GCash</span><span class="pay-badge">Cash</span></p></div>' +
      '</div><div class="footer-base"><span>\u00a9 ' + new Date().getFullYear() + ' PetalHub. All rights reserved.</span>' +
        '<details class="photo-credits"><summary>Flower photography credits</summary><div class="photo-credit-list">' +
          '<p><a href="https://commons.wikimedia.org/wiki/File:Pink_rose_bloom_of_a_climbing_rose_at_Boreham,_Essex,_England_1.jpg">Garden rose photo by Acabashi</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>' +
          '<p><a href="https://commons.wikimedia.org/wiki/File:Red-tulip-macro_-_West_Virginia_-_ForestWander.jpg">Tulip photo by ForestWander</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/us/deed.en">CC BY-SA 3.0 US</a></p>' +
          '<p><a href="https://commons.wikimedia.org/wiki/File:Sunflower_close_up_shot.jpg">Sunflower photo by Aerous</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>' +
          '<p><a href="https://commons.wikimedia.org/wiki/File:Pink_Peony_Flower.jpg">Peony photo by Nathanieljoyce</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a></p>' +
          '<p><a href="https://commons.wikimedia.org/wiki/File:IMG_8431_close_up_for_Purple_Orchid_Flower_photographed_by_Peak_Hora.jpg">Orchid photo by Peak Hora</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>' +
          '<p><a href="https://commons.wikimedia.org/wiki/File:A_flower_of_Madonna_lily,_black_stamen_pollen.jpg">Madonna lily photo by Bobjgalindo</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p>' +
        '</div></details></div></footer>';
  }

  /* ---------- screens ---------- */
  function heroFlower(i){ return FLOWERS.length ? FLOWERS[i % FLOWERS.length] : { image: "flowers/placeholder.svg", photoAlt: "" }; }
  // One entry per cart line that was ordered. The server stores one row per flower, so rows that share a line_key are grouped back together.
  var ARRANGEMENT_LABELS = { single: "Single Flower", bouquet: "Ready-Made Bouquet", custom: "Custom Bouquet" };
  function orderLines(o){
    var groups = [], byKey = {};
    (o.items || []).forEach(function(it, i){
      var key = it.lineKey || ("row-" + i), g = byKey[key];
      if (!g){
        g = byKey[key] = { arrangement: ARRANGEMENT_LABELS[it.arrangement] ? it.arrangement : "single", lineQty: it.lineQty > 0 ? it.lineQty : 1,
          wrapDesign: it.wrapDesign || "", wrapColor: it.wrapColor || "", wrapNotes: it.wrapNotes || "", wrapFee: 0, flowers: [], total: 0 };
        groups.push(g);
      }
      g.wrapFee += it.wrapFee || 0;
      g.total += it.price * it.qty;
      g.flowers.push({ name: it.name, qty: it.qty });
    });
    return groups;
  }
  function orderLinesHtml(o){
    return '<div class="order-lines">' + orderLines(o).map(function(g){
      var custom = g.arrangement === "custom";
      var count = custom ? g.lineQty : g.flowers[0].qty;
      var title = custom ? "Custom Bouquet" : g.flowers[0].name;
      var flowers = custom ? '<ul class="order-line-flowers">' + g.flowers.map(function(f){
        return '<li>' + esc(f.name) + ' \u00d7 ' + (f.qty / g.lineQty) + '</li>';
      }).join("") + '</ul>' + (g.lineQty > 1 ? '<small class="order-line-note">Flowers listed are for one bouquet; ordered \u00d7 ' + g.lineQty + '.</small>' : '') : '';
      var wrap = "";
      if (g.arrangement !== "single"){
        var option = WRAPPING_DESIGNS.filter(function(d){ return d.id === g.wrapDesign; })[0];
        if (g.wrapDesign){
          wrap = '<div class="order-line-wrap"><span class="order-line-label">Wrapping</span><span><strong>' + esc(option ? option.name : g.wrapDesign) + '</strong>' +
            (option ? ' \u00b7 ' + esc(option.color) : '') + (g.wrapFee > 0 ? ' \u00b7 +' + money(g.wrapFee) : '') +
            (g.wrapColor ? '<small>Requested color: ' + esc(g.wrapColor) + '</small>' : '') +
            (g.wrapNotes ? '<small>Notes: ' + esc(g.wrapNotes) + '</small>' : '') + '</span></div>';
        } else wrap = '<div class="order-line-wrap"><span class="order-line-label">Wrapping</span><span>Without wrapping</span></div>';
      }
      return '<div class="order-line"><div class="order-line-head"><span><span class="type-badge type-' + g.arrangement + '">' + esc(ARRANGEMENT_LABELS[g.arrangement]) + '</span> ' +
        '<strong>' + esc(title) + '</strong> \u00d7 ' + count + '</span><span class="order-line-total">' + money(g.total + g.wrapFee) + '</span></div>' + flowers + wrap + '</div>';
    }).join("") + '</div>';
  }
  function orderCategory(order){
    if (order.status === "Cancelled") return "cancelled";
    if (order.status === "Completed") return "completed";
    return "ongoing";
  }
  function screenHome(){
    return '' +
      '<section class="hero">' +
        '<div class="hero-copy"><div class="eyebrow">The PetalHub growers’ room</div><h1>Fresh stems, chosen and sent with care.</h1><p>Browse this week\u2019s cuts from our growers\u2019 room, add what catches your eye, and we\u2019ll get it to you \u2014 by pickup or delivery.</p><button class="btn hero-cta" onclick="App.browseCollection()">Explore the collection</button><div class="hero-note">Freshly gathered, arranged for your everyday</div></div>' +
        '<div class="bouquet-scene" aria-label="A floating arrangement of real garden flowers" role="img"><div class="bouquet-glow"></div><div class="bouquet-platform"></div><div class="bouquet">' +
          '<div class="bouquet-bloom bouquet-bloom-a">' + flowerPhoto(heroFlower(0), "bouquet-photo", true, true) + '</div>' +
          '<div class="bouquet-bloom bouquet-bloom-b">' + flowerPhoto(heroFlower(3), "bouquet-photo", true, true) + '</div>' +
          '<div class="bouquet-bloom bouquet-bloom-c">' + flowerPhoto(heroFlower(2), "bouquet-photo", true, true) + '</div>' +
          '<div class="bouquet-bloom bouquet-bloom-d">' + flowerPhoto(heroFlower(1), "bouquet-photo", true, true) + '</div>' +
          '<div class="bouquet-bloom bouquet-bloom-e">' + flowerPhoto(heroFlower(4), "bouquet-photo", true, true) + '</div>' +
          '<div class="bouquet-bloom bouquet-bloom-f">' + flowerPhoto(heroFlower(5), "bouquet-photo", true, true) + '</div>' +
        '</div><div class="bouquet-caption">A little color, gathered fresh</div></div>' +
      '</section>' +
      benefitsStrip() +
      screenRecommendations() +
      '<section class="shop-section" id="flower-collection"><div class="collection-head"><div><h2>Our flowers</h2><p>Fresh selections from the PetalHub growers\u2019 room</p></div></div>' +
        shopToolbar() + '<div class="grid" id="flower-grid">' + flowerCardsHtml() + '</div></section>';
  }

  // how many more of this flower can still be added (stock minus what is already in the cart)
  function room(f){ var max = stockQty(f); return max === null ? 99 : Math.max(0, max - stockUsed(f.id)); }
  function screenDetail(){
    var f = FLOWERS.filter(function(x){ return x.id === state.detailId; })[0];
    if (!f) { state.screen = "home"; return screenHome(); }
    var isCustomBouquet = state.arrangementType === "custom";
    var selectedStemCount = FLOWERS.reduce(function(total, flower){ return total + (state.customFlowers[flower.id] || 0); }, 0);
    var wrap = wrapOption({ wrapDesign: state.wrapDesign });
    var designs = WRAPPING_DESIGNS.map(function(option){
      var selected = state.wrapDesign === option.id;
      return '<button type="button" class="wrap-style' + (selected ? ' selected' : '') + '" aria-pressed="' + selected + '" onclick="App.chooseWrapDesign(\'' + option.id + '\')">' +
        wrappingImage(option, "wrap-style-image") + '<span class="wrap-style-name">' + esc(option.name) + '</span><span class="wrap-style-price">+' + money(option.price) + '</span>' + wrappingColor(option) + '<span class="wrap-style-detail">' + esc(option.detail) + '</span></button>';
    }).join("");
    var customFlowerRows = FLOWERS.map(function(flower){
      var qty = state.customFlowers[flower.id] || 0;
      var available = room(flower);
      var limit = available === null ? 99 : available;
      return '<div class="builder-flower-row">' +
        '<div class="builder-flower-info"><strong>' + esc(flower.name) + '</strong><small>' + money(flower.price) + ' each · ' + esc(flower.stock) + '</small></div>' +
        '<div class="builder-qty"><button type="button" class="qty-btn" aria-label="Remove one ' + esc(flower.name) + '" onclick="App.changeCustomFlower(' + flower.id + ',-1)"' + (qty < 1 ? ' disabled' : '') + '>−</button><span class="qty-val">' + qty + '</span><button type="button" class="qty-btn" aria-label="Add one ' + esc(flower.name) + '" onclick="App.changeCustomFlower(' + flower.id + ',1)"' + (qty >= limit ? ' disabled title="No more stock available"' : '') + '>+</button></div>' +
        '<strong class="builder-line-total">' + money(flower.price * qty) + '</strong>' +
      '</div>';
    }).join("");
    var detailTotal = isCustomBouquet ? customFlowerSubtotal() + (state.wrapChoice === "wrapped" && wrap ? wrap.price : 0) :
      f.price * state.qty;
    return '' +
      '<button class="back-link" onclick="App.go(\'home\')">' + iconBack() + 'Back to browsing</button>' +
      '<div class="detail">' +
        '<div class="detail-visual detail-visual-' + f.id + '">' + flowerPhoto(f, "detail-photo", false, true) + '</div>' +
        '<div class="detail-body">' +
          '<span class="flower-tag">' + esc(f.tag) + '</span>' +
          '<h2 style="margin-top:10px;">' + esc(f.name) + '</h2>' +
          '<div class="detail-price">' + money(f.price) + ' base price per bunch</div>' +
          '<p class="detail-desc">' + esc(f.desc) + '</p>' +
          '<div class="detail-stock"><span class="stock-badge' + (stockQty(f) === 0 ? ' out' : '') + '">' + (stockQty(f) === 0 ? 'Out of Stock' : 'In Stock') + '</span>' + (stockQty(f) === 0 ? '' : '<span>' + esc(f.stock) + '</span>') + '</div>' +
          '<section class="product-options" aria-label="Customize your order">' +
            '<fieldset class="option-group"><legend>1. Purchase type</legend><div class="option-choice-row arrangement-choice-row">' +
              '<button type="button" class="option-choice' + (state.arrangementType === "single" ? ' selected' : '') + '" aria-pressed="' + (state.arrangementType === "single") + '" onclick="App.chooseArrangement(\'single\')"><span class="option-choice-title">Single Flower</span><span class="option-choice-detail">Individual stems, unwrapped</span></button>' +
                '<button type="button" class="option-choice' + (isCustomBouquet ? ' selected' : '') + '" aria-pressed="' + isCustomBouquet + '" onclick="App.chooseArrangement(\'custom\')"><span class="option-choice-title">Custom Bouquet</span><span class="option-choice-detail">Build your bouquet from any flowers</span></button>' +
              '</div></fieldset>' +
              (isCustomBouquet ? '<section class="custom-builder" aria-labelledby="custom-builder-title"><h3 id="custom-builder-title">2. Build your bouquet</h3><p class="builder-hint">Choose the flowers and quantities for your arrangement.</p><div class="builder-flower-list">' + customFlowerRows + '</div><div class="builder-subtotal"><span>Flowers (' + selectedStemCount + ' stems)</span><strong>' + money(customFlowerSubtotal()) + '</strong></div></section>' : '') +
              (isCustomBouquet ? '<fieldset class="option-group"><legend>3. Wrapping design</legend><div class="wrap-styles" role="group" aria-label="Wrapping designs">' + designs + '</div>' +
              (isCustomBouquet ? '<div class="custom-wrap-fields"><div class="field"><label for="custom-wrap-color">Wrapping color preference</label><input id="custom-wrap-color" type="text" value="' + esc(state.customWrapColor) + '" placeholder="e.g. soft blush pink" onchange="App.updateCustomWrap(\'color\',this.value)"></div><div class="field"><label for="custom-wrap-notes">Material or wrapping notes</label><textarea id="custom-wrap-notes" rows="2" placeholder="Any special material or finishing requests" onchange="App.updateCustomWrap(\'notes\',this.value)">' + esc(state.customWrapNotes) + '</textarea></div></div>' : '') +
            '</fieldset>' : '') +
          '</section>' +
          (!isCustomBouquet ? '<div class="qty-row"><button class="qty-btn" onclick="App.changeQty(-1)" aria-label="Decrease quantity">\u2212</button><span class="qty-val">' + state.qty + '</span><button class="qty-btn" onclick="App.changeQty(1)" aria-label="Increase quantity"' + (state.qty >= room(f) ? ' disabled' : '') + '>+</button></div>' : '') +
          '<div class="detail-total"><span>' + (isCustomBouquet ? 'Custom bouquet total' : 'Total for ' + state.qty) + '</span><strong>' + money(detailTotal) + '</strong></div>' +
          (state.isAdmin ? '<p class="sub">Admin accounts manage the shop and cannot place orders.</p>' :
            (isCustomBouquet ? '<button class="btn" ' + (selectedStemCount === 0 ? 'disabled' : '') + ' onclick="App.addCustomBouquet()">Add custom bouquet to cart</button>' :
              (stockQty(f) === 0 ? '<button class="btn" disabled>Out of stock</button>' : room(f) <= 0 ? '<button class="btn" disabled>All available stock is already in your cart</button>' :
                '<button class="btn" onclick="App.addToCart(' + f.id + ')">Add to cart</button>'))) +
        '</div>' +
      '</div>';
  }

  /* ---------- shop: search, sort and the flower grid ---------- */
  function sortedFlowers(){
    var q = state.shopSearch.trim().toLowerCase();
    var list = FLOWERS.filter(function(f){
      if (state.shopInStock && stockQty(f) === 0) return false;
      return !q || (f.name + " " + f.tag + " " + f.desc).toLowerCase().indexOf(q) >= 0;
    });
    list.sort(function(a, b){
      var soldA = stockQty(a) === 0 ? 1 : 0, soldB = stockQty(b) === 0 ? 1 : 0;
      if (soldA !== soldB) return soldA - soldB;
      if (state.shopSort === "price-asc") return a.price - b.price;
      if (state.shopSort === "price-desc") return b.price - a.price;
      if (state.shopSort === "name") return a.name.localeCompare(b.name);
      return FLOWERS.indexOf(a) - FLOWERS.indexOf(b);
    });
    return list;
  }
  function flowerCardsHtml(){
    var list = sortedFlowers();
    if (!list.length) return '<div class="no-results"><strong>No flowers match your search.</strong><p>Try a different word, or clear the filters.</p><button class="btn secondary" onclick="App.clearShopFilters()">Clear filters</button></div>';
    return list.map(function(f){
      var soldOut = stockQty(f) === 0;
      return '<article class="flower-card' + (soldOut ? ' sold-out' : '') + '">' +
        '<button class="flower-open" onclick="App.openDetail(' + f.id + ')" aria-label="View ' + esc(f.name) + '">' +
          '<span class="flower-tag">' + esc(f.tag) + '</span>' +
          '<span class="flower-photo-wrap">' + flowerPhoto(f, "flower-photo", false, false) + '</span>' +
          '<span class="flower-name display">' + esc(f.name) + '</span>' +
        '</button>' +
        '<div class="flower-meta"><div class="flower-price">' + money(f.price) + '<small> / bunch</small></div>' +
          (state.isAdmin ? '' : (soldOut ? '<span class="flower-soldout">Out of stock</span>' :
            '<button class="btn btn-sm" onclick="App.quickAdd(' + f.id + ')" aria-label="Add ' + esc(f.name) + ' to cart">Add to cart</button>')) +
        '</div></article>';
    }).join("");
  }
  function shopCountText(){ return "Showing " + sortedFlowers().length + " of " + FLOWERS.length + " flowers"; }
  function refreshShopGrid(){
    var grid = document.getElementById("flower-grid"), count = document.getElementById("shop-count");
    if (grid) grid.innerHTML = flowerCardsHtml();
    if (count) count.textContent = shopCountText();
  }
  function benefitsStrip(){
    var items = [
      [iconLeaf(), "Freshly arranged", "Stems chosen and arranged for each order"],
      [iconTruck(), "Same-day delivery", "About 2\u20134 hours in Caoayan and nearby"],
      [iconQr(), "GCash or cash", "Scan to pay, verified by the shop"],
      [iconGift(), "Custom bouquets", "Pick your flowers and wrapping"]
    ];
    return '<section class="benefits" aria-label="Why shop with PetalHub">' + items.map(function(it){
      return '<div class="benefit"><span class="benefit-icon">' + it[0] + '</span><div><strong>' + it[1] + '</strong><span>' + it[2] + '</span></div></div>';
    }).join("") + '</section>';
  }
  function shopToolbar(){
    var sorts = [["featured", "Featured"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name A\u2013Z"]];
    return '<div class="shop-toolbar">' +
      '<label class="search-box">' + iconSearch() + '<input id="shop-search" type="search" placeholder="Search flowers\u2026" value="' + esc(state.shopSearch) + '" oninput="App.setSearch(this.value)" aria-label="Search flowers" autocomplete="off"></label>' +
      '<label class="toolbar-field">Sort by <select id="shop-sort" onchange="App.setSort(this.value)">' + sorts.map(function(o){
        return '<option value="' + o[0] + '"' + (state.shopSort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join("") + '</select></label>' +
      '<label class="check-field"><input type="checkbox" id="shop-instock" onchange="App.setInStock(this.checked)"' + (state.shopInStock ? ' checked' : '') + '> In stock only</label>' +
      '<span class="shop-count" id="shop-count">' + shopCountText() + '</span></div>';
  }

  /* ---------- sign in / register layout ---------- */
  function authShell(inner, title, text){
    return '<div class="auth-layout"><aside class="auth-aside" aria-hidden="false"><div class="auth-photos">' +
        flowerPhoto(heroFlower(0), "auth-photo auth-photo-a", true, true) + flowerPhoto(heroFlower(3), "auth-photo auth-photo-b", true, true) + flowerPhoto(heroFlower(6), "auth-photo auth-photo-c", true, true) +
      '</div><div class="auth-aside-copy"><div class="eyebrow">PetalHub</div><h2>' + title + '</h2><p>' + text + '</p>' +
      '<ul class="auth-points"><li>' + iconTick() + 'Track every order in one place</li><li>' + iconTick() + 'Pay with GCash or cash</li><li>' + iconTick() + 'Get notified when your order is ready</li></ul></div></aside>' +
      '<div class="auth-form">' + inner + '</div></div>';
  }
  function screenAuthGate(){
    return authShell(backBtn("Back to cart", "cart") +
      '<div class="panel"><h2>Almost there \u2014 sign in to check out</h2>' +
        '<p class="sub">Sign in or create an account so we can confirm your order and let you track it.</p>' +
        '<div class="choice-row">' +
          '<button class="tap-card" onclick="App.go(\'login\')"><span class="t">Yes, log in</span><span class="d">I already have an account</span></button>' +
          '<button class="tap-card" onclick="App.go(\'register\')"><span class="t">No, register</span><span class="d">Set up a new account</span></button>' +
        '</div></div>', "Your flowers are waiting", "Your cart is saved. Sign in to choose pickup or delivery and pay for your order.");
  }
  function screenRegister(){
    var f = state.registerForm;
    return authShell(backBtn("Back to log in", "login") +
      '<div class="panel"><h2>Create your account</h2><p class="sub">Takes under a minute to get started.</p>' +
        '<form class="stack" onsubmit="return App.submitRegister(event)">' +
          '<div class="field"><label for="reg-name">Full name</label><input id="reg-name" type="text" value="' + esc(f.name) + '" placeholder="Jamie Flores" autocomplete="name"></div>' +
          '<div class="field"><label for="reg-email">Email address</label><input id="reg-email" type="email" value="' + esc(f.email) + '" placeholder="jamie@email.com" autocomplete="email"></div>' +
          '<div class="row2">' +
            '<div class="field"><label for="reg-pass">Password</label><input id="reg-pass" type="password" value="' + esc(f.pass) + '" placeholder="At least 6 characters" autocomplete="new-password"></div>' +
            '<div class="field"><label for="reg-pass2">Confirm password</label><input id="reg-pass2" type="password" value="' + esc(f.pass2) + '" placeholder="Repeat password" autocomplete="new-password"></div>' +
          '</div>' +
          '<button class="btn block" type="submit">Create account</button>' +
        '</form>' +
        '<div class="switch-mode">Already registered? <button onclick="App.go(\'login\')">Log in instead</button></div></div>',
      "Join PetalHub", "Create an account to order flowers, follow your delivery and see your past orders.");
  }
  function screenLogin(){
    var f = state.loginForm;
    return authShell(backBtn(state.cart.length ? "Back to cart" : "Back to browsing", state.cart.length ? "cart" : "home") +
      '<div class="panel"><h2>Welcome back</h2><p class="sub">Log in to continue. Shop admins log in here too, with their admin email.</p>' +
        '<form class="stack" onsubmit="return App.submitLogin(event)">' +
          '<div class="field"><label for="log-email">Email address</label><input id="log-email" type="email" value="' + esc(f.email) + '" placeholder="jamie@email.com" autocomplete="email"></div>' +
          '<div class="field"><label for="log-pass">Password</label><input id="log-pass" type="password" value="' + esc(f.pass) + '" placeholder="Enter your password" autocomplete="current-password"></div>' +
          '<button class="btn block" type="submit">Log in</button>' +
        '</form>' +
        '<div class="switch-mode">New here? <button onclick="App.go(\'register\')">Register an account</button></div></div>',
      "Good to see you again", "Log in to continue your order, check on a delivery or reorder your favourites.");
  }

  /* ---------- checkout: shared layout with an order summary beside every step ---------- */
  function summaryAside(opts){
    opts = opts || {};
    var delivery = state.fulfillment === "delivery";
    var items = state.cart.map(function(l){
      var f = lineThumbFlower(l);
      return '<li class="os-line"><span class="os-thumb">' + (f ? flowerPhoto(f, "os-img", true, false) : '') + '<span class="os-qty">' + l.qty + '</span></span>' +
        '<span class="os-name">' + esc(lineLabel(l)) + '<small>' + esc(lineKind(l)) + '</small></span><span class="os-price">' + money(lineTotal(l)) + '</span></li>';
    }).join("");
    var details = "";
    if (state.fulfillment) details += '<div class="os-detail"><span>' + (delivery ? "Delivery" : "Pickup") + '</span><span>' + esc(delivery ? DELIVERY_SHORT : PICKUP_SHORT) + '</span></div>';
    if (delivery && state.address.street) details += '<div class="os-detail"><span>Deliver to</span><span>' + esc(state.address.street + (state.address.city ? ", " + state.address.city : "")) + '</span></div>';
    if (state.payment) details += '<div class="os-detail"><span>Payment</span><span>' + esc(paymentLabel(state.payment)) + '</span></div>';
    return '<aside class="order-summary" aria-label="Order summary"><h3>Order summary</h3><ul class="os-lines">' + items + '</ul>' +
      '<div class="summary-row"><span>Flowers</span><span>' + money(itemsSubtotal()) + '</span></div>' +
      (wrappingSubtotal() > 0 ? '<div class="summary-row"><span>Wrapping</span><span>' + money(wrappingSubtotal()) + '</span></div>' : '') +
      '<div class="summary-row total"><span>Total</span><span>' + money(cartTotal()) + '</span></div>' +
      (details ? '<div class="os-details">' + details + '</div>' : '') +
      (opts.cta ? '<div class="os-cta">' + opts.cta + '</div>' : '') +
      '<ul class="trust-list"><li>' + iconTick() + 'Arranged fresh to order</li><li>' + iconTick() + 'Same-day delivery in Caoayan &amp; nearby</li><li>' + iconTick() + 'GCash payments verified by the shop</li></ul></aside>';
  }
  function checkoutShell(main, opts){
    return '<div class="checkout-grid"><div class="checkout-main">' + main + '</div>' + summaryAside(opts) + '</div>';
  }

  function screenCart(){
    var ordersBtn = state.authenticated && !state.isAdmin ? '<button class="btn secondary" onclick="App.openOrders()">View My Orders</button>' : '';
    if (state.cart.length === 0){
      return '<div class="empty-state">' + iconEmptyCart() + '<div><strong>Your cart is empty.</strong></div>' +
        '<p class="sub" style="margin-top:8px">' + (state.orderCode ? "Your last order was placed successfully. " : "") + (state.authenticated ? "Orders you have already placed are kept in My Orders." : "Add some flowers to get started.") + '</p>' +
        '<div class="actions-row" style="margin-top:18px;"><button class="btn" onclick="App.go(\'home\')">Back to Browse</button>' + ordersBtn + '</div></div>';
    }
    var lines = state.cart.map(function(l, index){
      var f = flowerById(l.id);
      var firstFlower = f || (l.flowers && flowerById(l.flowers[0].id));
      var wrap = wrapOption(l);
      var lineName = l.arrangementType === "custom" ? "Custom Bouquet" : (f ? f.name : "Flower");
      var arrangement = l.arrangementType === "custom" ? "Custom Bouquet" : (l.arrangementType === "bouquet" ? "Ready-Made Bouquet" : "Single Flower");
      var wrapDetails = l.wrapChoice === "wrapped" && wrap ?
        '<div class="cart-line-wrap">' + wrappingImage(wrap, "cart-wrap-image") + '<span><strong>' + esc(wrap.name) + '</strong>' + wrappingColor(wrap) + '<small>' + esc(wrap.detail) + '</small><small>+' + money(wrap.price) + ' / bouquet</small>' + (l.arrangementType === "custom" ? customWrapNotes(l) : '') + '</span></div>' :
        (l.arrangementType !== "single" ? '<div class="cart-line-wrap">Without wrapping</div>' : '');
      return '' +
        '<div class="cart-line">' +
          '<div class="cart-line-icon">' + (firstFlower ? flowerPhoto(firstFlower, "flower-cart-image", false, false) : '') + '</div>' +
          '<div class="cart-line-info"><div class="cart-line-name">' + esc(lineName) + '</div><div class="cart-line-sub">' + esc(arrangement) + ' · ' + (l.arrangementType === "custom" ? 'Flowers ' + money(flowerSubtotal(l) / l.qty) + ' / bouquet' : money(f ? f.price : 0) + ' base / bunch') + '</div>' +
            (l.arrangementType === "custom" ? '<div class="custom-flower-list">' + customFlowerList(l.flowers, l.qty) + '</div>' : '') +
            wrapDetails + '<button type="button" class="link-btn" onclick="App.removeLine(' + index + ')">Remove</button></div>' +
          '<div class="cart-line-controls">' +
            '<button class="qty-btn" onclick="App.lineQty(' + index + ',-1)" aria-label="Decrease">\u2212</button>' +
            '<span class="qty-val">' + l.qty + '</span>' +
            '<button class="qty-btn" onclick="App.lineQty(' + index + ',1)" aria-label="Increase"' + (canIncreaseLine(l) ? '' : ' disabled title="No more stock available"') + '>+</button>' +
          '</div>' +
          '<div class="cart-line-total">' + money(lineTotal(l)) + '</div>' +
        '</div>';
    }).join("");
    var main = '<div class="panel"><div class="panel-head"><h2>Your cart</h2><span class="sub">' + cartCount() + ' item' + (cartCount() === 1 ? '' : 's') + '</span></div>' +
      '<p class="sub">' + (state.authenticated ? "Signed in as " + esc(state.userName) + ". " : "You will be asked to log in or register when you check out. ") + 'These items have not been ordered yet. Orders you already placed are in My Orders.</p>' + lines + '</div>';
    var cta = '<button class="btn block" onclick="App.proceed()">Proceed to checkout</button><button class="btn secondary block" onclick="App.go(\'home\')">Back to Browse</button>' +
      (ordersBtn ? '<button class="link-btn center" onclick="App.openOrders()">View My Orders</button>' : '');
    return checkoutShell(main, { cta: cta });
  }

  function screenFulfillment(){
    var main = backBtn("Back to cart", "cart") +
      '<div class="panel"><h2>Pickup or delivery?</h2><p class="sub">Choose how you\u2019d like to receive your order.</p>' +
        '<div class="choice-row">' +
          '<button class="tap-card' + (state.fulfillment === "pickup" ? ' selected' : '') + '" onclick="App.choosePickup()">' + iconStore() + '<span class="t">Pick up at store</span><span class="d">' + esc(PICKUP_ESTIMATE) + '</span></button>' +
          '<button class="tap-card' + (state.fulfillment === "delivery" ? ' selected' : '') + '" onclick="App.go(\'delivery\')">' + iconTruck() + '<span class="t">Delivery</span><span class="d">' + esc(DELIVERY_SHORT) + '</span></button>' +
        '</div></div>';
    return checkoutShell(main);
  }

  function screenDelivery(){
    var a = state.address;
    var main = '<button type="button" class="back-link" onclick="App.go(\'fulfillment\')">' + iconBack() + 'Change fulfillment</button>' +
      '<div class="panel"><h2>Delivery address</h2><p class="sub">Where should we send your flowers? ' + esc(DELIVERY_NOTE) + '</p>' +
        '<form class="stack" onsubmit="return App.submitDelivery(event)">' +
          '<div class="field"><label for="d-street">Street address</label><input id="d-street" type="text" value="' + esc(a.street) + '" placeholder="123 Rizal Street"></div>' +
          '<div class="row2">' +
            '<div class="field"><label for="d-city">City / town</label><input id="d-city" type="text" value="' + esc(a.city) + '" placeholder="Caoayan"></div>' +
            '<div class="field"><label for="d-zip">ZIP / postal code</label><input id="d-zip" type="text" value="' + esc(a.zip) + '" placeholder="2703"></div>' +
          '</div>' +
          '<div class="field"><label for="d-phone">Contact phone number <span class="sub">(required for delivery)</span></label><input id="d-phone" type="tel" value="' + esc(a.phone) + '" placeholder="09XX XXX XXXX" autocomplete="tel" required></div>' +
          '<button class="btn block" type="submit">Continue to payment</button>' +
        '</form></div>';
    return checkoutShell(main);
  }

  function screenPayment(){
    var delivery = state.fulfillment === "delivery";
    var opts = [
      { id: "gcash", label: "GCash (scan QR)", desc: "Scan the shop\u2019s GCash QR code, then enter your reference number. Your order is confirmed once the shop verifies the payment.", icon: iconQr(), tag: "Scan & pay" },
      { id: "cash", label: delivery ? "Cash on delivery" : "Cash on pickup", desc: "Pay in cash when you " + (delivery ? "receive" : "pick up") + " your order.", icon: iconCash(), tag: "" }
    ];
    var rows = opts.map(function(o){
      var sel = state.payment === o.id;
      return '<button class="pay-opt' + (sel ? ' selected' : '') + '" onclick="App.choosePayment(\'' + o.id + '\')" aria-pressed="' + sel + '">' +
        o.icon + '<div class="pay-opt-text"><div class="t">' + esc(o.label) + (o.tag ? '<span class="pay-tag">' + esc(o.tag) + '</span>' : '') + '</div><div class="d">' + esc(o.desc) + '</div></div><span class="pay-radio" aria-hidden="true"></span></button>';
    }).join("");
    var main = backBtn(delivery ? "Back to delivery address" : "Back to fulfillment", delivery ? "delivery" : "fulfillment") +
      '<div class="panel"><h2>Choose payment method</h2><p class="sub">Fulfillment: ' + (delivery ? "Delivery to " + esc(state.address.street || "your address") : "Pickup at store") + '</p>' +
        '<div class="payment-list">' + rows + '</div></div>';
    return checkoutShell(main, { cta: '<button class="btn block" ' + (state.payment ? '' : 'disabled') + ' onclick="App.go(\'confirm\')">Review order</button>' });
  }

  function screenConfirm(){
    var delivery = state.fulfillment === "delivery", gcash = state.payment === "gcash";
    var row = function(label, value){ return '<div class="confirm-item"><span class="label">' + label + '</span><span>' + value + '</span></div>'; };
    var lines = state.cart.map(function(l){
      var wrap = wrapOption(l);
      return '<div class="confirm-item"><span>' + esc(lineLabel(l)) + ' \u00d7 ' + l.qty + '<small class="confirm-option">' + esc(lineKind(l)) + (l.arrangementType === "custom" ? ' \u00b7 ' + customFlowerList(l.flowers, l.qty) : '') +
        (l.wrapChoice === "wrapped" && wrap ? ' \u00b7 ' + esc(wrap.name) + ' wrapping' : '') + '</small></span><span>' + money(lineTotal(l)) + '</span></div>';
    }).join("");
    var main = backBtn("Back to payment", "payment") +
      '<div class="panel"><h2>Review your order</h2><p class="sub">' + (gcash ? 'Double-check everything. Next you will scan the GCash QR code and submit your payment for verification.' : 'Double-check everything. Your order is only placed when you press Place order.') + '</p>' +
        '<div class="confirm-list">' + lines + '<div class="summary-row total"><span>Total</span><span>' + money(cartTotal()) + '</span></div></div>' +
        '<div class="confirm-list confirm-details">' +
          row("Fulfillment", delivery ? "Delivery" : "Pickup at store") +
          (delivery ? row("Address", esc([state.address.street, state.address.city, state.address.zip].filter(Boolean).join(", "))) : "") +
          (delivery ? row("Contact phone", esc(state.address.phone)) : "") +
          row("Estimated time", esc(delivery ? DELIVERY_SHORT : PICKUP_ESTIMATE)) +
          row("Payment", esc(paymentLabel(state.payment))) +
          row("Account", esc(state.userName || "Guest")) +
        '</div></div>';
    var cta = '<button class="btn block" ' + (state.placing ? 'disabled' : '') + ' onclick="App.confirmOrder()">' + (state.placing ? "Placing order\u2026" : (gcash ? "Continue to GCash payment" : "Place order")) + '</button>' +
      '<button type="button" class="link-btn center" onclick="App.go(\'cart\')">Edit cart</button>';
    return checkoutShell(main, { cta: cta });
  }

  function proofBlock(){
    if (state.gcashProof){
      return '<div class="proof-preview"><img src="' + esc(state.gcashProof) + '" alt="Your receipt screenshot"><div><strong>' + esc(state.gcashProofName || "Receipt screenshot") + '</strong><span>Attached</span>' +
        '<button type="button" class="link-btn" onclick="App.removeProof()">Remove</button></div></div>';
    }
    return '<label class="file-drop"><input type="file" accept="image/png,image/jpeg,image/webp" onchange="App.pickProof(this)"><span>' + iconQr() + 'Choose a screenshot of your GCash receipt</span></label>';
  }
  function gcashRefHint(){
    var n = state.gcashRef.replace(/\D/g, "").length;
    return n === 13 ? '<span class="ok">13 digits \u2014 looks good</span>' : '<span>' + n + ' of 13 digits</span>';
  }
  function screenGcash(){
    var info = state.payInfo, total = cartTotal();
    var qr = info && info.hasQr ? '<img class="qr-img" src="' + esc(info.qr) + '" alt="GCash QR code of ' + esc(info.name) + '">' :
      '<div class="qr-missing">The shop has not uploaded its GCash QR code yet. Please go back and choose cash instead.</div>';
    var main = backBtn("Back to review", "confirm") +
      '<div class="panel gcash-panel"><div class="panel-head"><h2>Pay with GCash</h2><span class="secure-pill">' + iconTick() + 'Verified by the shop</span></div>' +
        '<p class="sub">Scan the QR code with your GCash app, pay the exact amount, then send us the reference number.</p>' +
        '<div class="gcash-grid">' +
          '<div class="qr-card"><div class="qr-card-head"><span class="gcash-logo">GCash</span><span>Scan to pay</span></div>' + qr +
            '<div class="qr-account"><strong>' + esc(info ? info.name : "") + '</strong>' + (info && info.number ? '<span>' + esc(info.number) + ' <button type="button" class="link-btn" onclick="App.copyGcashNumber()">Copy</button></span>' : '') + '</div>' +
            '<div class="qr-amount"><span>Amount to pay</span><strong>' + money(total) + '</strong><small>The QR code does not fill in the amount. Type exactly ' + money(total) + ' in GCash.</small></div></div>' +
          '<div class="gcash-form">' +
            '<ol class="pay-steps"><li>Open the <strong>GCash</strong> app and tap <strong>Scan QR</strong>.</li><li>Scan the QR code and send exactly <strong>' + money(total) + '</strong>.</li>' +
              '<li>Copy the <strong>13-digit reference number</strong> from your GCash receipt.</li><li>Enter it below. The shop verifies the payment before your order is confirmed.</li></ol>' +
            '<div class="field"><label for="gcash-ref">GCash reference number</label><input id="gcash-ref" type="text" inputmode="numeric" autocomplete="off" maxlength="20" placeholder="e.g. 1234 567 890 123" value="' + esc(state.gcashRef) + '" oninput="App.setGcashRef(this.value)"><div class="hint-line" id="gcash-ref-hint">' + gcashRefHint() + '</div></div>' +
            '<div class="field"><label>Receipt screenshot <span class="sub">(optional, helps the shop verify faster)</span></label>' + proofBlock() + '</div>' +
            '<button class="btn block" ' + (state.placing || !(info && info.hasQr) ? 'disabled' : '') + ' onclick="App.submitGcash()">' + (state.placing ? "Submitting\u2026" : "I\u2019ve paid \u2014 submit for verification") + '</button>' +
            '<p class="fine-print">Your order is saved as <strong>awaiting payment verification</strong>. You will get a notification as soon as the shop confirms your payment. Please keep your GCash receipt.</p>' +
          '</div>' +
        '</div></div>';
    return checkoutShell(main);
  }

  /* ---------- order progress and payment badges (customer + admin) ---------- */
  function payBadge(o){
    if (o.payment === "GCash (QR)"){
      var m = { awaiting: ["Awaiting verification", "pay-awaiting"], verified: ["Payment verified", "pay-verified"], rejected: ["Payment rejected", "pay-rejected"] }[o.paymentStatus] || ["GCash", "pay-awaiting"];
      return '<span class="pay-pill ' + m[1] + '">GCash \u00b7 ' + m[0] + '</span>';
    }
    return '<span class="pay-pill pay-cash">' + esc(o.payment) + '</span>';
  }
  function orderProgress(o){
    if (o.status === "Cancelled") return '<div class="progress-cancelled">This order was cancelled.' + (o.paymentNote ? ' ' + esc(endSentence(o.paymentNote)) : '') + '</div>';
    var gcash = o.payment === "GCash (QR)", delivery = o.fulfillment === "delivery";
    var steps = gcash ? ["Order placed", "Payment verified", "Preparing", delivery ? "Out for delivery" : "Ready for pickup", "Completed"] :
      ["Order placed", "Preparing", delivery ? "Out for delivery" : "Ready for pickup", "Completed"];
    var done = gcash ? { Pending: o.paymentStatus === "verified" ? 2 : 1, Preparing: 2, Ready: 4, Completed: 5 }[o.status] : { Pending: 1, Preparing: 1, Ready: 3, Completed: 4 }[o.status];
    if (typeof done !== "number") done = 1;
    return '<ol class="progress" aria-label="Order progress">' + steps.map(function(label, i){
      return '<li class="' + (i < done ? 'done' : (i === done ? 'current' : '')) + '"><span class="dot">' + (i < done ? iconTick() : '') + '</span><span class="lbl">' + esc(label) + '</span></li>';
    }).join("") + '</ol>';
  }

  function currentOrder(){
    var list = state.myOrders || [];
    return list.filter(function(o){ return o.code === state.orderCode; })[0] || state.savedOrder || null;
  }
  function screenDone(){
    var o = currentOrder();
    var gcash = state.lastPaymentMethod === "gcash" || (!!o && o.payment === "GCash (QR)");
    var pay = o ? o.paymentStatus : (gcash ? "awaiting" : "not_required");
    var icon = iconCheck(), title = "Order confirmed", text = "A confirmation has been sent for your order. Thank you for choosing PetalHub.";
    if (gcash && pay === "awaiting"){ icon = '<span class="done-clock">' + iconClock() + '</span>'; title = "Payment submitted"; text = "We received your GCash reference number. The shop is verifying your payment now, and your order is confirmed as soon as it is verified. You\u2019ll get a notification right here."; }
    else if (gcash && pay === "verified"){ title = "Payment verified"; text = "The shop verified your GCash payment. Your order is confirmed and will be prepared now."; }
    else if (gcash && pay === "rejected"){ icon = '<span class="done-clock bad">' + iconClock() + '</span>'; title = "Payment not verified"; text = endSentence(o && o.paymentNote ? o.paymentNote : "The shop could not verify your GCash payment") + " Your order was cancelled. You can place the order again."; }
    var detail = o ? '<div class="done-detail"><h3>Order details</h3>' + orderProgress(o) + orderLinesHtml(o) + '<div class="order-total"><span>Total</span><strong>' + money(o.total) + '</strong></div>' +
      (gcash && o.gcashRef ? '<p class="sub">GCash reference: <strong>' + esc(o.gcashRef) + '</strong></p>' : '') + '</div>' :
      (state.lastOrder ? '<div class="done-detail"><h3>Order details</h3><div class="confirm-list">' + state.lastOrder.items.map(function(i){
        return '<div class="confirm-item"><span>' + esc(i.name) + ' \u00d7 ' + i.qty + '</span><span>' + money(i.price * i.qty) + '</span></div>'; }).join("") +
        '<div class="summary-row total"><span>Total</span><span>' + money(state.lastOrder.total) + '</span></div></div></div>' : '');
    return '<div class="done-grid"><div class="done-wrap"><div class="done-mark">' + icon + '</div><h2>' + esc(title) + '</h2>' +
      '<p class="done-text">' + esc(text) + '</p><div class="order-code">' + esc(state.orderCode) + '</div>' +
      (pay === "rejected" ? '' : '<p class="done-eta">' + esc(state.lastFulfillment === "delivery" ? DELIVERY_NOTE : PICKUP_ESTIMATE + ".") + '</p>') +
      '<div class="actions-row"><button class="btn" onclick="App.newOrder()">Back to Browse</button><button class="btn secondary" onclick="App.openOrders()">View My Orders</button></div></div>' + detail + '</div>';
  }

  function screenOrders(){
    var allOrders = state.myOrders || [];
    var filters = [{ id: "ongoing", label: "Ongoing" }, { id: "completed", label: "Completed" }, { id: "cancelled", label: "Cancelled" }];
    var filterButtons = filters.map(function(filter){
      var count = allOrders.filter(function(order){ return orderCategory(order) === filter.id; }).length;
      return '<button class="' + (state.customerOrderFilter === filter.id ? 'btn' : 'logout-btn') + '" onclick="App.setCustomerOrderFilter(\'' + filter.id + '\')">' + filter.label + ' (' + count + ')</button>';
    }).join("");
    var list = allOrders.filter(function(order){ return orderCategory(order) === state.customerOrderFilter; });
    var body = list.length ? '<div class="orders-grid">' + list.map(function(o){
      return '<div class="admin-card order-card"><div class="row"><strong>' + esc(o.code) + '</strong>' + statusBadge(o.status) + '</div>' +
        '<p class="sub" style="margin-bottom:8px">' + esc(new Date(o.date).toLocaleString()) + ' ' + payBadge(o) + '</p>' + orderProgress(o) + orderLinesHtml(o) +
        '<div class="order-total"><span>Total</span><strong>' + money(o.total) + '</strong></div>' +
        (o.payment === "GCash (QR)" && o.paymentStatus === "awaiting" ? '<p class="pay-note awaiting">' + iconClock() + 'The shop is verifying your GCash payment (ref. ' + esc(o.gcashRef || "") + '). Your order is confirmed once it is verified.</p>' : '') +
        (o.payment === "GCash (QR)" && o.paymentStatus === "rejected" ? '<p class="pay-note rejected">' + esc(o.paymentNote || "The shop could not verify this payment.") + '</p>' : '') +
        '<p class="sub" style="margin-bottom:0">' + (o.fulfillment === "delivery" ? "Delivery to " + esc([o.address.street, o.address.city, o.address.zip].filter(Boolean).join(", ")) + ' \u00b7 Contact: ' + esc(o.customerPhone || "Not provided") : "Pickup at store") + '</p>' +
        (o.fulfillment === "delivery" ? '<div class="customer-rider-details"><strong>Delivery rider</strong><span>' + (o.riderName ? esc(o.riderName) + ' \u00b7 <a href="tel:' + esc(o.riderPhone) + '">' + esc(o.riderPhone) + '</a>' : 'Not assigned yet') + '</span></div>' : '') + '</div>';
    }).join("") + '</div>' : '<p class="sub">' + (allOrders.length ? 'No ' + state.customerOrderFilter + ' orders.' : 'You have no orders yet.') + '</p>';
    return backBtn("Back to browse", "home") + '<div class="panel"><div class="panel-head"><h2>My orders</h2></div><p class="sub">Orders you have already placed. These are separate from your cart, so you will not be charged twice.</p>' +
      '<div class="order-filter-tabs" role="group" aria-label="Filter orders">' + filterButtons + '</div>' + body +
      '<div class="admin-actions"><button class="btn" onclick="App.go(\'home\')">Back to Browse</button><button class="btn secondary" onclick="App.go(\'cart\')">Go to cart (' + cartCount() + ')</button></div></div>';
  }

  // An order is flagged when another order from the same customer has the same items and total within 30 minutes.
  function dupOf(o){
    if (o.status === "Cancelled") return null;
    var sig = function(x){
      return x.items.map(function(i){
        return [i.name, i.qty, i.lineName || "", i.arrangement || "single", i.wrapDesign || "", i.wrapColor || "", i.wrapNotes || "", i.wrapFee || 0].join(":");
      }).sort().join("|") + "|" + x.total + "|" + x.fulfillment;
    };
    var mine = sig(o);
    var hit = db.orders.filter(function(p){
      return p.code !== o.code && p.status !== "Cancelled" && p.email === o.email && sig(p) === mine &&
        Math.abs(new Date(p.date) - new Date(o.date)) <= 30 * 60000 && (new Date(p.date) < new Date(o.date) || (+new Date(p.date) === +new Date(o.date) && p.code < o.code));
    })[0];
    return hit ? hit.code : null;
  }
  /* ---------- admin dashboard pieces ---------- */
  function adminStats(){
    var today = new Date().toDateString();
    var todayCount = db.orders.filter(function(o){ return new Date(o.date).toDateString() === today; }).length;
    var pending = db.orders.filter(function(o){ return o.status === "Pending"; }).length;
    var verify = db.orders.filter(function(o){ return o.paymentStatus === "awaiting" && o.status !== "Cancelled"; }).length;
    var low = db.products.filter(function(p){ return stockQty(p) === 0 || (typeof p.qty === "number" && p.qty <= 5); }).length;
    var cards = [
      ["Orders today", todayCount, "placed since midnight", ""],
      ["Pending orders", pending, "waiting to be prepared", pending ? "warn" : ""],
      ["GCash to verify", verify, verify ? "check your GCash transactions" : "nothing waiting", verify ? "alert" : ""],
      ["Low or out of stock", low, "flowers at 5 or fewer", low ? "warn" : ""]
    ];
    return '<div class="stat-grid">' + cards.map(function(c){
      return '<div class="stat-card ' + c[3] + '"><span class="stat-label">' + c[0] + '</span><strong class="stat-value">' + c[1] + '</strong><span class="stat-hint">' + c[2] + '</span></div>';
    }).join("") + '</div>';
  }
  function adminPayBlock(o){
    if (o.payment !== "GCash (QR)") return "";
    var awaiting = o.paymentStatus === "awaiting" && o.status !== "Cancelled", code = esc(o.code);
    return '<div class="admin-pay ' + esc(o.paymentStatus) + '"><div class="admin-pay-head"><strong>GCash payment</strong>' + payBadge(o) + '</div>' +
      '<div class="admin-pay-grid"><span>Reference no.</span><strong class="mono">' + esc(o.gcashRef || "\u2014") + '</strong>' +
      '<span>Amount to match</span><strong>' + money(o.total) + '</strong>' +
      (o.paidAt ? '<span>Verified on</span><strong>' + esc(new Date(o.paidAt).toLocaleString()) + '</strong>' : '') + '</div>' +
      (o.hasProof ? '<button type="button" class="logout-btn" onclick="App.viewProof(\'' + code + '\')">View receipt screenshot</button>' : '<p class="sub" style="margin:0">No receipt screenshot was uploaded.</p>') +
      (awaiting ? '<p class="sub" style="margin:8px 0 0">Open your GCash transactions and look for this reference number and amount. Then verify or reject the payment.</p>' +
        '<label class="pay-note-field">Note to customer (optional)<input id="pay-note-' + code + '" type="text" maxlength="200" placeholder="e.g. The amount did not match"></label>' +
        '<div class="admin-actions"><button class="btn" onclick="App.verifyPayment(\'' + code + '\')">Verify payment</button><button class="logout-btn product-delete-btn" onclick="App.rejectPayment(\'' + code + '\')">Reject payment</button></div>' : '') +
      (o.paymentNote && o.paymentStatus !== "awaiting" ? '<p class="sub" style="margin:8px 0 0">Note: ' + esc(o.paymentNote) + '</p>' : '') +
      (o.status === "Cancelled" && o.paymentStatus === "verified" ? '<p class="dup-flag">This order was cancelled after its payment was verified. Refund the customer through GCash.</p>' : '') + '</div>';
  }
  function adminOrdersBody(){
    var verifyCount = db.orders.filter(function(o){ return o.paymentStatus === "awaiting" && o.status !== "Cancelled"; }).length;
    var orderFilters = [
      { id: "verify", label: "Verify payment", count: verifyCount },
      { id: "ongoing", label: "Ongoing", count: db.orders.filter(function(o){ return orderCategory(o) === "ongoing"; }).length },
      { id: "completed", label: "Completed", count: db.orders.filter(function(o){ return orderCategory(o) === "completed"; }).length },
      { id: "cancelled", label: "Cancelled", count: db.orders.filter(function(o){ return orderCategory(o) === "cancelled"; }).length }
    ];
    var orderFilterButtons = orderFilters.map(function(filter){
      return '<button class="' + (state.adminOrderFilter === filter.id ? 'btn' : 'logout-btn') + (filter.id === "verify" && filter.count ? ' attention' : '') + '" onclick="App.setAdminOrderFilter(\'' + filter.id + '\')">' + filter.label + ' (' + filter.count + ')</button>';
    }).join("");
    var filteredOrders = db.orders.filter(function(order){
      return state.adminOrderFilter === "verify" ? (order.paymentStatus === "awaiting" && order.status !== "Cancelled") : orderCategory(order) === state.adminOrderFilter;
    });
    var cards = filteredOrders.map(function(o){
      var idx = STATUS_FLOW.indexOf(o.status), next = idx >= 0 ? STATUS_FLOW[idx + 1] : null;
      var awaiting = o.paymentStatus === "awaiting" && o.status !== "Cancelled";
      var readyNeedsRider = next === "Ready" && o.fulfillment === "delivery" && !o.riderId;
      var riderOptions = '<option value="">Not assigned</option>' + db.riders.map(function(rider){
        return '<option value="' + rider.id + '"' + (Number(o.riderId) === Number(rider.id) ? ' selected' : '') + '>' + esc(rider.name) + ' \u00b7 ' + esc(rider.phone) + '</option>';
      }).join("");
      return '<div class="admin-card order-card' + (awaiting ? ' needs-payment' : '') + '"><div class="row"><strong>' + esc(o.code) + '</strong><span class="admin-badges">' + payBadge(o) + '<span class="admin-status">' + esc(o.status) + '</span></span></div>' +
        '<p class="sub">' + esc(new Date(o.date).toLocaleString()) + ' \u2014 ' + esc(o.customer) + ' (' + esc(o.email) + ')</p>' +
        orderLinesHtml(o) + '<div class="order-total"><span>Total</span><strong>' + money(o.total) + '</strong></div>' + adminPayBlock(o) +
        (dupOf(o) ? '<p class="dup-flag">\u26a0 Possible duplicate of ' + esc(dupOf(o)) + ' (same customer, items and total within 30 minutes). Cancel this one if the customer only ordered once \u2014 stock is returned automatically.</p>' : '') +
        (o.fulfillment === "delivery" ?
          '<div class="admin-delivery-address"><strong>Delivery address</strong><span>' + esc([o.address.street, o.address.city, o.address.zip].filter(Boolean).join(", ") || "No address provided") + '</span>' +
          '<strong>Customer phone</strong><span>' + (o.customerPhone ? '<a href="tel:' + esc(o.customerPhone) + '">' + esc(o.customerPhone) + '</a>' : 'No phone provided') + '</span>' +
          '<label class="rider-assignment">Delivery rider<select id="rider-select-' + esc(o.code) + '">' + riderOptions + '</select></label><button class="btn" onclick="App.assignRider(\'' + esc(o.code) + '\')">Save rider assignment</button>' +
          (o.riderName ? '<span class="sub">Assigned: ' + esc(o.riderName) + ' \u00b7 ' + esc(o.riderPhone) + '</span>' : '') + '</div>' :
          '<p class="sub">Pickup at store</p>') +
        (o.payment !== "GCash (QR)" ? '<p class="sub admin-order-payment">Payment: ' + esc(o.payment) + '</p>' : '') +
        (readyNeedsRider ? '<p class="sub">Assign a rider before marking this delivery Ready.</p>' : '') +
        (awaiting ? '<p class="sub">Verify the GCash payment above before this order can move forward.</p>' : '') +
        (next ? '<div class="admin-actions"><button class="btn" ' + (readyNeedsRider || awaiting ? 'disabled title="' + (awaiting ? 'Verify the GCash payment first' : 'Assign a rider first') + '"' : '') + ' onclick="App.setStatus(\'' + o.code + '\',\'' + next + '\')">Mark ' + next + '</button><button class="logout-btn" onclick="App.cancelOrder(\'' + o.code + '\')">Cancel order</button></div>' : '') + '</div>';
    }).join("");
    return '<div class="order-filter-tabs" role="group" aria-label="Filter orders">' + orderFilterButtons + '</div>' +
      (filteredOrders.length ? '<div class="admin-grid">' + cards + '</div>' :
        '<p class="sub">' + (state.adminOrderFilter === "verify" ? 'No GCash payments are waiting for verification.' : (db.orders.length ? 'No ' + state.adminOrderFilter + ' orders.' : 'No orders yet.')) + '</p>');
  }
  function adminPaymentsBody(){
    var info = state.payInfo || { name: "", number: "", qr: "", hasQr: false };
    var sample = /payments\/gcash-qr\.png/.test(info.qr || "");
    return '<div class="admin-grid">' +
      '<div class="admin-card"><h3>GCash QR code</h3><p class="sub">Customers scan this QR code at checkout. Upload the QR code from your own GCash app (GCash \u2192 QR \u2192 save to your photos).</p>' +
        '<div class="qr-admin"><div class="qr-admin-img">' + (state.qrDraft ? '<img src="' + esc(state.qrDraft) + '" alt="Preview of the new QR code">' : (info.hasQr ? '<img src="' + esc(info.qr) + '" alt="Current GCash QR code">' : '<span class="sub">No QR code yet</span>')) + '</div>' +
        '<div class="qr-admin-side"><label class="file-drop small"><input type="file" accept="image/png,image/jpeg,image/webp" onchange="App.pickQr(this)"><span>' + iconQr() + 'Choose a QR image</span></label>' +
          (state.qrDraft ? '<div class="admin-actions"><button class="btn" onclick="App.saveQr()">Use this QR code</button><button class="logout-btn" onclick="App.cancelQr()">Cancel</button></div><p class="sub">This is only a preview. Customers see it after you press Use this QR code.</p>' : '') +
          (sample && !state.qrDraft ? '<p class="dup-flag">You are still using the sample QR code. Upload your real GCash QR code before customers pay.</p>' : '') + '</div></div></div>' +
      '<div class="admin-card"><h3>Account shown to customers</h3><p class="sub">Shown beside the QR code so customers can check they are paying the right account.</p>' +
        '<div class="product-create-form single"><label>Account name<input id="gcash-name" type="text" maxlength="100" value="' + esc(info.name) + '"></label>' +
        '<label>GCash mobile number<input id="gcash-number" type="tel" maxlength="30" placeholder="0917 123 4567" value="' + esc(info.number) + '"></label>' +
        '<button class="btn" onclick="App.saveGcashSettings()">Save account details</button></div></div>' +
      '<div class="admin-card"><h3>How payment verification works</h3><ol class="pay-steps compact"><li>The customer scans your QR code, pays, and submits the 13-digit GCash reference number (and optionally a screenshot).</li>' +
        '<li>The order appears under <strong>Orders \u2192 Verify payment</strong> and cannot move forward yet.</li><li>You check your GCash transactions for that reference number and amount, then press <strong>Verify payment</strong>.</li>' +
        '<li>The customer is notified and the order is confirmed. If the payment is wrong, press <strong>Reject payment</strong>: the order is cancelled and the stock is returned.</li></ol></div></div>';
  }
  function openLightbox(url, caption){
    var old = document.getElementById("lightbox"); if (old) old.remove();
    var box = document.createElement("div");
    box.id = "lightbox"; box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", caption);
    box.innerHTML = '<figure><img alt="' + esc(caption) + '" src="' + url + '"><figcaption>' + esc(caption) + '</figcaption><button type="button" class="btn secondary" id="lightbox-close">Close</button></figure>';
    function close(){ box.remove(); URL.revokeObjectURL(url); document.removeEventListener("keydown", onKey); }
    function onKey(e){ if (e.key === "Escape") close(); }
    box.addEventListener("click", function(e){ if (e.target === box) close(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(box);
    document.getElementById("lightbox-close").addEventListener("click", close);
    document.getElementById("lightbox-close").focus();
  }
  // Re-encode a picked image in the browser (smaller upload, strips camera metadata). Resolves to a data URL.
  function shrinkImage(file, maxSide, mime, quality){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onerror = function(){ reject(new Error("That image could not be read.")); };
      reader.onload = function(){
        var img = new Image();
        img.onerror = function(){ reject(new Error("That file is not a valid image.")); };
        img.onload = function(){
          var scale = Math.min(1, maxSide / Math.max(img.width, img.height)), w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          var canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
          var ctx = canvas.getContext("2d");
          if (mime === "image/jpeg"){ ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
          ctx.drawImage(img, 0, 0, w, h);
          var q = quality || 0.82, out = canvas.toDataURL(mime, q);
          while (mime === "image/jpeg" && out.length > 1500000 && q > 0.4){ q -= 0.1; out = canvas.toDataURL(mime, q); }
          resolve(out);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function apiBlob(url){
    var headers = {}; if (TOKEN){ headers.Authorization = "Bearer " + TOKEN; headers["X-Auth-Token"] = TOKEN; }
    return fetch(apiUrl(url), { headers: headers }).then(function(r){
      if (r.ok) return r.blob();
      return r.json().catch(function(){ return {}; }).then(function(j){ throw new Error(j.error || "The file could not be opened."); });
    }, function(){ throw new Error(SERVER_DOWN); });
  }
  function loadPaymentInfo(){ return api("GET", "/api/payment-info").then(function(info){ state.payInfo = info; return info; }); }

  function screenAdmin(){
    var tab = state.adminTab;
    var help = {
      orders: "Review new orders, verify GCash payments, and move each order forward (Pending \u2192 Preparing \u2192 Ready \u2192 Completed). Cancelling returns the stems to stock.",
      products: "Set the price, quantity and In stock / Out of stock status of each flower. Customers see exactly what you set here.",
      merchandising: "Choose the weather recommendations shown in the shop and manage flowers featured for each event.",
      customers: "See registered customers and how many orders each has placed.",
      riders: "Add delivery riders, or remove riders who should no longer be available for new delivery assignments.",
      payments: "Set up the GCash QR code customers scan at checkout, and see how payment verification works."
    }[tab];
    var attention = db.orders.filter(function(order){ return order.status === "Pending" || (order.paymentStatus === "awaiting" && order.status !== "Cancelled"); }).length;
    var tabs = [["orders", "Orders"], ["products", "Products"], ["merchandising", "Weather & Events"], ["customers", "Customers"], ["riders", "Riders"], ["payments", "Payments"]];
    var nav = '<nav class="admin-side" aria-label="Dashboard sections">' + tabs.map(function(t){
      var badge = t[0] === "orders" ? '<span class="pending-order-count admin-order-count" ' + (attention ? '' : 'hidden') + '>' + (attention > 99 ? "99+" : attention) + '</span>' : '';
      return '<button class="admin-tab' + (t[0] === tab ? ' active' : '') + '" onclick="App.setTab(\'' + t[0] + '\')">' + t[1] + badge + '</button>';
    }).join("") + '</nav>';
    var body = "";
    if (tab === "orders"){
      body = adminOrdersBody();
    } else if (tab === "products"){
      var productCreateForm = '<div class="admin-card product-create-card"><strong>Add a flower</strong><p class="sub">Use an image file saved in the flowers folder, for example flowers/rose.jpg. New flowers start with 0 stock; set the quantity below after adding.</p>' +
        '<div class="product-create-form"><label>Flower name<input id="new-product-name" type="text" maxlength="80" autocomplete="off"></label>' +
        '<label>Image location<input id="new-product-image" type="text" placeholder="flowers/flower.jpg" autocomplete="off"></label>' +
        '<label>Price ' + CURRENCY + '<input id="new-product-price" type="number" min="0" max="100000" step="0.01"></label>' +
        '<button class="btn" onclick="App.addProduct()">Add flower</button></div></div>';
      body = productCreateForm + '<div class="admin-grid">' + db.products.map(function(p){
        var f = { id: p.id, name: p.name, price: p.price, qty: p.qty, available: p.available, stock: p.stock }, look = flowerById(p.id);
        var on = stockQty(f) > 0;
        return '<div class="admin-card"><div class="row"><span class="admin-prod">' + (look ? flowerPhoto(look, "admin-thumb", true, false) : '') + '<strong>' + esc(f.name) + '</strong></span><span class="stock-state ' + (on ? 'in' : 'out') + '">' + (on ? 'In stock \u00b7 ' + esc(f.stock) : 'Out of stock') + '</span></div>' +
          '<div class="admin-actions"><label>Price ' + CURRENCY + ' <input id="p-price-' + f.id + '" type="number" min="0" step="0.01" value="' + f.price + '"></label>' +
          '<label>Qty <input id="p-qty-' + f.id + '" type="number" min="0" step="1" value="' + (typeof f.qty === "number" ? f.qty : 0) + '"></label>' +
          '<label>Status <select id="p-avail-' + f.id + '"><option value="1"' + (f.available !== false ? ' selected' : '') + '>In stock</option><option value="0"' + (f.available === false ? ' selected' : '') + '>Out of stock</option></select></label>' +
          '<button class="btn" onclick="App.saveProduct(' + f.id + ')">Save</button><button class="logout-btn product-delete-btn" onclick="App.deleteProduct(' + f.id + ')">Delete</button></div>' +
          (f.available !== false && f.qty === 0 ? '<p class="sub" style="margin:8px 0 0">Quantity is 0, so customers see this flower as Out of stock.</p>' : '') + '</div>';
      }).join("") + '</div>';
    } else if (tab === "merchandising"){
      var merchandising = state.merchandising;
      var weatherOptions = '<option value=""' + (!merchandising.weather ? ' selected' : '') + '>No weather picks</option>' +
        WEATHER_PRESETS.map(function(weather){
          return '<option value="' + weather.id + '"' + (merchandising.weather === weather.id ? ' selected' : '') + '>' + esc(weather.label) + '</option>';
        }).join("");
      var weatherFlowersBody = WEATHER_PRESETS.map(function(weather){
        var selectedFlowers = merchandising.weatherFlowers[weather.id] || weather.recommendedFlowerIds;
          return '<div class="admin-card recommendation-panel weather-' + esc(weather.id) + '"><div class="row"><strong>' + esc(weather.label) + ' flowers</strong></div><div class="flower-choice-grid">' +
          db.products.map(function(product){
            return '<label><input type="checkbox" name="weather-flower-' + weather.id + '" value="' + product.id + '"' + (selectedFlowers.indexOf(product.id) >= 0 ? ' checked' : '') + '> ' + esc(product.name) + '</label>';
          }).join("") + '</div><div class="admin-actions"><button class="btn" onclick="App.saveWeatherFlowers(\'' + weather.id + '\')">Save ' + esc(weather.label) + ' flowers</button></div></div>';
      }).join("");
      var eventsBody = OCCASIONS.slice().sort(function(a, b){
        return a.startMonth - b.startMonth || a.startDay - b.startDay;
      }).map(function(event){
        var chosen = merchandising.eventFlowers[event.id] || event.recommendedFlowerIds;
        var dateText = event.startMonth === event.endMonth && event.startDay === event.endDay ?
          event.startMonth + "/" + event.startDay : event.startMonth + "/" + event.startDay + "–" + event.endMonth + "/" + event.endDay;
        return '<div class="admin-card recommendation-panel event-panel event-' + esc(event.id) + '"><div class="row"><strong>' + esc(event.name) + '</strong><span class="sub">' + esc(dateText) + '</span></div>' +
          '<p class="sub">' + esc(event.message) + '</p><div class="flower-choice-grid">' +
          db.products.map(function(product){
            return '<label><input type="checkbox" name="event-flower-' + event.id + '" value="' + product.id + '"' + (chosen.indexOf(product.id) >= 0 ? ' checked' : '') + '> ' + esc(product.name) + '</label>';
          }).join("") +
          '</div><div class="admin-actions"><button class="btn" onclick="App.saveEventFlowers(\'' + event.id + '\')">Save event flowers</button></div></div>';
      }).join("");
      body = '<div class="admin-card"><div class="row"><strong>Weather picks</strong></div><div class="admin-actions"><label>Storefront weather <select id="weather-choice">' + weatherOptions + '</select></label><button class="btn" onclick="App.saveWeather()">Save weather setting</button></div></div>' +
        '<h3>Weather flowers</h3><p class="sub">Choose which flowers customers see for each weather recommendation.</p>' + weatherFlowersBody +
        '<h3>Events</h3><p class="sub">Events appear automatically during their date ranges: Valentine’s Day February 11–15, Mother’s Day May 1–14, Halloween October 25–November 2, Christmas December 22–26, and New Year December 28–January 1.</p>' + eventsBody;
    } else if (tab === "riders"){
      var riderForm = '<div class="admin-card"><strong>Add a delivery rider</strong><p class="sub">Add a rider’s name and phone number so they can be assigned to delivery orders.</p>' +
        '<div class="product-create-form"><label>Rider name<input id="new-rider-name" type="text" maxlength="80" autocomplete="name"></label>' +
        '<label>Phone number<input id="new-rider-phone" type="tel" maxlength="30" autocomplete="tel"></label>' +
        '<button class="btn" onclick="App.addRider()">Add rider</button></div></div>';
      body = riderForm + (db.riders.length ? '<div class="admin-grid">' + db.riders.map(function(rider){
        var assignedOrder = db.orders.filter(function(order){
          return Number(order.riderId) === Number(rider.id) && order.fulfillment === "delivery" && orderCategory(order) === "ongoing";
        })[0];
        var availability = assignedOrder ? "Unavailable" : "Available";
        return '<div class="admin-card"><div class="row"><div><strong>' + esc(rider.name) + '</strong><p class="sub">' + esc(rider.phone) + '</p>' +
          (assignedOrder ? '<p class="sub">Assigned to ' + esc(assignedOrder.code) + '</p>' : '') + '</div>' +
          '<span class="stock-state ' + (assignedOrder ? 'out' : 'in') + '">' + availability + '</span>' +
          '<button class="logout-btn product-delete-btn" onclick="App.deleteRider(' + rider.id + ')">Delete</button></div></div>';
      }).join("") + '</div>' : '<p class="sub">No riders added yet.</p>');
    } else if (tab === "payments"){
      body = adminPaymentsBody();
    } else {
      var cs = db.users.filter(function(u){ return u.role !== "admin"; });
      body = cs.length ? '<div class="admin-grid">' + cs.map(function(u, ci){
        var n = db.orders.filter(function(o){ return o.email === u.email; }).length;
        return '<div class="admin-card"><div class="row"><strong>' + esc(u.name) + '</strong><span class="sub">' + n + ' order' + (n === 1 ? '' : 's') + '</span></div><p class="sub">' + esc(u.email) + '</p></div>';
      }).join("") + '</div>' : '<p class="sub">No customers have registered yet.</p>';
    }
    return '<div class="admin-shell"><div class="admin-head"><div><h1 class="display">Dashboard</h1><p class="sub">Welcome back, ' + esc((state.userName || "Admin").split(" ")[0]) + '. Here is what is happening in the shop.</p></div></div>' +
      adminStats() +
      '<div class="admin-layout">' + nav + '<section class="admin-content"><div class="admin-content-head"><h2>' + (tab === "merchandising" ? "Weather & Events" : tab.charAt(0).toUpperCase() + tab.slice(1)) + '</h2><p class="sub">' + help + '</p></div>' + body + '</section></div></div>';
  }
  function renderMain(){
    switch(state.screen){
      case "home": return screenHome();
      case "detail": return screenDetail();
      case "authGate": return screenAuthGate();
      case "register": return screenRegister();
      case "login": return screenLogin();
      case "cart": return screenCart();
      case "fulfillment": return screenFulfillment();
      case "delivery": return screenDelivery();
      case "payment": return screenPayment();
      case "confirm": return screenConfirm();
      case "gcash": return screenGcash();
      case "done": return screenDone();
      case "admin": return state.isAdmin ? screenAdmin() : screenHome();
      case "orders": return state.authenticated ? screenOrders() : screenHome();
      default: return screenHome();
    }
  }

  function renderDialog(){
    var dialog = state.dialog;
    if (!dialog) return "";
    var confirming = typeof dialog.onConfirm === "function";
    return '<div class="app-dialog-backdrop" role="presentation"><section class="app-dialog" role="alertdialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">' +
      '<div class="app-dialog-mark" aria-hidden="true">' + (confirming ? '?' : '!') + '</div>' +
      '<h2 id="app-dialog-title">' + esc(dialog.title) + '</h2><p id="app-dialog-message">' + esc(dialog.message) + '</p>' +
      '<div class="app-dialog-actions">' + (confirming ? '<button class="logout-btn" onclick="App.dismissDialog()">Cancel</button>' : '') +
      (confirming ? '<button class="btn" onclick="App.confirmDialog()">' + esc(dialog.confirmText || "Continue") + '</button>' : '<button class="btn" autofocus onclick="App.dismissDialog()">Got it</button>') + '</div></section></div>';
  }

  function render(){
    state.cart = state.cart.filter(function(l){
      return l.arrangementType === "custom" ?
        Array.isArray(l.flowers) && l.flowers.length && l.flowers.every(function(item){ return flowerById(item.id); }) :
        flowerById(l.id);
    });
    saveCart();
    document.getElementById("app").innerHTML =
      renderTopbar() +
      "<main>" + renderMain() + "</main>" +
      renderFooter() +
        renderDialog();
    if (state.dialog){
      var dialogButton = document.querySelector(".app-dialog button");
      if (dialogButton) dialogButton.focus();
    }
    flushNotices();
    bindDepthInteractions();
  }

  function bindDepthInteractions(){
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".detail-visual").forEach(function(surface){
      surface.addEventListener("pointermove", function(event){
        var bounds = surface.getBoundingClientRect();
        var x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
        var y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
        surface.style.setProperty("--tilt-x", (-y * 3).toFixed(2) + "deg");
        surface.style.setProperty("--tilt-y", (x * 4).toFixed(2) + "deg");
      });
      surface.addEventListener("pointerleave", function(){
        surface.style.removeProperty("--tilt-x");
        surface.style.removeProperty("--tilt-y");
      });
    });
    var bouquetScene = document.querySelector(".bouquet-scene");
    if (!bouquetScene) return;
    bouquetScene.addEventListener("pointermove", function(event){
      var bounds = bouquetScene.getBoundingClientRect();
      var x = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      var y = (event.clientY - bounds.top) / bounds.height * 2 - 1;
      bouquetScene.style.transform = "rotateX(" + (-y * 2).toFixed(2) + "deg) rotateY(" + (x * 3).toFixed(2) + "deg)";
    });
    bouquetScene.addEventListener("pointerleave", function(){ bouquetScene.style.removeProperty("transform"); });
  }

  /* ---------- actions ---------- */
  // one place that puts a single flower in the cart (used by the product page and the quick Add button on each card)
  function addSingle(f, n){
    var arrangement = "single", wrapChoice = "none", wrapDesign = null;
    var line = state.cart.filter(function(l){
      return l.id === f.id && l.arrangementType === arrangement && l.wrapChoice === wrapChoice && l.wrapDesign === wrapDesign;
    })[0];
    if (line) line.qty += n;
    else state.cart.push({ id: f.id, qty: n, arrangementType: arrangement, wrapChoice: wrapChoice, wrapDesign: wrapDesign, lineId: newLineId() });
    state.checkoutKey = null; // cart changed -> this is a new checkout
    state.qty = 1;
    showCartToast(f.name + (n > 1 ? " \u00d7 " + n : "") + " added to your cart.");
  }
  var App = {
    go: go,
    browseCollection: function(){
      var collection = document.getElementById("flower-collection");
      if (collection) collection.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    },
    openDetail: function(id){
      state.detailId = id; state.qty = 1; state.arrangementType = "single"; state.wrapChoice = "none";
      state.wrapDesign = WRAPPING_DESIGNS[0].id; state.customFlowers = {}; state.customWrapColor = ""; state.customWrapNotes = "";
      go("detail");
    },
    changeQty: function(d){
      var f = flowerById(state.detailId);
      var max = f ? Math.max(1, room(f)) : 99;
      if (d > 0 && state.qty >= max) notify("warning", "Only " + max + " " + (max === 1 ? "is" : "are") + " available right now.", "Stock limit reached");
      state.qty = Math.max(1, Math.min(state.qty + d, max)); render();
    },
    chooseArrangement: function(type){
      if (["single", "custom"].indexOf(type) < 0) return;
      state.wrapChoice = type === "custom" ? "wrapped" : "none";
      state.arrangementType = type; render();
    },
    changeCustomFlower: function(id, delta){
      var flower = flowerById(id), next = (state.customFlowers[id] || 0) + delta;
      if (!flower || next < 0) return;
      if (next > room(flower)){ notify("warning", "Only " + room(flower) + " " + flower.name + " " + (room(flower) === 1 ? "is" : "are") + " available.", "Stock limit reached"); return; }
      if (next) state.customFlowers[id] = next; else delete state.customFlowers[id];
      render();
    },
    chooseWrapDesign: function(id){
      if (!WRAPPING_DESIGNS.some(function(option){ return option.id === id; })) return;
      state.wrapDesign = id; render();
    },
    updateCustomWrap: function(field, value){
      if (field === "color") state.customWrapColor = value;
      if (field === "notes") state.customWrapNotes = value;
    },
    addToCart: function(id){
      var f = flowerById(id);
      if (state.isAdmin || !f) return;
      var n = Math.min(state.qty, room(f));
      if (n < 1){ notify("warning", f.name + " is already at its available stock in your cart.", "No more available"); return; }
      addSingle(f, n);
    },
    quickAdd: function(id){
      var f = flowerById(id);
      if (state.isAdmin || !f) return;
      if (room(f) < 1){ notify("warning", stockQty(f) === 0 ? f.name + " is out of stock." : "All available " + f.name + " is already in your cart.", "No more available"); return; }
      addSingle(f, 1);
    },
    setSearch: function(v){ state.shopSearch = v; refreshShopGrid(); },
    setSort: function(v){ state.shopSort = v; refreshShopGrid(); },
    setInStock: function(v){ state.shopInStock = !!v; refreshShopGrid(); },
    clearShopFilters: function(){ state.shopSearch = ""; state.shopSort = "featured"; state.shopInStock = false; render(); },
    addCustomBouquet: function(){
      if (state.isAdmin) return;
      var flowers = FLOWERS.filter(function(flower){ return (state.customFlowers[flower.id] || 0) > 0; }).map(function(flower){
        return { id: flower.id, qty: state.customFlowers[flower.id] };
      });
      if (!flowers.length || flowers.some(function(item){ var f = flowerById(item.id); return !f || item.qty > room(f); })) return;
      state.cart.push({
        id: null, qty: 1, arrangementType: "custom", flowers: flowers,
        wrapChoice: "wrapped", wrapDesign: state.wrapDesign,
        wrapColor: state.customWrapColor.trim(),
        wrapNotes: state.customWrapNotes.trim(),
        lineId: newLineId()
      });
      state.customFlowers = {};
      state.arrangementType = "single";
      state.wrapChoice = "none";
      state.qty = 1;
      state.checkoutKey = null;
      showCartToast("Custom bouquet added to cart");
    },
    // Re-check stock, then continue to checkout (guests are asked to log in or register first and come straight back).
    proceed: function(){
      if (!state.cart.length) return go("cart");
      var before = JSON.stringify(state.cart);
      loadProducts().then(function(){
        if (!state.cart.length || JSON.stringify(state.cart) !== before){
          if (!state.notice) state.notice = "Some items in your cart were changed because the available stock changed. Please review your cart.";
          return go("cart");
        }
        state.notice = "";
        if (!state.authenticated){ state.afterCheckout = true; return go("authGate"); }
        go("fulfillment");
      }).catch(function(e){
        state.serverError = "";
        state.notice = "Stock could not be verified, so checkout is paused. " + e.message;
        go("cart");
      });
    },
    openCart: function(){
      if (state.isAdmin && !state.cart.length) return;
      go("cart");
    },
    removeLine: function(index){
      var line = state.cart[index], label = line ? lineLabel(line) : "Item";
      state.cart.splice(index, 1); state.checkoutKey = null; render();
      notify("info", label + " was removed from your cart.", "Removed from cart");
    },
    lineQty: function(index, d){
      var line = state.cart[index];
      if (!line) return;
      if (d > 0 && !canIncreaseLine(line)) return;
      line.qty += d;
      var removed = line.qty <= 0;
      if (removed) state.cart.splice(index, 1);
      state.checkoutKey = null;
      render();
      if (removed) notify("info", lineLabel(line) + " was removed from your cart.", "Removed from cart");
    },
    submitRegister: function(ev){
      ev.preventDefault();
      var name = document.getElementById("reg-name").value.trim();
      var email = document.getElementById("reg-email").value.trim();
      var pass = document.getElementById("reg-pass").value;
      var pass2 = document.getElementById("reg-pass2").value;
      state.registerForm = { name: name, email: email, pass: pass, pass2: pass2 };
      if (!name || !email || !pass || !pass2){
        state.registerError = "Please fill in every field to finish registration.";
      } else if (email.indexOf("@") === -1 || email.indexOf(".") === -1){
        state.registerError = "That doesn\u2019t look like a valid email address.";
      } else if (pass.length < 6){
        state.registerError = "Password must be at least 6 characters.";
      } else if (pass !== pass2){
        state.registerError = "Passwords don\u2019t match \u2014 try again.";
      } else {
        state.registerError = "";
        api("POST", "/api/register", { name: name, email: email, pass: pass }).then(function(r){
          state.registerForm = { name: "", email: "", pass: "", pass2: "" };
          return startSession(r, "register");
        }).catch(function(e){ state.registerError = e.message; render(); });
        return false;
      }
      render();
      return false;
    },
    submitLogin: function(ev){
      ev.preventDefault();
      var email = document.getElementById("log-email").value.trim();
      var pass = document.getElementById("log-pass").value;
      state.loginForm = { email: email, pass: pass };
      if (!email || !pass){
        state.loginError = "Enter both your email and password.";
      } else {
        state.loginError = "";
        api("POST", "/api/login", { email: email, pass: pass }).then(function(r){
          state.loginForm = { email: "", pass: "" };
          return startSession(r);
        }).catch(function(e){ state.loginError = e.message; render(); });
        return false;
      }
      render();
      return false;
    },
    logout: function(){
      var wasAdmin = state.isAdmin;
      customerOrderStatuses = null; knownAdminOrderCodes = null;
      if (TOKEN) api("POST", "/api/logout").catch(function(e){
       state.serverError = "You are signed out on this device, but PetalHub could not finish signing you out on the server. Please try again. " + e.message;
        render();
      });
      TOKEN = null; try { sessionStorage.removeItem("ph.token"); } catch(e){}
      state.authenticated = false;
      state.isAdmin = false;
      state.userEmail = "";
      state.userName = "";
      state.cart = [];
      state.afterCheckout = false;
      state.myOrders = [];
      state.checkoutKey = null;
      state.fulfillment = null;
      state.address = { street: "", city: "", zip: "", phone: "" };
      state.payment = null;
      state.orderCode = null;
      state.gcashRef = ""; state.gcashProof = ""; state.gcashProofName = ""; state.lastPaymentMethod = null;
      go("home");
      clearToasts();
      notify("success", wasAdmin ? "You have been signed out of the dashboard." : "You have been logged out. See you again soon!", "Logged out");
    },
    choosePickup: function(){ state.fulfillment = "pickup"; state.deliveryError = ""; go("payment"); notify("info", "You\u2019ll pick your order up at the store. " + PICKUP_ESTIMATE + ".", "Pickup selected"); },
    submitDelivery: function(ev){
      ev.preventDefault();
      var street = document.getElementById("d-street").value.trim();
      var city = document.getElementById("d-city").value.trim();
      var zip = document.getElementById("d-zip").value.trim();
      var phone = document.getElementById("d-phone").value.trim();
      state.address = { street: street, city: city, zip: zip, phone: phone };
      if (!street || !city){
        state.deliveryError = "Please enter your street address and city / town so we can deliver your flowers.";
        render();
        return false;
      }
      if (!/^[0-9+().\s-]{7,30}$/.test(phone) || phone.replace(/\D/g, "").length < 7){
        state.deliveryError = "Please enter a valid contact phone number for delivery.";
        render();
        return false;
      }
      state.deliveryError = "";
      state.fulfillment = "delivery";
      state.address = { street: street, city: city, zip: zip, phone: phone };
      go("payment");
      notify("success", "We\u2019ll deliver to " + street + ", " + city + ".", "Delivery details saved");
      return false;
    },
    choosePayment: function(id){
      state.payment = id; render();
      notify("info", id === "gcash" ? "You\u2019ll scan the shop\u2019s QR code on the next step." : "You\u2019ll pay in cash when you " + (state.fulfillment === "delivery" ? "receive" : "pick up") + " your order.", paymentLabel(id) + " selected", { duration: 3200 });
    },
    // ---- GCash QR payment ----
    openGcash: function(){
      loadPaymentInfo().then(function(){ go("gcash"); }).catch(showErr);
    },
    setGcashRef: function(value){
      state.gcashRef = value;
      var hint = document.getElementById("gcash-ref-hint");
      if (hint) hint.innerHTML = gcashRefHint();
    },
    pickProof: function(input){
      var file = input.files && input.files[0]; input.value = "";
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)){ notify("warning", "Please choose a PNG, JPG or WebP screenshot.", "Unsupported file"); return; }
      if (file.size > 15000000){ notify("warning", "That image is over 15 MB. Please choose a smaller screenshot.", "Image too large"); return; }
      shrinkImage(file, 1100, "image/jpeg", 0.82).then(function(dataUrl){
        state.gcashProof = dataUrl; state.gcashProofName = file.name; render();
        notify("success", "Your receipt screenshot is attached.", "Screenshot added");
      }).catch(showErr);
    },
    removeProof: function(){ state.gcashProof = ""; state.gcashProofName = ""; render(); notify("info", "The screenshot was removed.", "Screenshot removed", { duration: 2800 }); },
    copyGcashNumber: function(){
      var number = state.payInfo && state.payInfo.number ? state.payInfo.number : "";
      if (!number) return;
      var done = function(){ notify("success", number + " was copied.", "GCash number copied", { duration: 2800 }); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(number).then(done).catch(function(){ notify("warning", "Please copy the number by hand: " + number, "Could not copy"); });
      else notify("info", "GCash number: " + number, "Copy this number");
    },
    submitGcash: function(){
      var ref = state.gcashRef.replace(/\D/g, "");
      if (ref.length !== 13){
        state.gcashError = "Enter the 13-digit reference number shown on your GCash receipt. You entered " + ref.length + " digit" + (ref.length === 1 ? "" : "s") + ".";
        render();
        var input = document.getElementById("gcash-ref"); if (input) input.focus();
        return;
      }
      App.placeOrder({ gcashRef: ref, proof: state.gcashProof });
    },
    confirmOrder: function(){
      if (state.payment === "gcash") return App.openGcash();
      App.placeOrder();
    },
    placeOrder: function(extra){
      if (state.placing || !state.cart.length) return;
      state.placing = true; render();
      // one key per checkout: if the same checkout is sent twice (double-click, slow network retry) the server returns the first order
      if (!state.checkoutKey) state.checkoutKey = "ck" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      var fulfillment = state.fulfillment, method = state.payment;
      var payload = {
        items: state.cart.reduce(function(items, line){
          if (!line.lineId) line.lineId = newLineId();
          var f = flowerById(line.id);
          var lineName = line.arrangementType === "custom" ? "Custom Bouquet" : (f ? f.name : "Flower");
          lineFlowers(line).forEach(function(item){
            items.push({
              id: item.id, qty: item.qty * line.qty, line_key: line.lineId, line_name: lineName,
              arrangement: line.arrangementType || "single", line_qty: line.qty,
              wrap_design: line.wrapChoice === "wrapped" ? line.wrapDesign : "",
              wrap_color: line.wrapColor || "", wrap_notes: line.wrapNotes || ""
            });
          });
          return items;
        }, []),
        fulfillment: state.fulfillment, address: state.address, payment: state.payment, key: state.checkoutKey
      };
      if (method === "gcash" && extra){ payload.gcashRef = extra.gcashRef; if (extra.proof) payload.proof = extra.proof; }
      api("POST", "/api/orders", payload).then(function(r){
        // The order is now saved, so the cart is emptied. Items already ordered can never be checked out again.
        state.lastOrder = {
          items: state.cart.map(function(line){
            var f = flowerById(line.id), name = line.arrangementType === "custom" ? "Custom Bouquet" : (f ? f.name : "Flower");
            return { name: name, qty: line.qty, price: lineTotal(line) / line.qty };
          }),
          total: cartTotal(), payment: state.payment
        };
        state.placing = false; state.orderCode = r.code; state.lastFulfillment = fulfillment; state.lastPaymentMethod = method; state.afterCheckout = false;
        state.cart = []; state.fulfillment = null; state.payment = null; state.checkoutKey = null;
        state.gcashRef = ""; state.gcashProof = ""; state.gcashProofName = "";
        state.address = { street: "", city: "", zip: "", phone: "" };
        clearToasts(); // older warnings no longer matter once the order is in
        if (method === "gcash") notify("info", "Order " + r.code + " was placed. The shop will verify your GCash payment shortly, and you\u2019ll be notified here.", "Payment submitted", { duration: 9000 });
        else notify("success", "Order " + r.code + " has been placed. " + (fulfillment === "delivery" ? DELIVERY_SHORT : PICKUP_SHORT) + ".", "Order placed", { duration: 7000 });
        // show the order exactly as the server saved it (purchase type, wrapping ...); fall back to the cart summary if that fails
        state.savedOrder = null;
        api("GET", "/api/orders/mine").then(function(list){
          state.myOrders = list; rememberCustomerOrderStatuses(list); state.savedOrder = list.filter(function(o){ return o.code === r.code; })[0] || null;
        }).catch(function(e){
          notify("warning", "Your order was placed, but the full receipt could not be loaded. You can find it in My Orders. " + e.message, "Order saved");
        }).then(function(){
          go("done"); loadProducts().then(render).catch(function(e){ state.serverError = e.message; render(); });
        });
      }).catch(function(e){
        state.placing = false; var msg = e.message;
        // a problem with the GCash details stays on the GCash screen; anything else (for example stock) goes back to the cart
        if (method === "gcash" && /reference|receipt|image|screenshot|upload|too large/i.test(msg)){ state.gcashError = msg; render(); return; }
        loadProducts().then(function(){
          state.screen = "cart"; state.notice = msg + " Your order was not placed."; window.scrollTo(0,0); render();
        }).catch(function(refreshError){
          state.serverError = "";
          state.screen = "cart"; state.notice = msg + " Your order was not placed. Stock refresh failed: " + refreshError.message; window.scrollTo(0,0); render();
        });
      });
    },
    openAdmin: function(){ loadAdmin(true).then(function(){ go("admin"); }).catch(showErr); },
    openOrders: function(){ api("GET", "/api/orders/mine").then(function(r){ state.myOrders = r; rememberCustomerOrderStatuses(r); go("orders"); }).catch(showErr); },
    setTab: function(t){ state.adminTab = t; render(); },
    setAdminOrderFilter: function(filter){
      if (["verify", "ongoing", "completed", "cancelled"].indexOf(filter) < 0) return;
      state.adminOrderFilter = filter;
      render();
    },
    setCustomerOrderFilter: function(filter){
      if (["ongoing", "completed", "cancelled"].indexOf(filter) < 0) return;
      state.customerOrderFilter = filter;
      render();
    },
    saveWeather: function(){
      var weather = document.getElementById("weather-choice").value;
      api("PUT", "/api/admin/weather", { weather: weather }).then(loadAdmin).then(function(){ render(); notify("success", weather ? "The shop now recommends " + weather + "-day flowers." : "Weather picks are switched off.", "Weather setting saved"); }).catch(showErr);
    },
    saveWeatherFlowers: function(weather){
      var selected = document.querySelectorAll('input[name="weather-flower-' + weather + '"]:checked');
      var flowerIds = Array.prototype.map.call(selected, function(input){ return parseInt(input.value, 10); });
      api("PUT", "/api/admin/weather-flowers/" + weather, { flowerIds: flowerIds }).then(loadAdmin).then(function(){ render(); notify("success", "Flowers for the " + weather + " recommendation were updated.", "Weather flowers saved"); }).catch(showErr);
    },
    saveEventFlowers: function(eventId){
      var selected = document.querySelectorAll('input[name="event-flower-' + eventId + '"]:checked');
      var flowerIds = Array.prototype.map.call(selected, function(input){ return parseInt(input.value, 10); });
      api("PUT", "/api/admin/events/" + eventId, { flowerIds: flowerIds }).then(loadAdmin).then(function(){ render(); notify("success", "The featured flowers for this event were updated.", "Event flowers saved"); }).catch(showErr);
    },
    setStatus: function(code, status){
      api("PATCH", "/api/admin/orders/" + code, { status: status }).then(loadAdmin).then(function(){ render(); notify("success", "Order " + code + " is now " + status + ".", "Order updated"); }).catch(showErr);
    },
    cancelOrder: function(code){
      showConfirm("Cancel order " + code + "? The stems go back into stock. If the customer already paid with GCash, remember to refund them.", function(){
        api("PATCH", "/api/admin/orders/" + code, { status: "Cancelled" }).then(loadAdmin).then(function(){ render(); notify("success", "Order " + code + " was cancelled and its stock was returned.", "Order cancelled"); }).catch(showErr);
      }, "Cancel this order?", "Cancel order");
    },
    verifyPayment: function(code){
      var field = document.getElementById("pay-note-" + code), note = field ? field.value.trim() : "";
      showConfirm("Confirm that the GCash payment for " + code + " arrived? Only verify it after you have seen the reference number and the exact amount in your GCash transactions.", function(){
        api("PUT", "/api/admin/orders/" + encodeURIComponent(code) + "/payment", { action: "verify", note: note }).then(loadAdmin).then(function(){
          render(); notify("success", "The GCash payment for " + code + " is verified. The customer was notified, and you can now prepare the order.", "Payment verified", { duration: 7000 });
        }).catch(showErr);
      }, "Verify this payment?", "Verify payment");
    },
    rejectPayment: function(code){
      var field = document.getElementById("pay-note-" + code), note = field ? field.value.trim() : "";
      showConfirm("Reject the GCash payment for " + code + "? The order will be cancelled and its stock returned. The customer will see your note.", function(){
        api("PUT", "/api/admin/orders/" + encodeURIComponent(code) + "/payment", { action: "reject", note: note }).then(loadAdmin).then(function(){
          render(); notify("warning", "Order " + code + " was cancelled and its stock was returned.", "Payment rejected", { duration: 7000 });
        }).catch(showErr);
      }, "Reject this payment?", "Reject payment");
    },
    viewProof: function(code){
      apiBlob("/api/admin/orders/" + encodeURIComponent(code) + "/proof").then(function(blob){
        openLightbox(URL.createObjectURL(blob), "Receipt screenshot for " + code);
      }).catch(showErr);
    },
    saveGcashSettings: function(){
      var name = document.getElementById("gcash-name").value.trim(), number = document.getElementById("gcash-number").value.trim();
      if (!name){ showWarning("Enter the name shown on the GCash account.", "Account name needed"); return; }
      api("PUT", "/api/admin/payment-settings", { name: name, number: number }).then(function(info){
        state.payInfo = info; render(); notify("success", "Customers will now see " + info.name + (info.number ? " (" + info.number + ")" : "") + " beside the QR code.", "GCash details saved");
      }).catch(showErr);
    },
    pickQr: function(input){
      var file = input.files && input.files[0]; input.value = "";
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)){ notify("warning", "Please choose a PNG, JPG or WebP picture of your GCash QR code.", "Unsupported file"); return; }
      shrinkImage(file, 1400, "image/png").then(function(dataUrl){
        if (dataUrl.length > 2600000){ notify("warning", "That image is too large even after shrinking. Please use a smaller screenshot of the QR code.", "Image too large"); return; }
        state.qrDraft = dataUrl; render();
      }).catch(showErr);
    },
    cancelQr: function(){ state.qrDraft = ""; render(); },
    saveQr: function(){
      if (!state.qrDraft) return;
      api("POST", "/api/admin/payment-qr", { image: state.qrDraft }).then(function(info){
        state.payInfo = info; state.qrDraft = ""; render(); notify("success", "Customers now scan your QR code at checkout.", "GCash QR code updated");
      }).catch(showErr);
    },
    saveProduct: function(id){
      var price = parseFloat(document.getElementById("p-price-" + id).value);
      var qty = parseInt(document.getElementById("p-qty-" + id).value, 10);
      var available = document.getElementById("p-avail-" + id).value === "1";
      if (isNaN(price) || price < 0 || isNaN(qty) || qty < 0){ showWarning("Enter a valid price and quantity.", "Check the flower details"); return; }
      var pname = (db.products.filter(function(item){ return item.id === id; })[0] || {}).name || "Flower";
      api("PUT", "/api/admin/products/" + id, { price: price, qty: qty, available: available }).then(loadProducts).then(loadAdmin).then(function(){ render(); notify("success", pname + " was updated: " + money(price) + ", " + qty + " in stock" + (available ? "" : ", marked out of stock") + ".", "Flower saved"); }).catch(showErr);
    },
    addProduct: function(){
      var name = document.getElementById("new-product-name").value.trim();
      var imagePath = document.getElementById("new-product-image").value.trim();
      var price = parseFloat(document.getElementById("new-product-price").value);
      if (!name || !imagePath || isNaN(price) || price < 0){ showWarning("Enter the flower name, image location, and a valid price.", "Complete all flower details"); return; }
      api("POST", "/api/admin/products", { name: name, imagePath: imagePath, price: price })
        .then(loadProducts).then(loadAdmin).then(function(){ render(); notify("success", name + " is now in the shop.", "Flower added"); }).catch(showErr);
    },
    addRider: function(){
      var name = document.getElementById("new-rider-name").value.trim();
      var phone = document.getElementById("new-rider-phone").value.trim();
      if (!name || !/^[0-9+().\s-]{7,30}$/.test(phone) || phone.replace(/\D/g, "").length < 7){
        showWarning("Enter a rider name and a valid phone number.", "Check rider details");
        return;
      }
      var normalizedPhone = phone.replace(/\D/g, "");
      if (db.riders.some(function(rider){ return rider.phone.replace(/\D/g, "") === normalizedPhone; })){
        showWarning("A rider with this phone number already exists.", "Duplicate rider phone");
        return;
      }
      api("POST", "/api/admin/riders", { name: name, phone: phone }).then(loadAdmin).then(function(){ render(); notify("success", name + " can now be assigned to delivery orders.", "Rider saved"); }).catch(showErr);
    },
    deleteRider: function(id){
      var rider = db.riders.filter(function(item){ return Number(item.id) === Number(id); })[0];
      if (!rider) return;
      showConfirm("Remove " + rider.name + " from the available delivery riders? Existing order assignments and history will be kept.", function(){
        api("DELETE", "/api/admin/riders/" + encodeURIComponent(id)).then(loadAdmin).then(function(){
          render(); notify("success", rider.name + " was removed from available riders.", "Rider removed");
        }).catch(showErr);
      }, "Delete this rider?", "Delete rider");
    },
    assignRider: function(code){
      var input = document.getElementById("rider-select-" + code);
      if (!input) return;
      var riderId = input.value ? Number(input.value) : null;
      api("PUT", "/api/admin/orders/" + encodeURIComponent(code) + "/rider", { riderId: riderId }).then(loadAdmin).then(function(){ render(); notify("success", riderId ? "A rider was assigned to order " + code + "." : "The rider was removed from order " + code + ".", "Rider updated"); }).catch(showErr);
    },
    deleteProduct: function(id){
      var product = db.products.filter(function(item){ return item.id === id; })[0];
      var name = product ? product.name : "this flower";
      showConfirm("Remove " + name + " from the shop? Existing order history will be kept. Customers with this flower in their cart will be told it is no longer available.", function(){
        api("DELETE", "/api/admin/products/" + id)
          .then(loadProducts).then(loadAdmin).then(function(){ render(); notify("success", name + " was removed from the shop.", "Flower removed"); }).catch(showErr);
      }, "Remove this flower?", "Remove flower");
    },
    dismissDialog: function(){
      state.dialog = null;
      state.serverError = "";
      state.notice = "";
      state.deliveryError = "";
      state.registerError = "";
      state.loginError = "";
      render();
    },
    confirmDialog: function(){
      var dialog = state.dialog;
      if (!dialog || typeof dialog.onConfirm !== "function") return;
      state.dialog = null;
      render();
      dialog.onConfirm();
    },
    newOrder: function(){
      state.fulfillment = null;
      state.address = { street: "", city: "", zip: "", phone: "" };
      state.payment = null;
      state.orderCode = null;
      state.lastPaymentMethod = null;
      go("home");
    }
  };
  window.App = App;
  window.addEventListener("keydown", function(event){
    if (event.key === "Escape" && state.dialog){
      App.dismissDialog();
    }
  });
  window.setInterval(pollAdminOrders, 15000);
  window.setInterval(pollCustomerOrders, 15000);
  document.addEventListener("visibilitychange", function(){
    pollAdminOrders();
    pollCustomerOrders();
  });

  render();
  loadProducts().then(loadMerchandising).catch(function(e){ state.serverError = e.message; }).then(function(){
    if (!TOKEN) return;
    return api("GET", "/api/me").then(function(r){
      applyUser(r.user);
      if (state.isAdmin) return loadAdmin(true).catch(function(e){ console.error(e.message); });
      pollCustomerOrders(); // remembers the current order statuses, so later changes can be announced
    }).catch(function(e){
      if (TOKEN) state.serverError = e.message;
    });
  }).then(render);
  loadPaymentInfo().catch(function(){});
})();