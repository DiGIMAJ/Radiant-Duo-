import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { GamingButton } from "@/components/ui/gaming-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User } from "lucide-react";
import Logo from "@/components/Logo";
import { useNavigate, Link } from "react-router-dom";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      apiClient.getProfile()
        .then((profile) => {
          if (!profile || !profile.username) {
            navigate("/onboarding");
          } else {
            navigate("/swipe");
          }
        })
        .catch(() => {
          // Profile not found, redirect to onboarding
          navigate("/onboarding");
        });
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await apiClient.register(email, password, username);
        
        toast({
          title: "Account created!",
          description: "Welcome! Please complete your profile setup.",
        });
        
        // Redirect to onboarding after successful registration
        navigate("/onboarding");
      } else {
        await apiClient.login(email, password);
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        // The useEffect will handle navigation based on profile completion
        window.location.reload(); // Force auth state update
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      // Google OAuth not implemented in the new system yet
      toast({
        title: "Coming Soon",
        description: "Google authentication will be available soon. Please use email signup for now.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-900/80 border-slate-700 backdrop-blur-lg">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-rajdhani font-bold">
            {isSignUp ? "Join RadiantDuo" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? "Create your account to find your perfect duo" : "Sign in to continue your journey"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
                required
                minLength={6}
              />
            </div>
          </div>

          <GamingButton
            type="submit"
            variant="radiant"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </GamingButton>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GamingButton
            type="button"
            variant="tactical"
            size="lg"
            className="w-full mt-4"
            onClick={handleGoogleAuth}
          >
            Continue with Google
          </GamingButton>
        </div>

        <div className="mt-6 text-center space-y-3">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm block w-full"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
          
          {!isSignUp && (
            <Link 
              to="/forgot-password" 
              className="text-muted-foreground hover:text-neon-cyan transition-colors text-sm block"
            >
              Forgot your password?
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;