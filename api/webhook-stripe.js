// api/webhook-stripe.js

import { buffer } from 'micro';
import Stripe from 'stripe';
import { ddbDocClient, TABLE_NAME, PutCommand } from '../utils/dynamodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  if (req.method === 'POST') {
    let event;
    const sig = req.headers['stripe-signature'];
    console.log('Webhook received');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    try {
      const buf = await buffer(req);
      const rawBody = buf.toString('utf8');
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      console.log('✅ Webhook signature verified.');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log('Event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💳 Payment was successful!');
      console.log('Session details:', JSON.stringify(session, null, 2));
      console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));

      let answers;
      try {
        answers = JSON.parse(session.metadata.answers);
        console.log('✅ Parsed answers:', JSON.stringify(answers, null, 2));
      } catch (err) {
        console.error('❌ Error parsing answers:', err.message);
        return res.status(400).send(`Error parsing answers: ${err.message}`);
      }

      // Save consultation data to DynamoDB
      try {
        const params = {
          TableName: TABLE_NAME,
          Item: {
            sessionId: session.id,
            customerEmail: session.customer_details.email,
            createdAt: new Date().toISOString(),
            answers: answers,
          },
        };
        await ddbDocClient.send(new PutCommand(params));
        console.log('✅ Consultation data saved to DynamoDB.');
      } catch (err) {
        console.error('❌ Error saving to DynamoDB:', err.message);
        return res.status(500).send('Internal Server Error');
      }
    } else {
      console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Received');
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
  }
};