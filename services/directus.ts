
import { AuthResponse, User, Store, Product, Order, InventoryItem } from '../types';

const DIRECTUS_URL = 'https://crm.tankhor.com';

export const directusApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || 'خطا در ورود به پنل');
    }

    return response.json();
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${DIRECTUS_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('نشست فعال یافت نشد');
    const { data } = await response.json();
    return data;
  },

  async getMyStores(token: string, userId: string): Promise<Store[]> {
    const response = await fetch(`${DIRECTUS_URL}/items/stores?filter[user_created][_eq]=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('خطا در دریافت فروشگاه‌ها');
    const { data } = await response.json();
    return data;
  },

  async getMyProducts(token: string, storeIds: number[]): Promise<Product[]> {
    if (storeIds.length === 0) return [];
    const query = new URLSearchParams({
      'filter[product_store][id][_in]': storeIds.join(','),
      'fields': 'id,status,product_name,product_price,product_image,product_store',
      'limit': '-1'
    });
    const response = await fetch(`${DIRECTUS_URL}/items/products?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const { data } = await response.json();
    return data;
  },

  async getMyInventory(token: string, storeIds: number[]): Promise<InventoryItem[]> {
    if (storeIds.length === 0) return [];
    const query = new URLSearchParams({
      'filter[parent_product][product_store][id][_in]': storeIds.join(','),
      'fields': 'id,status,inventory_price,inventory_stock,inventory_color.color_title,inventory_color.color_decimal,inventory_size.size_title,parent_product.product_name',
      'limit': '-1'
    });
    const response = await fetch(`${DIRECTUS_URL}/items/inventory?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const { data } = await response.json();
    return data;
  },

  async getMyOrders(token: string, storeIds: number[]): Promise<Order[]> {
    if (storeIds.length === 0) return [];
    const query = new URLSearchParams({
        'filter[order_items][item_store][id][_in]': storeIds.join(','),
        'fields': '*,user_created.first_name,user_created.last_name',
        'sort': '-date_created'
    });
    const response = await fetch(`${DIRECTUS_URL}/items/orders?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const { data } = await response.json();
    return data;
  },

  getFileUrl(fileId: string | null | undefined): string {
    if (!fileId) return 'https://placehold.co/400x400/f1f5f9/64748b?text=بدون+تصویر';
    return `${DIRECTUS_URL}/assets/${fileId}?width=400&height=400&fit=cover&quality=80`;
  }
};
