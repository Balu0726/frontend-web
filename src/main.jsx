import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';

const KEYS = {
  users: 'farmer_connect_users',
  products: 'farmer_connect_products',
  orders: 'farmer_connect_orders',
  session: 'farmer_connect_session',
};

const ADMIN = {
  id: 'admin',
  name: 'FARMER CONNECT Admin',
  email: 'admin@agriculture.com',
  password: 'Admin@123',
  role: 'admin',
  location: 'Platform',
};

const SEED_PRODUCTS = [
  { id: 'seed-1', farmerId: 'seed-farmer-1', farmerName: 'Green Valley Farms', name: 'Fresh Tomatoes', category: 'Vegetables', price: 48, quantity: 120, description: 'Naturally grown red tomatoes, harvested fresh.', location: 'Nashik, Maharashtra' },
  { id: 'seed-2', farmerId: 'seed-farmer-2', farmerName: 'Sunrise Fields', name: 'Golden Wheat', category: 'Grains', price: 34, quantity: 480, description: 'Premium wheat suitable for everyday cooking.', location: 'Amritsar, Punjab' },
  { id: 'seed-3', farmerId: 'seed-farmer-3', farmerName: 'Ravi Orchards', name: 'Alphonso Mangoes', category: 'Fruits', price: 95, quantity: 75, description: 'Sweet, seasonal Alphonso mangoes from local orchards.', location: 'Ratnagiri, Maharashtra' },
  { id: 'seed-4', farmerId: 'seed-farmer-4', farmerName: 'Sundar Fields', name: 'Fresh Spinach', category: 'Leafy Greens', price: 28, quantity: 210, description: 'Tender leafy greens packed on the day of harvest.', location: 'Bengaluru, Karnataka' },
];

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function go(route) {
  window.location.hash = route;
}

function seedData() {
  const users = read(KEYS.users, []);
  if (!users.some((user) => user.role === 'admin')) write(KEYS.users, [ADMIN, ...users]);
  if (!localStorage.getItem(KEYS.products)) write(KEYS.products, SEED_PRODUCTS);
  if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, []);
}

function App() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'home');
  const [session, setSession] = useState(() => read(KEYS.session, null));

  useEffect(() => {
    seedData();
    const onHashChange = () => setRoute(window.location.hash.slice(1) || 'home');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function login(user) {
    write(KEYS.session, user);
    setSession(user);
    go(`${user.role}-dashboard`);
  }

  function logout() {
    localStorage.removeItem(KEYS.session);
    setSession(null);
    setRoute('home');
    go('home');
  }

  if (session) {
    const expected = `${session.role}-dashboard`;
    if (route === 'home' || route.endsWith('-login') || route === 'signup') {
      return <Redirect route={expected} />;
    }
    if (route === expected) return <Dashboard session={session} onLogout={logout} />;
    return <AccessDenied route={expected} />;
  }

  if (route === 'login' || route === 'admin-login' || route === 'signup') {
    return <AuthPage mode={route} onLogin={login} />;
  }
  return <LandingPage />;
}

function Redirect({ route }) {
  useEffect(() => go(route), [route]);
  return <Loading />;
}

function Loading() {
  return <main className="centered"><div className="loading">Opening FARMER CONNECT…</div></main>;
}

function LandingPage() {
  return (
    <main className="landing">
      <header className="landing-nav">
        <Brand />
        <nav><button className="nav-link" onClick={() => go('home')}>Home</button><button className="nav-link" onClick={() => go('login')}>Login</button><button className="button primary small" onClick={() => go('signup')}>Join FARMER CONNECT</button></nav>
      </header>
      <section className="landing-hero">
        <div className="hero-copy"><p className="eyebrow">Direct farm-to-market platform</p><h1>Better connections.<br /><em>Fairer harvests.</em></h1><p className="hero-lead">FARMER CONNECT helps farmers sell directly to buyers, discover fair prices, and grow their businesses without unnecessary middlemen.</p><div className="hero-actions"><button className="button primary" onClick={() => go('signup')}>Create an account <span>→</span></button><button className="button outline" onClick={() => go('login')}>Sign in</button></div></div>
        <div className="hero-illustration" aria-label="Agriculture illustration"><div className="sun" /><div className="field field-one" /><div className="field field-two" /><div className="crop crop-one">🌾</div><div className="crop crop-two">🌱</div><div className="crop crop-three">🍅</div></div>
      </section>
      <section className="feature-grid"><Feature icon="🌾" title="For farmers" text="List products, manage stock, receive orders and track your sales." /><Feature icon="🛒" title="For buyers" text="Find local produce, compare details and place direct orders." /><Feature icon="🤝" title="Fair trade" text="Connect directly and keep pricing clear for everyone." /></section>
      <footer className="landing-footer">FARMER CONNECT · Academic demonstration project · React + Vite</footer>
    </main>
  );
}

function Brand() {
  return <div className="brand"><span className="brand-mark">FC</span><span>FARMER <b>CONNECT</b></span></div>;
}

function Feature({ icon, title, text }) {
  return <article className="feature-card"><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>;
}

function AuthPage({ mode, onLogin }) {
  const adminLogin = mode === 'admin-login';
  const signup = mode === 'signup';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const users = read(KEYS.users, [ADMIN]);
    const email = data.email.trim().toLowerCase();
    if (signup) {
      if (data.password.length < 6) return setError('Password must contain at least 6 characters.');
      if (users.some((user) => user.email.toLowerCase() === email)) return setError('This email is already registered.');
      const user = { id: `user-${Date.now()}`, name: data.name.trim(), email, password: data.password, role: data.role, location: data.location.trim() };
      write(KEYS.users, [...users, user]);
      setSuccess('Account created successfully. Opening your dashboard…');
      setTimeout(() => onLogin(user), 350);
      return;
    }
    const role = adminLogin ? 'admin' : data.role;
    const user = users.find((item) => item.email.toLowerCase() === email && item.password === data.password && item.role === role);
    if (!user) return setError('Incorrect email, password, or selected role.');
    onLogin(user);
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel"><Brand /><div className="auth-message"><p className="eyebrow">Welcome to FARMER CONNECT</p><h1>From your field to their table.</h1><p>One simple platform for local farmers and buyers to work directly together.</p><div className="auth-points"><span>✓ Direct product listings</span><span>✓ Clear prices and quantities</span><span>✓ Simple order tracking</span></div></div></section>
      <section className="auth-form-panel"><div className="auth-card"><p className="eyebrow">{adminLogin ? 'Admin module' : signup ? 'Create your account' : 'User module'}</p><h2>{adminLogin ? 'Admin login' : signup ? 'Join FARMER CONNECT' : 'Welcome back'}</h2><p className="muted">{adminLogin ? 'Access user, product and order management.' : signup ? 'Choose your role to get started.' : 'Login as a farmer or buyer.'}</p>
        <form className="form-stack" onSubmit={submit}>
          {signup && <><label>Full name<input name="name" required placeholder="e.g. Priya Nair" /></label><label>Location<input name="location" required placeholder="City, State" /></label></>}
          <label>Email address<input name="email" type="email" required placeholder={adminLogin ? 'admin@agriculture.com' : 'you@example.com'} /></label>
          <label>Password<input name="password" type="password" required minLength="4" placeholder="Enter your password" /></label>
          {!adminLogin && !signup && <label>Login as<select name="role"><option value="buyer">Buyer</option><option value="farmer">Farmer</option></select></label>}
          {signup && <label>I am a<select name="role"><option value="farmer">Farmer</option><option value="buyer">Buyer</option></select></label>}
          {error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}
          <button className="button primary" type="submit">{signup ? 'Create account' : 'Login'} <span>→</span></button>
        </form>
        {adminLogin && <div className="demo-note"><b>Default admin credentials</b><br />Email: admin@agriculture.com<br />Password: Admin@123</div>}
        <div className="auth-links">{!adminLogin && <><span>{signup ? 'Already registered?' : 'New to FARMER CONNECT?'}</span><button className="text-button" onClick={() => go(signup ? 'login' : 'signup')}>{signup ? 'User login' : 'Create account'}</button></>}{!signup && <button className="text-button" onClick={() => go(adminLogin ? 'login' : 'admin-login')}>{adminLogin ? 'User login →' : 'Admin login →'}</button>}{signup && <button className="text-button" onClick={() => go('admin-login')}>Admin login →</button>}</div>
        <p className="security-note">Local Storage authentication is for academic demonstration only, not production security.</p>
      </div></section>
    </main>
  );
}

function Dashboard({ session, onLogout }) {
  const [view, setView] = useState('overview');
  const [users, setUsers] = useState(() => read(KEYS.users, []));
  const [products, setProducts] = useState(() => read(KEYS.products, SEED_PRODUCTS));
  const [orders, setOrders] = useState(() => read(KEYS.orders, []));
  const isAdmin = session.role === 'admin';
  const isFarmer = session.role === 'farmer';

  function updateUsers(next) { setUsers(next); write(KEYS.users, next); }
  function updateProducts(next) { setProducts(next); write(KEYS.products, next); }
  function updateOrders(next) { setOrders(next); write(KEYS.orders, next); }

  const nav = isAdmin ? [['overview', 'Overview'], ['users', 'Users'], ['products', 'Products'], ['orders', 'Orders']] : isFarmer ? [['overview', 'Dashboard'], ['products', 'My products'], ['orders', 'Received orders']] : [['overview', 'Dashboard'], ['products', 'Browse products'], ['orders', 'My orders']];
  const title = isAdmin ? 'Admin dashboard' : isFarmer ? 'Farmer dashboard' : 'Buyer dashboard';
  return (
    <div className="dashboard-shell">
      <aside className="sidebar"><Brand /><p className="sidebar-label">{isAdmin ? 'Admin module' : 'User module'}</p><nav className="side-nav">{nav.map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}><span>{iconFor(key)}</span>{label}</button>)}</nav><div className="sidebar-bottom"><p>Direct trade, stronger farms.</p><button className="logout-link" onClick={onLogout}>↪ Log out</button></div></aside>
      <main className="dashboard-main"><header className="dashboard-header"><div className="mobile-brand"><Brand /></div><div><p className="eyebrow">{isAdmin ? 'Admin module' : isFarmer ? 'Farmer module' : 'Buyer module'}</p><h1>{title}</h1></div><div className="account-chip"><div><b>{session.name}</b><small>{isAdmin ? 'Administrator' : isFarmer ? 'Farmer' : 'Buyer'}</small></div><button className="avatar" onClick={onLogout} title="Log out">{session.name[0].toUpperCase()}</button></div></header>
        <section className="dashboard-content">{view === 'overview' && <Overview session={session} users={users} products={products} orders={orders} setView={setView} />}{view === 'users' && isAdmin && <AdminUsers users={users} onUpdate={updateUsers} />}{view === 'products' && <ProductView session={session} products={products} onUpdate={updateProducts} onOrder={(order) => updateOrders([order, ...orders])} />}{view === 'orders' && <OrderView session={session} products={products} orders={orders} onUpdate={updateOrders} />}</section>
      </main>
    </div>
  );
}

function iconFor(key) {
  return { overview: '⌂', users: '♙', products: '▦', orders: '↗' }[key] || '•';
}

function Overview({ session, users, products, orders, setView }) {
  const isAdmin = session.role === 'admin';
  const isFarmer = session.role === 'farmer';
  const ownProducts = products.filter((product) => product.farmerId === session.id);
  const ownOrders = isFarmer ? orders.filter((order) => ownProducts.some((product) => product.id === order.productId)) : orders.filter((order) => order.buyerId === session.id);
  const sales = orders.filter((order) => ownProducts.some((product) => product.id === order.productId)).reduce((sum, order) => sum + order.total, 0);
  const stats = isAdmin ? [['Registered users', users.filter((user) => user.role !== 'admin').length], ['Farmers', users.filter((user) => user.role === 'farmer').length], ['Buyers', users.filter((user) => user.role === 'buyer').length], ['Listed products', products.length], ['All orders', orders.length]] : isFarmer ? [['My products', ownProducts.length], ['Orders received', ownOrders.length], ['Total sales', `₹${sales}`]] : [['Available products', products.filter((product) => product.quantity > 0).length], ['My orders', ownOrders.length], ['Account role', 'Buyer']];
  return <><section className="welcome-banner"><div><p className="eyebrow">{isAdmin ? 'Platform overview' : 'Welcome back'}</p><h2>{isAdmin ? 'Keep FARMER CONNECT growing.' : isFarmer ? 'Your farm, your customers.' : 'Find fresh produce near you.'}</h2><p>{isAdmin ? 'Manage every part of the direct agriculture marketplace from one place.' : isFarmer ? 'Add products and keep track of the orders coming from buyers.' : 'Browse products listed directly by local farmers.'}</p></div><span className="banner-art">🌿</span></section><section className="stats-row">{stats.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><section className="quick-grid">{!isAdmin && <article className="content-card quick-card"><span className="feature-icon">{isFarmer ? '➕' : '🛒'}</span><h3>{isFarmer ? 'Add a product' : 'Browse products'}</h3><p>{isFarmer ? 'List your next crop with price, stock and location.' : 'Search by name or filter by category.'}</p><button className="button primary small" onClick={() => setView('products')}>{isFarmer ? 'Add product' : 'View marketplace'} →</button></article>}<article className="content-card quick-card"><span className="feature-icon">📋</span><h3>{isAdmin ? 'Review activity' : isFarmer ? 'Track received orders' : 'Check order history'}</h3><p>{isAdmin ? 'See all users, products and order records.' : 'Review your latest orders and their status.'}</p><button className="button outline small" onClick={() => setView(isAdmin ? 'users' : 'orders')}>Open records →</button></article></section></>;
}

function AdminUsers({ users, onUpdate }) {
  const people = users.filter((user) => user.role !== 'admin');
  function removeUser(id) {
    if (!window.confirm('Remove this registered user?')) return;
    onUpdate(users.filter((user) => user.id !== id));
  }
  return <section className="content-card"><CardHeading title="Registered users" text="View and manage all farmer and buyer accounts." badge="Admin only" />{people.length ? <DataTable headers={['Name', 'Email', 'Role', 'Location', 'Action']} rows={people.map((user) => [<b key="name">{user.name}</b>, user.email, <span className="pill" key="role">{user.role}</span>, user.location, <button className="table-action danger-text" key="action" onClick={() => removeUser(user.id)}>Remove</button>])} /> : <Empty text="No farmers or buyers have registered yet." />}</section>;
}

function ProductView({ session, products, onUpdate, onOrder }) {
  const isFarmer = session.role === 'farmer';
  const isAdmin = session.role === 'admin';
  const canManage = isFarmer || isAdmin;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const categories = [...new Set(products.map((product) => product.category))];
  const visible = products.filter((product) => (!isFarmer || product.farmerId === session.id) && product.name.toLowerCase().includes(search.toLowerCase()) && (category === 'All' || product.category === category));
  function saveProduct(data) {
    const product = { ...data, id: editing?.id || `product-${Date.now()}`, farmerId: editing?.farmerId || session.id, farmerName: editing?.farmerName || session.name, price: Number(data.price), quantity: Number(data.quantity) };
    onUpdate(editing ? products.map((item) => item.id === editing.id ? product : item) : [product, ...products]);
    setEditing(null);
  }
  function deleteProduct(id) {
    if (window.confirm('Delete this product listing?')) onUpdate(products.filter((product) => product.id !== id));
  }
  function orderProduct(product) {
    if (product.quantity < 1) return;
    onOrder({ id: `order-${Date.now()}`, productId: product.id, productName: product.name, farmerId: product.farmerId, buyerId: session.id, buyerName: session.name, quantity: 1, total: product.price, status: 'Pending', date: new Date().toLocaleDateString() });
    onUpdate(products.map((item) => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
    setSelected(null);
  }
  if (isFarmer && editing !== null) return <ProductForm initial={editing || null} onSave={saveProduct} onCancel={() => setEditing(null)} />;
  return <section><div className="section-heading"><div><p className="eyebrow">{isFarmer ? 'Your listings' : isAdmin ? 'Platform catalogue' : 'Marketplace'}</p><h2>{isFarmer ? 'My agricultural products' : isAdmin ? 'All agricultural products' : 'Browse available products'}</h2><p className="muted">{isFarmer ? 'Add, edit or remove your own product listings.' : isAdmin ? 'Review and manage every product listed by farmers.' : 'Products listed directly by FARMER CONNECT farmers.'}</p></div>{isFarmer && <button className="button primary" onClick={() => setEditing({})}>+ Add product</button>}</div>{!isFarmer && <div className="filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products by name…" /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>}<div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} isFarmer={isFarmer} isAdmin={isAdmin} onView={() => setSelected(product)} onEdit={() => setEditing(product)} onDelete={() => deleteProduct(product.id)} onOrder={() => orderProduct(product)} />)}</div>{!visible.length && <Empty text={isFarmer ? 'You have not listed any products yet.' : 'No products match your search.'} />}{selected && <ProductModal product={selected} allowOrder={!isAdmin} onClose={() => setSelected(null)} onOrder={() => orderProduct(selected)} />}</section>;
}

function ProductCard({ product, isFarmer, isAdmin, onView, onEdit, onDelete, onOrder }) {
  const canManage = isFarmer || isAdmin;
  return <article className="product-card"><div className="product-image">{product.category === 'Fruits' ? '🥭' : product.category === 'Grains' ? '🌾' : product.category === 'Leafy Greens' ? '🥬' : '🍅'}</div><div className="product-body"><span className="pill">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><small>By {product.farmerName} · {product.location}</small><div className="product-bottom"><b>₹{product.price}<small> / unit</small></b><span>{product.quantity} available</span></div><button className="button outline full" onClick={onView}>View details</button>{canManage ? <div className="button-row">{isFarmer && <button className="button secondary small" onClick={onEdit}>Edit</button>}<button className="button danger small" onClick={onDelete}>Delete</button></div> : <button className="button primary full" disabled={!product.quantity} onClick={onOrder}>{product.quantity ? 'Place order' : 'Out of stock'}</button>}</div></article>;
}

function ProductForm({ initial, onSave, onCancel }) {
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (Number(data.price) <= 0 || Number(data.quantity) < 0) return setError('Price must be positive and quantity cannot be negative.');
    onSave(data);
  }
  return <section className="content-card form-card-wide"><div className="section-heading"><div><p className="eyebrow">Farmer module</p><h2>{initial?.id ? 'Edit product' : 'Add agricultural product'}</h2><p className="muted">Share clear details so buyers can make informed choices.</p></div></div><form className="product-form" onSubmit={submit}><label>Product name<input name="name" required defaultValue={initial?.name || ''} placeholder="e.g. Organic onions" /></label><label>Category<select name="category" defaultValue={initial?.category || 'Vegetables'}><option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Pulses</option><option>Leafy Greens</option><option>Other</option></select></label><label>Price per unit (₹)<input name="price" type="number" min="1" required defaultValue={initial?.price || ''} /></label><label>Available quantity<input name="quantity" type="number" min="0" required defaultValue={initial?.quantity || ''} /></label><label>Location<input name="location" required defaultValue={initial?.location || ''} placeholder="Village, district, state" /></label><label className="wide-field">Description<textarea name="description" rows="4" required defaultValue={initial?.description || ''} placeholder="Describe quality, harvest timing or packaging" /></label>{error && <p className="form-error wide-field">{error}</p>}<div className="button-row wide-field"><button type="button" className="button outline" onClick={onCancel}>Cancel</button><button className="button primary" type="submit">Save product</button></div></form></section>;
}

function ProductModal({ product, allowOrder, onClose, onOrder }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose}>×</button><div className="modal-image">🌱</div><p className="eyebrow">{product.category}</p><h2>{product.name}</h2><p>{product.description}</p><div className="detail-list"><span><small>Farmer</small><b>{product.farmerName}</b></span><span><small>Location</small><b>{product.location}</b></span><span><small>Price</small><b>₹{product.price} / unit</b></span><span><small>Available</small><b>{product.quantity} units</b></span></div>{allowOrder && <button className="button primary full" disabled={!product.quantity} onClick={onOrder}>{product.quantity ? 'Place order' : 'Out of stock'}</button>}</div></div>;
}

function OrderView({ session, products, orders, onUpdate }) {
  const ownProducts = products.filter((product) => product.farmerId === session.id);
  const visible = session.role === 'admin' ? orders : session.role === 'farmer' ? orders.filter((order) => ownProducts.some((product) => product.id === order.productId)) : orders.filter((order) => order.buyerId === session.id);
  function updateStatus(id, status) { onUpdate(orders.map((order) => order.id === id ? { ...order, status } : order)); }
  return <section className="content-card"><CardHeading title={session.role === 'admin' ? 'All orders' : session.role === 'farmer' ? 'Orders received' : 'My order history'} text={session.role === 'admin' ? 'Review every order placed on the platform.' : session.role === 'farmer' ? 'Track orders for your product listings.' : 'See the status of every order you have placed.'} badge={session.role === 'admin' ? 'Admin only' : 'Order records'} />{visible.length ? <DataTable headers={['Order', 'Product', session.role === 'farmer' ? 'Buyer' : 'Farmer', 'Qty', 'Total', 'Status', ...(session.role !== 'buyer' ? ['Action'] : [])]} rows={visible.map((order) => [order.id.slice(-8), <b key="product">{order.productName}</b>, session.role === 'farmer' ? order.buyerName : (products.find((product) => product.id === order.productId)?.farmerName || 'Farmer'), order.quantity, `₹${order.total}`, <span className={`status ${order.status.toLowerCase()}`} key="status">{order.status}</span>, ...(session.role !== 'buyer' ? [<select className="status-select" key="action" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}><option>Pending</option><option>Confirmed</option><option>Delivered</option></select>] : [])])} /> : <Empty text="No orders to show yet." />}</section>;
}

function CardHeading({ title, text, badge }) {
  return <div className="card-heading"><div><h2>{title}</h2><p className="muted">{text}</p></div><span className="pill">{badge}</span></div>;
}

function DataTable({ headers, rows }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Empty({ text }) {
  return <div className="empty-state">{text}</div>;
}

function AccessDenied({ route }) {
  return <main className="centered"><div className="auth-card"><p className="eyebrow">Access check</p><h2>Access denied</h2><p className="muted">This page is restricted to the correct signed-in role.</p><button className="button primary" onClick={() => go(route)}>Return to dashboard</button></div></main>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
