import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Store, Star, CheckCircle, Package } from 'lucide-angular';

@Component({
  selector: 'app-vendor-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './vendor-card.html'
})
export class VendorCardComponent {
  @Input({ required: true }) store!: {
    _id: string;
    name: string;
    description: string;
    isVerified: boolean;
    rating?: number;
    productCount?: number;
    logo?: string;
  };

  StoreIcon = Store;
  StarIcon = Star;
  CheckCircleIcon = CheckCircle;
  PackageIcon = Package;
}
