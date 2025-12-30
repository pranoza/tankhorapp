
import React from 'react';
import { Sparkles, TrendingUp, ShoppingBag, Box, Heart, ArrowRight } from 'lucide-react';
import './Dashboard.css';
import { DashboardStats, Order } from '../../types';

interface Props {
  stats: DashboardStats;
  orders: Order[];
  aiInsight: string;
}

export const Dashboard: React.FC<Props> = ({ stats, orders, aiInsight }) => {
  return (
    <div className="fade-in">
      <div className="ai-banner-modern">
        <div className="ai-icon-box">
          <Sparkles size={40} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 style={{fontSize:'1.5rem', fontWeight:900, marginBottom:'0.5rem'}}>دستیار هوشمند تنخور</h3>
          <p style={{fontSize:'1.1rem', opacity:0.95, lineHeight:1.7, maxWidth:'700px'}}>{aiInsight}</p>
        </div>
      </div>

      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <div className="stat-header">
            <span>فروش کل</span>
            <TrendingUp size={18} color="var(--primary)" />
          </div>
          <div style={{fontSize:'1.75rem', fontWeight:900}}>{stats.totalSales.toLocaleString()} <small style={{fontSize:'0.8rem'}}>تومان</small></div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span>سفارشات</span>
            <ShoppingBag size={18} color="#f59e0b" />
          </div>
          <div style={{fontSize:'1.75rem', fontWeight:900}}>{stats.totalOrders}</div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span>کالاهای فعال</span>
            <Box size={18} color="#10b981" />
          </div>
          <div style={{fontSize:'1.75rem', fontWeight:900}}>{stats.activeProducts}</div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-header">
            <span>رضایت مشتری</span>
            <Heart size={18} color="#ef4444" />
          </div>
          <div style={{fontSize:'1.75rem', fontWeight:900, color:'#ef4444'}}>{stats.customerSatisfaction}٪</div>
        </div>
      </div>

      <div className="tk-card" style={{padding:'0', overflow:'hidden', borderRadius:'2rem'}}>
        <div style={{padding:'1.5rem 2rem', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
           <h3 style={{fontWeight:900, fontSize:'1.2rem'}}>آخرین تراکنش‌ها</h3>
           <button className="tk-btn" style={{color:'var(--primary)', fontSize:'0.85rem'}}>
             مشاهده همه <ArrowRight size={16} />
           </button>
        </div>
        <table className="tk-table">
          <thead>
            <tr>
              <th>کد سفارش</th>
              <th>نام مشتری</th>
              <th>مبلغ</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.slice(0, 5).map(o => (
              <tr key={o.id}>
                <td style={{fontWeight:800, color: 'var(--primary)'}}>#{o.id}</td>
                <td style={{fontWeight:600}}>{o.user_created?.first_name || 'کاربر مهمان'}</td>
                <td style={{fontWeight:900}}>{Number(o.order_total).toLocaleString()}</td>
                <td><span style={{background:'#dcfce7', color:'#166534', padding:'0.4rem 1rem', borderRadius:'1rem', fontSize:'0.7rem', fontWeight:800}}>موفق</span></td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{padding:'4rem', textAlign:'center', color:'var(--text-muted)'}}>داده‌ای ثبت نشده است.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
