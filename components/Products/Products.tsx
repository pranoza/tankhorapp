
import React from 'react';
import { Product } from '../../types';
import { Plus, MoreVertical, Eye } from 'lucide-react';
import { directusApi } from '../../services/directus';
import './Products.css';

interface Props {
  products: Product[];
}

export const Products: React.FC<Props> = ({ products }) => {
  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">مدیریت محصولات</h2>
          <p className="section-subtitle">افزودن و ویرایش کالاهای فروشگاه شما</p>
        </div>
        <button className="tk-btn tk-btn-primary" style={{gap:'0.5rem'}}>
          <Plus size={20} /> محصول جدید
        </button>
      </div>

      <div className="products-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <div className="product-image-wrapper">
              <img src={directusApi.getFileUrl(p.product_image)} alt={p.product_name} />
              <div className="product-actions-overlay">
                <button className="overlay-btn"><Eye size={18} /></button>
              </div>
            </div>
            <div className="product-info">
              <div className="product-status-tag">{p.status === 'published' ? '✅ فعال' : '⏳ پیش‌نویس'}</div>
              <h4 className="product-name">{p.product_name}</h4>
              <div className="product-footer">
                <span className="product-price">{Number(p.product_price).toLocaleString()} <small>تومان</small></span>
                <button className="icon-btn"><MoreVertical size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
