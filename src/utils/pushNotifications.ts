import { supabase } from "@/integrations/supabase/client";

// Convert base64 string to Uint8Array for VAPID key
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

// Check if running on iOS
export const isIOSDevice = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Check if running as installed PWA
export const isStandalonePWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  // iOS requires PWA to be installed before notifications work
  if (isIOSDevice() && !isStandalonePWA()) {
    console.log('iOS device detected but not running as PWA - notifications require installation');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('Service Worker registered:', registration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Service Worker is ready');
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }

  // iOS specific check
  if (isIOSDevice()) {
    if (!isStandalonePWA()) {
      console.log('iOS requires app to be installed to home screen for notifications');
      return 'denied';
    }
    console.log('iOS PWA detected, requesting permission...');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    return permission;
  }

  return Notification.permission;
};

// Helper to detect browser and OS
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';

  // Detect OS
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
    // Public VAPID key - in production, this should be from your backend
    const vapidPublicKey = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
    
    const vapidKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey.buffer as ArrayBuffer
    });

    // Get device info
    const { browser, os } = getBrowserInfo();
    const deviceId = getDeviceId();

    console.log('📱 Device info:', { deviceId, browser, os });

    // Save subscription to Supabase with device info
    const { error } = await supabase
      .from('push_subscriptions' as any)
      .upsert({
        user_id: userId,
        device_id: deviceId,
        browser,
        os,
        subscription: subscription.toJSON(),
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_id'
      });

    if (error) {
      console.error('Error saving push subscription:', error);
      return false;
    }

    console.log('Push subscription saved successfully');
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

export const initializePushNotifications = async (userId: string): Promise<void> => {
  console.log('Initializing push notifications for user:', userId);
  
  // Request notification permission
  const permission = await requestNotificationPermission();
  console.log('Notification permission:', permission);
  
  if (permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  // Register service worker
  const registration = await registerServiceWorker();
  if (!registration) {
    console.log('Service worker registration failed');
    return;
  }

  // Subscribe to push notifications
  await subscribeToPushNotifications(registration, userId);
};

export const showBrowserNotification = (title: string, options: NotificationOptions = {}) => {
  if (!('Notification' in window)) {
    console.log('Browser notifications not supported');
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
