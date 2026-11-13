
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from './lib_supabase';
import { initialisePushNotifications } from './pushNotifications';
import { setMyPresence } from './presence';
import { App } from '@capacitor/app';

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  recovery: false,
  setRecovery: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);

  // Keep the user's online status connected to their login session.
  useEffect(() => {
    let alive = true;

    const publishPresence = async (userId, isOnline) => {
      if (!userId) return;

      try {
        await setMyPresence(userId, isOnline);
      } catch (error) {
        console.error('KONNEKT presence update failed:', error);
      }
    };

    const handleSession = (nextSession) => {
      if (!alive) return;

      setSession(nextSession);

      const userId = nextSession?.user?.id;

      if (userId) {
        initialisePushNotifications(userId);
        publishPresence(userId, true);
      }
    };

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;

        if (alive) {
          handleSession(data.session);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('KONNEKT session loading failed:', error);

        if (alive) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true);
      }

      if (event === 'SIGNED_OUT') {
        setRecovery(false);
      }

      handleSession(nextSession);

      if (event === 'SIGNED_OUT') {
        // The user is no longer logged in.
        setLoading(false);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  // Update presence when the browser tab becomes hidden or visible.
  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) return;

    const updateBrowserPresence = () => {
      publishCurrentPresence(
        userId,
        document.visibilityState === 'visible'
      );
    };

    function publishCurrentPresence(id, online) {
      setMyPresence(id, online).catch((error) => {
        console.error('KONNEKT browser presence error:', error);
      });
    }

    document.addEventListener(
      'visibilitychange',
      updateBrowserPresence
    );

    updateBrowserPresence();

    return () => {
      document.removeEventListener(
        'visibilitychange',
        updateBrowserPresence
      );
    };
  }, [session?.user?.id]);

  // Update presence when the Capacitor Android app enters or leaves the foreground.
  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) return;

    let listener;

    const setupAppListener = async () => {
      try {
        listener = await App.addListener(
          'appStateChange',
          ({ isActive }) => {
            setMyPresence(userId, isActive).catch((error) => {
              console.error('KONNEKT app presence error:', error);
            });
          }
        );
      } catch (error) {
        // Browser builds may not support the native app lifecycle listener.
        console.warn('KONNEKT native app listener unavailable:', error);
      }
    };

    setupAppListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [session?.user?.id]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        loading,
        recovery,
        setRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
