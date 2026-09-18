import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, CartDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'nexus-ecommerce';
}
