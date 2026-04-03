import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  try {
    const { tierId } = await req.json();

    // Free tier — no Stripe needed
    if (tierId === 'free') {
      return NextResponse.redirect(new URL('/tool', req.url));
    }

    // Team/Enterprise — contact sales
    if (tierId === 'team-enterprise') {
      return NextResponse.redirect(new URL('/settings', req.url));
    }

    // Pro tier — create Stripe Checkout Session
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
