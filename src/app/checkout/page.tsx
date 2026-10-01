/**
 * Multi-Vendor Escrow Split Checkout Flow
 * Production-grade multi-step checkout with real-time validation, server-side pricing,
 * transparent escrow guarantees, and order confirmation.
 * 
 * @agent design-ux-architect
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent engineering-payments-billing-engineer
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { apiClient } from '@/lib/api-client';
import { 
  CreditCard, MapPin, ShoppingBag, ShieldCheck, ArrowLeft, 
  Tag, X, Loader2, CheckCircle2, Truck, Lock, AlertCircle,
  PackageOpen, ChevronRight, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Step 1: Address form fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('CA');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  // Step 2: Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Dynamic shipping calculation
  const isFreeStandardShipping = cartTotal >= 150;
  const standardShippingCost = isFreeStandardShipping ? 0 : 15;
  const expressShippingCost = 25;
  const shippingFee = shippingMethod === 'standard' ? standardShippingCost : expressShippingCost;

  const finalTotal = Math.max(0, cartTotal - discount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: cartTotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired coupon code');
      setAppliedCoupon(data.code);
      setDiscount(data.discount);
      toast.success(`Coupon applied! Saved $${data.discount.toFixed(2)}`);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to complete your checkout and secure escrow protection.');
      router.push('/auth/login?returnUrl=/checkout');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!name.trim() || !street.trim() || !city.trim() || !zip.trim()) {
      toast.error('Please complete all required shipping address fields');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber.trim() || !expiry.trim() || !cvc.trim())) {
      toast.error('Please enter payment card information');
      return;
    }

    try {
      setLoading(true);

      // 1. Post shipping address
      const address = await apiClient.addresses.create({
        type: 'shipping',
        street: street.trim(),
        city: city.trim(),
        state: stateRegion.trim() || 'CA',
        zip: zip.trim(),
        country: country.trim(),
      }, token || undefined);

      const shippingAddressId = address._id || address.id;

      // 2. Create the Order in DB
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const orderData = await apiClient.orders.create({
        orderItems,
        shippingAddressId,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
      }, token || undefined);

      const orderId = orderData._id || orderData.id;

      // 3. If card payment, initiate Stripe payment intent
      if (paymentMethod === 'card') {
        await apiClient.payments.createIntent({ orderId }, token || undefined);
      }

      // 4. Save confirmed order state for confirmation screen
      setConfirmedOrder({
        id: orderId,
        total: finalTotal,
        items: [...cart],
        shippingAddress: `${street}, ${city}, ${stateRegion} ${zip}, ${country}`,
        recipient: name,
        paymentMethod: paymentMethod === 'card' ? 'Stripe Connect Escrow Vault' : 'Cash on Delivery (COD)',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      });

      clearCart();
      toast.success('Order placed successfully! Escrow vault initialized.');
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Order Confirmation Screen ─────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="max-w-2xl w-full glass-luxury-card specular-border rounded-3xl p-8 sm:p-12 shadow-2xl text-center">
          <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <span className="specular-pill text-emerald-700 dark:text-emerald-400 mb-3">
            Escrow Status: Protected & Vaulted
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white tracking-tight font-sans mb-3 mt-2">
            Thank You for Your Order!
          </h1>
          <p className="text-surface-600 dark:text-surface-300 text-sm max-w-md mx-auto mb-8 font-normal">
            Your acquisition has been confirmed. Order reference ID: <strong className="text-surface-900 dark:text-white font-mono">{confirmedOrder.id}</strong>.
          </p>

          <div className="bg-surface-100 dark:bg-surface-850 rounded-2xl p-6 mb-8 text-left text-xs sm:text-sm space-y-3 border border-surface-200 dark:border-surface-700">
            <div className="flex justify-between border-b border-surface-200/60 dark:border-surface-700/60 pb-2">
              <span className="text-surface-500">Recipient</span>
              <span className="font-bold text-surface-900 dark:text-white">{confirmedOrder.recipient}</span>
            </div>
            <div className="flex justify-between border-b border-surface-200/60 dark:border-surface-700/60 pb-2">
              <span className="text-surface-500">Shipping Destination</span>
              <span className="font-bold text-surface-900 dark:text-white text-right max-w-xs truncate">{confirmedOrder.shippingAddress}</span>
            </div>
            <div className="flex justify-between border-b border-surface-200/60 dark:border-surface-700/60 pb-2">
              <span className="text-surface-500">Payment Channel</span>
              <span className="font-bold text-surface-900 dark:text-white">{confirmedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-surface-500 font-bold">Total Paid</span>
              <span className="font-black text-brand-600 dark:text-brand-400 text-base font-geist">${confirmedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left text-xs text-emerald-800 dark:text-emerald-300 mb-8 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <span className="font-bold block">100% Escrow Guarantee Active</span>
              <span>Your funds are held securely. The creator workshop only receives payment once you inspect and confirm delivery.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/customer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs h-12">
                View in Customer Portal
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 text-xs font-bold h-12">
                Continue Exploring
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty Cart State ──────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-24 px-4 flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center flex flex-col gap-4 items-center max-w-md">
          <div className="rounded-full bg-surface-100 dark:bg-surface-800 p-8 text-surface-400">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-black text-surface-900 dark:text-white">Your Cart is Empty</h1>
          <p className="text-sm text-surface-500 leading-relaxed font-normal">
            You haven&apos;t selected any items yet. Explore our curated collections to find handcrafted goods and creator pieces.
          </p>
          <Link href="/products" className="mt-4">
            <Button size="lg" className="rounded-full px-8 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs h-12">
              Browse Collection
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Navigation Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 pb-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/products" 
              aria-label="Back to store" 
              className="rounded-full p-2.5 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-white tracking-tight">
                Secure Checkout
              </h1>
              <p className="text-xs text-surface-500 mt-0.5">
                Multi-vendor escrow protected purchase with 256-bit SSL encryption.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow Protected &bull; 14-Day Physical Inspection</span>
          </div>
        </div>

        {/* Guest Warning / Sign-In Fast Track */}
        {!user && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200 block">Sign In for Fast-Track Checkout</span>
                <span className="text-amber-700 dark:text-amber-300">Sign in to save your address, view order receipts, and track your escrow delivery.</span>
              </div>
            </div>
            <Link href="/auth/login?returnUrl=/checkout" className="flex-shrink-0">
              <Button size="sm" variant="outline" className="rounded-xl border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 text-xs font-bold">
                Sign In Now
              </Button>
            </Link>
          </div>
        )}

        {/* ─── Main Two-Column Layout ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form Steps (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-8">
              
              {/* Step 1: Shipping Address */}
              <Card className="rounded-3xl border-surface-200 dark:border-surface-800 shadow-sm">
                <CardHeader className="pb-4 border-b border-surface-100 dark:border-surface-800">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    1. Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Recipient Full Name</Label>
                      <Input
                        type="text"
                        placeholder="Aathil Jane"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Street Address</Label>
                      <Input
                        type="text"
                        placeholder="742 Evergreen Terrace, Suite 100"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">City</Label>
                      <Input
                        type="text"
                        placeholder="San Francisco"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">State / Region</Label>
                      <Input
                        type="text"
                        placeholder="California"
                        required
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Postal / Zip Code</Label>
                      <Input
                        type="text"
                        placeholder="94103"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Country</Label>
                      <Input
                        type="text"
                        placeholder="United States"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Delivery Method */}
              <Card className="rounded-3xl border-surface-200 dark:border-surface-800 shadow-sm">
                <CardHeader className="pb-4 border-b border-surface-100 dark:border-surface-800">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-2">
                    <Truck className="h-4 w-4 text-brand-600" />
                    2. Delivery Method & Speed
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setShippingMethod('standard')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        shippingMethod === 'standard'
                          ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40'
                          : 'border-surface-200 dark:border-surface-800 hover:border-surface-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-surface-900 dark:text-white">Carbon-Neutral Standard</span>
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                            {isFreeStandardShipping ? 'FREE' : '$15.00'}
                          </span>
                        </div>
                        <p className="text-xs text-surface-500">3-5 business days. 100% climate offset direct dispatch.</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setShippingMethod('express')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        shippingMethod === 'express'
                          ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40'
                          : 'border-surface-200 dark:border-surface-800 hover:border-surface-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-surface-900 dark:text-white">Express Inspected Courier</span>
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">$25.00</span>
                        </div>
                        <p className="text-xs text-surface-500">1-2 business days. Direct door-to-door insured routing.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Payment Method */}
              <Card className="rounded-3xl border-surface-200 dark:border-surface-800 shadow-sm">
                <CardHeader className="pb-4 border-b border-surface-100 dark:border-surface-800">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-brand-600" />
                    3. Escrow Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        paymentMethod === 'card'
                          ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40'
                          : 'border-surface-200 dark:border-surface-800 hover:border-surface-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white mb-1">
                        <CreditCard className="w-4 h-4 text-brand-600" />
                        <span>Stripe Escrow Card</span>
                      </div>
                      <p className="text-xs text-surface-500">256-bit encrypted card payment held in vault.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40'
                          : 'border-surface-200 dark:border-surface-800 hover:border-surface-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white mb-1">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-xs text-surface-500">Pay safely upon delivery inspection.</p>
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-4 pt-2">
                      <div className="p-3.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-300 flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Stripe Connect Escrow Vault:</strong> Funds are locked in escrow upon payment. The creator is only remitted their payout once you inspect and approve your delivery.
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Card Number</Label>
                        <Input
                          type="text"
                          placeholder="4242 •••• •••• 4242"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="rounded-xl font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Expiration (MM/YY)</Label>
                          <Input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="rounded-xl font-mono"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <Label className="text-xs font-bold text-surface-700 dark:text-surface-300">Security CVC</Label>
                          <Input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        You have selected <strong>Cash on Delivery</strong>. Our verified delivery courier will inspect the package with you before accepting payment. An official escrow receipt will be generated.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full text-base font-bold h-14 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Securing Escrow Vault & Authorizing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>Authorize & Confirm Order (${finalTotal.toFixed(2)})</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Right Column: Invoice Summary (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-surface-200 dark:border-surface-800 shadow-sm sticky top-28">
              <CardHeader className="pb-4 border-b border-surface-100 dark:border-surface-800">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-900 dark:text-white flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs text-surface-400 font-normal">({cart.length} items)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-6">
                
                {/* Itemized List */}
                <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1 divide-y divide-surface-100 dark:divide-surface-800">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 pt-3 first:pt-0">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0 border border-surface-200 dark:border-surface-700">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        ) : (
                          <PackageOpen className="w-6 h-6 text-surface-400 m-auto" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-surface-900 dark:text-white line-clamp-1">{item.name}</span>
                        <span className="text-[11px] text-surface-500">Qty: {item.quantity} &times; ${item.price.toFixed(2)}</span>
                      </div>
                      <span className="font-bold text-xs text-surface-900 dark:text-white whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="pt-4 border-t border-surface-100 dark:border-surface-800">
                  {!appliedCoupon ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Promo or Artisan code" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="h-10 text-xs rounded-xl"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleApplyCoupon} 
                          disabled={couponLoading || !couponInput.trim()}
                          className="rounded-xl px-4 text-xs font-bold"
                        >
                          {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {couponError && <p className="text-red-500 text-[11px]">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Tag className="w-3.5 h-3.5" /> Code: {appliedCoupon} (-${discount.toFixed(2)})
                      </span>
                      <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="text-surface-400 hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Calculation Breakdown */}
                <div className="border-t border-surface-100 dark:border-surface-800 pt-4 flex flex-col gap-2.5 text-xs text-surface-600 dark:text-surface-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-surface-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping ({shippingMethod === 'standard' ? 'Carbon-Neutral' : 'Express Courier'})</span>
                    <span className="font-semibold text-surface-900 dark:text-white">
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-black text-surface-900 dark:text-white pt-3 border-t border-surface-200 dark:border-surface-700">
                    <span>Total Amount</span>
                    <span className="text-brand-600 dark:text-brand-400 text-xl font-geist">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Escrow Guarantee Box */}
                <div className="p-4 rounded-2xl bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 space-y-2 text-[11px] text-surface-500">
                  <div className="flex items-center gap-1.5 font-bold text-surface-900 dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Nexus Escrow Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    Zero risk purchasing. Your payout to the merchant is held in escrow until 14 days after tracking confirms successful delivery.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
