'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function OpenedFromNotification() {
  const searchParams = useSearchParams();
  const isFromNotification = searchParams.get('from') === 'notification';

  useEffect(() => {
    if (isFromNotification) {
      setTimeout(() => {
        toast.success('Opened from notification');
      }, 0);
    }
  }, [isFromNotification]);

  return (
    isFromNotification && (
      <p className="text-green-600 text-sm text-center">
        Opened from notification
      </p>
    )
  );
}
