'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, AlertCircle, UploadCloud, Loader2, Camera, ShieldAlert } from 'lucide-react'

// Constants
const MOROCCAN_REGIONS = [
  'Marrakech & Surrounds',
  'High Atlas Mountains',
  'Agafay Desert',
  'Essaouira & Coast',
  'Sahara Desert (Merzouga/Zagora)',
  'Fes & Middle Atlas',
  'Chefchaouen & North',
  'Casablanca & Rabat',
]

const LANGUAGES = [
  'English',
  'French',
  'Arabic',
  'Berber (Tamazight)',
  'Spanish',
  'German',
  'Italian',
]

interface GuideVerificationClientProps {
  guide: any
  verificationRequest: any | null
}

export default function GuideVerificationClient({ guide, verificationRequest }: GuideVerificationClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine if we should show the form or a status screen
  const isPending = verificationRequest?.status === 'pending'
  const isRejected = verificationRequest?.status === 'rejected'

  // Form State
  const [formData, setFormData] = useState({
    first_name: verificationRequest?.first_name || '',
    last_name: verificationRequest?.last_name || '',
    birth_date: verificationRequest?.birth_date || '',
    bio: guide.bio || '',
    languages: guide.languages || [],
    regions: guide.regions || [],
    daily_rate_mad: guide.daily_rate_mad || 0,
    whatsapp_number: guide.whatsapp_number || '',
  })

  // File states (File objects before upload)
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null)
  const [idDocFile, setIdDocFile] = useState<File | null>(null)
  const [licenseDocFile, setLicenseDocFile] = useState<File | null>(null)

  // Preview URLs
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(guide.profile_picture_url || null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleArrayItem = (field: 'languages' | 'regions', value: string) => {
    setFormData((prev) => {
      const current = prev[field]
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicFile(file)
      setProfilePicPreview(URL.createObjectURL(file))
    }
  }

  const uploadFile = async (bucket: string, folder: string, file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true })
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return publicUrl
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Validations
      if (!formData.first_name || !formData.last_name || !formData.birth_date) throw new Error("Personal info is required")
      if (formData.languages.length === 0) throw new Error("Select at least one language")
      if (formData.regions.length === 0) throw new Error("Select at least one region")
      if (!formData.daily_rate_mad || formData.daily_rate_mad <= 0) throw new Error("Valid daily rate is required")
      
      if (!profilePicPreview) throw new Error("Profile picture is required")
      if (!verificationRequest?.id_document_url && !idDocFile) throw new Error("ID Document is required")
      if (!verificationRequest?.license_document_url && !licenseDocFile) throw new Error("Guide License is required")

      // 2. Upload files if they changed
      let profile_picture_url = guide.profile_picture_url
      let id_document_url = verificationRequest?.id_document_url
      let license_document_url = verificationRequest?.license_document_url

      if (profilePicFile) {
        profile_picture_url = await uploadFile('avatars', guide.id, profilePicFile)
      }
      if (idDocFile) {
        // We upload private docs to guide_documents, which doesn't allow publicUrl.
        // We just store the path.
        const fileExt = idDocFile.name.split('.').pop()
        const fileName = `${guide.id}/id_doc_${Date.now()}.${fileExt}`
        const { error: upErr } = await supabase.storage.from('guide_documents').upload(fileName, idDocFile, { upsert: true })
        if (upErr) throw upErr
        id_document_url = fileName
      }
      if (licenseDocFile) {
        const fileExt = licenseDocFile.name.split('.').pop()
        const fileName = `${guide.id}/license_doc_${Date.now()}.${fileExt}`
        const { error: upErr } = await supabase.storage.from('guide_documents').upload(fileName, licenseDocFile, { upsert: true })
        if (upErr) throw upErr
        license_document_url = fileName
      }

      // 3. Submit to server API
      const res = await fetch('/api/guides/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profile_picture_url,
          id_document_url,
          license_document_url
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit verification')
      }

      // Success! Refresh the page to show the Pending Review state
      router.refresh()

    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // STATUS: Pending Review
  if (isPending) {
    return (
      <div className="bg-card/50 border border-border rounded-2xl p-10 text-center flex flex-col items-center max-w-lg mx-auto mt-10">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground mb-3">
          Under Review
        </h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Your documents have been submitted securely. Our admin team is currently reviewing your profile to verify your Ministry of Tourism license.
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-full">
          Check back soon
        </p>
      </div>
    )
  }

  // STATUS: Rejected / Needs Action / Or Initial Form
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 mt-6 shadow-sm">
      <div className="mb-8 border-b border-border/50 pb-6">
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-foreground tracking-tight">
          Guide Verification
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          To join Atlas 360 as a certified guide, please provide your details and upload your official documents.
        </p>

        {isRejected && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Action Required</p>
              <p className="text-sm text-destructive/80 mt-1">{verificationRequest.admin_notes}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">First Name *</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Last Name *</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Birth Date *</label>
              <input required type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-lg text-xs uppercase tracking-widest hover:bg-foreground/90 transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-foreground mb-4">Professional Profile</h3>
            
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">WhatsApp Number *</label>
              <input required type="tel" name="whatsapp_number" placeholder="+212 600 000 000" value={formData.whatsapp_number} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Daily Rate (MAD) *</label>
              <input required type="number" name="daily_rate_mad" min="0" value={formData.daily_rate_mad} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Bio / About Me</label>
              <textarea name="bio" rows={4} value={formData.bio} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none" placeholder="Tell travelers about your expertise..."></textarea>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Languages Spoken *</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button key={lang} onClick={() => toggleArrayItem('languages', lang)} className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all ${formData.languages.includes(lang) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/20'}`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Regions Covered *</label>
              <div className="flex flex-wrap gap-2">
                {MOROCCAN_REGIONS.map(reg => (
                  <button key={reg} onClick={() => toggleArrayItem('regions', reg)} className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all ${formData.regions.includes(reg) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/20'}`}>
                    {reg}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-muted text-foreground font-semibold rounded-lg text-xs uppercase tracking-widest hover:bg-muted/80 transition-all">← Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-lg text-xs uppercase tracking-widest hover:bg-foreground/90 transition-all">Next Step →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-foreground mb-4">Verification Documents</h3>
            <p className="text-xs text-muted-foreground mb-6">Upload your official documents. These are securely stored and only visible to our verification team.</p>
            
            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Professional Photo *</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors">
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                  </label>
                </div>
              </div>

              {/* ID Document */}
              <div className="p-4 border border-border rounded-xl bg-background">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>National ID or Passport *</span>
                  {verificationRequest?.id_document_url && !idDocFile && <span className="text-[9px] text-green-500">Already Uploaded</span>}
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <UploadCloud className="w-5 h-5 text-muted-foreground" />
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setIdDocFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>

              {/* License Document */}
              <div className="p-4 border border-border rounded-xl bg-background">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>Ministry of Tourism License *</span>
                  {verificationRequest?.license_document_url && !licenseDocFile && <span className="text-[9px] text-green-500">Already Uploaded</span>}
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <UploadCloud className="w-5 h-5 text-muted-foreground" />
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setLicenseDocFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:uppercase file:tracking-widest file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-muted text-foreground font-semibold rounded-lg text-xs uppercase tracking-widest hover:bg-muted/80 transition-all" disabled={loading}>← Back</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isRejected ? 'Resubmit Application' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
