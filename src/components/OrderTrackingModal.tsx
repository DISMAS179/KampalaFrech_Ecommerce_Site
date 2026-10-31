import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { X, CheckCircle2, Clock, Package, Truck, CheckCheck, MapPin, Search, MessageCircle, Phone } from 'lucide-react';
import { api } from '../services/api';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrder: Order | null;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'Received',
    label: 'Order Received',
    desc: 'Order confirmed and queued at our Kampala depot.',
    icon: Clock
  },
  {
    status: 'Packing',
    label: 'Packing Fresh Produce',
    desc: 'Quality checked, washed and packed into cooler crates.',
    icon: Package
  },
  {
    status: 'Out for delivery',
    label: 'Out for Delivery',
    desc: 'Boda boda delivery rider dispatched to your address.',
    icon: Truck
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Groceries safely delivered to your doorstep.',
    icon: CheckCheck
  }
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrder
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [searchCode, setSearchCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setSearching(true);
    setSearchError('');
    try {
      const order = await api.getOrder(searchCode.trim());
      if (order) {
        setCurrentOrder(order);
      } else {
        setSearchError(`No order found with code "${searchCode}". Try KF-8821 or your order reference.`);
      }
    } catch {
      setSearchError('Error finding order. Please verify your order number.');
    } finally {
      setSearching(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Received': return 0;
      case 'Packing': return 1;
      case 'Out for delivery': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = currentOrder ? getStepIndex(currentOrder.order_status) : 0;

  const whatsappInquiry = currentOrder
    ? encodeURIComponent(`Hello Kampala Fresh, I am checking on my order ${currentOrder.order_number} to ${currentOrder.delivery_area}.`)
    : encodeURIComponent('Hello Kampala Fresh, I have an inquiry about grocery delivery.');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-lg leading-tight">Order Tracking</h2>
              <p className="text-xs text-emerald-200">Live delivery status across Kampala</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-emerald-800 text-emerald-100 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lookup bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Order # (e.g. KF-8821 or KF-8822)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 uppercase tracking-wider font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {searching ? 'Finding...' : 'Track'}
            </button>
          </form>
          {searchError && (
            <p className="text-[11px] text-rose-700 font-medium mt-2">
              ⚠️ {searchError}
            </p>
          )}
        </div>

        {/* Tracking Details */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {currentOrder ? (
            <>
              {/* Order Status Header Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
                    Order Reference
                  </div>
                  <div className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
                    {currentOrder.order_number}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                    Placed for {currentOrder.customer_name} ({currentOrder.customer_phone})
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-700 text-white shadow-xs">
                    {currentOrder.order_status}
                  </span>
                  <div className="text-xs text-gray-500 font-bold mt-1">
                    Total: UGX {currentOrder.total_ugx.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Visual 4-Step Stepper (Received, Packing, Out for delivery, Delivered) */}
              <div className="relative pl-2 sm:pl-4 space-y-6 before:absolute before:left-6.5 sm:before:left-8.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      {/* Step Circle */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-xs ${
                          isCompleted
                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-extrabold ${
                              isCurrent
                                ? 'text-emerald-900 font-black'
                                : isCompleted
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isCompleted ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Meta Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 text-xs">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Delivery Address
                  </span>
                  <div className="font-extrabold text-gray-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{currentOrder.delivery_area}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{currentOrder.delivery_address}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 text-xs">
                  <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Delivery Slot & Payment
                  </span>
                  <div className="font-extrabold text-gray-900 capitalize">
                    Slot: {currentOrder.delivery_slot} (8am-12pm / 12-4pm / 4-8pm)
                  </div>
                  <p className="text-emerald-800 font-bold mt-1">
                    Method: {currentOrder.payment_method.replace(/_/g, ' ').toUpperCase()} (
                    {currentOrder.payment_status})
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Produce in this Delivery
                </h4>
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {currentOrder.items.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between bg-white">
                      <div>
                        <span className="font-extrabold text-gray-900">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="text-[11px] text-gray-500 ml-1">
                          ({item.unit})
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-800">
                        UGX {item.line_total_ugx.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 flex items-center justify-between font-bold text-gray-600">
                    <span>Kampala Delivery Fee:</span>
                    <span>UGX {currentOrder.delivery_fee_ugx.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href={`https://wa.me/256772123456?text=${whatsappInquiry}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>Chat with Dispatch Rider on WhatsApp</span>
                </a>
                <a
                  href="tel:+256772123456"
                  className="py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Call Depot</span>
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
                📦
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Track any order with your code</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Enter your order reference above (e.g. KF-8821, KF-8822, or place a new order) to see real-time delivery status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
