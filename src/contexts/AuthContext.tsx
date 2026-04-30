import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { authStorageKey, legacyAuthStorageKey, portalId, supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role?: 'reader' | 'author') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; email?: string }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  isAuthor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getManagedAuthKeys() {
  return [
    authStorageKey,
    `${authStorageKey}-code-verifier`,
    legacyAuthStorageKey,
    legacyAuthStorageKey ? `${legacyAuthStorageKey}-code-verifier` : '',
  ].filter(Boolean);
}

function migrateLegacyAuthState() {
  if (!legacyAuthStorageKey) return;

  const currentValue = window.localStorage.getItem(authStorageKey);
  const legacyValue = window.localStorage.getItem(legacyAuthStorageKey);

  if (!currentValue && legacyValue) {
    window.localStorage.setItem(authStorageKey, legacyValue);
  }

  const currentVerifier = window.sessionStorage.getItem(`${authStorageKey}-code-verifier`);
  const legacyVerifier = window.sessionStorage.getItem(`${legacyAuthStorageKey}-code-verifier`);

  if (!currentVerifier && legacyVerifier) {
    window.sessionStorage.setItem(`${authStorageKey}-code-verifier`, legacyVerifier);
  }
}

function clearStoredAuthState() {
  getManagedAuthKeys().forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}

async function ensurePortalAccess(userId: string) {
  const { data, error } = await supabase
    .from('portal_user_access')
    .select('is_active')
    .eq('portal_id', portalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    if (!data.is_active) {
      throw new Error('Your account is deactivated for this portal.');
    }
    return;
  }

  const { error: insertError } = await supabase
    .from('portal_user_access')
    .insert({
      portal_id: portalId,
      user_id: userId,
      is_active: true,
    });

  if (insertError) throw insertError;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      migrateLegacyAuthState();
      const sessionPromise = supabase.auth.getSession();

      try {
        const sessionResult = await Promise.race<
          | { type: 'session'; result: Awaited<ReturnType<typeof supabase.auth.getSession>> }
          | { type: 'timeout' }
        >([
          sessionPromise.then((result) => ({ type: 'session', result })),
          new Promise<{ type: 'timeout' }>((resolve) => {
            window.setTimeout(() => resolve({ type: 'timeout' }), 2500);
          }),
        ]);

        if (!isMounted) return;

        if (sessionResult.type === 'timeout') {
          setLoading(false);

          sessionPromise
            .then(async ({ data }) => {
              if (!isMounted) return;

              setSession(data.session);

              if (data.session?.user) {
                await fetchUserProfile(data.session.user);
              } else {
                setUser(null);
                setLoading(false);
              }
            })
            .catch((error) => {
              console.warn('Delayed auth session lookup failed:', error);
              if (isMounted) {
                setUser(null);
                setSession(null);
                setLoading(false);
              }
            });

          return;
        }

        const session = sessionResult.result.data.session;
        setSession(session);

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Error initializing auth session:', error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      setLoading(true);
      setSession(nextSession);

      window.setTimeout(async () => {
        if (!isMounted) return;

        try {
          if (nextSession?.user) {
            await fetchUserProfile(nextSession.user);
          } else {
            setUser(null);
            setLoading(false);
          }
        } catch (error) {
          console.warn('Auth state profile refresh failed:', error);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const buildFallbackUser = (authUser: Session['user']): User => ({
    id: authUser.id,
    email: authUser.email ?? null,
    name: (authUser.user_metadata?.name as string | undefined) || authUser.email?.split('@')[0] || 'User',
    role: ((authUser.user_metadata?.role as User['role'] | undefined) || 'reader'),
    avatar_url: null,
    bio: null,
    created_at: new Date().toISOString(),
  });

  const fetchUserProfile = async (authUser: Session['user']) => {
    const fallbackUser = buildFallbackUser(authUser);

    try {
      await ensurePortalAccess(authUser.id);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUser(data);
        return;
      }

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(fallbackUser, { onConflict: 'id' });

      if (upsertError) {
        console.warn('Could not create missing user profile, using fallback auth profile instead:', upsertError);
      }

      setUser(fallbackUser);
    } catch (error) {
      console.error('Error fetching user profile:', error);

      if (error instanceof Error && error.message === 'Your account is deactivated for this portal.') {
        clearStoredAuthState();
        setUser(null);
        setSession(null);
        throw error;
      }

      setUser(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'reader' | 'author' = 'reader') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) throw error;
    if (data.user) {
      await ensurePortalAccess(data.user.id);
      await fetchUserProfile(data.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      setSession(data.session);

      if (data.user) {
        await ensurePortalAccess(data.user.id);
        await fetchUserProfile(data.user);
        return;
      }

      setLoading(false);
    } catch (error) {
      if (error instanceof Error && error.message === 'Your account is deactivated for this portal.') {
        clearStoredAuthState();
        setUser(null);
        setSession(null);
      }

      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const signOutResult = await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise<{ error: Error }>((resolve) => {
          window.setTimeout(() => resolve({ error: new Error('Sign out took too long.') }), 4000);
        }),
      ]);

      if (signOutResult.error) {
        console.warn('Sign out fallback cleanup triggered:', signOutResult.error);
      }
    } finally {
      clearStoredAuthState();
    }

    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const updateProfile = async (updates: { name?: string; email?: string }) => {
    if (!session?.user) {
      throw new Error('You must be signed in to update your profile.');
    }

    const nextName = updates.name?.trim();
    const nextEmail = updates.email?.trim();

    if (nextEmail && nextEmail !== session.user.email) {
      const { error } = await supabase.auth.updateUser({ email: nextEmail });
      if (error) throw error;
    }

    const profileUpdates: Partial<User> = {};
    if (nextName !== undefined) profileUpdates.name = nextName;
    if (nextEmail !== undefined) profileUpdates.email = nextEmail;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from('users')
        .update(profileUpdates)
        .eq('id', session.user.id);

      if (error) throw error;
    }

    await fetchUserProfile(session.user);
  };

  const sendPasswordResetEmail = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  };

  const isAuthor = user?.role === 'author' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        sendPasswordResetEmail,
        isAuthor,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
