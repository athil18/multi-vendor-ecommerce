'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ShoppingBag, Search, ClipboardList, RefreshCw, ArrowRight, Star, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

import { useQuery } from '@tanstack/react-query';

export default function CustomerPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([]);
  
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const openReviewModal = (item: any) => {
    setReviewingProduct(item);
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingProduct) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/products/${reviewingProduct.productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      toast.success('Review submitted successfully!');
      setReviewModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const { data: orders = [] as any[], isLoading: loading, refetch: loadOrders } = useQuery({
    queryKey: ['customerOrders', searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/orders?search=${searchQuery}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  // Load detailed single order progress
  const handleViewOrderDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/orders/${orderId}`);

      const json = await res.json();
      if (res.ok) {
        setSelectedOrder(json.order);
        setSelectedOrderItems(json.items || []);
      }
    } catch (err) {
      toast.error('Failed to retrieve order tracking details');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Stepper calculations
  const getStepStatus = (status: string, step: string) => {
    const sequence = ['pending', 'processing', 'shipped', 'delivered'];
    const curIdx = sequence.indexOf(status.toLowerCase());
    const stepIdx = sequence.indexOf(step.toLowerCase());
    
    if (curIdx >= stepIdx) return 'completed';
    if (curIdx === stepIdx - 1) return 'active';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background min-h-screen">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-display-lg text-on-surface flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            My Orders
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Track purchases and checkout history.</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => loadOrders()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload History
        </Button>
      </div>

      {/* Main Split: Orders List and Tracking Detail Side-Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Orders list container */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Search by Order ID..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
          />

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={ShoppingBag}
                  title="No orders placed yet"
                  description="Explore our catalog and add items to your cart to check out."
                  actionLabel="Browse Catalog"
                  onAction={() => window.location.href = '/'}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order: any) => (
                <div
                  key={order._id}
                  onClick={() => handleViewOrderDetail(order._id)}
                  className={`glass-panel rounded-xl p-5 cursor-pointer transition-all hover:border-primary/30 ${
                    selectedOrder?._id === order._id ? 'border-primary ring-1 ring-primary/20' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-label-md text-on-surface-variant">Order ID:</span>
                        <span className="text-xs font-mono font-bold text-on-surface">
                          {order._id.substring(0, 8)}...
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>{order.itemCount} items</span>
                        <span>&bull;</span>
                        <span className="font-bold text-on-surface">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={order.paymentStatus === 'completed' ? 'success' : order.paymentStatus === 'failed' ? 'destructive' : 'warning'}>
                          Pay: {order.paymentStatus}
                        </Badge>
                        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'default' : order.status === 'processing' ? 'warning' : 'secondary'}>
                          Ship: {order.status}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-on-surface-variant hidden sm:inline" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tracking Details Side Panel */}
        <aside className="lg:col-span-1">
          {loadingDetail ? (
            <Card className="sticky top-24">
              <CardContent className="p-12 flex items-center justify-center">
                <Spinner size="md" />
              </CardContent>
            </Card>
          ) : selectedOrder ? (
            <Card className="sticky top-24">
              <CardContent className="p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-title-md text-on-surface">Tracking Order</h3>
                  <p className="text-xs font-mono text-on-surface-variant mt-0.5">{selectedOrder._id}</p>
                </div>

                {/* Visual stepper */}
                <div className="flex flex-col gap-6 pl-4 border-l-2 border-outline-variant/30 relative">
                  {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step) => {
                    const status = getStepStatus(selectedOrder.status, step);
                    return (
                      <div key={step} className="relative">
                        <div className={`absolute -left-[21px] h-4 w-4 rounded-full border-2 ${
                          status === 'completed' ? 'bg-primary border-primary' :
                          status === 'active' ? 'bg-background border-primary' :
                          'bg-surface-container border-outline-variant'
                        }`} />
                        <h4 className={`text-body-sm font-bold -mt-0.5 ${
                          status === 'upcoming' ? 'text-on-surface-variant/50' : 'text-on-surface'
                        }`}>{step}</h4>
                      </div>
                    );
                  })}
                </div>
                
                {/* Items preview */}
                <div className="mt-4 pt-6 border-t border-outline-variant/30">
                  <h4 className="text-body-sm font-bold mb-3 text-on-surface">Items ({selectedOrderItems.length})</h4>
                  <div className="flex flex-col gap-3">
                    {selectedOrderItems.map((item: any) => (
                      <div key={item._id} className="flex flex-col gap-2 py-2">
                        <div className="flex justify-between items-center text-body-sm">
                          <span className="text-on-surface-variant truncate max-w-[150px]">{item.productName}</span>
                          <span className="font-medium text-on-surface">${item.price.toFixed(2)} &times; {item.quantity}</span>
                        </div>
                        {selectedOrder.status === 'delivered' && (
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => openReviewModal(item)}>
                              Write Review
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24">
              <CardContent className="p-8 text-center text-on-surface-variant text-body-sm">
                Select an order to view tracking details.
              </CardContent>
            </Card>
          )}
        </aside>

      </div>

      {/* Review Modal */}
      {reviewModalOpen && reviewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-surface rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-title-lg font-bold">Write a Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-body-sm text-on-surface-variant mb-2">Reviewing: <span className="font-bold text-on-surface">{reviewingProduct.productName}</span></p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`h-8 w-8 ${star <= reviewRating ? 'fill-tertiary text-tertiary' : 'text-outline-variant'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md">Review Title</label>
                <Input 
                  placeholder="Summarize your experience" 
                  value={reviewTitle} 
                  onChange={(e) => setReviewTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md">Detailed Feedback</label>
                <textarea 
                  className="w-full bg-surface-container rounded-lg border border-outline-variant/50 p-3 text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                  placeholder="What did you like or dislike?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <Button variant="outline" type="button" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={reviewLoading}>Submit Review</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
