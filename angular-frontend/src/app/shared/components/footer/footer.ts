import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './footer.html'
})
export class FooterComponent {
  SparklesIcon = Sparkles;
  ShieldCheckIcon = ShieldCheck;
  ZapIcon = Zap;
  GlobeIcon = Globe;
}
