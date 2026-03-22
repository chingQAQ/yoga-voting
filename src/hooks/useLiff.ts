'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';

export function useLiff() {
  const [profile, setProfile] = useState<{ userId: string; displayName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const userProfile = await liff.getProfile();

          setProfile({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
          });
        }
      } catch (err: any) {

        setError(err.message);
      }
    };
    initLiff();
  }, []);

  return { profile, error, isReady: !!profile };
}
