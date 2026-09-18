import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Sparkles, MessageSquare, X, Send, Bot, ShieldCheck, Zap, ArrowRight, RefreshCw } from 'lucide-angular';
import { AiAgentsService, AgentChatResponse } from '../../../core/services/ai-agents.service';

interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  sources?: string[];
  suggestedActions?: { label: string; action: string }[];
}

@Component({
  selector: 'app-ai-concierge',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './ai-concierge.html'
})
export class AiConciergeComponent {
  private aiService = inject(AiAgentsService);

  // Icons
  SparklesIcon = Sparkles;
  MessageSquareIcon = MessageSquare;
  XIcon = X;
  SendIcon = Send;
  BotIcon = Bot;
  ShieldCheckIcon = ShieldCheck;
  ZapIcon = Zap;
  ArrowRightIcon = ArrowRight;
  RefreshCwIcon = RefreshCw;

  isOpen = signal<boolean>(false);
  userInput = signal<string>('');
  isTyping = signal<boolean>(false);

  messages = signal<ChatMessage[]>([
    {
      sender: 'agent',
      text: 'Greetings! I am Nexus AI Concierge, powered by 500+ specialized agents. How can I assist with your orders, creator inquiries, or product recommendations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '📦 Track My Parcel', action: 'track' },
        { label: '✨ Recommend Trending Gear', action: 'trending' },
        { label: '🛡️ Escrow Guarantee', action: 'escrow' }
      ]
    }
  ]);

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  sendMessage(text?: string) {
    const query = text || this.userInput().trim();
    if (!query) return;

    // Add user message
    this.messages.update(m => [
      ...m,
      {
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    this.userInput.set('');
    this.isTyping.set(true);

    this.aiService.askSupportAgent(query).subscribe(res => {
      this.isTyping.set(false);
      this.messages.update(m => [
        ...m,
        {
          sender: 'agent',
          text: res.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.sources,
          suggestedActions: res.suggestedActions
        }
      ]);
    });
  }

  handleAction(action: string) {
    if (action === 'track') {
      this.sendMessage('Where is my recent shipment?');
    } else if (action === 'trending') {
      this.sendMessage('What are the top rated artisanal keyboards and minimal desk items?');
    } else if (action === 'escrow') {
      this.sendMessage('How does the Nexus multi-vendor escrow buyer protection work?');
    } else {
      this.sendMessage(action);
    }
  }
}
