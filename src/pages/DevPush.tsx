import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Send, 
  Trash2,
  ArrowLeft,
  Heart,
  MessageCircle,
  FileText,
  AtSign
} from "lucide-react";

interface PushState {
  permission: NotificationPermission;
  serviceWorkerState: string;
  subscription: PushSubscription | null;
  subscriptionJson: string;
  lastError: string | null;
  lastSuccess: string | null;
  logs: Array<{ time: string; type: string; message: string }>;
}

export default function DevPush() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<PushState>({
    permission: 'default',
    serviceWorkerState: 'unknown',
    subscription: null,
    subscriptionJson: '',
    lastError: null,
    lastSuccess: null,
    logs: []
  });
  const [loading, setLoading] = useState<string | null>(null);

  const log = (type: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    setState(prev => ({
      ...prev,
      logs: [{ time, type, message }, ...prev.logs].slice(0, 50)
    }));
    console.log(`[${type}]`, message);
  };

  useEffect(() => {
    checkAuth();
    refreshState();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    log('info', `Authenticated as ${user.email}`);
  };

  const refreshState = async () => {
    log('info', 'Refreshing state...');
    
    // Check notification permission
    const permission = 'Notification' in window ? Notification.permission : 'denied';
    
    // Check service worker
    let swState = 'not supported';
    let subscription: PushSubscription | null = null;
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        swState = registration.active ? 'active' : 'inactive';
        subscription = await registration.pushManager.getSubscription();
      } else {
        swState = 'not registered';
      }
    }

    setState(prev => ({
      ...prev,
      permission,
      serviceWorkerState: swState,
      subscription,
      subscriptionJson: subscription ? JSON.stringify(subscription.toJSON(), null, 2) : ''
    }));

    log('success', 'State refreshed');
  };

  const checkPermission = async () => {
    setLoading('permission');
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }
      
      const permission = Notification.permission;
      log('info', `Permission status: ${permission}`);
      
      setState(prev => ({ ...prev, permission, lastSuccess: 'Permission checked' }));
      toast({ title: `Permission: ${permission}` });
    } catch (error: any) {
      log('error', error.message);
      setState(prev => ({ ...prev, lastError: error.message }));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const registerSW = async () => {
    setLoading('sw');
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers not supported');
      }

      log('info', 'Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js');
      log('success', 'Service worker registered');

      await registration.update();
      await refreshState();
      
      setState(prev => ({ ...prev, lastSuccess: 'Service worker registered' }));
      toast({ title: "Service Worker registered" });
    } catch (error: any) {
      log('error', error.message);
      setState(prev => ({ ...prev, lastError: error.message }));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const subscribe = async () => {
    setLoading('subscribe');
    try {
      if (state.permission !== 'granted') {
        log('info', 'Requesting permission...');
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
          throw new Error('Permission denied');
        }
        
        setState(prev => ({ ...prev, permission }));
      }

      const registration = await navigator.serviceWorker.ready;
      log('info', 'Subscribing to push...');

      const vapidPublicKey = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
      
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      log('success', 'Subscribed to push notifications');

      // Save to backend
      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert({
          user_id: user.id,
          subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      log('success', 'Subscription saved to database');
      await refreshState();
      
      setState(prev => ({ ...prev, lastSuccess: 'Subscribed successfully' }));
      toast({ title: "Push notifications enabled!" });
    } catch (error: any) {
      log('error', error.message);
      setState(prev => ({ ...prev, lastError: error.message }));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const sendTestNotification = async (type: string) => {
    setLoading(`test-${type}`);
    try {
      if (!user) throw new Error('Not authenticated');

      log('info', `Sending ${type} test notification...`);

      const payloads: Record<string, any> = {
        message: {
          recipientUserId: user.id,
          title: 'Eric',
          body: '👋 Salut! J\'ai une nouvelle ressource à partager avec toi!',
          conversationId: 'test-conv-123'
        },
        comment: {
          recipientUserId: user.id,
          title: 'Eric a commenté',
          body: '💬 Super travail sur cette publication! Continue comme ça! 🌟',
          conversationId: null
        },
        like: {
          recipientUserId: user.id,
          title: 'Eric a aimé',
          body: '❤️ Eric a aimé votre publication',
          conversationId: null
        },
        post: {
          recipientUserId: user.id,
          title: 'Nouvelle publication d\'Eric',
          body: '📚 Eric a partagé un nouveau cours de mathématiques',
          conversationId: null
        },
        mention: {
          recipientUserId: user.id,
          title: 'Eric vous a mentionné',
          body: '🏆 Eric vous a mentionné dans un défi hebdomadaire!',
          conversationId: null
        }
      };

      const payload = payloads[type];
      
      // Send to edge function (for real push notification)
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: payload
      });

      if (error) throw error;

      log('success', `${type} notification sent: ${JSON.stringify(data)}`);
      
      // Also show a local notification immediately for testing
      if (state.permission === 'granted' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `test-${type}-${Date.now()}`,
          requireInteraction: false,
          data: { deeplink: '/community' }
        });
        
        log('success', 'Local notification displayed');
      }
      
      setState(prev => ({ ...prev, lastSuccess: `${type} notification sent` }));
      toast({ 
        title: "Test notification sent!", 
        description: `You should see both a local notification and receive a push notification for ${type}` 
      });
    } catch (error: any) {
      log('error', error.message);
      setState(prev => ({ ...prev, lastError: error.message }));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const unsubscribe = async () => {
    setLoading('unsubscribe');
    try {
      if (state.subscription) {
        await state.subscription.unsubscribe();
        log('success', 'Unsubscribed from push');
      }

      await supabase
        .from('push_subscriptions' as any)
        .delete()
        .eq('user_id', user.id);

      log('success', 'Subscription removed from database');
      await refreshState();
      
      setState(prev => ({ ...prev, lastSuccess: 'Unsubscribed' }));
      toast({ title: "Unsubscribed from push notifications" });
    } catch (error: any) {
      log('error', error.message);
      setState(prev => ({ ...prev, lastError: error.message }));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/community')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Push Notifications Debug</h1>
              <p className="text-sm text-muted-foreground">Test and debug push notifications</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={refreshState}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Permission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {state.permission === 'granted' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={state.permission === 'granted' ? 'default' : 'destructive'}>
                  {state.permission}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Service Worker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {state.serviceWorkerState === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={state.serviceWorkerState === 'active' ? 'default' : 'secondary'}>
                  {state.serviceWorkerState}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {state.subscription ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={state.subscription ? 'default' : 'secondary'}>
                  {state.subscription ? 'Active' : 'None'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Setup and test push notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                onClick={checkPermission}
                disabled={loading === 'permission'}
              >
                <Bell className="mr-2 h-4 w-4" />
                Check Permission
              </Button>
              <Button 
                variant="outline" 
                onClick={registerSW}
                disabled={loading === 'sw'}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Register SW
              </Button>
              <Button 
                onClick={subscribe}
                disabled={loading === 'subscribe'}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Test Notifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => sendTestNotification('message')}
                  disabled={!state.subscription || loading === 'test-message'}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => sendTestNotification('comment')}
                  disabled={!state.subscription || loading === 'test-comment'}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Comment
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => sendTestNotification('like')}
                  disabled={!state.subscription || loading === 'test-like'}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Like
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => sendTestNotification('post')}
                  disabled={!state.subscription || loading === 'test-post'}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Post
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => sendTestNotification('mention')}
                  disabled={!state.subscription || loading === 'test-mention'}
                >
                  <AtSign className="mr-2 h-4 w-4" />
                  Mention
                </Button>
              </div>
            </div>

            <Separator />

            <Button 
              variant="destructive" 
              onClick={unsubscribe}
              disabled={!state.subscription || loading === 'unsubscribe'}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Unsubscribe
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        {state.subscriptionJson && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                {state.subscriptionJson}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Status Messages */}
        {(state.lastSuccess || state.lastError) && (
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {state.lastSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{state.lastSuccess}</span>
                </div>
              )}
              {state.lastError && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">{state.lastError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
            <CardDescription>Last 50 events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {state.logs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No logs yet</p>
                ) : (
                  state.logs.map((log, i) => (
                    <div key={i} className="flex gap-2 text-xs font-mono">
                      <span className="text-muted-foreground">{log.time}</span>
                      <Badge variant={
                        log.type === 'error' ? 'destructive' : 
                        log.type === 'success' ? 'default' : 
                        'secondary'
                      } className="text-xs">
                        {log.type}
                      </Badge>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
