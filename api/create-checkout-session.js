// api/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const { answers } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Personalized Health Insurance Plan',
            },
            unit_amount: 1000, // $10.00
          },
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

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
