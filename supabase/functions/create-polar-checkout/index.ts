import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, priceType } = await req.json();
    
    const polarApiUrl = "https://api.polar.sh/v1/checkouts/";
    const accessToken = Deno.env.get("POLAR_ACCESS_TOKEN");

    if (!accessToken) {
      throw new Error("Polar access token not configured");
    }

    // Determine price based on type (monthly or yearly)
    const prices = {
      monthly: 300, // $3.00 in cents
      yearly: 3000  // $30.00 in cents
    };

    const checkoutData = {
      product_id: productId,
      success_url: `${req.headers.get("origin")}/upgrade-success`,
      amount: prices[priceType as keyof typeof prices] || prices.monthly,
      currency: "USD",
      metadata: {
        subscription_type: priceType
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
    
    return new Response(JSON.stringify({ 
      checkout_url: checkout.url || checkout.checkout_url,
      session_id: checkout.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});