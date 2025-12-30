
import React from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import './Sidebar.css';

interface Props {
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ onLogout, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'میز کار هوشمند', icon: LayoutDashboard },
    { id: 'inventory', label: 'انبار و موجودی', icon: Warehouse },
    { id: 'orders', label: 'سفارشات فروش', icon: ShoppingCart },
    { id: 'products', label: 'مدیریت محصولات', icon: Package },
    { id: 'customers', label: 'لیست مشتریان', icon: Users },
    { id: 'settings', label: 'تنظیمات پنل', icon: Settings },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo-area">
        <h1>تنخور</h1>
        <div style={{fontSize:'0.65rem', fontWeight:800, color: 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginTop:'2px'}}>
          Seller SaaS Platform
        </div>
      </div>

      <nav className="nav-list">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" strokeWidth={2.5} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="nav-btn" style={{color:'var(--danger)'}}>
          <LogOut className="nav-icon" strokeWidth={2.5} />
          <span>خروج از حساب</span>
        </button>
      </div>
    </aside>
  );
};
