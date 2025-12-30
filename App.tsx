
import React, { useState, useEffect } from 'react';
import { directusApi } from './services/directus';
import { getAiInsights } from './services/gemini';
import { User, DashboardStats, Order, Product, InventoryItem } from './types';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Inventory } from './components/Inventory/Inventory';
import { Products } from './components/Products/Products';
import { Mail, Lock, Loader2 } from 'lucide-react';

import './components/Layout/Layout.css';
import './components/Auth/Auth.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0, totalOrders: 0, activeProducts: 0, customerSatisfaction: 100
  });
  const [aiInsight, setAiInsight] = useState<string>('درحال تحلیل داده‌های فروشگاه شما...');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await directusApi.getCurrentUser(token);
          setUser(userData);
          loadAppData(token, userData.id);
        } catch { handleLogout(); }
      }
      setIsAuthChecking(false);
    };
    initAuth();
  }, [token]);

  const loadAppData = async (authToken: string, userId: string) => {
    try {
      const myStores = await directusApi.getMyStores(authToken, userId);
      const storeIds = myStores.map(s => s.id);
      if (storeIds.length > 0) {
        const [prodList, orderList, invList] = await Promise.all([
          directusApi.getMyProducts(authToken, storeIds),
          directusApi.getMyOrders(authToken, storeIds),
          directusApi.getMyInventory(authToken, storeIds)
        ]);
        
        setProducts(prodList);
        setOrders(orderList);
        setInventory(invList);

        const totalRevenue = orderList.reduce((sum, o) => sum + (Number(o.order_total) || 0), 0);
        const currentStats = {
          totalSales: totalRevenue,
          totalOrders: orderList.length,
          activeProducts: prodList.length,
          customerSatisfaction: 99
        };
        setStats(currentStats);
        getAiInsights(currentStats).then(setAiInsight);
      }
    } catch (err) { console.error("App Data Loading Error:", err); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const res = await directusApi.login(email, password);
      localStorage.setItem('access_token', res.data.access_token);
      setToken(res.data.access_token);
    } catch (err: any) {
      alert('خطا در ورود: ' + err.message);
    } finally { setIsLoginLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  if (isAuthChecking) return <div className="auth-wrapper"><Loader2 className="spin" color="var(--primary)" size={48} /></div>;

  if (!token) return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1>تنخور</h1>
          <p style={{color:'#64748b', fontWeight:600}}>پنل مدیریت متمرکز فروشندگان</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>پست الکترونیک</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input className="tk-input-modern" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="example@mail.com" />
            </div>
          </div>
          <div className="input-group" style={{marginBottom:'2.5rem'}}>
            <label>رمز عبور</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input className="tk-input-modern" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
          </div>
          <button className="tk-btn tk-btn-primary" style={{width:'100%', height:'3.5rem', borderRadius:'1.25rem', fontSize:'1.1rem'}} disabled={isLoginLoading}>
            {isLoginLoading ? <Loader2 className="spin" /> : 'ورود به پنل مدیریت'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="main-content fade-in">
        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3rem'}}>
          <div>
            <h2 style={{fontSize:'1.8rem', fontWeight:900}}>سلام، {user?.first_name} 👋</h2>
            <p style={{color:'var(--text-muted)', marginTop:'0.25rem'}}>خوشحالیم که دوباره تو رو در پنل تنخور می‌بینیم.</p>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'1rem', background:'white', padding:'0.6rem 1.5rem', borderRadius:'1.5rem', border:'1px solid #f1f5f9'}}>
             <div style={{textAlign:'left'}}>
               <div style={{fontWeight:800, fontSize:'0.9rem'}}>{user?.first_name} {user?.last_name}</div>
               <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>{user?.email}</div>
             </div>
             <div style={{width:'42px', height:'42px', background:'linear-gradient(45deg, var(--primary), #818cf8)', color:'white', borderRadius:'1rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900}}>
                {user?.first_name?.[0]}
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard stats={stats} orders={orders} aiInsight={aiInsight} />}
        {activeTab === 'inventory' && <Inventory items={inventory} />}
        {activeTab === 'products' && <Products products={products} />}
        
        {['orders', 'customers', 'settings'].includes(activeTab) && (
          <div style={{textAlign:'center', padding:'8rem 0', background:'white', borderRadius:'2rem', border:'1px dashed #cbd5e1'}}>
            <div style={{fontSize:'4rem', marginBottom:'1.5rem'}}>⚙️</div>
            <h3 style={{fontWeight:900, color:'#64748b'}}>این بخش در حال اتصال به زیرساخت جدید است</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
