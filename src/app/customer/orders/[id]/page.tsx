import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface Props {
  params: Promise<{ id: string }>;
}

async function getOrderDetails(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    return null;
  }
}

export default async function CustomerOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderDetails(id);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <h2 className="text-title-lg font-bold text-on-surface mb-4">Order Not Found</h2>
        <p className="text-body-md text-on-surface-variant mb-6">We couldn't retrieve the details for order #{id}.</p>
        <Link href="/customer" className="text-primary font-semibold hover:underline">
          Return to Account Dashboard
        </Link>
      </div>
    );
  }

  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/customer" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-body-md font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Order History
        </Link>
        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'default'}>
          {order.status ? order.status.toUpperCase() : 'PROCESSING'}
        </Badge>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 border border-outline-variant/30 shadow-sm flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-outline-variant/20">
          <div>
            <h1 className="text-title-lg font-bold text-on-surface">Order #{order._id || order.id}</h1>
            <p className="text-body-sm text-on-surface-variant flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" /> Placed on {formattedDate}
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-xs font-semibold uppercase text-on-surface-variant">Total Amount</p>
            <p className="text-display-xs font-extrabold text-primary">${(order.totalAmount || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h2 className="text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Purchased Items
          </h2>
          <div className="divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-low">
            {(order.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-surface-container-high/30 transition-colors">
                <div className="flex items-center gap-4">
                  {item.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-outline-variant/20" />
                  )}
                  <div>
                    <p className="text-body-md font-bold text-on-surface">{item.name || 'Product Item'}</p>
                    <p className="text-body-xs text-on-surface-variant">Qty: {item.quantity || 1} × ${(item.price || 0).toFixed(2)}</p>
                    {item.storeName && (
                      <p className="text-body-xs text-primary font-medium mt-1">Seller: {item.storeName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right font-bold text-on-surface">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Shipping Details" className="p-4 border border-outline-variant/30">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div className="text-body-sm text-on-surface">
                <p className="font-semibold">{order.shippingAddress?.fullName || 'Valued Customer'}</p>
                <p>{order.shippingAddress?.street || '123 Commerce Way'}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
                <p>{order.shippingAddress?.country || 'India'}</p>
              </div>
            </div>
          </Card>

          <Card title="Payment Method" className="p-4 border border-outline-variant/30">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div className="text-body-sm text-on-surface">
                <p className="font-semibold">Stripe Secure Card</p>
                <p className="text-on-surface-variant">Payment Status: {order.paymentStatus || 'Paid'}</p>
                <p className="text-body-xs text-on-surface-variant mt-2">Transaction ID: {order.paymentIntentId || 'pi_live_success'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
