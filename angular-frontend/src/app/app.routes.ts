import { Routes } from '@angular/router';
import { HomeComponent } from './features/customer/home/home';
import { ProductDetailComponent } from './features/customer/product-detail/product-detail';
import { CheckoutComponent } from './features/customer/checkout/checkout';
import { OrdersComponent } from './features/customer/orders/orders';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { SellerDashboardComponent } from './features/seller/dashboard/dashboard';
import { AdminModerationComponent } from './features/admin/moderation/moderation';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products/:slug', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'customer', component: OrdersComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'seller', component: SellerDashboardComponent },
  { path: 'admin', component: AdminModerationComponent },
  { path: '**', redirectTo: '' }
];
