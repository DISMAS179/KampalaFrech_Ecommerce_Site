import React, { useState } from 'react';
import { DeliverySlot, SubstitutionPref } from '../types';
import { KAMPALA_DELIVERY_AREAS } from '../data/mockProducts';
import { X, ArrowRight, MapPin, Clock, Phone, User, FileText, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onSubmitCheckout: (formData: CheckoutFormData) => void;
}

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  delivery_area: string;
  delivery_address: string;
  delivery_slot: DeliverySlot;
  substitution_pref: SubstitutionPref;
  substitution_note: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  deliveryFee,
  total,
  onSubmitCheckout
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState(KAMPALA_DELIVERY_AREAS[0]);
  const [address, setAddress] = useState('');
  const [slot, setSlot] = useState<DeliverySlot>('morning');
  const [substitutionPref, setSubstitutionPref] = useState<SubstitutionPref>('call_first');
  const [substitutionNote, setSubstitutionNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name or company name.');
      return;
    }

    // Clean phone number
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const ugandaPhoneRegex = /^(07\d{8}|\+2567\d{8}|2567\d{8})$/;
    if (!ugandaPhoneRegex.test(cleanPhone)) {
      setError('Please enter a valid Ugandan phone number (e.g. 0772 123 456 or +256 701 234 567).');
      return;
    }

    if (!address.trim()) {
      setError('Please provide your street or landmark (e.g. Plot 12, near Shell or green gate).');
      return;
    }

    onSubmitCheckout({
      customer_name: name.trim(),
      customer_phone: cleanPhone,
      delivery_area: deliveryArea,
      delivery_address: address.trim(),
      delivery_slot: slot,
      substitution_pref: substitutionPref,
      substitution_note: substitutionNote.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-lg leading-tight">Delivery Details</h2>
              <p className="text-xs text-emerald-200">Where should we deliver your fresh produce?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-800 text-emerald-100 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Full Name or Office Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Namubiru / Tech Hub Ltd"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Uganda Phone Number (for MoMo & delivery call) *</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                🇺🇬
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0772 123 456 or 0701 234 567"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Supports MTN (077/078/076) and Airtel (070/075/074)
            </p>
          </div>

          {/* Delivery Area Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kampala Area *</span>
            </label>
            <select
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            >
              {KAMPALA_DELIVERY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Address & Landmark */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Specific Address, Landmark or Plot Number *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 18 Martyrs Way, opposite Shell Ntinda, 2nd floor flat 4B"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Delivery Slot */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Preferred Delivery Slot *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'morning', label: 'Morning', time: '8:00 AM - 12:00 PM', icon: '🌅' },
                { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM', icon: '☀️' },
                { id: 'evening', label: 'Evening', time: '4:00 PM - 8:00 PM', icon: '🌆' }
              ].map((s) => {
                const isSelected = slot === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSlot(s.id as DeliverySlot)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 ring-2 ring-emerald-700/20 text-emerald-950'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{s.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                    </div>
                    <div className="mt-2">
                      <div className="font-extrabold text-xs">{s.label}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{s.time}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Substitution Preference */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>If an item is out of stock in the market:</span>
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'call_first', label: 'Call me before substituting any produce' },
                { id: 'replace_similar', label: 'Replace with closest fresh alternative' },
                { id: 'skip_item', label: 'Do not substitute (deduct from total)' }
              ].map((pref) => (
                <label
                  key={pref.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-colors ${
                    substitutionPref === pref.id
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="subPref"
                    checked={substitutionPref === pref.id}
                    onChange={() => setSubstitutionPref(pref.id as SubstitutionPref)}
                    className="accent-emerald-700 w-4 h-4"
                  />
                  <span>{pref.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Delivery or Substitution Note */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Produce Notes or Instructions (Optional)
            </label>
            <input
              type="text"
              value={substitutionNote}
              onChange={(e) => setSubstitutionNote(e.target.value)}
              placeholder="e.g. Please pick green matooke, gate code 2045"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Basket Subtotal:</span>
              <span className="font-bold text-gray-900">UGX {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-800">
              <span>Kampala Delivery Fee:</span>
              <span className="font-bold">UGX {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-black">
              <span className="text-gray-900 text-sm">Amount to Pay:</span>
              <span className="text-base text-emerald-900">UGX {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all min-h-[48px]"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
