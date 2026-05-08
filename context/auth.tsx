'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { BoltDatabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    BoltDatabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = BoltDatabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await BoltDatabase.auth.signOut();
  };

  return { user, signOut };
}
