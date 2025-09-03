import { useState } from "react";
import { Edit, Shield, Settings, LogOut, Crown } from "lucide-react";
import { GamingButton } from "@/components/ui/gaming-button";
import Navigation from "@/components/Navigation";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: "ValorantChampion",
    age: 24,
    rank: "Immortal 2",
    country: "🇺🇸",
    roles: ["Duelist", "Initiator"],
    bio: "Competitive Valorant player looking for consistent duo partner. Good comms and positive attitude. Let's climb to Radiant together!",
    avatar: "/api/placeholder/120/120",
    isPremium: false,
    voiceChat: true,
    availability: ["Evening", "Weekend"],
    gamesPlayed: 247,
    winRate: 68
  };

  const getRankColor = (rank: string) => {
    if (rank.includes("Radiant")) return "text-radiant-gold";
    if (rank.includes("Immortal")) return "text-purple-400";
    if (rank.includes("Diamond")) return "text-blue-400";
    return "text-slate-400";
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-slate-800">
        <h1 className="text-xl font-rajdhani font-bold">Profile</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="w-10 h-10 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-center hover:border-neon-cyan/50 transition-colors"
        >
          <Edit className="w-4 h-4 text-neon-cyan" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="card-tactical p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-gradient-card rounded-full border-2 border-slate-700 mx-auto"></div>
            {userProfile.isPremium && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-radiant-gold rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-black" />
              </div>
            )}
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-neon-cyan rounded-full flex items-center justify-center">
                <Edit className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
          
          <h2 className="font-rajdhani font-bold text-2xl mb-1">{userProfile.name}, {userProfile.age}</h2>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-4 h-4" />
            <span className={`font-medium ${getRankColor(userProfile.rank)}`}>
              {userProfile.rank}
            </span>
            <span className="text-xl">{userProfile.country}</span>
          </div>

          {userProfile.isPremium && (
            <div className="inline-flex items-center gap-2 bg-radiant-gold/20 border border-radiant-gold/30 rounded-full px-3 py-1 text-radiant-gold text-sm font-medium mb-4">
              <Crown className="w-3 h-3" />
              <span>Premium Member</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-tactical p-4 text-center">
            <div className="text-2xl font-rajdhani font-bold text-neon-cyan mb-1">
              {userProfile.gamesPlayed}
            </div>
            <div className="text-sm text-muted-foreground">Games Played</div>
          </div>
          <div className="card-tactical p-4 text-center">
            <div className="text-2xl font-rajdhani font-bold text-radiant-red mb-1">
              {userProfile.winRate}%
            </div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Roles */}
        <div className="card-tactical p-4">
          <h3 className="font-rajdhani font-semibold text-lg mb-3">Preferred Roles</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.roles.map((role, index) => (
              <span 
                key={index}
                className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-neon-cyan font-medium"
              >
                {role}
              </span>
            ))}
            {isEditing && (
              <button className="px-3 py-2 border-2 border-dashed border-slate-600 rounded-lg text-sm text-muted-foreground hover:border-neon-cyan/50 transition-colors">
                + Add Role
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="card-tactical p-4">
          <h3 className="font-rajdhani font-semibold text-lg mb-3">About Me</h3>
          {isEditing ? (
            <textarea 
              defaultValue={userProfile.bio}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-foreground placeholder-muted-foreground focus:border-neon-cyan focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Tell others about your playstyle..."
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {userProfile.bio}
            </p>
          )}
        </div>

        {/* Availability */}
        <div className="card-tactical p-4">
          <h3 className="font-rajdhani font-semibold text-lg mb-3">Availability</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.availability.map((time, index) => (
              <span 
                key={index}
                className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-sm text-foreground"
              >
                {time}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="flex gap-3">
              <GamingButton 
                variant="radiant" 
                size="lg" 
                className="flex-1"
                onClick={() => setIsEditing(false)}
              >
                Save Changes
              </GamingButton>
              <GamingButton 
                variant="ghost" 
                size="lg" 
                className="flex-1"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </GamingButton>
            </div>
          ) : (
            <>
              {!userProfile.isPremium && (
                <GamingButton variant="premium" size="lg" className="w-full">
                  Upgrade to Premium
                </GamingButton>
              )}
              
              <div className="flex gap-3">
                <button className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 hover:border-slate-600 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-center justify-center gap-2 hover:border-radiant-red/50 hover:text-radiant-red transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;