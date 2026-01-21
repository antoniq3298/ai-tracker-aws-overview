import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
    try {
        const claims = event.requestContext.authorizer.claims;
        const userId = claims.sub;

        const amount = 1000;
        const currency = "eur";

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                user_id: userId
            }
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ error: err.message })
        };
    }
};