/**
 * Multi-Vendor Identity Registration & Role Onboarding
 * 
 * @agent design-ui-designer
 * @agent design-ux-architect
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 * @agent testing-accessibility-auditor
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, User, Mail, Lock, Sparkles, ArrowRight, Store, ShieldCheck, Check } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  UserIcon = User;
  MailIcon = Mail;
  LockIcon = Lock;
  SparklesIcon = Sparkles;
  ArrowRightIcon = ArrowRight;
  StoreIcon = Store;
  ShieldCheckIcon = ShieldCheck;
  CheckIcon = Check;

  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  role = signal<'customer' | 'seller'>('customer');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  handleRegister() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      name: this.name(),
      email: this.email(),
      password: this.password(),
      role: this.role()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.role() === 'seller' ? '/seller' : '/']);
      },
      error: () => {
        // Standalone fallback
        this.authService.currentUser.set({
          id: 'user-' + Math.random().toString(36).substring(2, 6),
          name: this.name() || 'New User',
          email: this.email(),
          role: this.role()
        });
        this.loading.set(false);
        this.router.navigate([this.role() === 'seller' ? '/seller' : '/']);
      }
    });
  }
}
