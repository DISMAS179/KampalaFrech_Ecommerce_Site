export type CategoryId = 'all' | 'vegetables' | 'fruit' | 'staples' | 'dairy' | 'meat-and-fish';

export interface Product {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  price_ugx: number;
  unit: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity: number;
  is_featured: boolean;
  image_url: string;
  origin: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliverySlot = 'morning' | 'afternoon' | 'evening';
export type SubstitutionPref = 'call_first' | 'replace_similar' | 'skip_item';
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'cash_on_delivery';
export type OrderStatus = 'Received' | 'Packing' | 'Out for delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  product_id: string;
  product_name: string;
  price_ugx: number;
  quantity: number;
  unit: string;
  line_total_ugx: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_area: string;
  delivery_address: string;
  delivery_slot: DeliverySlot;
  substitution_pref: SubstitutionPref;
  substitution_note: string;
  subtotal_ugx: number;
  delivery_fee_ugx: number;
  total_ugx: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_ref?: string;
  order_status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  aov: number;
  statusBreakdown: {
    Received: number;
    Packing: number;
    'Out for delivery': number;
    Delivered: number;
  };
  productCount: number;
}
