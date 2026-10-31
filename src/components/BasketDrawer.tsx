import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface BasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

const MINIMUM_ORDER_UGX = 20000;
const DELIVERY_FEE_UGX = 3000;

export const BasketDrawer: React.FC<BasketDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onClearCart,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price_ugx * item.quantity, 0);
  const isMinOrderMet = subtotal >= MINIMUM_ORDER_UGX;
  const amountNeeded = Math.max(0, MINIMUM_ORDER_UGX - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / MINIMUM_ORDER_UGX) * 100));
  const grandTotal = subtotal > 0 ? subtotal + DELIVERY_FEE_UGX : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧺</span>
            <div>
              <h2 className="font-extrabold text-lg leading-tight">Your Grocery Basket</h2>
              <p className="text-xs text-emerald-200">
                {items.length} {items.length === 1 ? 'item' : 'different items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-800 text-emerald-100 hover:text-white hover:bg-emerald-700 flex items-center justify-center transition-colors"
            aria-label="Close basket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minimum Order Warning & Progress Banner */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className={isMinOrderMet ? 'text-emerald-800' : 'text-amber-800'}>
              {isMinOrderMet
                ? '✓ Minimum order of UGX 20,000 reached'
                : `Minimum order is UGX 20,000 (Add UGX ${amountNeeded.toLocaleString()} more)`}
            </span>
            <span className="text-emerald-900 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isMinOrderMet ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {!isMinOrderMet && subtotal > 0 && (
            <p className="text-[11px] text-amber-900 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
              <span>Orders below UGX 20,000 cannot be scheduled for delivery.</span>
            </p>
          )}
        </div>

        {/* Basket Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-4xl mb-3">
                🥦
              </div>
              <h3 className="font-bold text-gray-800 text-base">Your basket is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Explore fresh matooke, vegetables, fruits, tilapia and dairy from Kampala farmers.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 rounded-2xl p-3 shadow-xs flex items-center gap-3 hover:border-gray-200 transition-colors"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {product.name}
                  </h4>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    UGX {product.price_ugx.toLocaleString()} / {product.unit}
                  </div>
                  <div className="text-xs font-black text-emerald-800 mt-1">
                    UGX {(product.price_ugx * quantity).toLocaleString()}
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold text-xs shadow-xs"
                    aria-label="Decrease"
                  >
                    {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-600" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                  <span className="w-6 text-center font-extrabold text-xs text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold text-xs shadow-xs"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            {/* Calculations breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Produce Subtotal:</span>
                <span className="font-bold text-gray-900">UGX {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800">
                <span className="flex items-center gap-1">
                  <span>Standard Kampala Delivery Fee:</span>
                </span>
                <span className="font-bold">UGX {DELIVERY_FEE_UGX.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900">Estimated Total:</span>
                <span className="text-lg font-black text-emerald-900">
                  UGX {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Clear Basket & Checkout Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClearCart}
                className="px-3 py-3 rounded-xl border border-gray-300 text-gray-600 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold transition-colors flex items-center justify-center"
                title="Clear all items"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                disabled={!isMinOrderMet}
                onClick={onProceedToCheckout}
                className={`flex-1 py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow transition-all min-h-[48px] ${
                  isMinOrderMet
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-98'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delivery fee UGX 3,000 flat across Kampala • Pay on delivery or Mobile Money</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
