'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Edit2, Shield, Award } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  email: string
  tier: string
  role: string
  subscription_status: string
  created_at: string
}

interface UserManagementTabProps {
  initialUsers: UserProfile[]
}

export default function UserManagementTab({ initialUsers }: UserManagementTabProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editTier, setEditTier] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Filter users by search query
  const filteredUsers = search
    ? users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user)
    setEditRole(user.role)
    setEditTier(user.tier)
    setMessage(null)
  }

  const handleSaveChanges = async () => {
    if (!editingUser) return
    setSaving(true)
    setMessage(null)

    const payload: Record<string, string> = {
      role: editRole,
      tier: editTier,
    }

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update user')
      }

      const updatedProfile = await res.json()

      // Update state
      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                role: updatedProfile.role,
                tier: updatedProfile.tier,
              }
            : u
        )
      )

      setMessage({ type: 'success', text: 'User updated successfully!' })
      setTimeout(() => {
        setEditingUser(null)
      }, 800)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setSaving(false)
    }
  }

  const getTierColor = (t: string) => {
    if (t === 'nomad') return 'bg-primary/10 text-[#D4622E] border-primary/20'
    if (t === 'elite') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20' // explorer
  }

  const getRoleColor = (r: string) => {
    if (r === 'admin') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (r === 'moderator') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-muted-foreground/10 text-muted-foreground border-transparent'
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-between items-center gap-4 bg-card/40 border border-border p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg py-2 pl-4 pr-10 text-xs font-semibold tracking-wide text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
          />
          <div className="absolute right-3 top-2.5 text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Total Users: {filteredUsers.length}
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">No users found.</p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden bg-card/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">User</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Tier</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Created At</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-card/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground text-[13px] font-medium">{user.full_name}</p>
                      <p className="text-muted-foreground text-[11px]">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getTierColor(user.tier)}`}>
                        {user.tier.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                        user.subscription_status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px] whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-background hover:bg-muted border border-border hover:border-primary/30 text-foreground transition-all rounded-lg flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Sheet Drawer */}
      <Sheet open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <SheetContent side="right" className="w-[380px] bg-background border-l border-border p-6 flex flex-col justify-between">
          <div>
            <SheetHeader className="mb-6">
              <SheetTitle className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-wide text-foreground">
                Manage User Access
              </SheetTitle>
            </SheetHeader>

            {editingUser && (
              <div className="space-y-6">
                {/* User info summary */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-[13px] font-bold text-foreground truncate">{editingUser.full_name}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">{editingUser.email}</p>
                </div>

                {/* Role edit option */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" /> Role Privilege
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
                  >
                    <option value="member">Member (Standard User)</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {/* Tier edit option */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" /> Subscription Tier
                  </label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
                  >
                    <option value="explorer">Explorer (Free Tier)</option>
                    <option value="nomad">Nomad (Paid Subscriber)</option>
                    <option value="elite">Elite Explorer (Premium Subscriber)</option>
                  </select>
                </div>



                {message && (
                  <div className={`p-3 rounded-lg text-xs font-semibold tracking-wide border ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {message.text}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3 pt-6 border-t border-border">
            <button
              onClick={() => setEditingUser(null)}
              className="flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/95 disabled:opacity-50 transition-colors rounded-lg shadow-md cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
