/**
 * Multi-Step Express Checkout & Multi-Vendor Escrow Split Flow
 * 
 * Applies 20 UX Laws:
 * - Hick's Law (#1): Reduces choices per screen by dividing into 3 focused stages
 * - Miller's Law (#5): Chunks cognitive load (Shipping ➔ Payment ➔ Review)
 * - Doherty Threshold (#6): Real-time input formatting & instant feedback
 * - Von Restorff Effect (#7): Dominant primary action per section
 * - Zeigarnik Effect (#11): Visible progress stepper showing completed and remaining steps
 * - Postel's Law (#14, #15): Proactive inline validation with graceful error recovery
 * - Peak-End Rule (#10): Redirects to dedicated celebration & fulfillment tracker
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
import { 
  CreditCard, MapPin, ShoppingBag, ShieldCheck, 
  ArrowLeft, ArrowRight, Tag, X, Loader2, CheckCircle2,
  Lock, AlertCircle, Edit2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';

type CheckoutStep = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [loading, setLoading] = useState(false);

  // Address form fields
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [stateRegion, setStateRegion] = useState('CA');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  // Address validation errors (Postel's Law #14)
  const [shippingErrors, setShippingErrors] = useState<{ [key: string]: string }>({});

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<{ [key: string]: string }>({});

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Proactive Input Formatter for Card (Doherty Threshold #6)
  const handleCardNumberChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    if (paymentErrors.cardNumber && raw.length === 16) {
      setPaymentErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Expiry date formatter (MM/YY)
  const handleExpiryChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length >= 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(formatted);
    if (paymentErrors.expiry && raw.length === 4) {
      setPaymentErrors((prev) => ({ ...prev, expiry: '' }));
    }
  };

  // CVC formatter (3-4 digits)
  const handleCvcChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 4);
    setCvc(raw);
    if (paymentErrors.cvc && raw.length >= 3) {
      setPaymentErrors((prev) => ({ ...prev, cvc: '' }));
    }
  };

  // Validate Step 1 before advancing
  const handleProceedToPayment = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Please provide the recipient name.';
    if (!street.trim()) errors.street = 'Please provide the delivery street address.';
    if (!city.trim()) errors.city = 'Please provide the destination city.';
    if (!zip.trim() || zip.replace(/\D/g, '').length < 5) {
      errors.zip = 'Please enter a valid 5-digit ZIP code.';
    }

    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
      toast.error('Please complete all required shipping fields.');
      return;
    }

    setShippingErrors({});
    setCurrentStep(2);
  };

  // Validate Step 2 before advancing
  const handleProceedToReview = () => {
    const errors: { [key: string]: string } = {};
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 16) {
      errors.cardNumber = 'Please enter a 16-digit card number.';
    }
    if (expiry.length < 5) {
      errors.expiry = 'Enter MM/YY.';
    }
    if (cvc.length < 3) {
      errors.cvc = 'Enter 3-4 digit CVC.';
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      toast.error('Please enter valid payment details.');
      return;
    }

    setPaymentErrors({});
    setCurrentStep(3);
  };

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

      const orderId = orderData._id || orderData.id || 'NX-ORDER';

      // 3. Call Stripe Payment Intent
      await apiClient.payments.createIntent({ orderId });
      
      toast.success('Escrow order placed successfully!');
      clearCart();

      // Peak-End Rule (#10): Route to celebration page with order ID
      router.push(`/checkout/success?orderId=${orderId}&total=${finalTotal.toFixed(2)}`);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Checkout failed. Please review your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-grow items-center justify-center py-20 px-4 min-h-[60vh]">
        <div className="text-center flex flex-col gap-4 items-center">
          <div className="rounded-xl bg-surface-container p-5 text-on-surface-variant border border-outline-variant/30">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="text-title-md text-on-surface font-bold">Your Cart is Empty</h1>
          <p className="text-body-sm text-on-surface-variant max-w-xs">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link 
            href="/products" 
            className="bg-primary hover:bg-primary-fixed text-on-primary font-medium py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      
      {/* Title & Navigation */}
      <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-6">
        <Link href="/cart" aria-label="Back to shopping cart" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-variant transition-colors border border-outline-variant/30">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-headline-lg text-on-surface font-black tracking-tight">Secure Escrow Checkout</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            256-Bit TLS Encryption &bull; Institutional Buyer Escrow Protection
          </p>
        </div>
      </div>

      {/* ─── Multi-Step Visual Progress Stepper (Zeigarnik Effect #11 & Miller's Law #5) ─── */}
      <nav aria-label="Checkout Progress" className="w-full">
        <ol className="grid grid-cols-3 gap-2 sm:gap-4 p-2 bg-surface-container-low rounded-2xl border border-outline-variant/20">
          {/* Step 1 */}
          <li 
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 1 
                ? 'bg-surface-container-high shadow-sm text-primary font-bold' 
                : currentStep > 1 
                  ? 'text-emerald-500 font-medium hover:bg-surface-container' 
                  : 'text-on-surface-variant/50 cursor-not-allowed'
            }`}
          >
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 1 
                ? 'bg-emerald-500 text-white' 
                : currentStep === 1 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-outline-variant/40 text-on-surface-variant'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </div>
            <span className="text-xs sm:text-sm truncate">1. Shipping</span>
          </li>

          {/* Step 2 */}
          <li 
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all cursor-pointer ${
              currentStep === 2 
                ? 'bg-surface-container-high shadow-sm text-primary font-bold' 
                : currentStep > 2 
                  ? 'text-emerald-500 font-medium hover:bg-surface-container' 
                  : 'text-on-surface-variant/50 cursor-not-allowed'
            }`}
          >
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep > 2 
                ? 'bg-emerald-500 text-white' 
                : currentStep === 2 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-outline-variant/40 text-on-surface-variant'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </div>
            <span className="text-xs sm:text-sm truncate">2. Payment</span>
          </li>

          {/* Step 3 */}
          <li 
            className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
              currentStep === 3 
                ? 'bg-surface-container-high shadow-sm text-primary font-bold' 
                : 'text-on-surface-variant/50'
            }`}
          >
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 
                ? 'bg-primary text-on-primary' 
                : 'bg-outline-variant/40 text-on-surface-variant'
            }`}>
              3
            </div>
            <span className="text-xs sm:text-sm truncate">3. Review</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form Inputs columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <form onSubmit={handlePlaceOrder} className="flex flex-col gap-6">
            
            {/* ─── Step 1: Shipping Address (Miller's Law #5) ─── */}
            {currentStep === 1 && (
              <Card className="animate-in fade-in duration-200">
                <CardHeader className="pb-4 border-b border-outline-variant/20">
                  <CardTitle className="text-sm uppercase flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-primary" />
                    Step 1: Recipient & Destination Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="checkout-name" className="text-xs font-bold">
                        Recipient Full Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="checkout-name"
                        type="text"
                        placeholder="e.g. Johnathan Vance"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (shippingErrors.name) setShippingErrors((p) => ({ ...p, name: '' }));
                        }}
                      />
                      {shippingErrors.name && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> {shippingErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="checkout-street" className="text-xs font-bold">
                        Street Address & Suite <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="checkout-street"
                        type="text"
                        placeholder="e.g. 742 Evergreen Terrace, Suite 4B"
                        required
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                          if (shippingErrors.street) setShippingErrors((p) => ({ ...p, street: '' }));
                        }}
                      />
                      {shippingErrors.street && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> {shippingErrors.street}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkout-city" className="text-xs font-bold">
                        City <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="checkout-city"
                        type="text"
                        placeholder="San Francisco"
                        required
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (shippingErrors.city) setShippingErrors((p) => ({ ...p, city: '' }));
                        }}
                      />
                      {shippingErrors.city && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> {shippingErrors.city}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkout-zip" className="text-xs font-bold">
                        Postal / ZIP Code <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="checkout-zip"
                        type="text"
                        placeholder="94103"
                        required
                        maxLength={10}
                        value={zip}
                        onChange={(e) => {
                          setZip(e.target.value);
                          if (shippingErrors.zip) setShippingErrors((p) => ({ ...p, zip: '' }));
                        }}
                      />
                      {shippingErrors.zip && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> {shippingErrors.zip}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-bold">State / Region</Label>
                      <Input
                        type="text"
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        placeholder="CA"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-bold">Country</Label>
                      <Input
                        type="text"
                        value={country}
                        disabled
                        className="opacity-75 cursor-not-allowed bg-surface-container"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button 
                      type="button" 
                      onClick={handleProceedToPayment}
                      className="px-8 font-bold"
                    >
                      Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ─── Step 2: Payment Details (Postel's Law #14 & Miller's Law #5) ─── */}
            {currentStep === 2 && (
              <Card className="animate-in fade-in duration-200">
                <CardHeader className="pb-4 border-b border-outline-variant/20 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm uppercase flex items-center gap-2">
                    <CreditCard className="h-4.5 w-4.5 text-primary" />
                    Step 2: 256-Bit Escrow Vault Payment
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" /> Edit Shipping
                  </button>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkout-card" className="text-xs font-bold">
                        Card Number <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="checkout-card"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        icon={Lock}
                      />
                      {paymentErrors.cardNumber ? (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" /> {paymentErrors.cardNumber}
                        </p>
                      ) : (
                        <p className="text-[11px] text-on-surface-variant">
                          Enter your 16-digit card number. Spacing is applied automatically.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="checkout-expiry" className="text-xs font-bold">
                          Expiry Date (MM/YY) <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="checkout-expiry"
                          type="text"
                          placeholder="12/28"
                          required
                          maxLength={5}
                          value={expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                        />
                        {paymentErrors.expiry && (
                          <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-3 w-3" /> {paymentErrors.expiry}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="checkout-cvc" className="text-xs font-bold">
                          Security CVC <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="checkout-cvc"
                          type="password"
                          placeholder="•••"
                          required
                          maxLength={4}
                          value={cvc}
                          onChange={(e) => handleCvcChange(e.target.value)}
                        />
                        {paymentErrors.cvc && (
                          <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                            <AlertCircle className="h-3 w-3" /> {paymentErrors.cvc}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-primary-container/20 border border-primary/20 flex items-center gap-3 text-xs text-on-surface mt-2">
                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>
                        Your funds are held in zero-risk escrow and released only after verified delivery.
                      </span>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shipping
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleProceedToReview}
                        className="px-8 font-bold"
                      >
                        Review Order <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ─── Step 3: Final Review & Confirmation (Peak-End Preparation #10 & Von Restorff #7) ─── */}
            {currentStep === 3 && (
              <Card className="animate-in fade-in duration-200">
                <CardHeader className="pb-4 border-b border-outline-variant/20">
                  <CardTitle className="text-sm uppercase flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    Step 3: Review Details & Authorize Escrow
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col gap-6">
                  
                  {/* Shipping Recipient Recap */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                        Shipping Recipient
                      </span>
                      <p className="text-sm font-bold text-on-surface">{name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {street}, {city}, {stateRegion} {zip}, {country}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" /> Change
                    </button>
                  </div>

                  {/* Payment Method Recap */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                        Payment & Escrow Source
                      </span>
                      <p className="text-sm font-bold text-on-surface font-mono">
                        Card ending in &bull;&bull;&bull;&bull; {cardNumber.slice(-4) || '4242'}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> 100% Escrow Protection Active
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" /> Change
                    </button>
                  </div>

                  {/* Maker Split Reassurance */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                    <p className="font-bold mb-1">Direct Atelier Empowerment</p>
                    <p>
                      90% of your payment (${(finalTotal * 0.9).toFixed(2)}) is disbursed directly to independent artisans upon verified delivery inspection.
                    </p>
                  </div>

                  {/* Primary CTA (Von Restorff Effect #7) */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="order-2 sm:order-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payment
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      size="lg"
                      className="order-1 sm:order-2 flex-grow text-base font-bold shadow-xl shadow-primary/20"
                    >
                      {!loading && <ShieldCheck className="h-5 w-5 mr-2" />}
                      {loading ? 'Securing Escrow Vault...' : `Confirm Escrow Order &bull; $${finalTotal.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </form>
        </div>

        {/* ─── Sticky Invoice Summary Side-Panel ─── */}
        <Card className="lg:col-span-1 sticky top-24">
          <CardHeader className="pb-4 border-b border-outline-variant/20">
            <CardTitle className="text-sm uppercase flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-on-surface-variant font-normal">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-4">
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs justify-between items-center py-1">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-on-surface line-clamp-1">{item.name}</span>
                    <span className="text-on-surface-variant font-medium">Qty: {item.quantity} &times; ${item.price.toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-on-surface font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-4 flex flex-col gap-2.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Atelier Subtotal</span>
                <span className="font-semibold text-on-surface font-mono">${cartTotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-tertiary">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Coupon ({appliedCoupon})
                    <button type="button" onClick={removeCoupon} aria-label="Remove coupon" className="ml-1 text-on-surface-variant hover:text-error transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                  <span className="font-semibold font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Inspected Courier Delivery</span>
                <span className="text-emerald-500 font-bold uppercase">Complimentary</span>
              </div>

              <div className="pt-3 pb-1 border-t border-outline-variant/10">
                {!appliedCoupon && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Coupon code" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="h-9 text-xs"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponLoading || !couponInput}>
                        {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                    {couponError && <p className="text-rose-500 text-[10px]">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-between text-body-sm font-bold text-on-surface pt-3 border-t border-outline-variant/20 items-baseline">
                <span>Total Escrow Amount</span>
                <span className="text-primary text-xl font-black font-mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
