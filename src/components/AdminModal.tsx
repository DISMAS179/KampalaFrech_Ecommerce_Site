import React, { useState, useEffect } from 'react';
import { Order, Product, AdminStats, OrderStatus } from '../types';
import { api } from '../services/api';
import { X, Lock, ShieldCheck, TrendingUp, ShoppingBag, DollarSign, Package, Check, RefreshCw, Plus, Edit2, Search, Filter } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'inventory'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // New product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('vegetables');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdOrigin, setNewProdOrigin] = useState('Uganda Farms');

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await api.adminLogin(password.trim());
    if (res.success) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  const loadData = async () => {
    setLoadingOrders(true);
    try {
      const [fetchedStats, fetchedOrders] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders()
      ]);
      setStats(fetchedStats);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await api.updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    loadData();
  };

  const handleToggleStock = async (product: Product) => {
    const nextStatus = product.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock';
    await api.updateProduct(product.id, { stock_status: nextStatus });
    onRefreshProducts();
  };

  const handleUpdatePrice = async (product: Product) => {
    const newPrice = prompt(`Enter new price in UGX for ${product.name}:`, product.price_ugx.toString());
    if (newPrice && !isNaN(Number(newPrice)) && Number(newPrice) > 0) {
      await api.updateProduct(product.id, { price_ugx: Number(newPrice) });
      onRefreshProducts();
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          category_id: newProdCat,
          price_ugx: Number(newProdPrice),
          unit: newProdUnit,
          origin: newProdOrigin
        })
      });
      if (res.ok) {
        setShowAddProduct(false);
        setNewProdName('');
        setNewProdPrice('');
        onRefreshProducts();
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const matchSearch = !orderSearch ||
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_phone.includes(orderSearch) ||
      o.delivery_area.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-lg leading-tight">Kampala Fresh Depot Admin</h2>
              <p className="text-xs text-emerald-300">Staff Portal: Orders, Stock & Financials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-900 text-emerald-100 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-xl text-gray-900">Enter Admin Password</h3>
              <p className="text-xs text-gray-500 mt-1">
                Authorized for Kampala depot managers and dispatch teams.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-center font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
              {loginError && (
                <p className="text-xs text-rose-600 font-bold">{loginError}</p>
              )}
              <div className="text-[11px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
                Default password: <code className="font-bold text-gray-700">kampala2026</code>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-colors"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Nav Tabs */}
            <div className="px-6 py-2.5 bg-emerald-900/10 border-b border-gray-200 flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: 'stats', label: 'Overview & Revenue', icon: TrendingUp },
                { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
                { id: 'inventory', label: `Products & Stock (${products.length})`, icon: Package }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={loadData}
                className="ml-auto p-2 text-gray-500 hover:text-emerald-800 rounded-lg hover:bg-gray-100"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* TAB 1: FINANCIALS & STATS */}
              {activeTab === 'stats' && stats && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Total Orders
                      </div>
                      <div className="text-2xl font-black text-emerald-950 mt-1">
                        {stats.totalOrders}
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        {stats.todayOrders} placed today
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                      <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Total Revenue
                      </div>
                      <div className="text-xl font-black text-amber-950 mt-1">
                        UGX {stats.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Gross sales
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                      <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                        Avg Order Value (AOV)
                      </div>
                      <div className="text-xl font-black text-blue-950 mt-1">
                        UGX {stats.aov.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-blue-700 mt-0.5">
                        Per household/office
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                      <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                        Active Products
                      </div>
                      <div className="text-2xl font-black text-purple-950 mt-1">
                        {stats.productCount}
                      </div>
                      <div className="text-[11px] text-purple-700 mt-0.5">
                        Kampala catalogue
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                      Order Pipeline Status Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Received', count: stats.statusBreakdown.Received, color: 'bg-blue-100 text-blue-800' },
                        { label: 'Packing', count: stats.statusBreakdown.Packing, color: 'bg-amber-100 text-amber-800' },
                        { label: 'Out for delivery', count: stats.statusBreakdown['Out for delivery'], color: 'bg-purple-100 text-purple-800' },
                        { label: 'Delivered', count: stats.statusBreakdown.Delivered, color: 'bg-emerald-100 text-emerald-800' }
                      ].map(s => (
                        <div key={s.label} className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                          <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xl font-black text-gray-900">{s.count}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.color}`}>
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-between">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by customer name, phone, or order #"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-gray-500" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white font-bold"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Received">Received</option>
                        <option value="Packing">Packing</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="space-y-3">
                    {filteredOrders.length === 0 ? (
                      <p className="text-center py-8 text-xs text-gray-500">No matching orders found.</p>
                    ) : (
                      filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-emerald-950">
                                  {ord.order_number}
                                </span>
                                <span className="text-xs font-bold text-gray-900">
                                  {ord.customer_name}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                  ({ord.customer_phone})
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                📍 {ord.delivery_area} • Slot: <span className="capitalize font-bold text-gray-700">{ord.delivery_slot}</span>
                              </div>
                            </div>

                            {/* Status changer dropdown */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-gray-500">Status:</span>
                              <select
                                value={ord.order_status}
                                onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                                className={`text-xs font-black px-3 py-1.5 rounded-xl border focus:outline-none ${
                                  ord.order_status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : ord.order_status === 'Out for delivery'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : ord.order_status === 'Packing'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-blue-100 text-blue-900 border-blue-300'
                                }`}
                              >
                                <option value="Received">Received</option>
                                <option value="Packing">Packing</option>
                                <option value="Out for delivery">Out for delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                          </div>

                          {/* Line items preview */}
                          <div className="text-xs space-y-1">
                            <div className="text-[11px] font-bold text-gray-500">Items:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {ord.items.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] font-medium text-gray-800"
                                >
                                  {item.quantity}x {item.product_name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Substitution policy */}
                          {ord.substitution_note && (
                            <div className="text-[11px] bg-amber-50 p-2 rounded-lg text-amber-900 border border-amber-200">
                              <strong>Customer Note:</strong> {ord.substitution_note}
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xs pt-1">
                            <span className="text-gray-500">
                              Payment: <strong>{ord.payment_method.replace(/_/g, ' ').toUpperCase()}</strong> ({ord.payment_status})
                            </span>
                            <span className="font-black text-emerald-900 text-sm">
                              UGX {ord.total_ugx.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTORY & PRODUCTS */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600">
                      Manage stock availability and pricing for Kampala Fresh items.
                    </p>
                    <button
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>

                  {/* Add Product Form */}
                  {showAddProduct && (
                    <form onSubmit={handleAddProduct} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                      <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                        Add New Kampala Produce Item
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          placeholder="Product Name (e.g. Fresh Ginger)"
                          className="px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        />
                        <select
                          value={newProdCat}
                          onChange={(e) => setNewProdCat(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        >
                          <option value="vegetables">Vegetables</option>
                          <option value="fruit">Fruit</option>
                          <option value="staples">Staples</option>
                          <option value="dairy">Dairy & Eggs</option>
                          <option value="meat-and-fish">Meat & Fish</option>
                        </select>
                        <input
                          type="number"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          placeholder="Price in UGX (e.g. 5000)"
                          className="px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        />
                        <input
                          type="text"
                          required
                          value={newProdUnit}
                          onChange={(e) => setNewProdUnit(e.target.value)}
                          placeholder="Unit (kg, bunch, cluster, piece)"
                          className="px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(false)}
                          className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                        >
                          Save Product
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Product List */}
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden text-xs">
                    {products.map((p) => {
                      const isInStock = p.stock_status === 'in_stock';
                      return (
                        <div key={p.id} className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-gray-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-gray-900 truncate">{p.name}</h5>
                              <div className="text-[11px] text-gray-500">
                                {p.category_name} • {p.unit}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="font-black text-emerald-900">
                                UGX {p.price_ugx.toLocaleString()}
                              </div>
                              <button
                                onClick={() => handleUpdatePrice(p)}
                                className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 justify-end"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>Edit price</span>
                              </button>
                            </div>

                            {/* Stock Toggle Button */}
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors ${
                                isInStock
                                  ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                              }`}
                            >
                              {isInStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
