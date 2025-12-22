import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAvatarUrl } from '@/lib/avatarMap';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FollowRequest {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profile: {
    full_name: string;
    nickname: string;
    user_id: string;
    avatar_url: string | null;
  };
}

export default function FollowRequests() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<FollowRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUser(user);
  };

  const fetchRequests = async () => {
    try {
      // Fetch incoming requests (people who want to follow me)
      const { data: incomingFollows, error: incomingError } = await supabase
        .from('follows')
        .select('id, follower_id, following_id, status, created_at')
        .eq('following_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (incomingError) throw incomingError;

      // Fetch profiles for incoming requests
      const incomingUserIds = incomingFollows?.map(f => f.follower_id) || [];
      const { data: incomingProfiles } = await supabase
        .from('profiles')
        .select('full_name, nickname, user_id, avatar_url')
        .in('user_id', incomingUserIds);

      const incoming = incomingFollows?.map(follow => ({
        ...follow,
        profile: incomingProfiles?.find(p => p.user_id === follow.follower_id) || {
          full_name: 'Unknown',
          nickname: 'unknown',
          user_id: follow.follower_id,
          avatar_url: null
        }
      })) || [];

      // Fetch outgoing requests (people I want to follow)
      const { data: outgoingFollows, error: outgoingError } = await supabase
        .from('follows')
        .select('id, follower_id, following_id, status, created_at')
        .eq('follower_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (outgoingError) throw outgoingError;

      // Fetch profiles for outgoing requests
      const outgoingUserIds = outgoingFollows?.map(f => f.following_id) || [];
      const { data: outgoingProfiles } = await supabase
        .from('profiles')
        .select('full_name, nickname, user_id, avatar_url')
        .in('user_id', outgoingUserIds);

      const outgoing = outgoingFollows?.map(follow => ({
        ...follow,
        profile: outgoingProfiles?.find(p => p.user_id === follow.following_id) || {
          full_name: 'Unknown',
          nickname: 'unknown',
          user_id: follow.following_id,
          avatar_url: null
        }
      })) || [];

      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error: any) {
      toast.error('Failed to load follow requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string, followerId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      // Create notification for the person who sent the request
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: followerId,
          actor_id: currentUser.id,
          type: 'follow_accepted',
          read: false,
        });

      if (notifError) {
        console.error('❌ Error creating acceptance notification:', notifError);
      }

      // Send push notification to the person who sent the request
      try {
        const { data: acceptorProfile } = await supabase
          .from('profiles')
          .select('nickname, full_name')
          .eq('user_id', currentUser.id)
          .single();

        await supabase.functions.invoke('send-push-notification', {
          body: {
            recipientUserId: followerId,
            title: 'EDUPRENEURS',
            body: `${acceptorProfile?.nickname || acceptorProfile?.full_name || 'Someone'} a accepté votre demande d'abonnement`,
            url: '/notifications',
            type: 'follow_accepted'
          }
        });
        console.log('✅ Follow acceptance push notification sent');
      } catch (pushError) {
        console.error('❌ Error sending push notification:', pushError);
      }

      toast.success('Follow request accepted!');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to accept request');
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Follow request rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to reject request');
      console.error('Error rejecting request:', error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Follow request cancelled');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to cancel request');
      console.error('Error cancelling request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Follow Requests</h1>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing ({outgoingRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4 mt-4">
            {incomingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No incoming follow requests</p>
              </Card>
            ) : (
              incomingRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      className="h-12 w-12 cursor-pointer"
                      onClick={() => navigate(`/profile/${request.profile.user_id}`)}
                    >
                      <AvatarImage src={getAvatarUrl(request.profile.avatar_url)} />
                      <AvatarFallback>
                        {request.profile.full_name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/profile/${request.profile.user_id}`)}
                    >
                      <p className="font-semibold">{request.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{request.profile.nickname}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="default"
                        onClick={() => handleAccept(request.id, request.follower_id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4 mt-4">
            {outgoingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No outgoing follow requests</p>
              </Card>
            ) : (
              outgoingRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      className="h-12 w-12 cursor-pointer"
                      onClick={() => navigate(`/profile/${request.profile.user_id}`)}
                    >
                      <AvatarImage src={getAvatarUrl(request.profile.avatar_url)} />
                      <AvatarFallback>
                        {request.profile.full_name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/profile/${request.profile.user_id}`)}
                    >
                      <p className="font-semibold">{request.profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{request.profile.nickname}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}