'use client'

import { User } from '@supabase/supabase-js'

interface UserAvatarProps {
  user: User | null
  size?: number
  className?: string
}

export function UserAvatar({ user, size = 36, className = '' }: UserAvatarProps) {
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U'
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null

  const sizeClass = `w-[${size}px] h-[${size}px]`
  const fontSize = size < 32 ? 'text-[11px]' : size < 48 ? 'text-[13px]' : size < 64 ? 'text-[18px]' : 'text-[28px]'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        referrerPolicy="no-referrer"
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-br from-primary to-primary/60 text-white flex items-center justify-center font-semibold shrink-0 ${fontSize} ${className}`}
    >
      {displayName.charAt(0).toUpperCase()}
    </div>
  )
}

export function getDisplayName(user: User | null): string {
  return user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
}
