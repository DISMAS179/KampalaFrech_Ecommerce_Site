import React from 'react';
import { CartItem } from '../types';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  cartItems: CartItem[];
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ cartItems }) => {
  const KAMPALA_FRESH_WHATSAPP = '256772123456'; // Official Kampala Fresh WhatsApp line

  const buildMessage = () => {
    if (!cartItems || cartItems.length === 0) {
      return encodeURIComponent(
        'Hello Kampala Fresh! 🥬\nI would like to order fresh groceries for delivery in Kampala. Please share today\'s fresh arrivals list.'
      );
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price_ugx * item.quantity, 0);
    const deliveryFee = 3000;
    const total = subtotal + deliveryFee;

    const itemList = cartItems
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} (${i.product.unit}) = UGX ${(i.product.price_ugx * i.quantity).toLocaleString()}`
      )
      .join('\n');

    const msg = `Hello Kampala Fresh! 🛒\nI want to place an order for delivery:\n\n${itemList}\n\n*Produce Subtotal:* UGX ${subtotal.toLocaleString()}\n*Delivery Fee:* UGX ${deliveryFee.toLocaleString()}\n*Total:* UGX ${total.toLocaleString()}\n\n*My Delivery Area:* [Enter your area e.g. Kololo / Ntinda / Bugolobi]\n*Address/Landmark:* [Enter your landmark]\n*Phone:* [Enter your number]`;

    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${KAMPALA_FRESH_WHATSAPP}?text=${buildMessage()}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-4 right-4 z-30">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-extrabold px-4 py-3 rounded-2xl shadow-xl transition-all duration-150 border-2 border-white/40 group min-h-[48px]"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366] group-hover:scale-110 transition-transform" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" />
          )}
        </div>
        <span className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">
          Order on WhatsApp
        </span>
      </a>
    </aside>
  );
};
