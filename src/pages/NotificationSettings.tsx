import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Bell, MessageSquare, Heart, MessageCircle, Users, AtSign, Mail, 
  ArrowLeft, Share2, BookOpen, Loader2, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { sendPushNotification } from '@/utils/sendPushNotification';
import { useNetworkAwareLoading } from '@/hooks/useNetworkAwareLoading';
import { debounce } from '@/utils/performanceOptimization';

interface NotificationCategory {
  category: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

const CATEGORIES: Omit<NotificationCategory, 'enabled'>[] = [
  { category: 'message', label: 'Messages', description: 'Messages directs et messages de groupe', icon: MessageSquare },
  { category: 'comment', label: 'Commentaires', description: 'Commentaires sur vos publications', icon: MessageCircle },
  { category: 'like', label: 'J\'aime', description: 'J\'aime sur vos publications', icon: Heart },
  { category: 'share', label: 'Partages', description: 'Quand quelqu\'un partage vos publications', icon: Share2 },
  { category: 'post', label: 'Nouvelles publications', description: 'Publications des personnes que vous suivez', icon: Mail },
  { category: 'mention', label: 'Mentions', description: 'Quand quelqu\'un vous mentionne', icon: AtSign },
  { category: 'follow', label: 'Abonnements', description: 'Demandes d\'abonnement et nouveaux abonnés', icon: Users },
  { category: 'lesson', label: 'Leçons', description: 'Commentaires sur vos leçons', icon: BookOpen },
  { category: 'group', label: 'Groupes', description: 'Invitations et activités de groupe', icon: Users },
  { category: 'word_of_day', label: 'Mot du jour', description: 'Notification quotidienne avec le nouveau mot français', icon: BookOpen },
];

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [togglingAll, setTogglingAll] = useState(false);
  
  const { isSlowConnection, loadingStrategy } = useNetworkAwareLoading();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Load user preferences
      const { data: prefs, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Merge with default categories
      const prefsMap = new Map(prefs?.map(p => [p.category, p.enabled]) || []);
      
      setCategories(CATEGORIES.map(cat => ({
        ...cat,
        enabled: prefsMap.has(cat.category) ? prefsMap.get(cat.category)! : true
      })));
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      toast.error('Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  }

  // Debounced toggle to prevent rapid switching
  const debouncedToggle = useCallback(
    debounce(async (category: string, enabled: boolean, currentUserId: string) => {
      try {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: currentUserId,
            category,
            enabled
          }, {
            onConflict: 'user_id,category'
          });

        if (error) throw error;
        toast.success(enabled ? 'Notifications activées' : 'Notifications désactivées');
      } catch (error) {
        console.error('Failed to update preference:', error);
        toast.error('Échec de la mise à jour');
        // Revert on error
        setCategories(prev => prev.map(cat =>
          cat.category === category ? { ...cat, enabled: !enabled } : cat
        ));
      } finally {
        setSaving(null);
      }
    }, 300),
    []
  );

  async function toggleCategory(category: string, enabled: boolean) {
    if (!userId) return;

    setSaving(category);
    // Optimistic update
    setCategories(prev => prev.map(cat =>
      cat.category === category ? { ...cat, enabled } : cat
    ));
    
    debouncedToggle(category, enabled, userId);
  }

  async function toggleAllCategories(enabled: boolean) {
    if (!userId) return;

    setTogglingAll(true);
    try {
      // Batch upsert all categories
      const updates = CATEGORIES.map(cat => ({
        user_id: userId,
        category: cat.category,
        enabled
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(updates, {
          onConflict: 'user_id,category'
        });

      if (error) throw error;

      setCategories(prev => prev.map(cat => ({ ...cat, enabled })));
      toast.success(enabled ? 'Toutes les notifications activées' : 'Toutes les notifications désactivées');
    } catch (error) {
      console.error('Failed to toggle all categories:', error);
      toast.error('Échec de la mise à jour');
    } finally {
      setTogglingAll(false);
    }
  }

  async function sendTestNotification(category: string) {
    if (!userId) return;

    setSendingTest(category);
    try {
      const cat = categories.find(c => c.category === category);
      if (!cat) return;

      // Map category to valid notification type
      const typeMap: Record<string, string> = {
        'message': 'like',
        'comment': 'comment',
        'like': 'like',
        'share': 'share',
        'post': 'new_post',
        'mention': 'mention',
        'follow': 'follow_request',
        'lesson': 'lesson_comment',
        'group': 'group_invitation',
        'word_of_day': 'word_of_day',
      };

      const notificationType = typeMap[category] || 'like';

      // 1. Insert test notification in database so it shows in the notifications page
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id: userId,
        actor_id: userId,
        type: notificationType,
        content: `🧪 Notification de test pour "${cat.label}"`,
        read: false
      });

      if (insertError) {
        console.error('Failed to insert test notification:', insertError);
      }

      // 2. Send push notification
      await sendPushNotification({
        recipientUserId: userId,
        title: `🧪 Test: ${cat.label}`,
        body: `Ceci est une notification de test pour la catégorie "${cat.label}"`,
        type: category as 'message' | 'like' | 'comment' | 'share' | 'follow' | 'follow_accepted' | 'mention' | 'post',
      });

      toast.success('Notification de test envoyée !');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Échec de l\'envoi du test');
    } finally {
      setSendingTest(null);
    }
  }

  // Check if all categories are enabled
  const allEnabled = categories.length > 0 && categories.every(cat => cat.enabled);
  const someEnabled = categories.some(cat => cat.enabled);

  // Skeleton count based on network
  const skeletonCount = isSlowConnection ? 3 : 5;

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8">
          <div className={`space-y-4 ${isSlowConnection ? '' : 'animate-pulse'}`}>
            <div className="h-8 bg-muted rounded w-1/3" />
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Paramètres de notification</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Gérez vos préférences de notifications push
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Catégories de notifications
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Choisissez les types de notifications que vous souhaitez recevoir
                </CardDescription>
              </div>
              {/* Master Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllCategories(!allEnabled)}
                disabled={togglingAll}
                className="flex items-center gap-2 shrink-0"
              >
                {togglingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : allEnabled ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {allEnabled ? 'Tout désactiver' : 'Tout activer'}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSaving = saving === cat.category;
              const isSendingTest = sendingTest === cat.category;
              
              return (
                <div 
                  key={cat.category} 
                  className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg border bg-card"
                >
                  <Icon className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm md:text-base">{cat.label}</div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">
                      {cat.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={cat.enabled}
                      onCheckedChange={(enabled) => toggleCategory(cat.category, enabled)}
                      disabled={isSaving || togglingAll}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendTestNotification(cat.category)}
                      disabled={!cat.enabled || isSendingTest}
                      className="w-14"
                    >
                      {isSendingTest ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Only show info card on fast connections or after initial load */}
        {loadingStrategy !== 'minimal' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">À propos des notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <p>
                • Les notifications push fonctionnent même lorsque l'application est fermée
              </p>
              <p>
                • Sur iOS, vous devez installer l'application (Ajouter à l'écran d'accueil) pour recevoir les notifications push
              </p>
              <p>
                • Vous pouvez gérer les notifications pour plusieurs appareils
              </p>
              <p>
                • Les paramètres de notification sont synchronisés sur tous vos appareils
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
