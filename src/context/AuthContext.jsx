import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const AUTH_TIMEOUT_MS = 5000;
const NEW_SIGNUP_STORAGE_KEY = "tindahan_new_signup";

function withTimeout(promise, ms, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(fallbackValue), ms);
    })
  ]);
}

function getWelcomeRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/welcome`;
}

function markNewSignup() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NEW_SIGNUP_STORAGE_KEY, "true");
}

function clearNewSignup() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NEW_SIGNUP_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return null;
    }

    try {
      const result = await withTimeout(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        AUTH_TIMEOUT_MS,
        { data: null, error: new Error("Profile request timed out.") }
      );

      const { data, error } = result || {};

      if (error) {
        console.warn("Profile loading skipped:", error.message);
        setProfile(null);
        return null;
      }

      setProfile(data || null);
      return data || null;
    } catch (error) {
      console.warn("Profile loading error:", error.message);
      setProfile(null);
      return null;
    }
  }

  async function updateProfile(payload) {
    if (!user?.id) {
      return {
        data: null,
        error: new Error("No authenticated user.")
      };
    }

    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            ...payload,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id)
          .select("*")
          .maybeSingle();

        if (error) {
          return { data: null, error };
        }

        setProfile(data || null);
        return { data, error: null };
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          username:
            user.user_metadata?.username ||
            user.email?.split("@")[0] ||
            "user",
          ...payload,
          updated_at: new Date().toISOString()
        })
        .select("*")
        .maybeSingle();

      if (error) {
        return { data: null, error };
      }

      setProfile(data || null);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        setLoadingAuth(true);

        const result = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          {
            data: { session: null },
            error: new Error("Auth session request timed out.")
          }
        );

        const { data, error } = result || {};

        if (error) {
          console.warn("Session loading skipped:", error.message);
        }

        const currentUser = data?.session?.user || null;

        if (!mounted) return;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.warn("Session error:", error.message);

        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoadingAuth(false);
        }
      }
    }

    getSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;

      if (!mounted) return;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    clearNewSignup();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    setUser(data.user || null);

    if (data.user?.id) {
      await loadProfile(data.user.id);
    }

    return data;
  }

  async function signUp({ email, password, username }) {
    const cleanUsername = String(username || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    clearNewSignup();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getWelcomeRedirectUrl(),
        data: {
          username: cleanUsername
        }
      }
    });

    if (error) {
      clearNewSignup();
      return { data: null, error };
    }

    markNewSignup();

    return { data, error: null };
  }

  async function register(email, password, username) {
    const { data, error } = await signUp({
      email,
      password,
      username
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async function logout() {
    clearNewSignup();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
  }

  const value = {
    user,
    profile,
    loadingAuth,
    login,
    signUp,
    register,
    logout,
    loadProfile,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}