const app = document.getElementById('app');
const toast = document.getElementById('toast');
const adminAccount = { name: 'Harvest Admin', email: 'balu172609@gmail.com', password: '00000', role: 'admin' };
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const seedProducts = [
  { id: 1, name: 'Heirloom Tomatoes', category: 'Vegetables', price: 48, unit: 'kg', stock: 120, emoji: '🍅', farmer: 'Meera Farms' },
  { id: 2, name: 'Golden Wheat', category: 'Grains', price: 34, unit: 'kg', stock: 480, emoji: '🌾', farmer: 'Green Valley Co-op' },
  { id: 3, name: 'Alphonso Mangoes', category: 'Fruits', price: 95, unit: 'kg', stock: 75, emoji: '🥭', farmer: 'Ravi Orchards' },
  { id: 4, name: 'Fresh Spinach', category: 'Leafy greens', price: 28, unit: 'bundle', stock: 210, emoji: '🥬', farmer: 'Sundar Fields' },
  { id: 5, name: 'Red Lentils', category: 'Pulses', price: 110, unit: 'kg', stock: 180, emoji: '🫘', farmer: 'Meera Farms' },
  { id: 6, name: 'Raw Honey', category: 'Pantry', price: 260, unit: 'jar', stock: 42, emoji: '🍯', farmer: 'Hilltop Apiary' }
];

function init() {
  const users = store.get('hl_users', []);
  const adminIndex = users.findIndex(user => user.role === 'admin');
  if (adminIndex >= 0) users[adminIndex] = adminAccount;
  else users.push(adminAccount);
  users.forEach(user => { user.loginCount ??= 0; user.active ??= false; });
  store.set('hl_users', users);
  if (!localStorage.getItem('hl_products')) store.set('hl_products', seedProducts);
  if (!localStorage.getItem('hl_orders')) store.set('hl_orders', [
    { id: 'HL-1042', product: 'Golden Wheat', buyer: 'Anita Sharma', quantity: 20, total: 680, status: 'Completed', date: '22 Sep 2026' },
    { id: 'HL-1041', product: 'Heirloom Tomatoes', buyer: 'Fresh Basket Cafe', quantity: 12, total: 576, status: 'Processing', date: '21 Sep 2026' },
    { id: 'HL-1040', product: 'Raw Honey', buyer: 'Kiran Grocers', quantity: 5, total: 1300, status: 'Completed', date: '19 Sep 2026' }
  ]);
  renderAuth('login');
}

function renderAuth(mode) {
  const signup = mode === 'signup';
  const adminLogin = mode === 'admin';
  app.innerHTML = `<main class="auth-shell">
    <section class="auth-intro">
      <div class="brand"><span class="brand-mark">H</span> HarvestLink</div>
      <div>
        <div class="eyebrow">Direct from the field</div>
        <h1>Good food starts with a fair connection.</h1>
        <p>A farmer-first marketplace where fresh produce travels from local fields to people who value it.</p>
        <div class="auth-list"><div><span>✦</span> Sell directly, set your own price</div><div><span>✦</span> Discover what your market wants</div><div><span>✦</span> Keep every rupee traceable</div></div>
      </div>
    </section>
    <section class="auth-panel"><div class="auth-box">
      <div class="eyebrow">${signup ? 'Join the network' : adminLogin ? 'Restricted access' : 'Welcome back'}</div>
      <h2>${signup ? 'Create your account' : adminLogin ? 'Admin sign in' : 'Sign in to HarvestLink'}</h2>
      <p>${signup ? 'Your next customer is closer than you think.' : adminLogin ? 'Manage listings, orders and marketplace activity.' : 'Your fields, orders and market in one place.'}</p>
      <form id="auth-form" class="form-grid">
        ${signup ? '<label>Full name<input name="name" required placeholder="e.g. Priya Nair"></label>' : ''}
        <label>Email address<input name="email" type="email" required placeholder="you@example.com"></label>
        <label>Password<input name="password" type="password" required minlength="4" placeholder="At least 4 characters"></label>
        ${signup ? '<label>I am a<select name="role"><option value="buyer">Buyer</option><option value="farmer">Seller / Farmer</option></select></label>' : ''}
        <button class="btn" type="submit">${signup ? 'Create account' : 'Continue to dashboard'} <span>→</span></button>
      </form>
      <div class="auth-switch">${signup ? 'Already have an account?' : 'New to HarvestLink?'} <button class="link-btn" id="auth-switch">${signup ? 'Sign in' : 'Create an account'}</button>${!adminLogin ? '<span style="margin:0 7px;color:var(--line)">|</span><button class="link-btn" id="admin-login">Admin login</button>' : ''}</div>
    </div></section>
  </main>`;
  document.getElementById('auth-form').addEventListener('submit', handleAuth);
  document.getElementById('auth-switch').addEventListener('click', () => renderAuth(signup ? 'login' : 'signup'));
  document.getElementById('admin-login')?.addEventListener('click', () => renderAuth('admin'));
}

function handleAuth(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const users = store.get('hl_users', [adminAccount]);
  let user;
  if (data.role) {
    if (users.some(item => item.email === data.email)) return showToast('This email is already registered.');
    user = { name: data.name, email: data.email, password: data.password, role: data.role, loginCount: 1, lastLogin: new Date().toISOString(), active: true };
    users.push(user); store.set('hl_users', users);
    showToast('Account created. Welcome to HarvestLink.');
  } else {
    user = users.find(item => item.email === data.email && item.password === data.password);
    if (!user) return showToast('Email or password not recognised.');
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date().toISOString();
    user.active = true;
    store.set('hl_users', users);
  }
  store.set('hl_session', user);
  renderDashboard('overview');
}

function renderDashboard(view = 'overview') {
  const user = store.get('hl_session', null);
  if (!user) return renderAuth('login');
  const admin = user.role === 'admin';
  const farmer = user.role === 'farmer';
  const navItems = admin || farmer ? [['overview', '⌂', 'Overview'], ['products', '▦', 'My products'], ['orders', '↗', 'Sales orders'], ['trends', '⌁', 'Market trends']] : [['overview', '⌂', 'Marketplace'], ['orders', '↗', 'My orders'], ['trends', '⌁', 'Market trends']];
  app.innerHTML = `<div class="app-shell">
    <aside class="sidebar"><div class="brand"><span class="brand-mark">H</span> HarvestLink</div><div class="nav-label">Workspace</div><nav class="nav">${navItems.map(item => `<button class="${item[0] === view ? 'active' : ''}" data-view="${item[0]}"><span class="nav-icon">${item[1]}</span><span>${item[2]}</span></button>`).join('')}</nav><div class="sidebar-foot">Fair trade, better harvests.<br>© 2026 HarvestLink</div></aside>
    <main class="page"><header class="topbar"><div><div class="eyebrow">${admin ? 'Separate admin module' : farmer ? 'Seller / Farmer module' : 'Buyer module'}</div><h1>${pageTitle(view, admin, farmer)}</h1></div><div class="user-chip"><div><strong>${escapeHtml(user.name)}</strong><small>${admin ? 'Platform administrator' : farmer ? 'Seller / Farmer' : 'Buyer'}</small></div><div class="avatar">${user.name.charAt(0).toUpperCase()}</div><button class="btn secondary small" id="logout">Log out</button></div></header><section class="content" id="view-content"></section></main>
  </div>`;
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => renderDashboard(button.dataset.view)));
  document.getElementById('logout').addEventListener('click', () => { const users = store.get('hl_users', []); const index = users.findIndex(item => item.email === user.email); if (index >= 0) { users[index].active = false; store.set('hl_users', users); } localStorage.removeItem('hl_session'); renderAuth('login'); });
  renderView(view, admin);
}

function pageTitle(view, admin, farmer) { return view === 'overview' ? (admin ? 'Good morning, Admin' : farmer ? 'Your farm workspace' : 'Your fresh marketplace') : view === 'products' ? (farmer ? 'My product listings' : 'Product catalogue') : view === 'orders' ? (admin || farmer ? 'Sales orders' : 'Your orders') : 'Market intelligence'; }
function renderView(view, admin) {
  const content = document.getElementById('view-content');
  if (view === 'products') return renderProducts(content);
  if (view === 'orders') return renderOrders(content, admin);
  if (view === 'trends') return renderTrends(content);
  renderOverview(content, admin);
}

function renderOverview(content, admin) {
  const products = store.get('hl_products', seedProducts);
  const orders = store.get('hl_orders', []);
  const users = store.get('hl_users', []);
  const totalLogins = users.reduce((total, account) => total + (account.loginCount || 0), 0);
  const registeredAccounts = admin ? `<section class="panel" style="margin-bottom:18px"><div class="panel-head"><div><h3>Registered accounts</h3><p class="panel-sub">Every Buyer, Seller/Farmer, and Admin account in the platform.</p></div><span class="tag">${users.length} accounts</span></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Logins</th></tr></thead><tbody>${users.map(account => `<tr><td><strong>${escapeHtml(account.name)}</strong></td><td>${escapeHtml(account.email)}</td><td>${account.role === 'admin' ? 'Admin' : account.role === 'farmer' ? 'Seller / Farmer' : 'Buyer'}</td><td><span class="status ${account.active ? 'completed' : ''}">${account.active ? 'Active' : 'Inactive'}</span></td><td>${account.loginCount || 0}</td></tr>`).join('')}</tbody></table></div></section>` : '';
  content.innerHTML = `<div class="hero"><div><div class="eyebrow" style="color:#f2ce7d">${admin ? 'Today at a glance' : 'Good things are growing'}</div><h2>${admin ? 'A healthier marketplace starts with visibility.' : 'Know your farmer. Love your food.'}</h2><p>${admin ? 'Monitor supply, demand and every order moving through the network.' : 'Browse produce grown with care, then order directly from the people who grow it.'}</p></div><div class="hero-art"></div></div>
    <div class="grid stats"><div class="stat"><div class="stat-label">${admin ? 'Active listings' : 'Available listings'}</div><div class="stat-value">${products.length}</div><div class="stat-note">↑ 12% this month</div></div><div class="stat"><div class="stat-label">${admin ? 'Orders this month' : 'Orders placed'}</div><div class="stat-value">${admin ? orders.length + 126 : orders.filter(order => order.buyer === store.get('hl_session', {}).name).length}</div><div class="stat-note">↑ 8% this month</div></div><div class="stat"><div class="stat-label">${admin ? 'Gross trade value' : 'Average savings'}</div><div class="stat-value">${admin ? '₹18.4k' : '14%'}</div><div class="stat-note">${admin ? '↑ 21% this month' : 'vs. local retail'}</div></div><div class="stat"><div class="stat-label">Farmer satisfaction</div><div class="stat-value">4.8<span style="font-size:15px">/5</span></div><div class="stat-note">Based on 86 reviews</div></div></div>
    ${admin ? `<div class="grid stats"><div class="stat"><div class="stat-label">Accounts created</div><div class="stat-value">${users.length}</div><div class="stat-note">All registered accounts</div></div><div class="stat"><div class="stat-label">Active accounts</div><div class="stat-value">${users.filter(account => account.active).length}</div><div class="stat-note">Currently signed in</div></div><div class="stat"><div class="stat-label">Total logins</div><div class="stat-value">${totalLogins}</div><div class="stat-note">Across all accounts</div></div></div>${registeredAccounts}` : ''}
    <div class="grid two-col"><section class="panel"><div class="panel-head"><div><h3>Fresh from the field</h3><p class="panel-sub">Popular listings available today</p></div><button class="btn secondary small" data-jump="products">View all</button></div><div class="grid product-grid">${products.slice(0, 3).map(productCard).join('')}</div></section><section class="panel"><div class="panel-head"><div><h3>Price pulse</h3><p class="panel-sub">Average market movement</p></div><span class="tag">This week</span></div><div class="trend">${[42, 55, 47, 70, 63, 84, 73].map((height, i) => `<div class="bar-wrap"><div class="bar" style="height:${height}%"></div><span>${['M','T','W','T','F','S','S'][i]}</span></div>`).join('')}</div><p class="panel-sub" style="margin-top:12px">Demand is strongest for <strong style="color:var(--ink)">seasonal vegetables</strong>.</p></section></div>`;
  content.querySelector('[data-jump]').addEventListener('click', e => renderDashboard(e.target.dataset.jump));
  content.querySelectorAll('[data-order]').forEach(button => button.addEventListener('click', () => showOrderModal(Number(button.dataset.order))));
}

function productCard(product) { const buyerAction = store.get('hl_session', {}).role === 'buyer' || store.get('hl_session', {}).role === 'user' ? `<button class="btn small" data-order="${product.id}">Order</button>` : '<span class="tag">Direct</span>'; return `<article class="product-card"><div class="product-image">${product.emoji}</div><div class="product-info"><h4>${escapeHtml(product.name)}</h4><div class="product-meta">${escapeHtml(product.category)} · ${product.stock} ${product.unit}s left</div><div class="product-row"><span class="price">₹${product.price} / ${product.unit}</span>${buyerAction}</div></div></article>`; }
function renderProducts(content) {
  const products = store.get('hl_products', seedProducts);
  const canPublish = store.get('hl_session', {}).role === 'admin' || store.get('hl_session', {}).role === 'farmer';
  content.innerHTML = `<div class="panel"><div class="panel-head"><div><h3>${canPublish ? 'Your produce listings' : 'All produce'}</h3><p class="panel-sub">${canPublish ? 'Publish produce and keep your stock visible to buyers.' : 'Browse produce available from local farmers.'}</p></div>${canPublish ? '<button class="btn" id="add-product">＋ Add product</button>' : ''}</div><div class="grid product-grid">${products.map(productCard).join('')}</div></div>`;
  if (canPublish) document.getElementById('add-product').addEventListener('click', showProductModal);
}
function showProductModal() {
  const wrapper = document.createElement('div'); wrapper.className = 'modal-backdrop'; wrapper.innerHTML = `<div class="modal"><h2>Add a new listing</h2><form id="product-form" class="form-grid"><label>Produce name<input name="name" required placeholder="e.g. Organic Okra"></label><label>Category<input name="category" required placeholder="e.g. Vegetables"></label><label>Price per unit (₹)<input name="price" type="number" min="1" required></label><label>Available stock<input name="stock" type="number" min="1" required></label><label>Unit<select name="unit"><option>kg</option><option>bundle</option><option>jar</option><option>crate</option></select></label><div class="modal-actions"><button type="button" class="btn secondary" id="cancel-modal">Cancel</button><button class="btn">Publish listing</button></div></form></div>`;
  document.body.appendChild(wrapper); document.getElementById('cancel-modal').addEventListener('click', () => wrapper.remove());
  document.getElementById('product-form').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.target)); const products = store.get('hl_products', seedProducts); products.push({ ...data, id: Date.now(), price: Number(data.price), stock: Number(data.stock), emoji: '🌱', farmer: 'HarvestLink farm' }); store.set('hl_products', products); wrapper.remove(); showToast('Your new listing is live.'); renderDashboard('products'); });
}
function showOrderModal(productId) {
  const product = store.get('hl_products', seedProducts).find(item => item.id === productId);
  const wrapper = document.createElement('div'); wrapper.className = 'modal-backdrop'; wrapper.innerHTML = `<div class="modal"><h2>Order ${escapeHtml(product.name)}</h2><p class="panel-sub">Direct from ${escapeHtml(product.farmer)} · ₹${product.price} / ${product.unit}</p><form id="order-form" class="form-grid"><label>Quantity (${product.unit})<input name="quantity" type="number" min="1" max="${product.stock}" value="1" required></label><div class="modal-actions"><button type="button" class="btn secondary" id="cancel-order">Cancel</button><button class="btn">Place order</button></div></form></div>`;
  document.body.appendChild(wrapper); document.getElementById('cancel-order').addEventListener('click', () => wrapper.remove());
  document.getElementById('order-form').addEventListener('submit', event => { event.preventDefault(); const quantity = Number(new FormData(event.target).get('quantity')); const user = store.get('hl_session'); const orders = store.get('hl_orders', []); orders.unshift({ id: `HL-${1043 + orders.length}`, product: product.name, buyer: user.name, quantity, total: quantity * product.price, status: 'Processing', date: '24 Sep 2026' }); store.set('hl_orders', orders); wrapper.remove(); showToast('Order placed. The farmer has been notified.'); renderDashboard('orders'); });
}
function renderOrders(content, admin) {
  const orders = store.get('hl_orders', []);
  content.innerHTML = `<div class="panel"><div class="panel-head"><div><h3>${admin ? 'All marketplace orders' : 'Order history'}</h3><p class="panel-sub">${admin ? 'Keep orders moving from field to doorstep.' : 'A record of the food you have brought home.'}</p></div><span class="tag">${orders.length} total</span></div><div class="table-wrap"><table><thead><tr><th>Order</th><th>Produce</th><th>${admin ? 'Buyer' : 'Quantity'}</th><th>Total</th><th>Status</th>${admin ? '<th>Action</th>' : ''}</tr></thead><tbody>${orders.map(order => `<tr><td><strong>${order.id}</strong><br><small class="product-meta">${order.date}</small></td><td>${escapeHtml(order.product)}</td><td>${admin ? escapeHtml(order.buyer) : order.quantity + ' units'}</td><td>₹${order.total}</td><td><span class="status ${order.status === 'Completed' ? 'completed' : ''}">${order.status}</span></td>${admin ? `<td><button class="btn secondary small" data-complete="${order.id}">${order.status === 'Completed' ? 'Completed' : 'Mark complete'}</button></td>` : ''}</tr>`).join('')}</tbody></table></div></div>`;
  content.querySelectorAll('[data-complete]').forEach(button => button.addEventListener('click', () => { const updated = orders.map(order => order.id === button.dataset.complete ? { ...order, status: 'Completed' } : order); store.set('hl_orders', updated); showToast('Order status updated.'); renderDashboard('orders'); }));
}
function renderTrends(content) { content.innerHTML = `<div class="grid two-col"><section class="panel"><div class="panel-head"><div><h3>Market demand</h3><p class="panel-sub">Search interest across your region</p></div><span class="tag">Last 30 days</span></div><div class="trend" style="height:250px">${[35, 50, 43, 68, 62, 87, 75, 92, 82, 97].map((height, i) => `<div class="bar-wrap"><strong style="color:var(--green);font-size:11px">${height}</strong><div class="bar" style="height:${height}%;background:${i > 6 ? 'var(--coral)' : 'var(--gold)'}"></div><span>${['12','14','16','18','20','22','24','26','28','30'][i]}</span></div>`).join('')}</div></section><section class="panel"><div class="panel-head"><div><h3>Helpful signals</h3><p class="panel-sub">What the market is telling us</p></div></div><div class="grid" style="gap:13px"><div class="stat"><span class="tag">Rising</span><h4 style="margin:10px 0 2px">Leafy greens</h4><p class="panel-sub">Demand is up 24%. A good week to list spinach and kale.</p></div><div class="stat"><span class="tag" style="color:#9b5429;background:#fce8d4">Fair price</span><h4 style="margin:10px 0 2px">Tomatoes</h4><p class="panel-sub">The current average of ₹48/kg keeps farmers competitive.</p></div><div class="stat"><span class="tag" style="color:#87641d;background:#fff2cf">Seasonal</span><h4 style="margin:10px 0 2px">Mangoes</h4><p class="panel-sub">Limited supply is creating a premium for quality fruit.</p></div></div></section></div>`; }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
init();
