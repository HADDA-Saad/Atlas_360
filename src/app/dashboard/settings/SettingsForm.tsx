'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, User as UserIcon, Mail, Camera } from 'lucide-react'

export default function SettingsForm({
  initialName,
  initialAvatarUrl,
  initialBirthDate,
  email
}: {
  initialName: string | null
  initialAvatarUrl: string | null
  initialBirthDate: string | null
  email: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName || '')
  const [birthDate, setBirthDate] = useState(initialBirthDate || '')
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingName(true)
    setError('')
    setNameSuccess('')
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: name,
          birth_date: birthDate || null
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setNameSuccess('Profile updated successfully!')
      router.refresh()
      
      setTimeout(() => setNameSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update name')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    setError('')
    setNameSuccess('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // If they are a guide, silently sync it to the guides table too
      // so their public profile updates!
      await supabase
        .from('guides')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id)

      setAvatarUrl(publicUrl)
      setNameSuccess('Profile picture updated!')
      router.refresh()
      
      setTimeout(() => setNameSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Personal Information Section */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold text-foreground">
              Personal Information
            </h2>
            <p className="text-sm text-muted-foreground">Update your basic profile details and photo.</p>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-2 border-border flex items-center justify-center relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold text-primary">
                  {(name || email).charAt(0).toUpperCase()}
                </span>
              )}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100' : ''}`}>
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Profile Picture</span>
            <span className="text-xs text-muted-foreground">Click the image to upload a new photo. Max size 2MB.</span>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Date of Birth
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              Email Address
              <span className="text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground/70">Read-only</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-muted/30 border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
            <span className="text-sm text-green-500/90 font-medium">
              {nameSuccess}
            </span>
            <button
              type="submit"
              disabled={isSavingName}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
