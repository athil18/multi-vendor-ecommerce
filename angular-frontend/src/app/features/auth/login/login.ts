import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  MailIcon = Mail;
  LockIcon = Lock;
  SparklesIcon = Sparkles;
  ArrowRightIcon = ArrowRight;
  ShieldCheckIcon = ShieldCheck;

  email = signal<string>('alex@example.com');
  password = signal<string>('password123');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  handleLogin() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        // Fallback for standalone demo mode
        this.authService.currentUser.set({
          id: 'user-demo',
          name: this.email().split('@')[0],
          email: this.email(),
          role: 'customer'
        });
        this.loading.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
