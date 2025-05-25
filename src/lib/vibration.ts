/**
 * Triggers device vibration if the Vibration API is available and the app is in PWA mode.
 * @param pattern The vibration pattern (milliseconds). Defaults to 50ms.
 *                Can be a single value or an array of values (e.g., [100, 50, 100]).
 */
export const triggerVibration = (pattern: number | number[] = 50): void => {
  // Check if the Vibration API is supported
  if (typeof window !== 'undefined' && typeof window.navigator.vibrate === 'function') {
    // Check if the app is in PWA mode
    // This relies on a class 'pwa-mode' being added to the body or html element
    // as seen in src/app/layout.tsx
    const isPwaMode = document.body.classList.contains('pwa-mode') || 
                      document.documentElement.classList.contains('pwa-mode');

    if (isPwaMode) {
      try {
        window.navigator.vibrate(pattern);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    } else {
      // Optional: Log if not in PWA mode (for debugging)
      // console.log('Vibration skipped: Not in PWA mode.');
    }
  } else {
    // Optional: Log if Vibration API is not supported (for debugging)
    // console.log('Vibration skipped: Vibration API not supported.');
  }
};
