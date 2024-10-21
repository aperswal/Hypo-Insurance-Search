const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { answers } = req.body;

  console.log('Received answers:', JSON.stringify(answers, null, 2));

  try {
    // Split the answers into chunks of 500 characters or less
    const answerChunks = splitAnswersIntoChunks(answers);

    // Create a customer first
    const customer = await stripe.customers.create({
      metadata: answerChunks,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Q8pNxGDDWAeQTzJ7sjocNYN', // Ensure this price ID exists
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
      customer: customer.id,
    });

    console.log('✅ Checkout session created successfully:', session.id);
    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('❌ Error creating Stripe session:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

function splitAnswersIntoChunks(answers) {
  const answerString = JSON.stringify(answers);
  const chunkSize = 490; // Leave some room for the key name
  const chunks = {};

  for (let i = 0; i < answerString.length; i += chunkSize) {
    const chunkIndex = Math.floor(i / chunkSize);
    chunks[`answers_${chunkIndex}`] = answerString.slice(i, i + chunkSize);
  }

  return chunks;
}