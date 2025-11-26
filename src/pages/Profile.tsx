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
import { ThemeToggle } from '@/components/ThemeToggle';
import { useProfileAnalytics } from '@/hooks/useProfileAnalytics';

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
  
  // Fetch profile analytics for streak and achievements
  const { analytics, isLoading: analyticsLoading } = useProfileAnalytics(userId || null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser && userId) {
      fetchProfile();
      fetchFollowStatus();
      fetchFollowCounts();
    }
  }, [currentUser, userId]);

  const checkAuth = async () => {
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
          }
        });
        console.log('✅ Follow request push notification sent');
      } catch (pushError) {
        console.error('❌ Error sending push notification:', pushError);
      }

      setFollowStatus({ following: true, status: 'pending', followId: null });
      toast.success('Follow request sent!');
      fetchFollowStatus();
    } catch (error: any) {
      toast.error('Failed to send follow request');
      console.error('Error following user:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
    }
  };

  const handleUnfollow = async () => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);

      if (error) throw error;

      setFollowStatus({ following: false, status: null, followId: null });
      toast.success('Unfollowed successfully');
      fetchFollowCounts();
    } catch (error: any) {
      toast.error('Failed to unfollow');
      console.error('Error unfollowing user:', error);
    }
  };

  const startConversation = async () => {
    try {
      // First check if a conversation exists between these two users
      // by looking at the other user's conversations
      const { data: otherUserConversations, error: otherUserError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      if (otherUserError) throw otherUserError;

      let sharedConversationId: string | null = null;

      // Check if any of the other user's conversations are non-group conversations
      // that might be with the current user (even if current user left it)
      if (otherUserConversations && otherUserConversations.length > 0) {
        for (const conv of otherUserConversations) {
          // Check if this is a non-group conversation
          const { data: conversationInfo } = await supabase
            .from('conversations')
            .select('is_group')
            .eq('id', conv.conversation_id)
            .single();

          if (conversationInfo && !conversationInfo.is_group) {
            // Check all participants of this conversation
            const { data: participants } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', conv.conversation_id);

            const participantIds = participants?.map(p => p.user_id) || [];
            
            // If it's just the other user (current user left), or includes both users
            if (participantIds.includes(userId) && participantIds.length <= 2) {
              sharedConversationId = conv.conversation_id;
              break;
            }
          }
        }
      }

      if (sharedConversationId) {
        // Conversation exists - check if current user is a participant
        const { data: currentUserParticipation } = await supabase
          .from('conversation_participants')
          .select('id, visible_from_message_id')
          .eq('conversation_id', sharedConversationId)
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!currentUserParticipation) {
          // Re-add current user to the conversation (WhatsApp-like behavior)
          const { error: addError } = await supabase
            .from('conversation_participants')
            .insert({
              conversation_id: sharedConversationId,
              user_id: currentUser.id,
              visible_from_message_id: null,
            });

          if (addError) throw addError;
        } else if (currentUserParticipation.visible_from_message_id) {
          // User deleted the conversation before - reset visibility
          const { error: resetError } = await supabase
            .from('conversation_participants')
            .update({ visible_from_message_id: null })
            .eq('conversation_id', sharedConversationId)
            .eq('user_id', currentUser.id);

          if (resetError) throw resetError;
        }

        // Navigate to the conversation
        navigate(`/community?conversation=${sharedConversationId}`);
        return;
      }

      // No existing conversation - create a new one
      const { data: conversationData, error: conversationError } = await supabase
        .rpc('create_conversation');

      if (conversationError) throw conversationError;

      const conversationId = conversationData;

      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: currentUser.id },
          { conversation_id: conversationId, user_id: userId }
        ]);

      if (participantsError) throw participantsError;

      toast.success('Conversation started!');
      navigate(`/community?conversation=${conversationId}`);
    } catch (error: any) {
      toast.error('Failed to start conversation');
      console.error('Error starting conversation:', error);
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/community')}
          className="mb-2 sm:mb-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

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

            <div className="flex gap-8 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{followersCount}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{followingCount}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
              {!profile.is_system_account && (
                <div className="text-center">
                  <p className="text-2xl font-bold">{profile.affiliation_points}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <div className="w-full max-w-xs space-y-2">
                {!profile.is_system_account && (
                  <>
                    {!followStatus.following && (
                      <Button onClick={handleFollow} className="w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </Button>
                    )}
                    {followStatus.following && followStatus.status === 'pending' && (
                      <Button onClick={handleUnfollow} variant="outline" className="w-full">
                        <Clock className="w-4 h-4 mr-2" />
                        Pending
                      </Button>
                    )}
                    {followStatus.following && followStatus.status === 'accepted' && (
                      <Button onClick={handleUnfollow} variant="outline" className="w-full">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </Button>
                    )}
                  </>
                )}
                <Button onClick={startConversation} variant="default" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            )}

            {isOwnProfile && (
              <Button onClick={() => navigate('/settings')} variant="outline" className="w-full max-w-xs">
                Edit Profile
              </Button>
            )}
          </div>

          {/* Learning Streak Section */}
          {!profile.is_system_account && !analyticsLoading && (
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

          {/* Achievements/Badges Section */}
          {!profile.is_system_account && !analyticsLoading && (
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

          <div className="mt-8 space-y-4">
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {!profile.is_system_account && (
              <div className="grid grid-cols-2 gap-4">
                {profile.school && (
                  <div>
                    <h3 className="font-semibold mb-1">School</h3>
                    <p className="text-muted-foreground">{profile.school}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-1">Grade</h3>
                  <p className="text-muted-foreground">{profile.academic_grade}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}