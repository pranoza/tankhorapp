
import React, { useState, useEffect } from 'react';
import { directusApi } from './services/directus';
import { getAiInsights } from './services/gemini';
import { User, DashboardStats, Order, Store, Product, InventoryItem } from './types';
import { Sidebar } from './components/Sidebar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [productViewMode, setProductViewMode] = useState<'grid' | 'table'>('grid');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    customerSatisfaction: 100
  });
  const [aiInsight, setAiInsight] = useState<string>('درحال تحلیل داده‌های فروشگاه شما...');

  // Advanced Edit States
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<'general' | 'variants'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await directusApi.getCurrentUser(token);
          setUser(userData);
          loadAppData(token, userData.id);
        } catch {
          handleLogout();
        }
      }
      setIsAuthChecking(false);
    };
    initAuth();
  }, [token]);

  const loadAppData = async (authToken: string, userId: string) => {
    setIsDataLoading(true);
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

        const totalRevenue = orderList
          .filter(o => o.status === 'published')
          .reduce((sum, o) => sum + (Number(o.order_total) || 0), 0);

        const currentStats = {
          totalSales: totalRevenue,
          totalOrders: orderList.length,
          activeProducts: prodList.length,
          customerSatisfaction: 98
        };

        setStats(currentStats);
        const insight = await getAiInsights(currentStats);
        setAiInsight(insight);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !token) return;
    setIsSaving(true);
    try {
      await directusApi.updateProduct(token, editingProduct.id, {
          product_name: editingProduct.product_name,
          product_price: editingProduct.product_price,
          status: editingProduct.status,
          // Add other fields if needed: product_description, etc.
      });
      loadAppData(token, user!.id);
      setEditingProduct(null);
    } catch (err) {
      alert("خطا در ذخیره کالا");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateVariant = async (variantId: number, data: any) => {
    if (!token) return;
    try {
      await directusApi.updateInventory(token, variantId, data);
      // Refresh inventory state locally to show immediate change
      setInventory(prev => prev.map(inv => inv.id === variantId ? {...inv, ...data} : inv));
    } catch (err) {
      alert("خطا در بروزرسانی واریانت");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setErrorMsg(null);
    try {
      const res = await directusApi.login(email, password);
      const access_token = res.data.access_token;
      localStorage.setItem('access_token', access_token);
      const userData = await directusApi.getCurrentUser(access_token);
      setToken(access_token);
      setUser(userData);
      loadAppData(access_token, userData.id);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'ناموجود', color: '#ef4444', bg: '#fef2f2' };
    if (stock <= 5) return { label: 'رو به اتمام', color: '#f59e0b', bg: '#fffbeb' };
    return { label: 'موجود', color: '#10b981', bg: '#f0fdf4' };
  };

  if (isAuthChecking) {
    return (
      <div className="auth-wrapper">
        <div className="loading-pulse"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="tk-card auth-card fade-in">
          <header style={{textAlign:'center', marginBottom:'3rem'}}>
            <h1 style={{fontSize:'3.5rem', color:'var(--primary)', fontWeight:900, marginBottom:'0.5rem'}}>تنخور</h1>
            <p style={{color:'var(--text-muted)', fontWeight:500}}>پنل مدیریت هوشمند فروشگاه</p>
          </header>
          
          {errorMsg && <div style={{padding:'1rem', background:'#fef2f2', color:'var(--danger)', borderRadius:'0.75rem', marginBottom:'1.5rem', fontSize:'0.85rem', fontWeight:700, border:'1px solid #fee2e2'}}>⚠️ {errorMsg}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-container">
              <label>پست الکترونیک</label>
              <input className="tk-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="manager@tankhor.com" />
            </div>
            <div className="input-container" style={{marginBottom:'2.5rem'}}>
              <label>رمز عبور</label>
              <input className="tk-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button className="tk-btn tk-btn-primary" style={{width:'100%'}} disabled={isLoginLoading}>
              {isLoginLoading ? 'درحال بررسی...' : 'ورود به حساب کاربری'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="main-content fade-in">
        <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3rem'}}>
          <div>
            <h2 style={{fontSize:'2.25rem', fontWeight:900}}>سلام، {user?.first_name} 👋</h2>
            <p style={{color:'var(--text-muted)', marginTop:'0.25rem'}}>به میز کار هوشمند تنخور خوش آمدید.</p>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'1rem', background:'white', padding:'0.5rem 1.5rem', borderRadius:'100px', border:'1px solid var(--border)'}}>
             <div style={{textAlign:'left'}}>
               <div style={{fontWeight:900, fontSize:'0.95rem'}}>{user?.first_name} {user?.last_name}</div>
               <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>مدیر ارشد</div>
             </div>
             <div style={{width:'45px', height:'45px', background:'var(--primary)', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'1.2rem'}}>
                {user?.first_name?.[0]}
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div>
            <div className="ai-banner">
               <div style={{fontSize:'4.5rem', background:'rgba(255,255,255,0.2)', padding:'1rem', borderRadius:'2rem', backdropFilter:'blur(10px)'}}>🤖</div>
               <div>
                 <h3 style={{fontSize:'1.75rem', fontWeight:900, marginBottom:'0.5rem'}}>تحلیل هوش مصنوعی تنخور</h3>
                 <p style={{fontSize:'1.2rem', opacity:0.95, lineHeight:1.8, maxWidth:'800px'}}>"{aiInsight}"</p>
               </div>
            </div>

            <div className="stats-grid">
              <div className="tk-card stat-card-body">
                <span className="stat-label">فروش کل (تومان)</span>
                <span className="stat-value">{stats.totalSales.toLocaleString()}</span>
              </div>
              <div className="tk-card stat-card-body">
                <span className="stat-label">سفارشات جدید</span>
                <span className="stat-value">{stats.totalOrders}</span>
              </div>
              <div className="tk-card stat-card-body">
                <span className="stat-label">محصولات فعال</span>
                <span className="stat-value">{stats.activeProducts}</span>
              </div>
              <div className="tk-card stat-card-body">
                <span className="stat-label">شاخص رضایت</span>
                <span className="stat-value" style={{color:'var(--success)'}}>{stats.customerSatisfaction}٪</span>
              </div>
            </div>

            <div className="tk-card" style={{padding:'0', overflow:'hidden'}}>
              <div style={{padding:'1.5rem 2rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <h3 style={{fontWeight:900, fontSize:'1.25rem'}}>سفارشات اخیر</h3>
                 <button className="tk-btn" style={{color:'var(--primary)', fontWeight:800}}>نمایش همه</button>
              </div>
              <table className="tk-table">
                <thead>
                  <tr>
                    <th>کد سفارش</th>
                    <th>نام مشتری</th>
                    <th>مبلغ نهایی</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.slice(0, 6).map(o => (
                    <tr key={o.id}>
                      <td style={{fontWeight:800, color: 'var(--primary)'}}>#{o.id}</td>
                      <td>{o.user_created?.first_name || 'کاربر سیستم'}</td>
                      <td style={{fontWeight:900}}>{Number(o.order_total).toLocaleString()}</td>
                      <td><span style={{background:'#dcfce7', color:'#166534', padding:'0.35rem 1rem', borderRadius:'100px', fontSize:'0.75rem', fontWeight:800}}>تکمیل شده</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} style={{padding:'4rem', textAlign:'center', color:'var(--text-muted)'}}>داده‌ای برای نمایش وجود ندارد.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3rem'}}>
              <h3 style={{fontSize:'2rem', fontWeight:900}}>مدیریت انبار و واریانت‌ها</h3>
              <div style={{display:'flex', gap:'1rem'}}>
                <button className="tk-btn" style={{background:'white', border:'1px solid var(--border)'}}>📤 خروجی اکسل</button>
                <button className="tk-btn tk-btn-primary">📦 بروزرسانی موجودی</button>
              </div>
            </div>

            <div className="tk-card" style={{padding:'0', overflow:'hidden'}}>
              <table className="tk-table">
                <thead>
                  <tr>
                    <th>نام محصول</th>
                    <th>رنگ</th>
                    <th>سایز</th>
                    <th>قیمت فروش (تومان)</th>
                    <th>موجودی</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length > 0 ? inventory.map(item => {
                    const status = getStockStatus(item.inventory_stock);
                    return (
                      <tr key={item.id}>
                        <td style={{fontWeight:800}}>{item.parent_product?.product_name || 'محصول تکی'}</td>
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                            <div style={{width:'16px', height:'16px', borderRadius:'50%', background:item.inventory_color?.color_decimal || '#ccc', border:'1px solid var(--border)'}}></div>
                            <span>{item.inventory_color?.color_title}</span>
                          </div>
                        </td>
                        <td><span style={{fontWeight:800, background:'#f1f5f9', padding:'4px 10px', borderRadius:'6px'}}>{item.inventory_size?.size_title || '-'}</span></td>
                        <td style={{fontWeight:900, color:'var(--primary)'}}>{Number(item.inventory_price).toLocaleString()}</td>
                        <td style={{fontWeight:900}}>{item.inventory_stock}</td>
                        <td>
                          <span style={{
                            background: status.bg, 
                            color: status.color, 
                            padding:'0.4rem 1rem', 
                            borderRadius:'100px', 
                            fontSize:'0.75rem', 
                            fontWeight:800
                          }}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                           <button onClick={() => {
                             const parent = products.find(p => p.product_name === item.parent_product?.product_name);
                             if (parent) {
                               setEditingProduct(parent);
                               setActiveEditTab('variants');
                             }
                           }} className="tk-btn" style={{padding:'0.5rem', background:'var(--primary-light)', color:'var(--primary)'}}>⚙️ مدیریت واریانت</button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={7} style={{padding:'6rem', textAlign:'center', color:'var(--text-muted)'}}>واریانتی یافت نشد.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3rem'}}>
              <h3 style={{fontSize:'2rem', fontWeight:900}}>مدیریت محصولات</h3>
              <div style={{display:'flex', gap:'1rem'}}>
                <div style={{display:'flex', background:'white', borderRadius:'0.75rem', padding:'0.25rem', border:'1px solid var(--border)'}}>
                    <button onClick={() => setProductViewMode('grid')} className={`tk-btn ${productViewMode === 'grid' ? 'tk-btn-primary' : ''}`} style={{padding:'0.5rem 1rem', borderRadius:'0.5rem'}}>🖼️ کارتی</button>
                    <button onClick={() => setProductViewMode('table')} className={`tk-btn ${productViewMode === 'table' ? 'tk-btn-primary' : ''}`} style={{padding:'0.5rem 1rem', borderRadius:'0.5rem'}}>📋 جدولی</button>
                </div>
                <button className="tk-btn tk-btn-primary">➕ محصول جدید</button>
              </div>
            </div>
            
            {productViewMode === 'grid' ? (
              <div className="product-grid">
                {products.length > 0 ? products.map(p => (
                  <div key={p.id} className="tk-card product-item">
                    <div className="product-img-box">
                      <img src={directusApi.getFileUrl(p.product_image)} alt={p.product_name} />
                    </div>
                    <div className="product-details">
                      <h4 style={{fontWeight:900, fontSize:'1.15rem', marginBottom:'0.5rem'}}>{p.product_name}</h4>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:'1rem', marginTop:'1rem'}}>
                        <span className="product-price">{Number(p.product_price).toLocaleString()} <span style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>تومان</span></span>
                        <button onClick={() => { setEditingProduct(p); setActiveEditTab('general'); }} className="tk-btn" style={{padding:'0.5rem 1rem', background:'var(--primary-light)', color:'var(--primary)'}}>✏️ ویرایش کامل</button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{gridColumn:'1/-1', textAlign:'center', padding:'8rem 0'}}>کالایی یافت نشد.</div>
                )}
              </div>
            ) : (
                <div className="tk-card" style={{padding:'0', overflow:'hidden'}}>
                    <table className="tk-table">
                        <thead>
                            <tr>
                                <th>تصویر</th>
                                <th>نام محصول</th>
                                <th>قیمت اصلی</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td><img src={directusApi.getFileUrl(p.product_image)} style={{width:'50px', height:'50px', borderRadius:'8px', objectFit:'cover'}} /></td>
                                    <td style={{fontWeight:800}}>{p.product_name}</td>
                                    <td style={{fontWeight:900}}>{Number(p.product_price).toLocaleString()}</td>
                                    <td>
                                      <span style={{
                                        background: p.status === 'published' ? '#dcfce7' : '#f1f5f9',
                                        color: p.status === 'published' ? '#166534' : '#64748b',
                                        padding:'0.25rem 0.75rem', borderRadius:'100px', fontSize:'0.7rem', fontWeight:800
                                      }}>
                                        {p.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                                      </span>
                                    </td>
                                    <td>
                                        <button onClick={() => { setEditingProduct(p); setActiveEditTab('general'); }} className="tk-btn" style={{padding:'0.4rem 1rem', background:'var(--primary-light)', color:'var(--primary)'}}>✏️ ویرایش</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        )}

        {/* Unified Product & Inventory Edit Modal */}
        {editingProduct && (
          <div className="modal-overlay">
            <div className="tk-card modal-content fade-in" style={{maxWidth: activeEditTab === 'variants' ? '900px' : '600px', width: '95%'}}>
              <header style={{marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'1rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h3 style={{fontSize:'1.5rem', fontWeight:900}}>مدیریت محصول: {editingProduct.product_name}</h3>
                  <button onClick={() => setEditingProduct(null)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'var(--text-muted)'}}>✕</button>
                </div>
                
                {/* Modal Tabs */}
                <div style={{display:'flex', gap:'1.5rem', marginTop:'1.5rem'}}>
                  <button 
                    onClick={() => setActiveEditTab('general')}
                    className={`edit-tab-btn ${activeEditTab === 'general' ? 'active' : ''}`}
                  >
                    📝 اطلاعات پایه
                  </button>
                  <button 
                    onClick={() => setActiveEditTab('variants')}
                    className={`edit-tab-btn ${activeEditTab === 'variants' ? 'active' : ''}`}
                  >
                    📦 انبار و واریانت‌ها
                  </button>
                </div>
              </header>

              <div className="modal-body" style={{maxHeight:'65vh', overflowY:'auto', padding:'0.5rem'}}>
                {activeEditTab === 'general' ? (
                  <form onSubmit={handleUpdateProduct}>
                    <div className="edit-form-grid">
                      <div className="input-container">
                        <label>نام محصول</label>
                        <input className="tk-input" value={editingProduct.product_name} onChange={e => setEditingProduct({...editingProduct, product_name: e.target.value})} required />
                      </div>
                      <div className="input-container">
                        <label>قیمت اصلی کالا (تومان)</label>
                        <input className="tk-input" type="number" value={editingProduct.product_price} onChange={e => setEditingProduct({...editingProduct, product_price: e.target.value})} required />
                      </div>
                      <div className="input-container">
                        <label>وضعیت نمایش</label>
                        <select className="tk-input" value={editingProduct.status} onChange={e => setEditingProduct({...editingProduct, status: e.target.value})}>
                          <option value="published">انتشار عمومی</option>
                          <option value="draft">پیش‌نویس (مخفی)</option>
                          <option value="archived">بایگانی شده</option>
                        </select>
                      </div>
                      <div className="input-container">
                        <label>شناسه تصویر (UUID)</label>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                          <input className="tk-input" value={editingProduct.product_image || ''} onChange={e => setEditingProduct({...editingProduct, product_image: e.target.value})} placeholder="UUID تصویر..." />
                          <div style={{width:'45px', height:'45px', borderRadius:'8px', overflow:'hidden', border:'1px solid var(--border)'}}>
                             <img src={directusApi.getFileUrl(editingProduct.product_image)} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{display:'flex', gap:'1rem', marginTop:'2rem'}}>
                      <button type="submit" className="tk-btn tk-btn-primary" style={{flex:2}} disabled={isSaving}>
                        {isSaving ? 'درحال ذخیره...' : '✅ بروزرسانی کالا'}
                      </button>
                      <button type="button" onClick={() => setEditingProduct(null)} className="tk-btn" style={{flex:1, background:'#f1f5f9'}}>انصراف</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div style={{marginBottom:'1rem', padding:'1rem', background:'var(--primary-light)', borderRadius:'0.75rem', color:'var(--primary)', fontSize:'0.85rem', fontWeight:700}}>
                      💡 در این بخش می‌توانید قیمت و موجودی دقیق هر ترکیب (رنگ/سایز) را مدیریت کنید.
                    </div>
                    <table className="tk-table" style={{fontSize:'0.9rem'}}>
                      <thead>
                        <tr>
                          <th>مشخصات</th>
                          <th>قیمت اختصاصی</th>
                          <th>موجودی</th>
                          <th>عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.filter(inv => inv.parent_product?.product_name === editingProduct.product_name).length > 0 ? (
                          inventory.filter(inv => inv.parent_product?.product_name === editingProduct.product_name).map(inv => (
                            <tr key={inv.id}>
                              <td>
                                <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                  <div style={{width:'14px', height:'14px', borderRadius:'50%', background:inv.inventory_color?.color_decimal || '#ccc'}}></div>
                                  <span>{inv.inventory_color?.color_title}</span>
                                  <span style={{fontWeight:900, background:'#e2e8f0', padding:'2px 6px', borderRadius:'4px'}}>{inv.inventory_size?.size_title}</span>
                                </div>
                              </td>
                              <td>
                                <input 
                                  className="tk-input" 
                                  type="number" 
                                  defaultValue={inv.inventory_price} 
                                  onBlur={(e) => handleUpdateVariant(inv.id, { inventory_price: Number(e.target.value) })}
                                  style={{padding:'0.4rem', fontSize:'0.8rem', width:'120px'}}
                                />
                              </td>
                              <td>
                                <input 
                                  className="tk-input" 
                                  type="number" 
                                  defaultValue={inv.inventory_stock} 
                                  onBlur={(e) => handleUpdateVariant(inv.id, { inventory_stock: Number(e.target.value) })}
                                  style={{padding:'0.4rem', fontSize:'0.8rem', width:'80px'}}
                                />
                              </td>
                              <td>
                                <span style={{fontSize:'1.2rem'}}>💾</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} style={{textAlign:'center', padding:'3rem'}}>واریانتی برای این محصول ثبت نشده است.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {['customers', 'settings'].includes(activeTab) && (
          <div style={{textAlign:'center', padding:'10rem 0'}}>
            <div style={{fontSize:'6rem', marginBottom:'1.5rem'}}>🚧</div>
            <h3 style={{fontWeight:900, fontSize:'1.75rem'}}>این بخش در حال اتصال به دایرکتوس است</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
