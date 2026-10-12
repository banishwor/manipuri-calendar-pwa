// Analytics & ntfy Notification Utility
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Generated unique ntfy topic name
export const NTFY_TOPIC = 'meitei-cal-alert-7b39a';

/**
 * Send push notification to your phone via ntfy.sh
 * Skips during localhost/dev mode to avoid spamming while testing.
 */
export async function sendNtfyNotification(
  title: string,
  message: string,
  tags: string[] = ['calendar'],
  priority: number = 3
) {
  // Only trigger on live site (e.g. GitHub Pages or production domains)
  if (
    typeof window === 'undefined' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    console.log('[ntfy (dev skipped)]', title, message);
    return;
  }

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: message,
      headers: {
        'Title': title,
        'Tags': tags.join(','),
        'Priority': priority.toString(),
      },
    });
  } catch (err) {
    console.warn('Failed to dispatch ntfy notification', err);
  }
}

/**
 * Log event to Google Analytics (GA4)
 */
export function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Determine client platform & display mode
 */
export function getClientEnvironment() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  const ua = navigator.userAgent;
  let platform = 'Desktop';
  if (/iPhone|iPad|iPod/.test(ua)) {
    platform = 'iOS';
  } else if (/Android/.test(ua)) {
    platform = 'Android';
  }

  return { isStandalone, platform };
}

/**
 * Track PWA Installation
 */
export function trackPwaInstall(method: string) {
  const { platform } = getClientEnvironment();
  sendNtfyNotification(
    '🎉 PWA Installed',
    `User installed Manipuri Calendar (${platform} - ${method})!`,
    ['tada', 'sparkles'],
    4
  );
  trackGAEvent('pwa_install', { platform, method });
}

/**
 * Initialize analytics, daily open alert (debounced once per day per device),
 * and PWA install listeners.
 */
export function initAnalyticsAndNotifications() {
  if (typeof window === 'undefined') return;

  const { isStandalone, platform } = getClientEnvironment();
  const today = new Date().toISOString().slice(0, 10);
  const lastActive = localStorage.getItem('mc_last_active_date');

  // 1. Daily usage notification (1 alert per user/device per day)
  if (lastActive !== today) {
    localStorage.setItem('mc_last_active_date', today);
    sendNtfyNotification(
      'App Opened',
      `Someone opened Manipuri Calendar (${platform} - ${isStandalone ? 'PWA' : 'Web Browser'})`,
      ['calendar', isStandalone ? 'iphone' : 'globe'],
      3
    );
    trackGAEvent('app_open', {
      platform,
      display_mode: isStandalone ? 'standalone' : 'browser',
    });
  }

  // 2. Track first-time launch as an iOS PWA (Added to Home Screen)
  if (platform === 'iOS' && isStandalone) {
    const iosPwaTracked = localStorage.getItem('mc_ios_pwa_installed');
    if (!iosPwaTracked) {
      localStorage.setItem('mc_ios_pwa_installed', 'true');
      sendNtfyNotification(
        '🎉 PWA Installed (iOS)',
        'User opened Manipuri Calendar from their iOS Home Screen for the first time!',
        ['tada', 'iphone', 'star'],
        4
      );
      trackGAEvent('pwa_install', { platform: 'iOS', method: 'home_screen' });
    }
  }

  // 3. Native PWA install event listener (Android, Chrome, Edge)
  window.addEventListener('appinstalled', () => {
    trackPwaInstall('browser_prompt');
  });
}
