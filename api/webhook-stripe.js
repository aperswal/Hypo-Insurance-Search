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
    
    try {
      const buf = await buffer(req);
      const rawBody = buf.toString('utf8');
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      console.log('✅ Webhook signature verified.');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log('Event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💳 Payment was successful!');

      try {
        const customer = await stripe.customers.retrieve(session.customer);
        const answers = reconstructAnswers(customer.metadata);
        console.log('✅ Parsed answers:', JSON.stringify(answers, null, 2));

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
        console.error('❌ Error processing webhook:', err.message);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
      }
    } else {
      console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};

function reconstructAnswers(metadata) {
  const chunks = Object.entries(metadata)
    .filter(([key]) => key.startsWith('answers_'))
    .sort(([a], [b]) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));

  const fullAnswerString = chunks.map(([, value]) => value).join('');
  return JSON.parse(fullAnswerString);
}