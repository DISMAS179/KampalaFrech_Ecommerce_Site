import React from 'react';
import { ShoppingBag, Search, Shield, Truck, X, PhoneCall } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  searchTerm,
  onSearchChange,
  onOpenTracking,
  onOpenAdmin
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md">
      {/* Top micro-banner for fast load & phone orders */}
      <div className="bg-emerald-950 px-3 py-1.5 text-xs flex justify-between items-center text-emerald-100">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Delivering across Kampala today • Min order UGX 20,000</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTracking}
            className="hover:text-white flex items-center gap-1 transition-colors"
            title="Track existing order"
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Track Order</span>
          </button>
          <button
            onClick={onOpenAdmin}
            className="hover:text-white flex items-center gap-1 text-emerald-300 font-semibold transition-colors"
            title="Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-700 font-black text-xl shadow-inner">
            🌿
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight leading-none text-white">
              Kampala<span className="text-amber-400">Fresh</span>
            </h1>
            <p className="text-[11px] text-emerald-200 font-medium">Fresh Groceries to your Door</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Quick Call hotline for low-data users */}
          <a
            href="tel:+256772123456"
            className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Call Kampala Fresh Hotline"
          >
            <PhoneCall className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">0772 123 456</span>
          </a>

          {/* Cart Button with Counter */}
          <button
            onClick={onOpenCart}
            aria-label="Open grocery basket"
            className="relative flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-emerald-950 font-bold px-3.5 py-2 rounded-xl shadow transition-all duration-150 min-h-[44px]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Basket</span>
            {cartCount > 0 && (
              <span className="bg-emerald-900 text-amber-300 text-xs font-black px-2 py-0.5 rounded-full ml-1 animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Input Bar (High visibility for phone users) */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search matooke, tilapia, onions, milk, fruit..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
