import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GamingButton } from "@/components/ui/gaming-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    country: "",
    rank: "",
    selectedRoles: [] as string[],
    voiceChat: false,
    availability: [] as string[],
    age: "",
    bio: "",
    avatar: null as File | null
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
    }));
  };

  const handleAvailabilityToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(t => t !== time)
        : [...prev.availability, time]
    }));
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

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let avatarUrl = null;
      if (formData.avatar) {
        avatarUrl = await handleAvatarUpload(formData.avatar);
      }

      const selectedCountry = countries.find(c => c.code === formData.country);

      const { error } = await supabase
        .from('profiles')
        .update({
          country_code: formData.country,
          country_flag: selectedCountry?.flag || "",
          rank: formData.rank,
          roles: formData.selectedRoles,
          voice_chat: formData.voiceChat,
          availability: formData.availability,
          age: formData.age ? parseInt(formData.age) : null,
          bio: formData.bio,
          avatar_url: avatarUrl,
          last_active: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile created!",
        description: "Welcome to RadiantDuo. Let's find your perfect duo!",
      });

      navigate('/swipe');
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

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.country && formData.rank;
      case 2:
        return formData.selectedRoles.length > 0;
      case 3:
        return formData.availability.length > 0;
      case 4:
        return formData.bio.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-slate-900/80 border-slate-700 backdrop-blur-lg">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-rajdhani font-bold">
              Complete Your Profile
            </h1>
            <span className="text-sm text-muted-foreground">
              {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-rajdhani font-semibold mb-4">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue placeholder="Select your country" />
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
                  <Label>Current Rank</Label>
                  <Select
                    value={formData.rank}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rank: value }))}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue placeholder="Select your rank" />
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
                  <Label>Age (Optional)</Label>
                  <Input
                    type="number"
                    min="13"
                    max="99"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="bg-slate-800/50 border-slate-600 focus:border-neon-cyan"
                    placeholder="Enter your age"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-rajdhani font-semibold mb-4">
                Gameplay Preferences
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Preferred Roles (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <div
                        key={role}
                        onClick={() => handleRoleToggle(role)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.selectedRoles.includes(role)
                            ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                            : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.selectedRoles.includes(role)}
                            onChange={() => {}}
                          />
                          <span className="font-medium">{role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={formData.voiceChat}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, voiceChat: !!checked }))
                    }
                  />
                  <Label>I use voice chat</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-rajdhani font-semibold mb-4">
                Availability
              </h2>
              
              <div>
                <Label className="mb-3 block">When do you usually play?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availabilityOptions.map((time) => (
                    <div
                      key={time}
                      onClick={() => handleAvailabilityToggle(time)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.availability.includes(time)
                          ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.availability.includes(time)}
                          onChange={() => {}}
                        />
                        <span className="font-medium">{time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-rajdhani font-semibold mb-4">
                Tell us about yourself
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell potential duos about your playstyle, goals, and what you're looking for..."
                    className="bg-slate-800/50 border-slate-600 focus:border-neon-cyan min-h-[120px]"
                  />
                </div>

                <div>
                  <Label>Profile Picture (Optional)</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData(prev => ({ ...prev, avatar: file }));
                        }
                      }}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {formData.avatar ? formData.avatar.name : "Choose image"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <GamingButton
            variant="tactical"
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </GamingButton>

          <GamingButton
            variant="radiant"
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex items-center gap-2"
          >
            {step === totalSteps ? (
              loading ? "Creating Profile..." : "Complete Setup"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </GamingButton>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;