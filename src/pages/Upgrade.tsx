import { Crown, Zap, Eye, Filter, Star, X } from "lucide-react";
import { GamingButton } from "@/components/ui/gaming-button";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Upgrade = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.functions.invoke('create-polar-checkout', {
        body: { 
          productId: 'radiant-duo-premium', // You'll need to set this up in Polar
          priceType: selectedPlan 
        }
      });

      if (error) throw error;

      if (data?.checkout_url) {
        window.open(data.checkout_url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: Zap,
      title: "Unlimited Swipes",
      description: "Swipe as much as you want without daily limits",
      free: "10 per day",
      premium: "Unlimited"
    },
    {
      icon: Eye,
      title: "Visibility Boost",
      description: "Get shown to 3x more players",
      free: "Standard",
      premium: "3x Boost"
    },
    {
      icon: Filter,
      title: "Advanced Filters",
      description: "Filter by specific ranks, regions, and playtimes",
      free: "Basic",
      premium: "Advanced"
    },
    {
      icon: Star,
      title: "Premium Badge",
      description: "Stand out with an exclusive premium badge",
      free: "❌",
      premium: "✅"
    },
    {
      icon: X,
      title: "Ad-Free Experience",
      description: "Enjoy uninterrupted swiping without ads",
      free: "Ads every 7 swipes",
      premium: "No ads"
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-6 h-6 text-radiant-gold glow-gold" />
          <h1 className="text-2xl font-rajdhani font-bold">
            <span className="text-radiant-gold">Premium</span> Upgrade
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Unlock the full RadiantDuo experience
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Premium Hero */}
        <div className="card-tactical p-6 text-center border-2 border-radiant-gold/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-radiant-gold/5 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-radiant-gold to-yellow-600 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-black" />
            </div>
            
            <h2 className="font-rajdhani font-bold text-3xl mb-2 text-radiant-gold">
              Go Radiant
            </h2>
            <p className="text-muted-foreground mb-6">
              Join the elite and unlock unlimited potential
            </p>
            
            <div className="text-center mb-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedPlan === 'monthly' 
                      ? 'border-neon-cyan bg-neon-cyan/10' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-lg font-rajdhani font-bold">
                    $3<span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Monthly billing</p>
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-3 rounded-lg border transition-all relative ${
                    selectedPlan === 'yearly' 
                      ? 'border-radiant-gold bg-radiant-gold/10' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="text-lg font-rajdhani font-bold text-radiant-gold">
                    $30<span className="text-sm text-muted-foreground">/year</span>
                  </div>
                  <p className="text-xs text-neon-cyan">Save 17%!</p>
                  <div className="absolute -top-2 -right-2 bg-neon-cyan text-black text-xs px-2 py-1 rounded-full font-bold">
                    BEST
                  </div>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Cancel anytime • No commitment
              </p>
            </div>
            
            <GamingButton 
              variant="premium" 
              size="xl" 
              className="w-full mb-4"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Creating checkout..." : `Upgrade ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}`}
            </GamingButton>
            
            <p className="text-xs text-muted-foreground">
              Secure payment via Stripe • Instant activation
            </p>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="space-y-4">
          <h3 className="font-rajdhani font-bold text-xl text-center mb-6">
            What You Get With <span className="text-radiant-gold">Premium</span>
          </h3>
          
          {premiumFeatures.map(({ icon: Icon, title, description, free, premium }, index) => (
            <div key={index} className="card-tactical p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-glow rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-rajdhani font-semibold text-lg mb-1">{title}</h4>
                  <p className="text-muted-foreground text-sm mb-3">{description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Free</span>
                      <span className={`font-medium ${free === "❌" ? "text-muted-foreground" : "text-neon-cyan"}`}>
                        {free}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Premium</span>
                      <span className="font-medium text-radiant-gold">{premium}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="card-tactical p-6 border border-neon-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-card rounded-full border-2 border-neon-cyan/50"></div>
            <div>
              <div className="font-rajdhani font-semibold">RadiantPlayer99</div>
              <div className="text-sm text-purple-400">Immortal 3</div>
            </div>
          </div>
          <blockquote className="text-sm text-muted-foreground italic mb-4">
            "Premium changed everything! I found my perfect duo partner in just 2 days. 
            The advanced filters helped me find someone with the exact playstyle I was looking for."
          </blockquote>
          <div className="flex text-radiant-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="card-tactical p-6">
          <h3 className="font-rajdhani font-bold text-lg mb-4">Frequently Asked</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
              <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Is my payment secure?</h4>
              <p className="text-muted-foreground">Absolutely. We use Stripe for secure payment processing with industry-standard encryption.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">When do premium features activate?</h4>
              <p className="text-muted-foreground">All premium features are activated instantly after successful payment.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <GamingButton 
            variant="premium" 
            size="xl" 
            className="w-full"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Creating checkout..." : `Start Your Premium Journey - ${selectedPlan === 'yearly' ? '$30/year' : '$3/month'}`}
          </GamingButton>
          <p className="text-xs text-muted-foreground">
            Join thousands of elite players already using Premium
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Upgrade;