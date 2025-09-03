import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GamingButton } from "@/components/ui/gaming-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Settings as SettingsIcon, Save, Upload, LogOut } from "lucide-react";

const ranks = [
  "Iron 1", "Iron 2", "Iron 3",
  "Bronze 1", "Bronze 2", "Bronze 3", 
  "Silver 1", "Silver 2", "Silver 3",
  "Gold 1", "Gold 2", "Gold 3",
  "Platinum 1", "Platinum 2", "Platinum 3",
  "Diamond 1", "Diamond 2", "Diamond 3",
  "Ascendant 1", "Ascendant 2", "Ascendant 3",
  "Immortal 1", "Immortal 2", "Immortal 3",
  "Radiant"
];

const roles = ["Duelist", "Initiator", "Controller", "Sentinel"];
const availabilityOptions = ["Morning", "Afternoon", "Evening", "Weekend"];

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          country_code: profile.country_code,
          country_flag: countries.find(c => c.code === profile.country_code)?.flag || "",
          rank: profile.rank,
          roles: profile.roles,
          voice_chat: profile.voice_chat,
          availability: profile.availability,
          age: profile.age,
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const avatarUrl = await handleAvatarUpload(file);
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRoleToggle = (role: string) => {
    setProfile(prev => ({
      ...prev,
      roles: prev.roles?.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...(prev.roles || []), role]
    }));
  };

  const handleAvailabilityToggle = (time: string) => {
    setProfile(prev => ({
      ...prev,
      availability: prev.availability?.includes(time)
        ? prev.availability.filter(t => t !== time)
        : [...(prev.availability || []), time]
    }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 loading-tactical mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-neon-cyan" />
          <h1 className="text-2xl font-rajdhani font-bold">Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Profile Picture */}
        <Card className="p-6 bg-slate-900/60 border-slate-700">
          <h2 className="text-lg font-rajdhani font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-card border-2 border-slate-700 overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neon-cyan/20 to-radiant-red/20"></div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Change Avatar
              </label>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6 bg-slate-900/60 border-slate-700">
          <h2 className="text-lg font-rajdhani font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input
                value={profile.display_name || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                className="bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
              />
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={profile.bio || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Select
                  value={profile.country_code || ""}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, country_code: value }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  min="13"
                  max="99"
                  value={profile.age || ""}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || null }))}
                  className="bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Game Settings */}
        <Card className="p-6 bg-slate-900/60 border-slate-700">
          <h2 className="text-lg font-rajdhani font-semibold mb-4">Game Settings</h2>
          <div className="space-y-4">
            <div>
              <Label>Current Rank</Label>
              <Select
                value={profile.rank || ""}
                onValueChange={(value) => setProfile(prev => ({ ...prev, rank: value }))}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  {ranks.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">Preferred Roles</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <div
                    key={role}
                    onClick={() => handleRoleToggle(role)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      profile.roles?.includes(role)
                        ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.roles?.includes(role) || false}
                        onChange={() => {}}
                      />
                      <span className="font-medium">{role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Availability</Label>
              <div className="grid grid-cols-2 gap-3">
                {availabilityOptions.map((time) => (
                  <div
                    key={time}
                    onClick={() => handleAvailabilityToggle(time)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      profile.availability?.includes(time)
                        ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.availability?.includes(time) || false}
                        onChange={() => {}}
                      />
                      <span className="font-medium">{time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                checked={profile.voice_chat || false}
                onCheckedChange={(checked) => 
                  setProfile(prev => ({ ...prev, voice_chat: !!checked }))
                }
              />
              <Label>I use voice chat</Label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <GamingButton
            variant="radiant"
            size="lg"
            className="w-full"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </GamingButton>

          <GamingButton
            variant="tactical"
            size="lg"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </GamingButton>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Settings;