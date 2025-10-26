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

// Detect browser type with detailed logging
export const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  console.log('🔍 User Agent:', ua);
  
  // Check Samsung Internet first (includes Chrome in UA)
  if (ua.includes('SamsungBrowser')) {
    console.log('✅ Browser detected: Samsung Internet');
    return 'Samsung Internet';
  }
  // Chrome (but not Edge)
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    console.log('✅ Browser detected: Chrome');
    return 'Chrome';
  }
  // Edge (Chromium-based)
  if (ua.includes('Edg')) {
    console.log('✅ Browser detected: Edge');
    return 'Edge';
  }
  // Safari (but not Chrome-based)
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    console.log('✅ Browser detected: Safari');
    return 'Safari';
  }
  // Firefox
  if (ua.includes('Firefox')) {
    console.log('✅ Browser detected: Firefox');
    return 'Firefox';
  }
  
  console.warn('⚠️ Unknown browser detected');
  return 'Unknown';
};

// Check if running on iOS
export const isIOSDevice = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  console.log(`📱 iOS device: ${isIOS}`);
  return isIOS;
};

// Check if running as installed PWA
export const isStandalonePWA = (): boolean => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
  console.log(`📲 Running as PWA: ${isStandalone}`);
  return isStandalone;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  console.log('🔧 Starting Service Worker registration...');
  
  // Check browser support
  if (!('serviceWorker' in navigator)) {
    console.error('❌ Service Worker not supported in this browser');
    console.error('💡 Suggestion: Try using Chrome, Edge, Samsung Internet, or Safari (iOS 16.4+)');
    return null;
  }
  console.log('✅ Service Worker API is supported');

  const browser = detectBrowser();
  const isIOS = isIOSDevice();
  const isPWA = isStandalonePWA();

  // iOS requires PWA installation for push notifications
  if (isIOS && !isPWA) {
    console.error('❌ iOS notifications require PWA installation');
    console.error('💡 User must: Safari Menu → Share → Add to Home Screen');
    return null;
  }

  // Safari desktop doesn't support push notifications yet
  if (browser === 'Safari' && !isIOS) {
    console.warn('⚠️ Safari desktop does not support push notifications');
    console.error('💡 Please use Chrome, Edge, or Firefox on desktop');
    return null;
  }

  try {
    console.log('📝 Registering service worker at /sw.js...');
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Always fetch fresh service worker
    });
    console.log('✅ Service Worker registered successfully');
    console.log('📊 Registration state:', registration.active?.state || 'installing');
    
    // Wait for service worker to be ready
    console.log('⏳ Waiting for Service Worker to be ready...');
    const readyRegistration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker is ready and active');
    
    return readyRegistration;
  } catch (error: any) {
    console.error('❌ Service Worker registration failed:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Provide specific error guidance
    if (error.message?.includes('load')) {
      console.error('💡 The sw.js file may be missing or inaccessible');
    } else if (error.message?.includes('https')) {
      console.error('💡 Service Workers require HTTPS (or localhost)');
    }
    
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  console.log('🔔 Requesting notification permission...');
  
  // Check if Notification API is supported
  if (!('Notification' in window)) {
    console.error('❌ Notifications API not supported in this browser');
    const browser = detectBrowser();
    if (browser === 'Safari' && !isIOSDevice()) {
      console.error('💡 Safari desktop does not support Web Push Notifications');
      console.error('💡 Please use Chrome, Edge, Firefox, or Safari on iOS 16.4+');
    } else {
      console.error('💡 Try updating your browser to the latest version');
    }
    return 'denied';
  }
  console.log('✅ Notifications API is supported');

  const browser = detectBrowser();
  const isIOS = isIOSDevice();
  const isPWA = isStandalonePWA();

  // iOS specific requirements
  if (isIOS) {
    console.log('📱 iOS device detected');
    if (!isPWA) {
      console.error('❌ iOS requires PWA installation for notifications');
      console.error('💡 Steps: Safari → Share Button → "Add to Home Screen"');
      console.error('💡 Then open the app from home screen and allow notifications');
      return 'denied';
    }
    console.log('✅ iOS PWA mode confirmed, proceeding...');
  }

  // Check current permission status
  const currentPermission = Notification.permission;
  console.log(`📊 Current permission status: ${currentPermission}`);

  if (currentPermission === 'granted') {
    console.log('✅ Permission already granted');
    return 'granted';
  }

  if (currentPermission === 'denied') {
    console.error('❌ Notification permission was previously denied');
    console.error('💡 To enable: Browser Settings → Site Settings → Notifications → Allow');
    console.error(`💡 ${browser} specific: Check browser notification settings for this site`);
    return 'denied';
  }

  // Request permission (currentPermission === 'default')
  try {
    console.log('📋 Showing permission prompt to user...');
    const permission = await Notification.requestPermission();
    console.log(`✅ User responded with: ${permission}`);
    
    if (permission === 'granted') {
      console.log('🎉 Notification permission granted!');
    } else if (permission === 'denied') {
      console.warn('⚠️ User denied notification permission');
      console.log('💡 User can change this later in browser settings');
    } else {
      console.warn('⚠️ User dismissed the permission prompt');
    }
    
    return permission;
  } catch (error: any) {
    console.error('❌ Error requesting permission:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message
    });
    return 'denied';
  }
};

// Helper to detect browser and OS
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser (check Samsung Internet first as it includes Chrome in UA)
  if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
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
  console.log('📝 Starting push notification subscription...');
  
  try {
    // Check if Push API is supported
    if (!('PushManager' in window)) {
      console.error('❌ Push API not supported in this browser');
      return false;
    }
    console.log('✅ Push API is supported');

    // Get existing subscription first
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('📋 Existing subscription found, unsubscribing first...');
      await existingSubscription.unsubscribe();
      console.log('✅ Old subscription removed');
    }

    // Public VAPID key
    const vapidPublicKey = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
    console.log('🔑 Using VAPID key for subscription');
    
    const vapidKey = urlBase64ToUint8Array(vapidPublicKey);
    console.log('📨 Subscribing to push service...');
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey.buffer as ArrayBuffer
    });
    console.log('✅ Push subscription created successfully');
    console.log('📊 Subscription endpoint:', subscription.endpoint);

    // Get device info
    const { browser, os } = getBrowserInfo();
    const deviceId = getDeviceId();
    console.log('📱 Device info:', { deviceId, browser, os });

    // Clean up old subscriptions without device info
    console.log('🧹 Cleaning up old subscriptions...');
    const { error: deleteError } = await supabase
      .from('push_subscriptions' as any)
      .delete()
      .eq('user_id', userId)
      .or('device_id.is.null,browser.is.null,os.is.null');

    if (deleteError) {
      console.warn('⚠️ Could not clean up old subscriptions:', deleteError);
    } else {
      console.log('✅ Old subscriptions cleaned');
    }

    // Save new subscription to database
    console.log('💾 Saving subscription to database...');
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
      console.error('❌ Failed to save subscription to database:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return false;
    }

    console.log('✅ Subscription saved successfully to database');
    console.log('🎉 Push notifications fully configured!');
    return true;
    
  } catch (error: any) {
    console.error('❌ Error during push subscription:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Provide specific error guidance
    if (error.name === 'NotAllowedError') {
      console.error('💡 User denied notification permission');
    } else if (error.name === 'NotSupportedError') {
      console.error('💡 Push notifications not supported on this browser/device');
      console.error('💡 Try Chrome, Edge, Samsung Internet, or Safari on iOS 16.4+');
    } else if (error.message?.includes('VAPID')) {
      console.error('💡 VAPID key configuration issue');
    } else {
      console.error('💡 Unexpected error - check network connection and try again');
    }
    
    return false;
  }
};

export const initializePushNotifications = async (userId: string): Promise<void> => {
  console.log('═══════════════════════════════════════════');
  console.log('🚀 INITIALIZING PUSH NOTIFICATIONS');
  console.log('═══════════════════════════════════════════');
  console.log('👤 User ID:', userId);
  console.log('🌐 Browser:', detectBrowser());
  console.log('📱 Platform:', getBrowserInfo().os);
  console.log('⏰ Time:', new Date().toISOString());
  console.log('═══════════════════════════════════════════');
  
  // Step 1: Request notification permission
  console.log('\n📋 STEP 1: Requesting notification permission...');
  const permission = await requestNotificationPermission();
  console.log(`✅ Permission result: ${permission}\n`);
  
  if (permission !== 'granted') {
    console.error('❌ Cannot proceed: Permission not granted');
    console.log('═══════════════════════════════════════════\n');
    return;
  }

  // Step 2: Register service worker
  console.log('📋 STEP 2: Registering service worker...');
  const registration = await registerServiceWorker();
  
  if (!registration) {
    console.error('❌ Cannot proceed: Service worker registration failed');
    console.log('═══════════════════════════════════════════\n');
    return;
  }
  console.log('✅ Service worker registered\n');

  // Step 3: Subscribe to push notifications
  console.log('📋 STEP 3: Subscribing to push notifications...');
  const subscribed = await subscribeToPushNotifications(registration, userId);
  
  if (subscribed) {
    console.log('✅ Push notifications subscription complete\n');
    console.log('═══════════════════════════════════════════');
    console.log('🎉 SUCCESS: Push notifications fully enabled!');
    console.log('═══════════════════════════════════════════\n');
  } else {
    console.error('❌ Push notification subscription failed');
    console.log('═══════════════════════════════════════════\n');
  }
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
