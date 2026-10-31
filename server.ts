import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database store with preloaded sample data (aligned with schema.sql)
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
  delivery_slot: 'morning' | 'afternoon' | 'evening';
  substitution_pref: 'call_first' | 'replace_similar' | 'skip_item';
  substitution_note: string;
  subtotal_ugx: number;
  delivery_fee_ugx: number;
  total_ugx: number;
  payment_method: 'mtn_momo' | 'airtel_money' | 'cash_on_delivery';
  payment_status: 'pending' | 'completed' | 'failed';
  payment_ref?: string;
  order_status: 'Received' | 'Packing' | 'Out for delivery' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// Initial 20 Realistic Kampala Fresh Products
let products: Product[] = [
  // Staples
  {
    id: 'prod_01',
    category_id: 'staples',
    category_name: 'Staples',
    name: 'Fresh Matooke (Whole Cluster)',
    slug: 'fresh-matooke-cluster',
    description: 'Freshly harvested highland green bananas from Mbarara. Tender, golden and fragrant when steamed.',
    price_ugx: 8500,
    unit: 'cluster',
    stock_status: 'in_stock',
    stock_quantity: 45,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80',
    origin: 'Mbarara & Masaka Farms'
  },
  {
    id: 'prod_02',
    category_id: 'staples',
    category_name: 'Staples',
    name: 'Kabale Irish Potatoes',
    slug: 'kabale-irish-potatoes',
    description: 'Grade A firm red-skin Irish potatoes from the cool hills of Kabale. Perfect for chips, boiling, or katogo.',
    price_ugx: 4500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 60,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    origin: 'Kabale Highlands'
  },
  {
    id: 'prod_03',
    category_id: 'staples',
    category_name: 'Staples',
    name: 'Ugandan Super Rice (Pure Pearl)',
    slug: 'ugandan-super-rice',
    description: 'Aromatic, long-grain fragrant rice from the wetland plains of Butaleja. Clean and stone-free quality.',
    price_ugx: 5500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 50,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    origin: 'Butaleja Mills'
  },
  {
    id: 'prod_04',
    category_id: 'staples',
    category_name: 'Staples',
    name: 'Fine Posho (Maize Flour No. 1)',
    slug: 'fine-posho-maize-flour',
    description: 'Ultra-sifted white maize meal for silky smooth mingling. High energy household staple.',
    price_ugx: 3500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 80,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1627735647500-0e1272c47863?w=600&auto=format&fit=crop&q=80',
    origin: 'Jinja Grain Silos'
  },
  {
    id: 'prod_05',
    category_id: 'staples',
    category_name: 'Staples',
    name: 'Yellow Sweet Potatoes',
    slug: 'yellow-sweet-potatoes',
    description: 'Naturally sweet, nutrient-dense root tubers. Freshly dug from fertile Mpigi gardens.',
    price_ugx: 3500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 30,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=600&auto=format&fit=crop&q=80',
    origin: 'Mpigi District'
  },

  // Vegetables
  {
    id: 'prod_06',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Fresh Sukuma Wiki (Collard Greens)',
    slug: 'fresh-sukuma-wiki',
    description: 'Crisp, nutrient-rich dark green collard leaves. Bundled fresh daily at morning farm harvest.',
    price_ugx: 2000,
    unit: 'bunch',
    stock_status: 'in_stock',
    stock_quantity: 70,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?w=600&auto=format&fit=crop&q=80',
    origin: 'Wakiso Farmers Coop'
  },
  {
    id: 'prod_07',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Traditional Nakati',
    slug: 'traditional-nakati',
    description: 'Beloved local bitter-sweet nightshade greens. Steams wonderfully with groundnut or simsim sauce.',
    price_ugx: 1500,
    unit: 'bunch',
    stock_status: 'in_stock',
    stock_quantity: 55,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    origin: 'Gayaza Gardeners'
  },
  {
    id: 'prod_08',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Red Salad Tomatoes',
    slug: 'red-salad-tomatoes',
    description: 'Plump, greenhouse vine-ripened red tomatoes from Mukono. Firm, sweet and flavorful.',
    price_ugx: 4000,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 65,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    origin: 'Mukono Greenhouses'
  },
  {
    id: 'prod_09',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Red Dry Onions',
    slug: 'red-dry-onions',
    description: 'Pungent, well-cured medium red onions. Essential seasoning base for every Ugandan stew and sauce.',
    price_ugx: 4500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 50,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    origin: 'Kapchorwa & Kasese'
  },
  {
    id: 'prod_10',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Fresh Green Bell Peppers',
    slug: 'fresh-green-bell-peppers',
    description: 'Aromatic, crunchy green capsicums. Hand-sorted for premium size, firm flesh and thick walls.',
    price_ugx: 3000,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 40,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    origin: 'Luwero Triangle Farms'
  },
  {
    id: 'prod_11',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Sweet Orange Carrots',
    slug: 'sweet-orange-carrots',
    description: 'Crisp, washed sweet carrots grown in volcanic highlands. Great raw or sliced into stir-fries.',
    price_ugx: 3500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 45,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    origin: 'Kigezi Highlands'
  },
  {
    id: 'prod_12',
    category_id: 'vegetables',
    category_name: 'Vegetables',
    name: 'Fresh Dodo (Amaranth Greens)',
    slug: 'fresh-dodo-amaranth',
    description: 'Tender young leaves of local red-stem amaranth. Rich in dietary iron and vital micronutrients.',
    price_ugx: 1500,
    unit: 'bunch',
    stock_status: 'in_stock',
    stock_quantity: 40,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    origin: 'Entebbe Road Gardens'
  },

  // Fruit
  {
    id: 'prod_13',
    category_id: 'fruit',
    category_name: 'Fruit',
    name: 'Bogoya Sweet Bananas',
    slug: 'bogoya-sweet-bananas',
    description: 'Naturally tree-ripened sweet yellow bananas with smooth peel and decadent honey-like sweetness.',
    price_ugx: 4000,
    unit: 'cluster',
    stock_status: 'in_stock',
    stock_quantity: 50,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    origin: 'Kayunga Plantations'
  },
  {
    id: 'prod_14',
    category_id: 'fruit',
    category_name: 'Fruit',
    name: 'Sugar Baby Watermelon',
    slug: 'sugar-baby-watermelon',
    description: 'Crisp, ultra-sweet red heart watermelon. Deeply refreshing for hot Kampala afternoons.',
    price_ugx: 7000,
    unit: 'piece',
    stock_status: 'in_stock',
    stock_quantity: 25,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    origin: 'Lake Kyoga Basin'
  },
  {
    id: 'prod_15',
    category_id: 'fruit',
    category_name: 'Fruit',
    name: 'Hass Avocado (Grade A)',
    slug: 'hass-avocado',
    description: 'Rich, buttery pear avocados with dark pebbled skin. Perfect natural ripeness for toast and salads.',
    price_ugx: 3500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 35,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
    origin: 'Fort Portal Groves'
  },
  {
    id: 'prod_16',
    category_id: 'fruit',
    category_name: 'Fruit',
    name: 'Masaka Purple Passion Fruit',
    slug: 'masaka-purple-passion-fruit',
    description: 'Intensely fragrant purple passion fruits with generous, tangy and sweet tropical juice pulp.',
    price_ugx: 6000,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 30,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=600&auto=format&fit=crop&q=80',
    origin: 'Masaka Smallholders'
  },

  // Dairy & Eggs
  {
    id: 'prod_17',
    category_id: 'dairy',
    category_name: 'Dairy & Eggs',
    name: 'Fresh Pasteurized Whole Milk',
    slug: 'fresh-pasteurized-whole-milk',
    description: 'Pure, rich whole cow milk gently pasteurized. Bottled fresh, delivered chilled in a sealed 1-litre pack.',
    price_ugx: 3200,
    unit: 'litre',
    stock_status: 'in_stock',
    stock_quantity: 60,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    origin: 'Mbarara Dairy Cooperative'
  },
  {
    id: 'prod_18',
    category_id: 'dairy',
    category_name: 'Dairy & Eggs',
    name: 'Farm Fresh White/Brown Eggs',
    slug: 'farm-fresh-eggs-tray',
    description: 'Full tray of 30 clean, graded fresh poultry eggs. High vibrant yolk index and clean shells.',
    price_ugx: 14000,
    unit: 'tray',
    stock_status: 'in_stock',
    stock_quantity: 35,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
    origin: 'Semuto Poultry Farm'
  },

  // Meat & Fish
  {
    id: 'prod_19',
    category_id: 'meat-and-fish',
    category_name: 'Meat & Fish',
    name: 'Fresh Whole Tilapia (Lake Victoria)',
    slug: 'fresh-whole-tilapia',
    description: 'Caught fresh daily by local fishermen in Ggaba. Cleaned, descaled and gutted on order ready for grilling or frying.',
    price_ugx: 16000,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 20,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?w=600&auto=format&fit=crop&q=80',
    origin: 'Ggaba Landing Site, Lake Victoria'
  },
  {
    id: 'prod_20',
    category_id: 'meat-and-fish',
    category_name: 'Meat & Fish',
    name: 'Prime Beef Stew Cuts',
    slug: 'prime-beef-stew-cuts',
    description: 'Tender lean beef chuck, diced into neat stew cubes. Clean, trimmed and freshly prepared for Ugandan katogo.',
    price_ugx: 16500,
    unit: 'kg',
    stock_status: 'in_stock',
    stock_quantity: 30,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80',
    origin: 'Soroti Cattle Ranchers'
  }
];

// Initial In-Memory Orders
let orders: Order[] = [
  {
    id: 'ord_101',
    order_number: 'KF-8821',
    customer_name: 'Sarah Namubiru',
    customer_phone: '0772123456',
    delivery_area: 'Ntinda',
    delivery_address: 'Plot 18 Martyrs Way, near Shell Ntinda',
    delivery_slot: 'morning',
    substitution_pref: 'call_first',
    substitution_note: 'Please pick a green firm matooke cluster',
    subtotal_ugx: 27000,
    delivery_fee_ugx: 3000,
    total_ugx: 30000,
    payment_method: 'mtn_momo',
    payment_status: 'completed',
    payment_ref: 'MOMO-UG-882199',
    order_status: 'Packing',
    items: [
      { product_id: 'prod_01', product_name: 'Fresh Matooke (Whole Cluster)', price_ugx: 8500, quantity: 2, unit: 'cluster', line_total_ugx: 17000 },
      { product_id: 'prod_06', product_name: 'Fresh Sukuma Wiki (Collard Greens)', price_ugx: 2000, quantity: 3, unit: 'bunch', line_total_ugx: 6000 },
      { product_id: 'prod_08', product_name: 'Red Salad Tomatoes', price_ugx: 4000, quantity: 1, unit: 'kg', line_total_ugx: 4000 }
    ],
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'ord_102',
    order_number: 'KF-8822',
    customer_name: 'David Otim',
    customer_phone: '0701987654',
    delivery_area: 'Kololo',
    delivery_address: 'Acacia Avenue, Pine Apartments flat 4B',
    delivery_slot: 'afternoon',
    substitution_pref: 'replace_similar',
    substitution_note: 'Gate security code is 4412',
    subtotal_ugx: 33500,
    delivery_fee_ugx: 3000,
    total_ugx: 36500,
    payment_method: 'airtel_money',
    payment_status: 'completed',
    payment_ref: 'AIRTEL-UG-492104',
    order_status: 'Out for delivery',
    items: [
      { product_id: 'prod_19', product_name: 'Fresh Whole Tilapia (Lake Victoria)', price_ugx: 16000, quantity: 1, unit: 'kg', line_total_ugx: 16000 },
      { product_id: 'prod_18', product_name: 'Farm Fresh White/Brown Eggs', price_ugx: 14000, quantity: 1, unit: 'tray', line_total_ugx: 14000 },
      { product_id: 'prod_11', product_name: 'Sweet Orange Carrots', price_ugx: 3500, quantity: 1, unit: 'kg', line_total_ugx: 3500 }
    ],
    created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 0.4).toISOString()
  },
  {
    id: 'ord_103',
    order_number: 'KF-8823',
    customer_name: 'Amina Nakate',
    customer_phone: '0782334455',
    delivery_area: 'Bugolobi',
    delivery_address: 'Bandali Rise, Plot 8 office 2B',
    delivery_slot: 'evening',
    substitution_pref: 'call_first',
    substitution_note: 'Deliver to reception desk',
    subtotal_ugx: 22600,
    delivery_fee_ugx: 3000,
    total_ugx: 25600,
    payment_method: 'cash_on_delivery',
    payment_status: 'pending',
    order_status: 'Received',
    items: [
      { product_id: 'prod_17', product_name: 'Fresh Pasteurized Whole Milk', price_ugx: 3200, quantity: 2, unit: 'litre', line_total_ugx: 6400 },
      { product_id: 'prod_02', product_name: 'Kabale Irish Potatoes', price_ugx: 4500, quantity: 2, unit: 'kg', line_total_ugx: 9000 },
      { product_id: 'prod_14', product_name: 'Sugar Baby Watermelon', price_ugx: 7000, quantity: 1, unit: 'piece', line_total_ugx: 7000 }
    ],
    created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 0.5).toISOString()
  }
];

// Admin Credentials
const ADMIN_PASSWORD_HASH = 'kampala2026'; // Demo password
const ADMIN_SECRET_TOKEN = 'kf_session_tok_' + crypto.randomBytes(16).toString('hex');

// ==========================================
// API ROUTES
// ==========================================

// 1. Get Products
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, featured } = req.query;
  let result = [...products];

  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter(p => p.category_id.toLowerCase() === category.toLowerCase());
  }

  if (featured === 'true') {
    result = result.filter(p => p.is_featured);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category_name.toLowerCase().includes(q) ||
      p.origin.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, products: result });
});

// 2. Get Single Product
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, product });
});

// 3. Admin: Update Product (Stock / Price)
app.patch('/api/products/:id', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.includes('Admin')) {
    // allow demo testing if local
  }
  const { stock_status, price_ugx, is_featured, stock_quantity } = req.body;
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  if (stock_status) products[index].stock_status = stock_status;
  if (typeof price_ugx === 'number') products[index].price_ugx = price_ugx;
  if (typeof is_featured === 'boolean') products[index].is_featured = is_featured;
  if (typeof stock_quantity === 'number') products[index].stock_quantity = stock_quantity;

  res.json({ success: true, product: products[index] });
});

// 4. Admin: Add New Product
app.post('/api/products', (req: Request, res: Response) => {
  const { name, category_id, description, price_ugx, unit, image_url, origin } = req.body;
  if (!name || !price_ugx || !unit) {
    res.status(400).json({ success: false, error: 'Missing required product fields' });
    return;
  }

  const categoryNames: Record<string, string> = {
    vegetables: 'Vegetables',
    fruit: 'Fruit',
    staples: 'Staples',
    dairy: 'Dairy & Eggs',
    'meat-and-fish': 'Meat & Fish'
  };

  const newProduct: Product = {
    id: 'prod_' + (products.length + 1).toString().padStart(2, '0'),
    category_id: category_id || 'vegetables',
    category_name: categoryNames[category_id] || 'General Fresh',
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: description || 'Fresh produce sourced daily from Kampala markets.',
    price_ugx: Number(price_ugx),
    unit,
    stock_status: 'in_stock',
    stock_quantity: 50,
    is_featured: false,
    image_url: image_url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    origin: origin || 'Kampala Farms'
  };

  products.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

// 5. Create Order
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      delivery_area,
      delivery_address,
      delivery_slot,
      substitution_pref,
      substitution_note,
      payment_method,
      items
    } = req.body;

    // Validate inputs
    if (!customer_name || !customer_phone || !delivery_area || !delivery_address || !delivery_slot || !payment_method) {
      res.status(400).json({ success: false, error: 'All delivery and contact fields are required.' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Basket is empty.' });
      return;
    }

    // Calculate subtotal
    let subtotal_ugx = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.product_id);
      if (!prod) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = prod.price_ugx * qty;
      subtotal_ugx += lineTotal;
      validatedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        price_ugx: prod.price_ugx,
        quantity: qty,
        unit: prod.unit,
        line_total_ugx: lineTotal
      });
    }

    // Minimum order requirement of UGX 20,000
    const MINIMUM_ORDER_UGX = 20000;
    if (subtotal_ugx < MINIMUM_ORDER_UGX) {
      res.status(400).json({
        success: false,
        error: `Minimum order value is UGX ${MINIMUM_ORDER_UGX.toLocaleString()}. Current total is UGX ${subtotal_ugx.toLocaleString()}. Add UGX ${(MINIMUM_ORDER_UGX - subtotal_ugx).toLocaleString()} more to checkout.`
      });
      return;
    }

    const DELIVERY_FEE_UGX = 3000;
    const total_ugx = subtotal_ugx + DELIVERY_FEE_UGX;

    const orderNumber = `KF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: 'ord_' + Date.now().toString(36),
      order_number: orderNumber,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      delivery_area,
      delivery_address: delivery_address.trim(),
      delivery_slot,
      substitution_pref: substitution_pref || 'call_first',
      substitution_note: (substitution_note || '').trim(),
      subtotal_ugx,
      delivery_fee_ugx: DELIVERY_FEE_UGX,
      total_ugx,
      payment_method,
      payment_status: payment_method === 'cash_on_delivery' ? 'pending' : 'pending',
      order_status: 'Received',
      items: validatedItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order created successfully'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error creating order' });
  }
});

// 6. Get Order Details (For Tracking)
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const query = req.params.id;
  const order = orders.find(o => o.id === query || o.order_number.toUpperCase() === query.toUpperCase());
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found. Please check your order number.' });
    return;
  }
  res.json({ success: true, order });
});

// 7. Payment Simulation & Retry (MTN MoMo, Airtel Money, Pay on Delivery)
app.post('/api/orders/:id/payment', (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.id || o.order_number === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const { action, phone_number, provider } = req.body;
  // action can be: 'initiate', 'confirm_success', 'simulate_failure', 'retry'

  if (action === 'simulate_failure') {
    order.payment_status = 'failed';
    order.updated_at = new Date().toISOString();
    res.json({
      success: false,
      payment_status: 'failed',
      message: `Payment request timed out or was rejected on ${phone_number || order.customer_phone}. You can retry or choose Pay on Delivery.`,
      can_retry: true
    });
    return;
  }

  if (action === 'confirm_success' || action === 'success') {
    order.payment_status = 'completed';
    order.payment_ref = (provider === 'airtel_money' ? 'AIRTEL-' : 'MOMO-') + 'UG-' + Math.floor(100000 + Math.random() * 900000);
    order.updated_at = new Date().toISOString();
    res.json({
      success: true,
      payment_status: 'completed',
      payment_ref: order.payment_ref,
      order,
      message: `Payment of UGX ${order.total_ugx.toLocaleString()} received successfully!`
    });
    return;
  }

  // Default: Initiate pending state
  order.payment_status = 'pending';
  order.updated_at = new Date().toISOString();

  res.json({
    success: true,
    payment_status: 'pending',
    provider: provider || order.payment_method,
    prompt: `A USSD push notification has been sent to ${phone_number || order.customer_phone}. Approve the transaction of UGX ${order.total_ugx.toLocaleString()} to complete your order.`,
    order
  });
});

// 8. Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD_HASH) {
    res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      user: { username: 'admin', role: 'admin', name: 'Kampala Fresh Depot Manager' }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid admin password. Default is: kampala2026' });
  }
});

// 9. Admin: Get All Orders
app.get('/api/admin/orders', (req: Request, res: Response) => {
  res.json({ success: true, count: orders.length, orders });
});

// 10. Admin: Update Order Status
app.patch('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const { status, payment_status } = req.body;
  const order = orders.find(o => o.id === req.params.id || o.order_number === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const validStatuses = ['Received', 'Packing', 'Out for delivery', 'Delivered', 'Cancelled'];
  if (status && validStatuses.includes(status)) {
    order.order_status = status as any;
  }

  if (payment_status) {
    order.payment_status = payment_status;
  }

  order.updated_at = new Date().toISOString();
  res.json({ success: true, order, message: `Order updated to ${order.order_status}` });
});

// 11. Admin: Dashboard Stats
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.payment_status === 'completed' || o.order_status === 'Delivered')
    .reduce((sum, o) => sum + o.total_ugx, 0);

  const completedOrDeliveredCount = orders.filter(o => o.payment_status === 'completed' || o.order_status === 'Delivered').length;
  const aov = completedOrDeliveredCount > 0 ? Math.round(totalRevenue / completedOrDeliveredCount) : 0;

  const todayOrders = orders.filter(o => {
    const d = new Date(o.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const statusBreakdown = {
    Received: orders.filter(o => o.order_status === 'Received').length,
    Packing: orders.filter(o => o.order_status === 'Packing').length,
    'Out for delivery': orders.filter(o => o.order_status === 'Out for delivery').length,
    Delivered: orders.filter(o => o.order_status === 'Delivered').length,
  };

  res.json({
    success: true,
    stats: {
      totalOrders,
      todayOrders,
      totalRevenue,
      aov,
      statusBreakdown,
      productCount: products.length
    }
  });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  const rootDir = process.cwd();
  if (process.env.NODE_ENV === 'production') {
    // Serve production build
    app.use(express.static(path.resolve(rootDir, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(rootDir, 'dist', 'index.html'));
    });
  } else {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kampala Fresh Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
