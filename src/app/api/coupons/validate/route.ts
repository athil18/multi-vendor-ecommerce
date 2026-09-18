/**
 * Promotion Coupon Validation Route
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = schema.parse(body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });
    
    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }

    if (coupon.validFrom > new Date() || coupon.validTo < new Date()) {
      return NextResponse.json({ error: 'Coupon is expired or not active' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return NextResponse.json({ error: `Minimum order amount is $${coupon.minOrderValue}` }, { status: 400 });
    }

    let totalDiscount = 0;
    if (coupon.discountType === 'fixed') {
      totalDiscount = Math.min(coupon.value, subtotal);
    } else {
      totalDiscount = (coupon.value / 100) * subtotal;
    }
    
    if (coupon.maxDiscount && totalDiscount > coupon.maxDiscount) {
      totalDiscount = coupon.maxDiscount;
    }

    return NextResponse.json({
      valid: true,
      discount: totalDiscount,
      couponId: coupon.id,
      code: coupon.code
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

