import { useState } from "react";
import Logo from "@/components/Logo";
import { GamingButton } from "@/components/ui/gaming-button";
import { Check, X, Zap, Shield, Star, Users } from "lucide-react";

const Landing = () => {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    { icon: Users, title: "Smart Matching", desc: "AI-powered duo finder based on rank, role, and playstyle" },
    { icon: Zap, title: "Instant Chat", desc: "Connect and coordinate with your matches in real-time" },
    { icon: Shield, title: "Skill-Based", desc: "Match with players in your rank range for balanced games" },
    { icon: Star, title: "Premium Features", desc: "Unlock unlimited swipes and advanced filters" },
  ];

  const comparison = [
    { feature: "Daily Swipes", free: "10", premium: "Unlimited" },
    { feature: "Visibility Boost", free: "❌", premium: "✅" },
    { feature: "Advanced Filters", free: "❌", premium: "✅" },
    { feature: "Premium Badge", free: "❌", premium: "✅" },
    { feature: "Ad-Free Experience", free: "❌", premium: "✅" },
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" className="justify-center mb-4" />
            <p className="text-muted-foreground">Join the elite Valorant community</p>
          </div>
          
          <div className="card-tactical p-8 space-y-6">
            <GamingButton variant="tactical" size="lg" className="w-full">
              Continue with Google
            </GamingButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-neon-cyan focus:outline-none transition-colors"
              />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-neon-cyan focus:outline-none transition-colors"
              />
            </div>
            
            <GamingButton variant="radiant" size="lg" className="w-full">
              Join RadiantDuo
            </GamingButton>
            
            <button 
              onClick={() => setShowAuth(false)}
              className="w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Logo size="lg" className="justify-center mb-8" />
          
          <h2 className="text-4xl md:text-6xl font-rajdhani font-bold mb-6 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Find Your Perfect Duo in 
            <span className="text-radiant-red glow-red"> Valorant</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Swipe, match, and team up with skilled players. Climb the ranks together with RadiantDuo's tactical matchmaking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GamingButton 
              variant="radiant" 
              size="xl"
              onClick={() => setShowAuth(true)}
            >
              Start Matching
            </GamingButton>
            <GamingButton variant="tactical" size="xl">
              Learn More
            </GamingButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-rajdhani font-bold text-center mb-16">
            <span className="text-neon-cyan">Elite</span> Features for <span className="text-radiant-red">Champions</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, index) => (
              <div key={index} className="card-tactical p-6 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-glow">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-rajdhani font-semibold text-lg mb-2">{title}</h4>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-rajdhani font-bold text-center mb-16">
            Choose Your <span className="text-radiant-gold">Battle Plan</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="card-tactical p-8">
              <div className="text-center mb-6">
                <h4 className="font-rajdhani font-bold text-2xl mb-2">Agent</h4>
                <div className="text-3xl font-bold">Free</div>
                <p className="text-muted-foreground">Get started with basic features</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {comparison.map(({ feature, free }, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{feature}</span>
                    <span className={`text-sm ${free === "❌" ? "text-muted-foreground" : "text-neon-cyan"}`}>
                      {free}
                    </span>
                  </div>
                ))}
              </div>
              
              <GamingButton variant="tactical" size="lg" className="w-full" onClick={() => { window.location.href = '/auth'; }}>
                Start Free
              </GamingButton>
            </div>

            {/* Premium Tier */}
            <div className="card-tactical p-8 border-2 border-radiant-gold/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-radiant-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h4 className="font-rajdhani font-bold text-2xl mb-2 text-radiant-gold">Radiant</h4>
                <div className="text-3xl font-bold">$3<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Unlock your full potential</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {comparison.map(({ feature, premium }, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{feature}</span>
                    <span className={`text-sm ${premium === "❌" ? "text-muted-foreground" : "text-radiant-gold"}`}>
                      {premium}
                    </span>
                  </div>
                ))}
              </div>
              
              <GamingButton variant="premium" size="lg" className="w-full" onClick={() => { window.location.href = '/upgrade'; }}>
                Upgrade to Radiant
              </GamingButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <Logo className="justify-center mb-6" />
          <div className="flex flex-wrap justify-center gap-8 mb-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-neon-cyan transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Contact</a>
            <a href="#" className="hover:text-neon-cyan transition-colors">Support</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 RadiantDuo. All rights reserved. Not affiliated with Riot Games.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;