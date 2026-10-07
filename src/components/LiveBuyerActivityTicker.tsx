/**
 * Live Global Buyer Activity Ticker
 * Dispatches subtle, non-intrusive verified acquisitions from collectors worldwide.
 * 
 * @agent design-ui-designer
 * @agent design-whimsy-injector
 * @agent design-ux-architect
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

interface ActivityItem {
  id: string;
  buyerLocation: string;
  action: string;
  productName: string;
  productHref: string;
  timeAgo: string;
  badge: string;
}

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    buyerLocation: 'Tokyo, Japan',
    action: 'acquired',
    productName: 'Custom CNC Aluminum Planar Headphones',
    productHref: '/products',
    timeAgo: '2m ago',
    badge: 'Artisan Batch',
  },
  {
    id: 'act-2',
    buyerLocation: 'Copenhagen, Denmark',
    action: 'reserved',
    productName: 'Hand-Stitched Tuscan Leather Weekender',
    productHref: '/products',
    timeAgo: '6m ago',
    badge: 'Limited Run',
  },
  {
    id: 'act-3',
    buyerLocation: 'San Francisco, USA',
    action: 'commissioned',
    productName: 'Aero Carbon Endurance Road Frame',
    productHref: '/products',
    timeAgo: '11m ago',
    badge: '100% Escrow',
  },
  {
    id: 'act-4',
    buyerLocation: 'Milan, Italy',
    action: 'acquired',
    productName: 'Nordic Oak & Matte Brass Luminary Desk Lamp',
    productHref: '/products',
    timeAgo: '18m ago',
    badge: 'Verified Maker',
  },
];

export function LiveBuyerActivityTicker() {
  // In accordance with the Anti-Vibe Coding Directive:
  // Simulated or fake customer buyer notifications/tickers are strictly deactivated.
  return null;
}
