import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Create Polar checkout session
router.post('/create-checkout', async (req: AuthenticatedRequest, res) => {
  try {
    const { productId, priceType } = req.body;
    
    const polarApiUrl = "https://api.polar.sh/v1/checkouts/";
    const accessToken = process.env.POLAR_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ error: 'Polar access token not configured' });
    }

    // Determine price based on type (monthly or yearly)
    const prices = {
      monthly: 300, // $3.00 in cents
      yearly: 3000  // $30.00 in cents
    };

    const checkoutData = {
      product_id: productId,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/upgrade-success`,
      amount: prices[priceType as keyof typeof prices] || prices.monthly,
      currency: "USD",
      metadata: {
        subscription_type: priceType,
        user_id: req.user!.id
      }
    };

    const response = await fetch(polarApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Polar API error:", errorData);
      throw new Error(`Failed to create checkout session: ${response.status}`);
    }

    const checkout = await response.json();
    
    res.json({ 
      checkoutUrl: checkout.url || checkout.checkout_url,
      sessionId: checkout.id 
    });
  } catch (error: any) {
    console.error("Error creating checkout:", error);
    res.status(500).json({ 
      error: error.message || 'Failed to create checkout session'
    });
  }
});

export default router;