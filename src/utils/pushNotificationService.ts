import { supabase } from "@/integrations/supabase/client";

const DEBUG = import.meta.env.DEV;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

interface PushNotificationData {
  recipientUserId: string;
  title: string;
  body: string;
  conversationId?: string;
  type?: 'message' | 'like' | 'comment' | 'share' | 'follow' | 'follow_accepted' | 'mention' | 'post' | 'group_message' | 'new_post' | 'quiz_invite';
  actorId?: string;
  entityId?: string;
  url?: string;
  notificationId?: string;
}

interface SendResult {
  success: boolean;
  error?: string;
  retries?: number;
}

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Centralized push notification service with retry logic and error handling
 */
export async function sendPushToUser(data: PushNotificationData): Promise<SendResult> {
  let lastError: string | undefined;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (DEBUG && attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt + 1}/${MAX_RETRIES} for push notification`);
      }

      const { data: response, error } = await supabase.functions.invoke('send-push-notification', {
        body: data
      });

      if (error) {
        lastError = error.message;
        
        // Don't retry for certain errors
        if (error.message?.includes('not configured') || 
            error.message?.includes('No push subscription')) {
          if (DEBUG) console.log('⏭️ Skipping retry - non-retryable error:', error.message);
          return { success: false, error: lastError, retries: attempt };
        }
        
        // Wait before retrying
        if (attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY_MS * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }
      }

      // Check if notification was actually sent or just skipped
      if (response?.skipped) {
        if (DEBUG) console.log('⏭️ Push notification skipped:', response.message);
        return { success: true, retries: attempt };
      }

      if (response?.success) {
        if (DEBUG) console.log(`✅ Push notification sent successfully (${response.successCount}/${response.totalDevices} devices)`);
        return { success: true, retries: attempt };
      }

      // Partial success
      if (response?.successCount > 0) {
        if (DEBUG) console.log(`⚠️ Partial push success: ${response.successCount}/${response.totalDevices} devices`);
        return { success: true, retries: attempt };
      }

      lastError = 'No devices received the notification';
      
    } catch (err: any) {
      lastError = err.message;
      if (DEBUG) console.error(`❌ Push notification error (attempt ${attempt + 1}):`, err.message);
      
      // Wait before retrying on network errors
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  if (DEBUG) console.error(`❌ Push notification failed after ${MAX_RETRIES} attempts:`, lastError);
  return { success: false, error: lastError, retries: MAX_RETRIES };
}

/**
 * Send notification for a new message
 */
export async function notifyNewMessage(
  recipientUserId: string,
  actorId: string,
  conversationId: string,
  isGroupMessage: boolean = false
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Nouveau message',
    body: '',
    type: isGroupMessage ? 'group_message' : 'message',
    actorId,
    conversationId,
    url: '/community'
  });
}

/**
 * Send notification for a like on post
 */
export async function notifyPostLike(
  recipientUserId: string,
  actorId: string,
  postId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Nouveau j\'aime',
    body: '',
    type: 'like',
    actorId,
    entityId: postId,
    url: '/feed'
  });
}

/**
 * Send notification for a comment on post
 */
export async function notifyPostComment(
  recipientUserId: string,
  actorId: string,
  postId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Nouveau commentaire',
    body: '',
    type: 'comment',
    actorId,
    entityId: postId,
    url: '/feed'
  });
}

/**
 * Send notification for a share of post
 */
export async function notifyPostShare(
  recipientUserId: string,
  actorId: string,
  postId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Partage de publication',
    body: '',
    type: 'share',
    actorId,
    entityId: postId,
    url: '/feed'
  });
}

/**
 * Send notification for a follow request
 */
export async function notifyFollowRequest(
  recipientUserId: string,
  actorId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Demande de suivi',
    body: '',
    type: 'follow',
    actorId,
    url: '/follow-requests'
  });
}

/**
 * Send notification when follow is accepted
 */
export async function notifyFollowAccepted(
  recipientUserId: string,
  actorId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Demande acceptée',
    body: '',
    type: 'follow_accepted',
    actorId,
    url: `/profile/${actorId}`
  });
}

/**
 * Send notification for new post from followed user
 */
export async function notifyNewPost(
  recipientUserId: string,
  actorId: string,
  postId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: 'Nouvelle publication',
    body: '',
    type: 'new_post',
    actorId,
    entityId: postId,
    url: '/feed'
  });
}

/**
 * Send notification for quiz battle invitation
 */
export async function notifyQuizInvitation(
  recipientUserId: string,
  actorId: string,
  senderNickname: string,
  invitationId: string
): Promise<SendResult> {
  return sendPushToUser({
    recipientUserId,
    title: '⚔️ Défi Quiz Battle!',
    body: `${senderNickname} te défie en Quiz Battle!`,
    type: 'quiz_invite',
    actorId,
    entityId: invitationId,
    url: `/quiz-battle?invitation=${invitationId}`
  });
}
