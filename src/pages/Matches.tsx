import { useState, useEffect } from "react";
import { MessageCircle, Shield, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  profile: {
    user_id: string;
    username: string;
    display_name: string;
    rank: string;
    avatar_url: string;
    last_active: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

const Matches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Get all matches for the current user
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          profiles!matches_user1_id_fkey(*),
          profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('matched_at', { ascending: false });

      if (matchError) throw matchError;

      // For each match, get the other user's profile and last message
      const matchesWithProfiles = await Promise.all(
        (matchData || []).map(async (match) => {
          // Determine which profile belongs to the other user
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', otherUserId)
            .single();

          // Get the last message for this match
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...match,
            profile,
            last_message: lastMessage
          };
        })
      );

      setMatches(matchesWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (match: Match) => {
    navigate(`/chat/${match.id}`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 loading-tactical mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    );
  }
  const getRankColor = (rank: string) => {
    if (rank.includes("Radiant")) return "text-radiant-gold";
    if (rank.includes("Immortal")) return "text-purple-400";
    if (rank.includes("Diamond")) return "text-blue-400";
    if (rank.includes("Ascendant")) return "text-green-400";
    return "text-slate-400";
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-2xl font-rajdhani font-bold text-center">
          <span className="text-radiant-red">Radiant</span> Matches
        </h1>
        <p className="text-center text-muted-foreground text-sm mt-1">
          {matches.length} active connections
        </p>
      </div>

      {/* Matches List */}
      <div className="p-4 space-y-3">
        {matches.map((match) => (
          <div 
            key={match.id}
            onClick={() => handleChatClick(match)}
            className="card-tactical p-4 hover:border-neon-cyan/30 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-card rounded-full border-2 border-slate-700 group-hover:border-neon-cyan/50 transition-colors overflow-hidden">
                  {match.profile?.avatar_url ? (
                    <img 
                      src={match.profile.avatar_url} 
                      alt={match.profile.display_name || match.profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neon-cyan/20 to-radiant-red/20"></div>
                  )}
                </div>
                {/* Online Status */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-green-400"></div>
              </div>

              {/* Match Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-rajdhani font-semibold text-lg truncate">
                    {match.profile?.display_name || match.profile?.username}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {match.last_message ? formatTimestamp(match.last_message.created_at) : formatTimestamp(match.matched_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-3 h-3" />
                  <span className={`text-xs font-medium ${getRankColor(match.profile?.rank || '')}`}>
                    {match.profile?.rank}
                  </span>
                </div>

                <p className="text-sm truncate text-muted-foreground">
                  {match.last_message?.content || "Start your conversation!"}
                </p>
              </div>

              {/* Chat Button */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-center group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/10 transition-colors">
                  <MessageCircle className="w-4 h-4 text-neon-cyan" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {matches.length === 0 && (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
          <div className="w-20 h-20 bg-gradient-card rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-rajdhani font-semibold text-xl mb-2">No matches yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Start swiping to find your perfect Valorant duo partner!
          </p>
          <button className="btn-tactical">
            Start Swiping
          </button>
        </div>
      )}

      <Navigation />
    </div>
  );
};

export default Matches;