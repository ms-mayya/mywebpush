/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
const sw = self;

sw.addEventListener('push', function (event) {
  if (event.data) {
    const options = event.data.json();
    event.waitUntil(sw.registration.showNotification(options.title, options));
  }
});

sw.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(clients.openWindow('/?success'));
});
