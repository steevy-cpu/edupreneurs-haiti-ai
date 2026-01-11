import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, UserPlus, UserCheck, Clock, ArrowLeft, BadgeCheck, MessageCircle, Flame, Trophy } from 'lucide-react';
import { getAvatarUrl } from '@/lib/avatarMap';
import { PageHeader } from '@/components/shared/PageHeader';
import { ProfileStatsSkeleton } from '@/components/shared/SkeletonLoaders';
import { useProfileAnalytics } from '@/hooks/useProfileAnalytics';
import { useVisitor } from '@/contexts/VisitorContext';
import { isFounder } from '@/lib/founderConstants';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  bio: string | null;
  school: string | null;
  academic_grade: string;
  affiliation_points: number;
  avatar_url: string | null;
  verified: boolean;
  is_system_account: boolean;
}

interface FollowStatus {
  following: boolean;
  status: 'pending' | 'accepted' | 'rejected' | null;
  followId: string | null;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isVisitor, exitVisitorMode } = useVisitor();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    following: false,
    status: null,
    followId: null,
  });
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  
  // Fetch profile analytics for streak and achievements
  const { analytics, isLoading: analyticsLoading } = useProfileAnalytics(userId || null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      // Only fetch follow status/counts for logged-in users
      if (currentUser && !isVisitor) {
        fetchFollowStatus();
        fetchFollowCounts();
      } else if (isVisitor) {
        // Demo counts for visitors
        setFollowersCount(42);
        setFollowingCount(28);
      }
    }
  }, [currentUser, userId, isVisitor]);

  const checkAuth = async () => {
    // Allow visitors to view profiles
    if (isVisitor) {
      setLoading(false);
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUser(user);
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error('Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id, status')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFollowStatus({
          following: true,
          status: data.status,
          followId: data.id,
        });
      }
    } catch (error: any) {
      console.error('Error fetching follow status:', error);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId)
          .eq('status', 'accepted'),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId)
          .eq('status', 'accepted'),
      ]);

      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
    } catch (error: any) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const handleFollow = async () => {
    if (isVisitor) {
      toast.info("Créez un compte pour suivre cet utilisateur !", {
        action: {
          label: "S'inscrire",
          onClick: () => {
            exitVisitorMode();
            navigate("/auth");
          }
        }
      });
      return;
    }

    setFollowLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.id,
          following_id: userId,
          status: 'pending',
        });

      if (error) {
        console.error('Full error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      // Send push notification for follow request
      try {
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('nickname, full_name')
          .eq('user_id', currentUser.id)
          .single();

        await supabase.functions.invoke('send-push-notification', {
          body: {
            recipientUserId: userId,
            title: 'EDUPRENEURS',
            body: `${currentUserProfile?.nickname || currentUserProfile?.full_name || 'Someone'} vous a envoyé une demande d'abonnement`,
            url: '/notifications',
            type: 'follow'
          }
        });
        console.log('✅ Follow request push notification sent');
      } catch (pushError) {
        console.error('❌ Error sending push notification:', pushError);
      }

      setFollowStatus({ following: true, status: 'pending', followId: null });
      toast.success('Demande envoyée!');
      fetchFollowStatus();
    } catch (error: any) {
      toast.error('Échec de la demande');
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowStatus({ following: false, status: null, followId: null });
      toast.success('Désabonné avec succès');
      fetchFollowCounts();
    } catch (error: any) {
      toast.error('Échec du désabonnement');
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const startConversation = async () => {
    if (isVisitor) {
      toast.info("Créez un compte pour envoyer un message !", {
        action: {
          label: "S'inscrire",
          onClick: () => {
            exitVisitorMode();
            navigate("/auth");
          }
        }
      });
      return;
    }

    setMessageLoading(true);
    try {
      const { data: conversationId, error } = await supabase
        .rpc('start_direct_conversation', { other_user_id: userId });

      if (error) throw error;

      toast.success('Conversation démarrée!');
      navigate(`/community?conversation=${conversationId}`);
    } catch (error: any) {
      toast.error('Échec du démarrage de la conversation');
      console.error('Error starting conversation:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === userId;
  const isFounderProfile = isFounder(profile?.user_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-20" />
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-32" />
              <ProfileStatsSkeleton />
              <Skeleton className="h-10 w-full max-w-xs" />
              <Skeleton className="h-10 w-full max-w-xs" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <Card className="p-8 text-center max-w-sm mx-4">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Profil introuvable</h2>
          <p className="text-muted-foreground mb-4 text-sm">Ce profil n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <PageHeader
          title={profile.nickname}
          subtitle={profile.full_name}
          variant="simple"
          backPath="/dashboard"
          backLabel="Retour"
          showThemeToggle={true}
        />

        <Card className="p-4 sm:p-8">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <Avatar className={profile.is_system_account ? "w-48 h-48 sm:w-64 sm:h-64" : "w-24 h-24 sm:w-32 sm:h-32"}>
              <AvatarImage src={getAvatarUrl(profile.avatar_url)} />
              <AvatarFallback>{profile.nickname[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1 sm:space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{profile.nickname}</h1>
                {profile.verified && (
                  <BadgeCheck className="w-6 h-6 text-primary fill-primary/20" />
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">{profile.full_name}</p>
            </div>

            <div className="flex gap-6 sm:gap-8 py-4">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{followersCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Abonnés</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{followingCount}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Abonnements</p>
              </div>
              {!profile.is_system_account && !isFounderProfile && (
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold">{profile.affiliation_points}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Points</p>
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <div className="w-full max-w-xs space-y-2">
                {!profile.is_system_account && (
                  <>
                    {!followStatus.following && (
                      <Button onClick={handleFollow} className="w-full" disabled={followLoading}>
                        {followLoading ? (
                          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        S'abonner
                      </Button>
                    )}
                    {followStatus.following && followStatus.status === 'pending' && (
                      <Button onClick={handleUnfollow} variant="outline" className="w-full" disabled={followLoading}>
                        {followLoading ? (
                          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 mr-2" />
                        )}
                        En attente
                      </Button>
                    )}
                    {followStatus.following && followStatus.status === 'accepted' && (
                      <Button onClick={handleUnfollow} variant="outline" className="w-full" disabled={followLoading}>
                        {followLoading ? (
                          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserCheck className="w-4 h-4 mr-2" />
                        )}
                        Abonné
                      </Button>
                    )}
                  </>
                )}
                <Button onClick={startConversation} variant="default" className="w-full" disabled={messageLoading}>
                  {messageLoading ? (
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  Envoyer un message
                </Button>
              </div>
            )}

            {isOwnProfile && (
              <Button onClick={() => navigate('/settings')} variant="outline" className="w-full max-w-xs">
                Modifier le profil
              </Button>
            )}
          </div>

          {/* Learning Streak Section - Only visible on own profile */}
          {isOwnProfile && !profile.is_system_account && !analyticsLoading && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Série d'apprentissage
              </h3>
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {analytics.streak} {analytics.streak === 1 ? "jour" : "jours"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {analytics.streak === 0 
                        ? "Commence une leçon pour démarrer ta série!" 
                        : analytics.streak >= 7 
                        ? "Incroyable série! Continue comme ça! 🔥" 
                        : "Continue ta série d'apprentissage!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements/Badges Section - Visible to everyone */}
          {!profile.is_system_account && !isFounderProfile && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Badges & Réalisations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    name: "Première Leçon", 
                    icon: "⭐", 
                    earned: analytics.totalLessonsCompleted >= 1,
                    description: "Complète ta première leçon"
                  },
                  { 
                    name: "Apprenant Assidu", 
                    icon: "🎯", 
                    earned: analytics.totalLessonsCompleted >= 10,
                    description: "Complète 10 leçons"
                  },
                  { 
                    name: "Maître", 
                    icon: "🏆", 
                    earned: analytics.totalLessonsCompleted >= 50,
                    description: "Complète 50 leçons"
                  },
                  { 
                    name: "Éclair", 
                    icon: "⚡", 
                    earned: analytics.totalLessonsCompleted >= 100,
                    description: "Complète 100 leçons"
                  },
                ].map((achievement, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      achievement.earned 
                        ? "bg-primary/10 border-primary/20 shadow-sm" 
                        : "bg-muted/50 border-muted opacity-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <p className="text-xs font-medium text-center mb-1">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground text-center">
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <div className="mt-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        ✓ Débloqué
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio & Info Section */}
          <div className="mt-8 pt-6 border-t space-y-5">
            {profile.bio ? (
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 sm:p-5">
                <h3 className="font-playfair font-semibold text-lg mb-2 text-foreground">Bio</h3>
                <p className="text-muted-foreground leading-relaxed font-poppins">{profile.bio}</p>
              </div>
            ) : isOwnProfile && (
              <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Vous n'avez pas encore de bio</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  Ajouter une bio
                </Button>
              </div>
            )}

            {!profile.is_system_account && !isFounderProfile && (
              <div className="grid grid-cols-2 gap-4">
                {profile.school && (
                  <div className="bg-gradient-to-br from-secondary/50 to-muted/30 rounded-xl p-4">
                    <h3 className="font-playfair font-semibold text-base mb-1 text-foreground">École</h3>
                    <p className="text-muted-foreground font-poppins text-sm sm:text-base">{profile.school}</p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-secondary/50 to-muted/30 rounded-xl p-4">
                  <h3 className="font-playfair font-semibold text-base mb-1 text-foreground">Classe</h3>
                  <p className="text-muted-foreground font-poppins text-sm sm:text-base">{profile.academic_grade}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}