import { useState, useEffect } from "react";
import { X, Heart, Shield, Mic, Clock } from "lucide-react";
import { GamingButton } from "@/components/ui/gaming-button";
import Navigation from "@/components/Navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  country_flag: string;
  avatar_url: string;
  rank: string;
  roles: string[];
  voice_chat: boolean;
  availability: string[];
  age: number;
  last_active: string;
}

const Swipe = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      // Get profiles excluding current user and already swiped users
      const { data: swipedProfiles } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .not('user_id', 'in', `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`)
        .order('last_active', { ascending: false })
        .limit(10);

      if (error) throw error;

      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !currentProfile) return;

    try {
      setSwipeCount(prev => prev + 1);
      
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: currentProfile.user_id,
          is_like: direction === 'right'
        });

      if (swipeError) throw swipeError;

      // If it's a like, check for a match
      if (direction === 'right') {
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', currentProfile.user_id)
          .eq('swiped_id', user.id)
          .eq('is_like', true)
          .maybeSingle();

        if (existingSwipe) {
          setMatchedProfile(currentProfile);
          setShowMatch(true);
          return;
        }
      }

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Load more profiles
        await fetchProfiles();
        setCurrentIndex(0);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes("Radiant")) return "text-radiant-gold";
    if (rank.includes("Immortal")) return "text-purple-400";
    if (rank.includes("Diamond")) return "text-blue-400";
    if (rank.includes("Platinum")) return "text-cyan-400";
    return "text-slate-400";
  };

  if (showMatch) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="text-6xl font-rajdhani font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              RADIANT MATCH!
            </div>
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-card border-2 border-neon-cyan glow-cyan"></div>
              <div className="text-4xl animate-pulse">💫</div>
              <div className="w-20 h-20 rounded-full bg-gradient-card border-2 border-radiant-red glow-red"></div>
            </div>
            <p className="text-muted-foreground mb-8">You and {matchedProfile?.display_name || matchedProfile?.username} liked each other!</p>
          </div>
          
          <div className="space-y-4">
            <GamingButton 
              variant="radiant" 
              size="lg" 
              className="w-full"
              onClick={() => setShowMatch(false)}
            >
              Start Chatting
            </GamingButton>
            <GamingButton 
              variant="tactical" 
              size="lg" 
              className="w-full"
              onClick={() => setShowMatch(false)}
            >
              Keep Swiping
            </GamingButton>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 loading-tactical mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-card rounded-full flex items-center justify-center mb-6">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-rajdhani font-semibold text-xl mb-2">No more profiles</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You've seen all available profiles. Check back later for new members!
          </p>
          <GamingButton variant="radiant" onClick={fetchProfiles}>
            Refresh
          </GamingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Finding duos...</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Swipes: {swipeCount}</span>
        </div>
      </div>

      {/* Swipe Card */}
      <div className="px-4 pb-8">
        <div className="card-swipe max-w-sm mx-auto relative overflow-hidden">
          {/* Player Image */}
          <div className="aspect-[3/4] bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Online Status */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 glow-cyan"></div>
              <span className="text-xs bg-black/50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>

            {/* Rank Badge */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className={`text-sm font-medium ${getRankColor(currentProfile.rank)}`}>
                {currentProfile.rank}
              </span>
            </div>

            {/* Country Flag */}
            <div className="absolute bottom-4 left-4 text-2xl">
              {currentProfile.country_flag}
            </div>

            {/* Avatar Image */}
            {currentProfile.avatar_url && (
              <img 
                src={currentProfile.avatar_url} 
                alt={currentProfile.display_name || currentProfile.username}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Player Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-rajdhani font-bold">
                {currentProfile.display_name || currentProfile.username}
                {currentProfile.age && `, ${currentProfile.age}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {currentProfile.voice_chat && (
                  <div className="flex items-center gap-1 text-xs text-neon-cyan">
                    <Mic className="w-3 h-3" />
                    <span>Voice Chat</span>
                  </div>
                )}
              </div>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap gap-2">
              {currentProfile.roles?.map((role, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-slate-800/60 border border-slate-700 rounded-full text-xs text-neon-cyan"
                >
                  {role}
                </span>
              ))}
            </div>

            {/* Availability */}
            {currentProfile.availability && currentProfile.availability.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{currentProfile.availability.join(", ")}</span>
              </div>
            )}

            {/* Bio */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentProfile.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-24 left-0 right-0 px-8">
        <div className="flex justify-center gap-6 max-w-sm mx-auto">
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 bg-slate-800/80 border-2 border-slate-600 rounded-full flex items-center justify-center transition-all duration-300 hover:border-radiant-red hover:bg-radiant-red/20 hover:scale-110 active:scale-95"
          >
            <X className="w-6 h-6 text-radiant-red" />
          </button>
          
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 bg-slate-800/80 border-2 border-slate-600 rounded-full flex items-center justify-center transition-all duration-300 hover:border-neon-cyan hover:bg-neon-cyan/20 hover:scale-110 active:scale-95"
          >
            <Heart className="w-6 h-6 text-neon-cyan" />
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Swipe;