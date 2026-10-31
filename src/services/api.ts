import { Product, Order, AdminStats, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

// Local storage keys for resilient persistence
const CART_STORAGE_KEY = 'kampala_fresh_cart';
const RECENT_ORDERS_KEY = 'kampala_fresh_orders';

export const api = {
  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch from API');
      const data = await res.json();
      return data.products;
    } catch {
      // Fallback
      let filtered = [...INITIAL_PRODUCTS];
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category_id.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category_name.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      return data.product;
    } catch {
      return INITIAL_PRODUCTS.find(p => p.id === id || p.slug === id) || null;
    }
  },

  // Create Order
  async createOrder(orderPayload: any): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Could not place order' };
      }
      // Save order to recent orders cache
      saveRecentOrder(data.order);
      return { success: true, order: data.order };
    } catch {
      // Offline fallback: create simulated order
      const subtotal = orderPayload.items.reduce((acc: number, item: any) => {
        const prod = INITIAL_PRODUCTS.find(p => p.id === item.product_id);
        return acc + (prod ? prod.price_ugx * item.quantity : 0);
      }, 0);

      if (subtotal < 20000) {
        return {
          success: false,
          error: `Minimum order value is UGX 20,000. Your current total is UGX ${subtotal.toLocaleString()}. Add UGX ${(20000 - subtotal).toLocaleString()} more.`
        };
      }

      const orderNumber = `KF-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackOrder: Order = {
        id: 'ord_' + Date.now().toString(36),
        order_number: orderNumber,
        customer_name: orderPayload.customer_name,
        customer_phone: orderPayload.customer_phone,
        delivery_area: orderPayload.delivery_area,
        delivery_address: orderPayload.delivery_address,
        delivery_slot: orderPayload.delivery_slot,
        substitution_pref: orderPayload.substitution_pref || 'call_first',
        substitution_note: orderPayload.substitution_note || '',
        subtotal_ugx: subtotal,
        delivery_fee_ugx: 3000,
        total_ugx: subtotal + 3000,
        payment_method: orderPayload.payment_method,
        payment_status: 'pending',
        order_status: 'Received',
        items: orderPayload.items.map((i: any) => {
          const prod = INITIAL_PRODUCTS.find(p => p.id === i.product_id);
          return {
            product_id: i.product_id,
            product_name: prod ? prod.name : 'Grocery Item',
            price_ugx: prod ? prod.price_ugx : 0,
            quantity: i.quantity,
            unit: prod ? prod.unit : 'unit',
            line_total_ugx: (prod ? prod.price_ugx : 0) * i.quantity
          };
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      saveRecentOrder(fallbackOrder);
      return { success: true, order: fallbackOrder };
    }
  },

  // Get Order Tracking
  async getOrder(orderIdOrNumber: string): Promise<Order | null> {
    try {
      const res = await fetch(`/api/orders/${orderIdOrNumber}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      return data.order;
    } catch {
      const recent = getRecentOrders();
      const match = recent.find(o => o.id === orderIdOrNumber || o.order_number.toUpperCase() === orderIdOrNumber.toUpperCase());
      return match || null;
    }
  },

  // Payment Process / Retry
  async processPayment(orderId: string, payload: { action: string; phone_number?: string; provider?: string }): Promise<any> {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      if (payload.action === 'simulate_failure') {
        return {
          success: false,
          payment_status: 'failed',
          message: 'USSD prompt timed out on customer device. Please retry or choose Cash on Delivery.',
          can_retry: true
        };
      }
      return {
        success: true,
        payment_status: 'completed',
        payment_ref: 'MOMO-UG-DEMO' + Math.floor(100000 + Math.random() * 900000),
        message: 'Mobile money payment confirmed!'
      };
    }
  },

  // Admin Login
  async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      return await res.json();
    } catch {
      if (password === 'kampala2026') {
        return { success: true, token: 'offline_token' };
      }
      return { success: false, error: 'Incorrect password (Demo: kampala2026)' };
    }
  },

  // Admin Orders
  async getAdminOrders(): Promise<Order[]> {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.orders;
    } catch {
      return getRecentOrders();
    }
  },

  // Admin Update Status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      const orders = getRecentOrders();
      const ord = orders.find(o => o.id === orderId || o.order_number === orderId);
      if (ord) {
        ord.order_status = status;
        localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(orders));
      }
      return true;
    }
  },

  // Admin Update Product
  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  // Admin Stats
  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data.stats;
    } catch {
      const orders = getRecentOrders();
      const rev = orders.reduce((sum, o) => sum + o.total_ugx, 0);
      return {
        totalOrders: orders.length,
        todayOrders: orders.length,
        totalRevenue: rev,
        aov: orders.length > 0 ? Math.round(rev / orders.length) : 0,
        statusBreakdown: {
          Received: orders.filter(o => o.order_status === 'Received').length,
          Packing: orders.filter(o => o.order_status === 'Packing').length,
          'Out for delivery': orders.filter(o => o.order_status === 'Out for delivery').length,
          Delivered: orders.filter(o => o.order_status === 'Delivered').length,
        },
        productCount: INITIAL_PRODUCTS.length
      };
    }
  }
};

export function saveRecentOrder(order: Order) {
  try {
    const list = getRecentOrders();
    const filtered = list.filter(o => o.id !== order.id && o.order_number !== order.order_number);
    filtered.unshift(order);
    localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export function getRecentOrders(): Order[] {
  try {
    const raw = localStorage.getItem(RECENT_ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
