import React from 'react';
import { Product } from '../types';
import { Plus, Minus, Check, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onOpenDetails
}) => {
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const isLowStock = product.stock_status === 'low_stock';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Product Image & Badges */}
      <div
        className="relative aspect-4/3 w-full bg-gray-50 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(product)}
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // High-contrast clean fallback image if external link is offline
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Stock Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
              Only few left
            </span>
          ) : product.is_featured ? (
            <span className="bg-emerald-700/90 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider backdrop-blur-xs flex items-center gap-1">
              ★ Popular
            </span>
          ) : null}
        </div>

        {/* Origin Pill */}
        <div className="absolute bottom-2 left-2 bg-emerald-950/70 text-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          <span className="truncate max-w-[120px]">{product.origin}</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div className="cursor-pointer" onClick={() => onOpenDetails(product)}>
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            {product.category_name}
          </span>
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mt-0.5 group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>
          <p className="text-[12px] text-gray-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Price & Unit */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] text-gray-500 font-medium">
              Price per <span className="font-bold text-gray-700">{product.unit}</span>
            </div>
            <div className="text-base font-extrabold text-emerald-800 tracking-tight">
              UGX {product.price_ugx.toLocaleString()}
            </div>
          </div>

          {/* Add to Basket Action */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-2 rounded-xl cursor-not-allowed min-h-[44px]"
              >
                Sold out
              </button>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-1 shadow-xs">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="w-8 h-8 rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-extrabold text-emerald-900 text-sm">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all duration-150 min-h-[44px]"
                aria-label={`Add ${product.name} to basket`}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
