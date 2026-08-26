// Ensure returning users aren't stuck on a stale cached version.
// When vite-plugin-pwa (autoUpdate) installs a new Service Worker and skipWaiting()
// activates it, this event fires and we force the page to reload once to get fresh assets.
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
