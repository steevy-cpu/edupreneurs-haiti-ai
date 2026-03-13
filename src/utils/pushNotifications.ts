/**
 * @file pushNotifications.ts
 * @description Web Push notification setup — service worker registration, permission handling, VAPID subscription, and cross-domain cleanup.
 * @module utils
 *
 * @example
 * await initializePushNotifications(userId);
 * showBrowserNotification('New message', { body: 'Hello!' });
 */

import { supabase } from "@/integrations/supabase/client";

const DEBUG = import.meta.env.DEV;

/**
 * Converts a URL-safe base64 string to a Uint8Array for VAPID key usage.
 * @param base64String - URL-safe base64-encoded string
 * @returns Decoded byte array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Detects the user's browser from the user agent string.
 * @returns Browser name (e.g. 'Chrome', 'Safari', 'Firefox')
 */
export const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  
  return 'Unknown';
};

/**
 * Checks if the current device is running iOS.
 * @returns True if user agent indicates iPhone, iPad, or iPod
 */
export const isIOSDevice = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Check if running as installed PWA
export const isStandalonePWA = (): boolean => {
  const isIOSStandalone = (window.navigator as any).standalone === true;
  const isStandardStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  
  return isIOSStandalone || isStandardStandalone || isFullscreen;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    if (DEBUG) console.error('❌ Service Worker not supported');
    return null;
  }

  const browser = detectBrowser();
  const isIOS = isIOSDevice();
  const isPWA = isStandalonePWA();

  // iOS requires PWA installation for push notifications
  if (isIOS && !isPWA) {
    if (DEBUG) console.error('❌ iOS requires PWA installation');
    return null;
  }

  // Safari desktop doesn't support push notifications
  if (browser === 'Safari' && !isIOS) {
    if (DEBUG) console.warn('⚠️ Safari desktop does not support push');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    
    const readyRegistration = await navigator.serviceWorker.ready;
    if (DEBUG) console.log('✅ Service Worker ready');
    
    return readyRegistration;
  } catch (error: any) {
    console.error('❌ Service Worker registration failed:', error.message);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    if (DEBUG) console.error('❌ Notifications API not supported');
    return 'denied';
  }

  const browser = detectBrowser();
  const isIOS = isIOSDevice();
  const isPWA = isStandalonePWA();

  // iOS specific requirements
  if (isIOS && !isPWA) {
    if (DEBUG) console.error('❌ iOS requires PWA installation');
    return 'denied';
  }

  const currentPermission = Notification.permission;

  if (currentPermission === 'granted') {
    return 'granted';
  }

  if (currentPermission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error: any) {
    console.error('❌ Error requesting permission:', error.message);
    return 'denied';
  }
};

// Helper to detect browser and OS
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

// Generate unique device ID (store in localStorage for consistency)
function getDeviceId() {
  const storageKey = 'edupreneurs_device_id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
}

export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration,
  userId: string
): Promise<boolean> => {
  try {
    if (!('PushManager' in window)) {
      if (DEBUG) console.error('❌ Push API not supported');
      return false;
    }

    // Get existing subscription first
    const existingSubscription = await (registration as any).pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    // Public VAPID key
    const vapidPublicKey = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
    const vapidKey = urlBase64ToUint8Array(vapidPublicKey);
    
    const subscription = await (registration as any).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey.buffer as ArrayBuffer
    });

    // Get device info
    const { browser, os } = getBrowserInfo();
    const deviceId = getDeviceId();
    const currentDomain = window.location.hostname;

    // Clean up old subscriptions without device info or from old domains
    await supabase
      .from('push_subscriptions' as any)
      .delete()
      .eq('user_id', userId)
      .or('device_id.is.null,browser.is.null,os.is.null');

    // Also clean up subscriptions from different domains (old lovable.app subscriptions)
    await supabase
      .from('push_subscriptions' as any)
      .delete()
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .neq('domain', currentDomain);

    // Save new subscription to database with domain
    const { error } = await supabase
      .from('push_subscriptions' as any)
      .upsert({
        user_id: userId,
        device_id: deviceId,
        browser,
        os,
        domain: currentDomain,
        subscription: subscription.toJSON(),
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_id'
      });

    if (error) {
      console.error('❌ Failed to save subscription:', error.message);
      return false;
    }

    if (DEBUG) console.log('✅ Push notifications configured for domain:', currentDomain);
    return true;
    
  } catch (error: any) {
    console.error('❌ Push subscription error:', error.message);
    return false;
  }
};

/**
 * Check if user needs to re-subscribe (e.g., after domain change)
 */
export const checkSubscriptionValidity = async (userId: string): Promise<boolean> => {
  try {
    const currentDomain = window.location.hostname;
    const deviceId = getDeviceId();
    
    const { data: subscription } = await supabase
      .from('push_subscriptions' as any)
      .select('domain, last_used_at')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .single() as { data: { domain?: string; last_used_at?: string } | null };
    
    if (!subscription) {
      if (DEBUG) console.log('⚠️ No subscription found for this device');
      return false;
    }
    
    // Check if subscription is for current domain
    if (subscription.domain && subscription.domain !== currentDomain && subscription.domain !== 'legacy') {
      if (DEBUG) console.log('⚠️ Subscription is for different domain:', subscription.domain);
      return false;
    }
    
    // Check if subscription is too old (60 days)
    if (subscription.last_used_at) {
      const lastUsed = new Date(subscription.last_used_at);
      const maxAge = 60 * 24 * 60 * 60 * 1000; // 60 days
      if (Date.now() - lastUsed.getTime() > maxAge) {
        if (DEBUG) console.log('⚠️ Subscription is too old');
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
};

export const initializePushNotifications = async (userId: string): Promise<void> => {
  if (DEBUG) console.log('🚀 Initializing push notifications...');
  
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    if (DEBUG) console.log('❌ Permission not granted');
    return;
  }

  const registration = await registerServiceWorker();
  
  if (!registration) {
    if (DEBUG) console.log('❌ Service worker registration failed');
    return;
  }

  const subscribed = await subscribeToPushNotifications(registration, userId);
  
  if (subscribed && DEBUG) {
    console.log('🎉 Push notifications enabled!');
  }
};

export const showBrowserNotification = (title: string, options: NotificationOptions = {}) => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
      notification.close();
    };
  }
};
