/**
 * Device fingerprinting utility for smart login notifications
 * Generates a semi-unique identifier based on browser/device characteristics
 */

interface DeviceInfo {
  fingerprint: string;
  hardwareFingerprint: string; // Browser-agnostic device identifier
  deviceName: string;
  browser: string;
  os: string;
}

/**
 * Detects the browser name and version
 */
function detectBrowser(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return `Firefox ${match?.[1] || ''}`.trim();
  }
  if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return `Edge ${match?.[1] || ''}`.trim();
  }
  if (userAgent.includes('Chrome')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return `Chrome ${match?.[1] || ''}`.trim();
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return `Safari ${match?.[1] || ''}`.trim();
  }
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    return 'Opera';
  }
  
  return 'Unknown Browser';
}

/**
 * Detects the operating system
 */
function detectOS(): string {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || '';
  
  if (userAgent.includes('Windows NT 10')) return 'Windows 10/11';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    return `macOS ${match?.[1]?.replace('_', '.') || ''}`.trim();
  }
  if (userAgent.includes('iPhone')) return 'iOS (iPhone)';
  if (userAgent.includes('iPad')) return 'iOS (iPad)';
  if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android (\d+)/);
    return `Android ${match?.[1] || ''}`.trim();
  }
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('CrOS')) return 'Chrome OS';
  
  return platform || 'Unknown OS';
}

/**
 * Generates a simple hash from a string
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates a hardware-only fingerprint that stays consistent across browsers
 * This excludes browser-specific data like userAgent
 */
function generateHardwareFingerprint(): string {
  // Only use hardware/device characteristics that don't change between browsers
  const hardwareCharacteristics = [
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '',
    navigator.maxTouchPoints?.toString() || '0',
    navigator.platform || '',
    // Device memory is the same across browsers on same device
    (navigator as any).deviceMemory?.toString() || '',
    // Screen available dimensions (excludes taskbar, etc.)
    screen.availWidth?.toString() || '',
    screen.availHeight?.toString() || '',
  ];
  
  return simpleHash(hardwareCharacteristics.join('|'));
}

/**
 * Generates a device fingerprint and info
 * Uses multiple browser characteristics to create a semi-unique identifier
 */
export function generateDeviceFingerprint(): DeviceInfo {
  const browser = detectBrowser();
  const os = detectOS();
  
  // Full fingerprint includes browser-specific data (for exact matching)
  const fullCharacteristics = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '',
    navigator.maxTouchPoints?.toString() || '0',
    navigator.platform || '',
  ];
  
  const fingerprint = simpleHash(fullCharacteristics.join('|'));
  const hardwareFingerprint = generateHardwareFingerprint();
  
  // Generate a friendly device name
  const isMobile = /Mobile|iPhone|iPad|Android/i.test(navigator.userAgent);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  const deviceName = `${os} - ${browser} (${deviceType})`;
  
  return {
    fingerprint,
    hardwareFingerprint,
    deviceName,
    browser,
    os,
  };
}

/**
 * Gets a unique device ID stored in localStorage, or creates one
 * This provides additional uniqueness beyond the fingerprint
 */
export function getOrCreateDeviceId(): string {
  const storageKey = 'edupreneurs_device_id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    // Generate a random device ID
    deviceId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
}

/**
 * Combines fingerprint with device ID for a more unique identifier
 */
export function getFullDeviceIdentifier(): DeviceInfo {
  const info = generateDeviceFingerprint();
  const deviceId = getOrCreateDeviceId();
  
  // Combine fingerprint with device ID for better uniqueness
  const combinedFingerprint = simpleHash(`${info.fingerprint}-${deviceId}`);
  
  return {
    ...info,
    fingerprint: combinedFingerprint,
  };
}
