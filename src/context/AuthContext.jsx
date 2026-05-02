import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function createMissingProfile(currentUser) {
    const fallbackUsername =
      currentUser.user_metadata?.username ||
      `user_${currentUser.id.slice(0, 8)}`

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: currentUser.id,
        username: fallbackUsername,
        full_name: currentUser.user_metadata?.full_name || '',
        bio: '',
        location: 'Philippines',
        rating: 5,
        sales_count: 0,
        is_verified: true
      })
      .select('*')
      .single()

    if (error) {
      console.error('Create missing profile error:', error.message)
      return null
    }

    return data
  }

  async function loadProfile(currentUser) {
    if (!currentUser) {
      setProfile(null)
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (error) {
      console.error('Profile loading error:', error.message)
      setProfile(null)
      return null
    }

    if (!data) {
      const newProfile = await createMissingProfile(currentUser)
      setProfile(newProfile)
      return newProfile
    }

    setProfile(data)
    return data
  }

  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      try {
        setLoading(true)

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session loading error:', error.message)

          if (isMounted) {
            setUser(null)
            setProfile(null)
          }

          return
        }

        const currentUser = data.session?.user ?? null

        if (isMounted) {
          setUser(currentUser)
        }

        if (currentUser) {
          await loadProfile(currentUser)
        } else if (isMounted) {
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)

        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null

      if (!isMounted) {
        return
      }

      setUser(currentUser)

      if (currentUser) {
        await loadProfile(currentUser)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp({ email, password, username }) {
    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername
        }
      }
    })

    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error && data.user) {
      setUser(data.user)
      await loadProfile(data.user)
      setLoading(false)
    }

    return { data, error }
  }

  async function signOut() {
    setLoading(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error.message)
    }

    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile: async () => {
          if (user) {
            return await loadProfile(user)
          }

          return null
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}