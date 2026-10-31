import React, { useState, useEffect } from 'react';
import { PaymentMethod, Order } from '../types';
import { X, Check, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck, Smartphone, Banknote, Sparkles } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onPaymentSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(order.payment_method || 'mtn_momo');
  const [momoPhone, setMomoPhone] = useState(order.customer_phone);
  const [paymentState, setPaymentState] = useState<'select' | 'pending' | 'success' | 'failed'>('select');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(25);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentState === 'pending' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (paymentState === 'pending' && countdown === 0) {
      // Auto-timeout after countdown if not manually approved
      setPaymentState('failed');
      setErrorMessage(`Prompt timed out on ${momoPhone}. Please ensure your phone is unlocked and try again.`);
    }
    return () => clearTimeout(timer);
  }, [paymentState, countdown, momoPhone]);

  if (!isOpen) return null;

  const handleInitiatePayment = () => {
    if (selectedMethod === 'cash_on_delivery') {
      // Direct completion for Pay on Delivery
      const updated: Order = {
        ...order,
        payment_method: 'cash_on_delivery',
        payment_status: 'pending' // Pending collection on delivery
      };
      onPaymentSuccess(updated);
      return;
    }

    // For MTN MoMo or Airtel Money
    setPaymentState('pending');
    setCountdown(25);
    setErrorMessage('');
  };

  const handleSimulateSuccess = () => {
    const updated: Order = {
      ...order,
      payment_method: selectedMethod,
      payment_status: 'completed',
      payment_ref: (selectedMethod === 'airtel_money' ? 'AIRTEL-' : 'MOMO-') + 'UG-' + Math.floor(100000 + Math.random() * 900000)
    };
    setPaymentState('success');
    setTimeout(() => {
      onPaymentSuccess(updated);
    }, 1200);
  };

  const handleSimulateFailure = () => {
    setPaymentState('failed');
    setErrorMessage(`Mobile money prompt was cancelled or failed due to insufficient balance on ${momoPhone}.`);
  };

  const handleRetry = () => {
    setRetryCount(r => r + 1);
    setCountdown(25);
    setErrorMessage('');
    setPaymentState('pending');
  };

  const handleSwitchToCOD = () => {
    setSelectedMethod('cash_on_delivery');
    setPaymentState('select');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-lg leading-tight">Payment Method</h2>
              <p className="text-xs text-emerald-200">Order Ref: {order.order_number}</p>
            </div>
          </div>
          {paymentState !== 'pending' && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-emerald-800 text-emerald-100 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Amount bar */}
        <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
          <span className="text-xs text-emerald-900 font-bold">Total to Pay (includes UGX 3,000 delivery):</span>
          <span className="text-lg font-black text-emerald-900">
            UGX {order.total_ugx.toLocaleString()}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* STEP 1: SELECT METHOD */}
          {paymentState === 'select' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 font-medium">
                Choose your preferred way to pay for your Kampala Fresh order:
              </p>

              {/* MTN MoMo Option */}
              <div
                onClick={() => setSelectedMethod('mtn_momo')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedMethod === 'mtn_momo'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs flex items-center justify-center shadow-xs">
                      MTN
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-gray-900">MTN Mobile Money</div>
                      <div className="text-[11px] text-gray-500">Instant USSD prompt (*165#)</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={selectedMethod === 'mtn_momo'}
                    onChange={() => setSelectedMethod('mtn_momo')}
                    className="accent-amber-500 w-4 h-4"
                  />
                </div>

                {selectedMethod === 'mtn_momo' && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      MTN MoMo Number for prompt
                    </label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="077... or 078..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Airtel Money Option */}
              <div
                onClick={() => setSelectedMethod('airtel_money')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedMethod === 'airtel_money'
                    ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      Airtel
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-gray-900">Airtel Money</div>
                      <div className="text-[11px] text-gray-500">Instant USSD prompt (*185#)</div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={selectedMethod === 'airtel_money'}
                    onChange={() => setSelectedMethod('airtel_money')}
                    className="accent-rose-500 w-4 h-4"
                  />
                </div>

                {selectedMethod === 'airtel_money' && (
                  <div className="mt-3 pt-3 border-t border-rose-200/60">
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Airtel Money Number for prompt
                    </label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="070... or 075..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Pay on Delivery Option */}
              <div
                onClick={() => setSelectedMethod('cash_on_delivery')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-gray-900">Pay on Delivery</div>
                      <div className="text-[11px] text-gray-500">
                        Pay cash or mobile money directly to rider upon delivery
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={selectedMethod === 'cash_on_delivery'}
                    onChange={() => setSelectedMethod('cash_on_delivery')}
                    className="accent-emerald-700 w-4 h-4"
                  />
                </div>
              </div>

              {/* Developer note requirement */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-tight">
                <strong>Telecom Integration Placeholder:</strong> Mobile money flows simulate live USSD approval and webhook callbacks, fully isolated and ready for live telecom gateway endpoints.
              </div>

              <button
                onClick={handleInitiatePayment}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-4"
              >
                <span>
                  {selectedMethod === 'cash_on_delivery' ? 'Confirm Order (Pay on Delivery)' : 'Authorize Mobile Money'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: PENDING PAYMENT STATE (USSD PROMPT SIMULATION) */}
          {paymentState === 'pending' && (
            <div className="text-center py-4 space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-700 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-emerald-900">
                  {countdown}s
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
                  Payment Pending
                </span>
                <h3 className="text-lg font-black text-gray-900">
                  Authorizing {selectedMethod === 'airtel_money' ? 'Airtel Money' : 'MTN MoMo'}
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1">
                  We've initiated a payment request for <strong>UGX {order.total_ugx.toLocaleString()}</strong> to <strong>{momoPhone}</strong>.
                </p>
              </div>

              {/* Simulated Handset Screen */}
              <div className="bg-gray-900 text-white rounded-2xl p-4 text-left shadow-lg max-w-xs mx-auto border-2 border-gray-700 font-mono text-xs space-y-2">
                <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-between">
                  <span>📱 HANDSET USSD PUSH</span>
                  <span>SIM 1</span>
                </div>
                <div className="text-gray-200">
                  Kampala Fresh: Pay UGX {order.total_ugx.toLocaleString()} for {order.order_number}?
                </div>
                <div className="text-amber-400 text-[11px]">
                  Enter MoMo PIN to authorize: [ * * * * ]
                </div>
              </div>

              {/* Simulator Action Controls for developer testing */}
              <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Simulation Test Controls:
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSimulateSuccess}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simulate Approval</span>
                  </button>
                  <button
                    onClick={handleSimulateFailure}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Simulate Failed</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FAILED PAYMENT STATE WITH CLEAR RETRY (Prompt requirement) */}
          {paymentState === 'failed' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
                ✕
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900">Payment Could Not Complete</h3>
                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl mt-2 max-w-sm mx-auto">
                  {errorMessage || 'Payment timed out or was rejected.'}
                </p>
                {retryCount > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Attempt #{retryCount + 1}
                  </p>
                )}
              </div>

              {/* Retry & Fallback Options */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleRetry}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Mobile Money Payment</span>
                </button>

                <button
                  onClick={handleSwitchToCOD}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Switch to Pay on Delivery Instead</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS STATE */}
          {paymentState === 'success' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl animate-bounce">
                ✓
              </div>
              <h3 className="text-xl font-black text-emerald-900">Payment Confirmed!</h3>
              <p className="text-xs text-gray-600">
                Ref: {order.payment_ref || 'MOMO-UG-VERIFIED'}
              </p>
              <p className="text-xs text-emerald-700 font-semibold">
                Redirecting to order tracking...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
