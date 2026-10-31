/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, CartItem, CategoryId, Order } from './types';
import { api, getRecentOrders } from './services/api';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BasketDrawer } from './components/BasketDrawer';
import { CheckoutModal, CheckoutFormData } from './components/CheckoutModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminModal } from './components/AdminModal';
import { WhatsAppButton } from './components/WhatsAppButton';
import { DataSaverBadge } from './components/DataSaverBadge';
import { Sparkles, ShoppingBag, ArrowRight, Truck, Check, HelpCircle } from 'lucide-react';

const MINIMUM_ORDER_UGX = 20000;
const DELIVERY_FEE_UGX = 3000;

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kampala_fresh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active Order State
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('kampala_fresh_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Load products
  const fetchProducts = async () => {
    try {
      const data = await api.getProducts(activeCategory, searchTerm);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchTerm]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to basket`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Basket cleared');
  };

  const getQuantityInCart = (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price_ugx * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE_UGX;

  // Checkout submission
  const handleProceedToCheckout = () => {
    if (subtotal < MINIMUM_ORDER_UGX) {
      showToast(`Minimum order of UGX ${MINIMUM_ORDER_UGX.toLocaleString()} required`);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (formData: CheckoutFormData) => {
    const payload = {
      ...formData,
      payment_method: 'mtn_momo', // Default initial payment method
      items: cartItems.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity
      }))
    };

    const res = await api.createOrder(payload);
    if (res.success && res.order) {
      setActiveOrder(res.order);
      setIsCheckoutOpen(false);
      setIsPaymentOpen(true);
      // Clear basket upon successful order generation
      setCartItems([]);
    } else {
      showToast(res.error || 'Failed to create order');
    }
  };

  // Payment completed
  const handlePaymentSuccess = (updatedOrder: Order) => {
    setActiveOrder(updatedOrder);
    setIsPaymentOpen(false);
    setIsTrackingOpen(true);
    showToast(`Order ${updatedOrder.order_number} confirmed!`);
  };

  // Open latest tracking order
  const handleOpenLatestTracking = () => {
    if (!activeOrder) {
      const recent = getRecentOrders();
      if (recent.length > 0) {
        setActiveOrder(recent[0]);
      }
    }
    setIsTrackingOpen(true);
  };

  // Filtered lists
  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 pb-20 font-sans">
      {/* 1. Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenTracking={handleOpenLatestTracking}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Data Saver & Quality Banner */}
      <DataSaverBadge />

      {/* 3. Categories Navigation Bar */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 4. Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-5 w-full space-y-6 flex-1">
        {/* Hero Announcement Banner (Mobile First) */}
        {!searchTerm && activeCategory === 'all' && (
          <div className="relative rounded-3xl bg-linear-to-r from-emerald-800 to-emerald-950 text-white p-5 sm:p-6 shadow-md overflow-hidden">
            <div className="relative z-10 max-w-lg space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-emerald-950 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Direct From Ugandan Farms
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                Kampala's Freshest Matooke, Tilapia & Greens
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Harvested this morning in Mbarara, Kayunga & Mukono. Same-day delivery across Kampala for only UGX 3,000 flat.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs font-bold text-amber-300">
                <span>✓ Min Order: UGX 20,000</span>
                <span>•</span>
                <span>✓ MTN MoMo & Airtel</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 text-7xl sm:text-8xl opacity-15 select-none pointer-events-none pr-4 pb-2">
              🍍🥬
            </div>
          </div>
        )}

        {/* Featured Section (when on 'all' and no active search) */}
        {!searchTerm && activeCategory === 'all' && featuredProducts.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h3 className="font-extrabold text-base text-gray-900">
                  Featured Daily Staples
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                Nakasero Market Prices
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 6).map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  quantityInCart={getQuantityInCart(prod.id)}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Full Catalogue Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900">
              {searchTerm
                ? `Search Results for "${searchTerm}"`
                : activeCategory === 'all'
                ? 'All Fresh Produce'
                : `${activeCategory.toUpperCase()} Produce`}
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              {products.length} {products.length === 1 ? 'item' : 'items'} available
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-6 space-y-3">
              <div className="text-4xl">🔍</div>
              <h4 className="font-bold text-gray-800 text-sm">No items found</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                We couldn't find anything matching your search. Try "matooke", "sukuma", "tomatoes" or "milk".
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {products.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  quantityInCart={getQuantityInCart(prod.id)}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onOpenDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* How It Works Guide (Compact for Kampala households & offices) */}
        <section className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-3">
          <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span>How Kampala Fresh Delivers</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-black text-emerald-800 text-sm block mb-1">1. Choose Produce</span>
              <p className="text-gray-600">Pick from fresh vegetables, fruit, staples and meat. Minimum order is UGX 20,000.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-black text-emerald-800 text-sm block mb-1">2. Fast Checkout</span>
              <p className="text-gray-600">Choose your Kampala area and time slot. Delivery fee is only UGX 3,000 flat.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-black text-emerald-800 text-sm block mb-1">3. Easy Payment</span>
              <p className="text-gray-600">Approve instant MTN MoMo or Airtel Money prompt, or pay cash on delivery.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Cart Bar (if items in cart and cart drawer not open) */}
      {cartItems.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 inset-x-0 z-20 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-gray-500 font-semibold">
                {totalCartCount} items • {subtotal < MINIMUM_ORDER_UGX ? (
                  <span className="text-amber-700 font-bold">UGX {(MINIMUM_ORDER_UGX - subtotal).toLocaleString()} to min order</span>
                ) : (
                  <span className="text-emerald-700 font-bold">Ready for delivery</span>
                )}
              </div>
              <div className="text-base font-black text-emerald-900">
                UGX {subtotal.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-98 transition-all min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Basket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Sticky WhatsApp Order Button */}
      <WhatsAppButton cartItems={cartItems} />

      {/* 6. Modals & Drawers */}
      <BasketDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <ProductDetailModal
        product={selectedProduct}
        quantityInCart={selectedProduct ? getQuantityInCart(selectedProduct.id) : 0}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        deliveryFee={DELIVERY_FEE_UGX}
        total={total}
        onSubmitCheckout={handleCheckoutSubmit}
      />

      {activeOrder && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          order={activeOrder}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrder={activeOrder}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onRefreshProducts={fetchProducts}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-emerald-700 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
