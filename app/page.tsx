import OpenedFromNotification from '@/components/OpenedFromNotification';
import PushNotificationManager from '@/components/push-notification-manager';
import { ClientOnly } from '@/components/client-only';

export default function Page() {
  return (
    <div className={`p-4 flex flex-col items-center`}>
      <h1 className="text-3xl font-bold mb-3">Web Push</h1>
      <ClientOnly>
        <PushNotificationManager />
      </ClientOnly>
      <OpenedFromNotification />
    </div>
  );
}
