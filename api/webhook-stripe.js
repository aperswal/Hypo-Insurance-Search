// webhook-stripe.js

import { buffer } from 'micro';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const mongodbUri = process.env.MONGODB_URI;

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
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('🔔 Event received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💳 Payment was successful!');
      console.log('Session details:', JSON.stringify(session, null, 2));
      
      let answers;
      try {
        answers = JSON.parse(session.metadata.answers);
        console.log('Parsed answers:', JSON.stringify(answers, null, 2));
      } catch (err) {
        console.error('❌ Error parsing answers:', err.message);
        return res.status(400).send(`Error parsing answers: ${err.message}`);
      }

      const client = new MongoClient(mongodbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      try {
        console.log('Attempting to connect to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB.');

        const database = client.db('HypoInsuranceSearch');
        const collection = database.collection('consultations');

        console.log('Database and collection selected:', database.databaseName, collection.collectionName);

        const consultationData = {
          sessionId: session.id,
          customerEmail: session.customer_details.email,
          answers: answers,
          paymentStatus: session.payment_status,
          createdAt: new Date(),
        };

        console.log('Consultation data to be stored:', JSON.stringify(consultationData, null, 2));

        // Use updateOne with upsert option to update or insert based on email
        const result = await collection.updateOne(
          { customerEmail: session.customer_details.email },
          { $set: consultationData },
          { upsert: true }
        );

        console.log('MongoDB operation result:', JSON.stringify(result, null, 2));

        if (result.matchedCount > 0) {
          console.log('✅ Document updated successfully');
        } else if (result.upsertedCount > 0) {
          console.log('✅ New document inserted successfully');
        } else {
          console.log('⚠️ Document was not updated or inserted');
        }
      } catch (err) {
        console.error('❌ Error storing data in MongoDB:', err);
        console.error('Error stack:', err.stack);
        return res.status(500).send('Internal Server Error');
      } finally {
        console.log('Closing MongoDB connection...');
        await client.close();
        console.log('MongoDB connection closed.');
      }
    }

    res.status(200).send('Received');
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method Not Allowed');
  }
};