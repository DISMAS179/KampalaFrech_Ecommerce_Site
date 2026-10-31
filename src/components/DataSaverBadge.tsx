import React from 'react';
import { Zap, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const DataSaverBadge: React.FC = () => {
  return (
    <div className="bg-emerald-50/70 border-y border-emerald-100 py-2 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] text-emerald-900 font-semibold gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
          <span>Data-Saver Mode: Fast load & compressed imagery</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Same-Day Kampala Boda Delivery (UGX 3,000)</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Pay via MTN MoMo, Airtel or on Delivery</span>
        </div>
      </div>
    </div>
  );
};
