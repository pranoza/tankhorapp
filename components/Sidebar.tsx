
import React from 'react';

interface Props {
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ onLogout, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'میز کار هوشمند', icon: '💎' },
    { id: 'inventory', label: 'انبار و موجودی', icon: '🏭' },
    { id: 'orders', label: 'سفارشات فروش', icon: '🛒' },
    { id: 'products', label: 'مدیریت محصولات', icon: '📦' },
    { id: 'customers', label: 'لیست مشتریان', icon: '👥' },
    { id: 'settings', label: 'تنظیمات پنل', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo-area">
        <h1>تنخور</h1>
        <div style={{fontSize:'0.6rem', fontWeight:900, color: 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'2px', marginTop:'-8px'}}>SaaS Platform</div>
      </div>

      <nav className="nav-list">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
          >
            <span style={{fontSize:'1.4rem'}}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{padding:'1.5rem', borderTop:'1px solid var(--border)'}}>
        <button onClick={onLogout} className="nav-btn" style={{color:'var(--danger)', width:'100%'}}>
          <span>🚪</span>
          <span>خروج از پنل</span>
        </button>
      </div>
    </aside>
  );
};
