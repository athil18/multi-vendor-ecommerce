export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt?: string;
}

export interface Store {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  sellerId: string;
  isVerified: boolean;
  rating?: number;
  productCount?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  price?: number;
  inventoryCount: number;
  brandName?: string;
  images: string[];
  categoryId?: Category | string;
  sellerId?: Store | any;
  status: 'pending_review' | 'published' | 'rejected' | 'archived';
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Address {
  _id?: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Order {
  _id: string;
  userId: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  itemCount: number;
  items?: OrderItem[];
  shippingAddressId?: Address | string;
  createdAt: string;
}

export interface Review {
  _id?: string;
  productId: string;
  userId?: string;
  userName?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt?: string;
}
