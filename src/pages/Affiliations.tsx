import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Copy,
  Check,
  Coins,
  UserCheck,
  TrendingUp,
  Share2,
  Users,
} from "lucide-react";
import ericExcited from "@/assets/eric-main01.png";

interface UserProfile {
  id: string;
  referral_code: string;
  affiliation_points: number;
  full_name: string;
}

interface PublicProfile {
  user_id: string;
  full_name: string;
  nickname: string;
}

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  points_awarded: number;
  created_at: string;
  profiles: {
    full_name: string;
    nickname: string;
  };
}

const Affiliations = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchAffiliationData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  const fetchAffiliationData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, referral_code, affiliation_points, full_name")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      toast.error("Erreur lors du chargement du profil");
      return;
    }

    setProfile(profileData);

    // Fetch referrals with only public profile information
    const { data: referralsData, error: referralsError } = await supabase
      .from("referrals")
      .select(`
        id,
        referred_id,
        status,
        points_awarded,
        created_at
      `)
      .eq("referrer_id", profileData.id)
      .order("created_at", { ascending: false });

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError);
      return;
    }
    
    // Fetch public profile info for referred users and merge
    const enrichedReferrals: Referral[] = [];
    if (referralsData && referralsData.length > 0) {
      const referredIds = referralsData.map(r => r.referred_id);
      const { data: publicProfiles } = await supabase
        .from("public_profiles")
        .select("user_id, full_name, nickname")
        .in("user_id", referredIds)
        .returns<PublicProfile[]>();
      
      // Create properly typed referral objects
      referralsData.forEach((referral) => {
        const profile = publicProfiles?.find(p => p.user_id === referral.referred_id);
        enrichedReferrals.push({
          ...referral,
          profiles: {
            full_name: profile?.full_name || "Utilisateur",
            nickname: profile?.nickname || "utilisateur"
          }
        });
      });
    }

    setReferrals(enrichedReferrals);

    // Calculate stats
    const total = enrichedReferrals.length;
    const active = enrichedReferrals.filter((r) => r.status === "active" || r.status === "rewarded").length;
    const pending = enrichedReferrals.filter((r) => r.status === "pending").length;
    const totalPoints = enrichedReferrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

    setStats({ total, active, pending, totalPoints });
  };

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    
    const referralUrl = `${window.location.origin}/auth?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Lien copié dans le presse-papiers!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = async () => {
    if (!profile?.referral_code) return;
    
    const referralUrl = `${window.location.origin}/auth?ref=${profile.referral_code}`;
    const text = `Rejoignez EDUPRENEURS avec mon lien de parrainage et commencez votre parcours d'apprentissage!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "EDUPRENEURS - Invitation",
          text: text,
          url: referralUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      copyReferralLink();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="pt-4 px-4 lg:px-8 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-8 rounded-[20px] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 relative z-10">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Programme d'Affiliation</h1>
              <p className="opacity-75">
                Partagez votre lien et gagnez des points pour chaque nouvel utilisateur
              </p>
            </div>
            <div className="flex-shrink-0 relative z-10">
              <img 
                src={ericExcited} 
                alt="Eric - Excited" 
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain animate-[float_4s_ease-in-out_infinite]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <UserCheck />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {stats.total}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Total Parrainages</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--success))] to-[hsl(160_84%_32%)] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <TrendingUp />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {stats.active}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Actifs</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <Users />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {stats.pending}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">En attente</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <Coins />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {profile?.affiliation_points || 0}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Points gagnés</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="border-none rounded-[20px] shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Votre lien de parrainage</CardTitle>
            <CardDescription>
              Partagez ce lien avec vos amis. Vous gagnerez 10 points lorsqu'ils s'inscriront et deviendront actifs!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                readOnly
                value={profile?.referral_code ? `${window.location.origin}/auth?ref=${profile.referral_code}` : "Chargement..."}
                className="flex-1 bg-muted"
              />
              <Button
                onClick={copyReferralLink}
                className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
              <Button
                onClick={shareReferralLink}
                variant="outline"
                className="border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Comment ça marche?</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>• Partagez votre lien unique avec vos amis</li>
                <li>• Ils s'inscrivent en utilisant votre lien</li>
                <li>• Vous gagnez 10 points une fois qu'ils deviennent actifs</li>
                <li>• Utilisez vos points pour débloquer des fonctionnalités premium!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="border-none rounded-[20px] shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Mes parrainages</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs que vous avez parrainés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'avez pas encore de parrainages.</p>
                <p className="text-sm mt-2">Commencez à partager votre lien pour gagner des points!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] flex items-center justify-center text-white font-bold">
                        {referral.profiles?.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold">{referral.profiles?.full_name || "Utilisateur"}</p>
                        <p className="text-sm text-muted-foreground">
                          @{referral.profiles?.nickname || "utilisateur"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          referral.status === "rewarded"
                            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                            : referral.status === "active"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                        }`}
                      >
                        {referral.status === "rewarded"
                          ? "Récompensé"
                          : referral.status === "active"
                          ? "Actif"
                          : "En attente"}
                      </span>
                      {referral.points_awarded > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          +{referral.points_awarded} points
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Affiliations;
