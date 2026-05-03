import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile loading error:", error.message);
      setProfile(null);
      return;
    }

    setProfile(data);
  }

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      setLoadingAuth(true);

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      }

      const currentUser = data?.session?.user || null;

      if (!mounted) return;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoadingAuth(false);
    }

    getSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;

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
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    setUser(data.user);
    await loadProfile(data.user.id);

    return data;
  }

  async function register(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async function logout() {
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
    register,
    logout,
    loadProfile
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