'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AddressCardModal from '@/components/AddressCardModal';
import {
  CheckCircle,
  MapPin,
  CreditCard,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  effectivePrice: number;
  quantity: number;
  image: string;
  itemSubtotal: number;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address & Items, 2: Payment, 3: Confirmation
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_DEMO'>('COD');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCheckoutData = useCallback(async () => {
    try {
      const [cartRes, addrRes] = await Promise.all([
        fetch('/api/cart'),
        fetch('/api/addresses'),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCartItems(cartData.items || []);
        setSubtotal(cartData.subtotal || 0);
        setDeliveryFee(cartData.deliveryFee || 0);
        setTotal(cartData.total || 0);

        if (!cartData.items || cartData.items.length === 0) {
          router.push('/cart');
          return;
        }
      }

      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData.addresses || []);
        const defaultAddr = addrData.addresses.find((a: Address) => a.isDefault) || addrData.addresses[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      }
    } catch (error) {
      console.error('Failed to load checkout data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCheckoutData();
  }, [fetchCheckoutData]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address to proceed.');
      return;
    }

    setPlacingOrder(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to place order. Please try again.');
      } else {
        setCompletedOrder(data.order);
        setStep(3); // Confirmation screen
      }
    } catch {
      setErrorMsg('An unexpected error occurred while placing order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Preparing secure checkout session...
      </div>
    );
  }

  // Step 3: Order Confirmation Screen
  if (step === 3 && completedOrder) {
    const shipping = JSON.parse(completedOrder.shippingAddress);

    return (
      <div className="max-w-2xl mx-auto my-8 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Order Placed Successfully!
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thank You for Shopping!</h1>
          <p className="text-xs text-slate-500">
            Order ID: <strong className="text-slate-900 font-mono text-sm">{completedOrder.orderNumber}</strong>
          </p>
        </div>

        {/* Receipt Details Box */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
            <span>Payment Method</span>
            <span className="text-brand-600 uppercase">{completedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Demo Online Payment (Paid)'}</span>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">Delivery Address:</span>
            <p className="text-slate-700">{shipping.fullName}, {shipping.phone}</p>
            <p className="text-slate-500">{shipping.houseBuilding}, {shipping.street}, {shipping.area}, {shipping.city}, {shipping.state} - {shipping.pincode}</p>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-sm text-slate-900">
            <span>Total Amount Paid</span>
            <span className="text-brand-600">₹{completedOrder.finalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            href={`/orders/${completedOrder.id}`}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition"
          >
            Track Order Status
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Checkout Stepper Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout & Order Placement</h1>
          <p className="text-xs text-slate-500 font-medium">Fast, secure 256-bit encrypted checkout</p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${step === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <span>1. Shipping Address</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            <span>2. Payment Method</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content (Step 1 or Step 2) */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 ? (
            /* STEP 1: SELECT OR ADD ADDRESS */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600" /> Select Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-6 space-y-3 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500 font-medium">You have no saved addresses yet.</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow"
                  >
                    + Add Delivery Address Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative space-y-1.5 ${
                        selectedAddressId === addr.id
                          ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-700">{addr.phone}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {addr.houseBuilding}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Items Preview */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                  Items in this Order ({cartItems.length})
                </h4>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 line-clamp-1">{item.name}</span>
                          <span className="text-slate-500 text-[11px]">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">
                        ₹{item.itemSubtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    if (!selectedAddressId) {
                      alert('Please select or add a shipping address.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: SELECT PAYMENT METHOD */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-600" /> Choose Payment Option
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-brand-600 font-bold hover:underline"
                >
                  ← Back to Address
                </button>
              </div>

              <div className="space-y-4">
                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                      ₹
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-slate-500">Pay with cash or UPI when your parcel is delivered to your doorstep.</p>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && <CheckCircle className="w-5 h-5 text-brand-600" />}
                </div>

                {/* Demo Online Payment Option */}
                <div
                  onClick={() => setPaymentMethod('ONLINE_DEMO')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === 'ONLINE_DEMO'
                      ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Demo Online Payment (Instant)</h4>
                      <p className="text-xs text-slate-500">Simulate UPI/NetBanking/Card payment without entering sensitive details.</p>
                    </div>
                  </div>
                  {paymentMethod === 'ONLINE_DEMO' && <CheckCircle className="w-5 h-5 text-brand-600" />}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guaranteed 100% Buyer Protection
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition disabled:opacity-50"
                >
                  {placingOrder ? 'Processing Order...' : `Place Order (₹${total.toLocaleString('en-IN')})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 sticky top-24">
          <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
            Order Total
          </h3>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>Items Total ({cartItems.reduce((a, b) => a + b.quantity, 0)})</span>
              <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Express Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  FREE
                </span>
              ) : (
                <span className="font-bold">₹{deliveryFee}</span>
              )}
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-black text-sm text-slate-900">Final Order Total</span>
              <span className="font-black text-xl text-brand-600">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 space-y-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Estimated Delivery: <strong>2 - 4 Business Days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressCardModal
          onClose={() => setShowAddressModal(false)}
          onSuccess={fetchCheckoutData}
        />
      )}
    </div>
  );
}
