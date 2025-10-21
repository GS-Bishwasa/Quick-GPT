import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const sessionList = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessionList.data[0];
      console.log("Stripe session:", session.metadata);

      const { transactionId, appId } = session.metadata || {};

      if (appId !== "quickgpt" || !transactionId) {
        console.log("Ignored: Invalid metadata");
        return response.json({ received: true });
      }

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        console.log("Transaction not found:", transactionId);
        return response.json({ received: true });
      }

      if (!transaction.isPaid) {
        await User.updateOne(
          { _id: transaction.userId },
          { $inc: { credits: transaction.credits } }
        );

        transaction.isPaid = true;
        await transaction.save();

        console.log("✅ Credits added & transaction marked paid");
      }
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    response.status(500).send("Internal Server Error");
  }
};
