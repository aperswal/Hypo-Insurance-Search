// api/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { answers } = req.body;

  try {
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
      metadata: {
        answers: JSON.stringify(answers), // Store answers in metadata
      },
    });

    console.log('✅ Checkout session created successfully:', session.id);
    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('❌ Error creating Stripe session:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
