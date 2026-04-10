import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const client = await clerkClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        try {
          await client.users.updateUser(userId, {
            publicMetadata: {
              stripeCustomerId: session.customer as string,
              subscriptionStatus: 'active',
              subscriptionTier: 'pro',
            },
          });
        } catch (err) {
          console.error('Failed to update Clerk user metadata:', err);
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }
      } else {
        console.warn('checkout.session.completed without client_reference_id');
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find Clerk user by stripeCustomerId in metadata
      const users = await client.users.getUserList({ limit: 100 });
      const user = users.data.find(
        (u) => (u.publicMetadata as Record<string, unknown>)?.stripeCustomerId === customerId
      );

      if (user) {
        await client.users.updateUser(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            subscriptionStatus: subscription.status,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const users = await client.users.getUserList({ limit: 100 });
      const user = users.data.find(
        (u) => (u.publicMetadata as Record<string, unknown>)?.stripeCustomerId === customerId
      );

      if (user) {
        await client.users.updateUser(user.id, {
          publicMetadata: {
            stripeCustomerId: customerId,
            subscriptionStatus: 'canceled',
          },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
