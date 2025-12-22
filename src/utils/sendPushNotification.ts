import { supabase } from "@/integrations/supabase/client";

interface PushNotificationData {
  recipientUserId: string;
  title: string;
  body: string;
  conversationId?: string;
  type?: 'message' | 'like' | 'comment' | 'share' | 'follow' | 'follow_accepted' | 'mention' | 'post';
  actorId?: string;
  entityId?: string;
  url?: string;
}

/**
 * Sends a push notification to a user
 * This will work even when the user is not on the website
 */
export async function sendPushNotification(data: PushNotificationData) {
  try {
    console.log('📤 Sending push notification:', data);
    
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: data
    });

    if (error) {
      console.error('❌ Error sending push notification:', error);
      return false;
    }

    console.log('✅ Push notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Exception sending push notification:', error);
    return false;
  }
}
