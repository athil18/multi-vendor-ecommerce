/**
 * Express Checkout & Multi-Vendor Escrow Split Flow
 * 
 * @agent design-ux-architect
 * @agent design-ui-designer
 * @agent engineering-frontend-developer
 * @agent engineering-payments-billing-engineer
 * @agent testing-accessibility-auditor
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { apiClient } from '@/lib/api-client';
import { CreditCard, MapPin, ShoppingBag, ShieldCheck, ArrowLeft, Tag, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(false);

  // Address form fields
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [stateRegion, setStateRegion] = useState('CA');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

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
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');
      setAppliedCoupon(data.code);
      setDiscount(data.discount);
      toast.success(`Coupon applied! You saved $${data.discount.toFixed(2)}`);
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

  const finalTotal = Math.max(0, cartTotal - discount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!name || !street || !city || !zip) {
      toast.error('Please fill in all shipping details');
      return;
    }

    if (!cardNumber || !expiry || !cvc) {
      toast.error('Please enter payment details');
      return;
    }

    try {
      setLoading(true);

      // 1. Post to create address
      const address = await apiClient.addresses.create({
        type: 'shipping',
        street,
        city,
        state: stateRegion || 'CA',
        zip,
        country,
      });

      const shippingAddressId = address._id;

      // 2. Create the Order in DB
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const orderData = await apiClient.orders.create({
        orderItems,
        shippingAddressId,
        paymentMethod: 'card',
        couponCode: appliedCoupon || undefined,
      });

      const orderId = orderData._id || orderData.id;

      // 3. Call Stripe Payment Intent
      const intentData = await apiClient.payments.createIntent({ orderId });
      
      toast.success('Order placed! Complete payment to confirm your order.');
      clearCart();
      router.push('/customer');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-grow items-center justify-center py-20 px-4">
        <div className="text-center flex flex-col gap-4 items-center">
          <div className="rounded-full bg-surface-container p-6 text-on-surface-variant">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h1 className="text-title-md text-on-surface">Checkout</h1>
          <p className="text-body-sm text-on-surface-variant max-w-xs">Your shopping cart is currently empty. Go back and select products before checkout.</p>
          <Link href="/" className="bg-primary hover:bg-primary-fixed text-on-primary font-bold py-2.5 px-6 rounded-lg text-label-md transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-6">
        <Link href="/" aria-label="Back to store" className="rounded-full p-2 text-on-surface-variant hover:bg-surface-variant transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-headline-lg text-on-surface">Secure Checkout</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Please review your billing, shipping, and credit card credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form Inputs columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
            
            {/* Shipping Info Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm uppercase flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-primary" />
                  1. Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Recipient Name</Label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label>Address line</Label>
                    <Input
                      type="text"
                      placeholder="Street Address"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>City</Label>
                    <Input
                      type="text"
                      placeholder="San Francisco"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Postal / Zip Code</Label>
                    <Input
                      type="text"
                      placeholder="94103"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm uppercase flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                  2. Secure Payment Details (256-bit SSL Encrypted)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Card Number</Label>
                    <Input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Expiry Date</Label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        required
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label>CVC Code</Label>
                      <Input
                        type="password"
                        placeholder="•••"
                        required
                        maxLength={4}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit checkout */}
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full text-lg"
            >
              {!loading && <ShieldCheck className="h-5 w-5" />}
              {loading ? 'Processing transaction...' : `Pay $${finalTotal.toFixed(2)} Now`}
            </Button>

          </form>
        </div>

        {/* Invoice Summary Side-Panel */}
        <Card className="lg:col-span-1 sticky top-24">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm uppercase">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs justify-between">
                  <div>
                    <span className="font-bold text-on-surface line-clamp-1">{item.name}</span>
                    <span className="text-on-surface-variant font-medium">Qty: {item.quantity} x ${item.price}</span>
                  </div>
                  <span className="font-bold text-on-surface">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-4 flex flex-col gap-2.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-tertiary">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Coupon ({appliedCoupon})
                    <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="ml-1 text-on-surface-variant hover:text-error transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                  <span className="font-semibold">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-tertiary font-bold uppercase">Free</span>
              </div>

              <div className="pt-3 pb-1 border-t border-outline-variant/10">
                {!appliedCoupon && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter coupon code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="h-8 text-xs"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput}>
                        {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                    {couponError && <p className="text-error text-[10px]">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-body-sm font-bold text-on-surface pt-2 border-t border-outline-variant/20">
                <span>Total Amount</span>
                <span className="text-primary text-lg font-bold">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
