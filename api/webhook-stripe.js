// api/webhook-stripe.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion } = require('mongodb');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const mongodbUri = process.env.MONGODB_URI; // Ensure this includes your database name

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Verify the Stripe webhook signature
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Successfully verified webhook signature.');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔔 Event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('💳 Payment was successful!');
    const answers = JSON.parse(session.metadata.answers);

    // Store in MongoDB
    try {
      // Create a new MongoClient with the updated options
      const client = new MongoClient(mongodbUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

      // Connect to MongoDB
      await client.connect();
      console.log('✅ Connected to MongoDB.');

      // Access the database and collection
      const database = client.db('HypoInsuranceSearch'); // Ensure this matches your DB name
      const collection = database.collection('consultations'); // The collection you want to use

      // Insert the document
      await collection.insertOne({
        sessionId: session.id,
        customerEmail: session.customer_details.email,
        answers,
        paymentStatus: session.payment_status,
        createdAt: new Date(),
      });
      console.log('✅ Data successfully stored in MongoDB.');

      // Close the connection
      await client.close();
    } catch (err) {
      console.error('❌ Error storing data in MongoDB:', err);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.status(200).send('Received');
};
