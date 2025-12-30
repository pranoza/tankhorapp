
import React from 'react';
import { InventoryItem } from '../../types';
import { Edit3, Package, AlertTriangle } from 'lucide-react';
import './Inventory.css';

interface Props {
  items: InventoryItem[];
}

export const Inventory: React.FC<Props> = ({ items }) => {
  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">مدیریت موجودی انبار</h2>
          <p className="section-subtitle">کنترل دقیق تعداد کالاها به تفکیک رنگ و سایز</p>
        </div>
      </div>

      <div className="tk-card no-padding overflow-hidden">
        <table className="tk-table">
          <thead>
            <tr>
              <th>نام محصول</th>
              <th>ویژگی‌ها</th>
              <th>قیمت (تومان)</th>
              <th>موجودی</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="product-name-cell">
                    <Package size={16} className="text-muted" />
                    <strong>{item.parent_product?.product_name}</strong>
                  </div>
                </td>
                <td>
                  <div className="variant-badges">
                    {item.inventory_color && (
                      <span className="badge-color" style={{backgroundColor: item.inventory_color.color_decimal}}>
                        {item.inventory_color.color_title}
                      </span>
                    )}
                    {item.inventory_size && (
                      <span className="badge-size">{item.inventory_size.size_title}</span>
                    )}
                  </div>
                </td>
                <td className="font-bold">{item.inventory_price.toLocaleString()}</td>
                <td>
                  <div className={`stock-status ${item.inventory_stock < 5 ? 'low-stock' : ''}`}>
                    {item.inventory_stock} عدد
                    {item.inventory_stock < 5 && <AlertTriangle size={14} />}
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${item.status}`}>
                    {item.status === 'published' ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td>
                  <button className="icon-btn hover-primary">
                    <Edit3 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
