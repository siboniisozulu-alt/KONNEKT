import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './lib_supabase';

const AuthContext = createContext({ session: null, user: null, loading: true });
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setLoading(false); }
    }).catch(() => { if (alive) setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
      setSession(nextSession);
      setLoading(false);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{ session, user: session?.user || null, loading, recovery, setRecovery }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
