import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_AGENTIC_WEBHOOK_SECRET || '';

/**
 * Agentic Commerce order approval webhook.
 *
 * Receives `v1.delegated_checkout.finalize_checkout` events from Stripe ACS
 * and approves valid purchases. Uses a separate webhook secret from the
 * fulfillment webhook since Stripe assigns distinct secrets per endpoint.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === 'v1.delegated_checkout.finalize_checkout') {
      // Approve the agent-initiated purchase
      return NextResponse.json({
        manual_approval_details: {
          type: 'approved',
        },
      });
    }

    // Acknowledge any other event type
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Agentic approval webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
