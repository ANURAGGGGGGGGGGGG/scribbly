'use client'

import { useEffect, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

export function useAuth() {
  const { data, status } = useSession()
  const loading = status === 'loading'
  const sessionUser = data?.user ?? null
  const userId = sessionUser?.id ?? sessionUser?.email ?? sessionUser?.name ?? null
  const user = sessionUser && userId ? { ...sessionUser, id: userId } : null
  const hasMountedRef = useRef(false)
  const previousUserIdRef = useRef(null)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      previousUserIdRef.current = user?.id ?? null
      return
    }

    if (loading) return

    const previousUserId = previousUserIdRef.current
    const currentUserId = user?.id ?? null

    if (!previousUserId && currentUserId) {
      toast.success('Login successful')
    }

    previousUserIdRef.current = currentUserId
  }, [loading, user?.id])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast.success('Logged out')
  }

  return {
    user,
    loading,
    signIn,
    signOut: handleSignOut
  }
}
