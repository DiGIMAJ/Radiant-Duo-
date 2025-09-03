import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GamingButton } from "@/components/ui/gaming-button";

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  profile?: {
    username: string;
    display_name: string;
    rank: string;
    avatar_url: string;
  };
}

const Chat = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user && matchId) {
      fetchMatch();
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMatch = async () => {
    if (!user || !matchId) return;

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) throw error;

      // Verify user is part of this match
      if (data.user1_id !== user.id && data.user2_id !== user.id) {
        navigate('/matches');
        return;
      }

      // Get the other user's profile
      const otherUserId = data.user1_id === user.id ? data.user2_id : data.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, rank, avatar_url')
        .eq('user_id', otherUserId)
        .single();

      setMatch({ ...data, profile });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load match details",
        variant: "destructive",
      });
      navigate('/matches');
    }
  };

  const fetchMessages = async () => {
    if (!matchId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!matchId) return;

    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !matchId || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRankColor = (rank: string) => {
    if (rank?.includes("Radiant")) return "text-radiant-gold";
    if (rank?.includes("Immortal")) return "text-purple-400";
    if (rank?.includes("Diamond")) return "text-blue-400";
    if (rank?.includes("Ascendant")) return "text-green-400";
    return "text-slate-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 loading-tactical mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Match not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/matches')}
            className="w-10 h-10 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-center hover:border-neon-cyan/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-full bg-gradient-card border-2 border-slate-700 overflow-hidden">
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

          <div className="flex-1">
            <h1 className="font-rajdhani font-semibold text-lg">
              {match.profile?.display_name || match.profile?.username}
            </h1>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span className={`text-xs font-medium ${getRankColor(match.profile?.rank || '')}`}>
                {match.profile?.rank}
              </span>
            </div>
          </div>

          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Start your conversation with {match.profile?.display_name || match.profile?.username}!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-neon-cyan text-black rounded-br-none'
                    : 'bg-slate-800 text-white rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === user?.id ? 'text-black/60' : 'text-slate-400'
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-lg">
        <form onSubmit={sendMessage} className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
            disabled={sending}
          />
          <GamingButton
            type="submit"
            variant="radiant"
            size="sm"
            disabled={!newMessage.trim() || sending}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </GamingButton>
        </form>
      </div>
    </div>
  );
};

export default Chat;