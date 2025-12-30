
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  data: {
    access_token: string;
    expires: number;
    refresh_token: string;
  };
}

export interface Store {
  id: number;
  store_name: string;
  store_title: string;
  status: string;
  store_logo?: string;
  user_created: string;
}

export interface Product {
  id: number;
  product_name: string;
  product_price: string;
  status: string;
  product_store: number;
  product_image?: string;
}

export interface InventoryItem {
  id: number;
  status: string;
  inventory_price: number;
  inventory_stock: number;
  inventory_color?: {
    color_title: string;
    color_decimal: string;
  };
  inventory_size?: {
    size_title: string;
  };
  parent_product?: {
    product_name: string;
  };
}

export interface Order {
  id: number;
  status: string;
  order_total: string | number;
  date_created: string;
  user_created?: {
    first_name: string;
    last_name: string;
  };
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  activeProducts: number;
  customerSatisfaction: number;
}
