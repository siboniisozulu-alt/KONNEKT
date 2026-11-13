
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
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

  // Remember the currently authenticated user for sign-out handling.
  const currentUserId = useRef(null);

  // Safely update the user's online status in Supabase.
  const publishPresence = async (userId, isOnline) => {
    if (!userId) return;

    try {
      await setMyPresence(userId, isOnline);
    } catch (error) {
      console.error('KONNEKT presence update failed:', error);
    }
  };

  // Keep authentication and presence connected.
  useEffect(() => {
    let alive = true;

    const handleSession = (nextSession) => {
      if (!alive) return;

      const nextUserId = nextSession?.user?.id || null;
      const previousUserId = currentUserId.current;

      // Mark the previous account offline if the account changes or signs out.
      if (previousUserId && previousUserId !== nextUserId) {
        publishPresence(previousUserId, false);
      }

      currentUserId.current = nextUserId;
      setSession(nextSession);

      if (nextUserId) {
        publishPresence(nextUserId, true);

        // Initialise push notifications without blocking authentication.
        Promise.resolve(initialisePushNotifications(nextUserId)).catch(
          (error) => {
            console.error(
              'KONNEKT push notification initialisation failed:',
              error
            );
          }
        );
      }
    };

    // Subscribe to authentication changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!alive) return;

      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true);
      }

      if (event === 'SIGNED_OUT') {
        setRecovery(false);
      }

      handleSession(nextSession);
      setLoading(false);
    });

    // Restore an existing login session.
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;

        if (alive) {
          handleSession(data?.session || null);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('KONNEKT session loading failed:', error);

        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  // Update presence when the browser tab becomes visible or hidden.
  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) return;

    const updateBrowserPresence = () => {
      const isVisible = document.visibilityState === 'visible';
      publishPresence(userId, isVisible);
    };

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

  // Update presence when the Android app enters or leaves the foreground.
  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) return;

    let active = true;
    let listener = null;

    const setupAppListener = async () => {
      try {
        const newListener = await App.addListener(
          'appStateChange',
          ({ isActive }) => {
            publishPresence(userId, !!isActive);
          }
        );

        // Handle cleanup if the user signs out before registration finishes.
        if (!active) {
          await newListener.remove();
          return;
        }

        listener = newListener;
      } catch (error) {
        console.warn(
          'KONNEKT native app lifecycle listener unavailable:',
          error
        );
      }
    };

    setupAppListener();

    return () => {
      active = false;

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
