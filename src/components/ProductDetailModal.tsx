import React from 'react';
import { Product } from '../types';
import { X, Check, MapPin, Sparkles, MessageCircle, Plus, Minus } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  quantityInCart: number;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  quantityInCart,
  onClose,
  onAddToCart,
  onUpdateQuantity
}) => {
  if (!product) return null;

  const isOutOfStock = product.stock_status === 'out_of_stock';
  const isLowStock = product.stock_status === 'low_stock';

  const whatsappMessage = encodeURIComponent(
    `Hello Kampala Fresh, I would like to order "${product.name}" (${product.unit} @ UGX ${product.price_ugx.toLocaleString()}) for delivery in Kampala.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header with image */}
        <div className="relative aspect-16/10 bg-gray-100 w-full overflow-hidden shrink-0">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-3 bg-emerald-900/80 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Harvested in {product.origin}</span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {product.category_name}
              </span>
              <h2 className="text-xl font-black text-gray-900 mt-0.5 leading-tight">
                {product.name}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-emerald-800">
                UGX {product.price_ugx.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                per {product.unit}
              </div>
            </div>
          </div>

          {/* Stock state badge */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800">
                Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                ⚠️ Low Stock - Order Soon
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                <Check className="w-3.5 h-3.5" /> Fresh in stock today
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
            <p className="font-medium text-gray-900 mb-1">About this produce:</p>
            <p>{product.description}</p>
          </div>

          {/* Quality commitment */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-emerald-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Checked for freshness before packing</span>
            </div>
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-amber-900 flex items-center gap-2">
              <span className="text-base shrink-0">🛵</span>
              <span>Same-day Boda delivery in Kampala</span>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-2xl cursor-not-allowed"
              >
                Item Unavailable
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex-1 flex items-center justify-between bg-emerald-100/70 border border-emerald-300 rounded-2xl p-1.5">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="w-11 h-11 rounded-xl bg-white text-emerald-900 flex items-center justify-center font-bold shadow-xs active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <span className="block text-base font-extrabold text-emerald-950">
                    {quantityInCart} {product.unit} in Basket
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">
                    UGX {(product.price_ugx * quantityInCart).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow flex items-center justify-center gap-2 active:scale-98 transition-all min-h-[48px]"
              >
                <Plus className="w-5 h-5" />
                <span>Add to Basket (UGX {product.price_ugx.toLocaleString()})</span>
              </button>
            )}
          </div>

          {/* Quick WhatsApp order for this single item */}
          <a
            href={`https://wa.me/256772123456?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Order "{product.name}" directly on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
