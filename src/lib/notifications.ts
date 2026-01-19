export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}
