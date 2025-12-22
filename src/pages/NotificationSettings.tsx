import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, MessageSquare, Heart, MessageCircle, Users, AtSign, Mail } from 'lucide-react';
import { sendPushNotification } from '@/utils/sendPushNotification';

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
  { category: 'post', label: 'Nouvelles publications', description: 'Publications des personnes que vous suivez', icon: Mail },
  { category: 'mention', label: 'Mentions', description: 'Quand quelqu\'un vous mentionne', icon: AtSign },
  { category: 'follow', label: 'Abonnements', description: 'Demandes d\'abonnement et nouveaux abonnés', icon: Users },
  { category: 'group', label: 'Groupes', description: 'Invitations et activités de groupe', icon: Users },
];

export default function NotificationSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<NotificationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

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

  async function toggleCategory(category: string, enabled: boolean) {
    if (!userId) return;

    setSaving(category);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          category,
          enabled
        }, {
          onConflict: 'user_id,category'
        });

      if (error) throw error;

      setCategories(prev => prev.map(cat =>
        cat.category === category ? { ...cat, enabled } : cat
      ));

      toast.success(enabled ? 'Notifications activées' : 'Notifications désactivées');
    } catch (error) {
      console.error('Failed to update preference:', error);
      toast.error('Échec de la mise à jour');
    } finally {
      setSaving(null);
    }
  }

  async function sendTestNotification(category: string) {
    if (!userId) return;

    try {
      const cat = categories.find(c => c.category === category);
      if (!cat) return;

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
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de notification</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos préférences de notifications push
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Catégories de notifications
            </CardTitle>
            <CardDescription>
              Choisissez les types de notifications que vous souhaitez recevoir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.category} className="flex items-start gap-4 p-4 rounded-lg border">
                  <Icon className="w-5 h-5 mt-1 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{cat.label}</div>
                    <div className="text-sm text-muted-foreground">{cat.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cat.enabled}
                      onCheckedChange={(enabled) => toggleCategory(cat.category, enabled)}
                      disabled={saving === cat.category}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendTestNotification(cat.category)}
                      disabled={!cat.enabled}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>À propos des notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
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
      </div>
    </Layout>
  );
}
