/**
 * Level 2: Component Test Suite for Isolated Storefront UI Components
 * 
 * @agent design-ui-designer
 * @agent design-brand-guardian
 * @agent testing-accessibility-auditor
 * @agent testing-test-automation-engineer
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { AgentComplianceBadge } from '@/components/ui/AgentComplianceBadge';
import { NexusLogo } from '@/components/NexusLogo';
import { ProductCard } from '@/components/ProductCard';
import { NewsletterForm } from '@/components/NewsletterForm';

describe('Level 2: Storefront Component Tests', () => {

  describe('Button Component', () => {
    it('should render button with accessible text and default primary variant', () => {
      render(<Button>Proceed to Checkout</Button>);
      const btn = screen.getByRole('button', { name: /Proceed to Checkout/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass('focus-visible:ring-brand-500');
    });

    it('should apply disabled attributes and styles correctly', () => {
      render(<Button disabled>Disabled Action</Button>);
      const btn = screen.getByRole('button', { name: /Disabled Action/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should render loading state with spinner', () => {
      render(<Button loading>Processing</Button>);
      const btn = screen.getByRole('button', { name: /Processing/i });
      expect(btn).toBeDisabled();
    });
  });

  describe('AgentComplianceBadge Component', () => {
    it('should render verified badge with high-contrast text color tokens', () => {
      const { container } = render(
        <AgentComplianceBadge division="engineering" agentName="500+ AI Agent Ecosystem" />
      );
      const badge = screen.getByText('500+ AI Agent Ecosystem');
      expect(badge).toBeInTheDocument();
      // Contrast check: must have WCAG 2.1 AA compliant dark-in-light and light-in-dark classes
      expect(container.firstChild).toHaveClass('text-blue-700');
      expect(container.firstChild).toHaveClass('dark:text-blue-400');
    });

    it('should support security division styling', () => {
      const { container } = render(
        <AgentComplianceBadge division="security" agentName="21-pii-sanitization-agent" />
      );
      expect(container.firstChild).toHaveClass('text-rose-700');
      expect(container.firstChild).toHaveClass('dark:text-rose-400');
    });
  });

  describe('NexusLogo Brand Component', () => {
    it('should render SVG vector logo and accessible link to homepage', () => {
      render(<NexusLogo href="/" />);
      const link = screen.getByRole('link', { name: /Nexus (Curated Marketplace|Homepage)/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
      expect(screen.getByText(/NEXUS/i)).toBeInTheDocument();
    });
  });

  describe('ProductCard Component', () => {
    const mockProduct = {
      _id: 'prod-test-1',
      name: 'Artisan Mechanical Keyboard',
      description: 'Handcrafted custom mechanical keyboard with brass plate.',
      basePrice: 289.0,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'],
      categoryName: 'Keyboards',
      rating: 4.9,
      numReviews: 38,
      storeName: 'Artisan Makers',
    };

    it('should render product information, price, and image alt text', () => {
      render(<ProductCard product={mockProduct} />);
      
      expect(screen.getByText('Artisan Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('$289.00')).toBeInTheDocument();
      expect(screen.getByText('Keyboards')).toBeInTheDocument();
      
      const img = screen.getByAltText('Artisan Mechanical Keyboard');
      expect(img).toBeInTheDocument();
    });

    it('should render accessible Add to Cart button', () => {
      render(<ProductCard product={mockProduct} />);
      const cartBtn = screen.getByRole('button', { name: /Add Artisan Mechanical Keyboard to cart/i });
      expect(cartBtn).toBeInTheDocument();
    });
  });

  describe('NewsletterForm Component', () => {
    it('should render email input and accessible submit button', () => {
      render(<NewsletterForm />);
      const input = screen.getByLabelText(/Email address for newsletter/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');

      const submitBtn = screen.getByRole('button', { name: /Subscribe to newsletter/i });
      expect(submitBtn).toBeInTheDocument();
    });
  });
});
