"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { UserInfo } from "@/types/use"
import { cn, formatDateTime } from "@/lib/utils"

const FALLBACK_AVATAR = "/avatar.jpg"

export type ProfileViewProps = {
  profile: UserInfo & {
    email?: string | null
    followsCount?: number
    favoritesCount?: number
    totalViews?: number
    role?: string | null
    interests?: string[]
  }
  availableInterests: string[]
}

export default function ProfileView({ profile, availableInterests }: ProfileViewProps) {
  const router = useRouter()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState(profile.name ?? "")
  const [email, setEmail] = useState(profile.email ?? "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests ?? [])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isHoveringAvatar, setHoveringAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const avatarSrc = useMemo(() => {
    if (previewUrl) return previewUrl
    const src = profile.image?.trim()
    if (!src) return FALLBACK_AVATAR

    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
      return src
    }

    return "/avatar.jpg"
  }, [previewUrl, profile.image])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function resetForm() {
    setDialogOpen(false)
    setName(profile.name ?? "")
    setEmail(profile.email ?? "")
    setAvatarFile(null)
    setPreviewUrl(null)
    setSelectedInterests(profile.interests ?? [])
    setError(null)
  }

  function openDialog() {
    setName(profile.name ?? "")
    setEmail(profile.email ?? "")
    setSelectedInterests(profile.interests ?? [])
    setAvatarFile(null)
    setPreviewUrl(null)
    setError(null)
    setSuccess(null)
    setDialogOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("email", email.trim())
    if (avatarFile) {
      formData.append("avatar", avatarFile)
    }
    selectedInterests.forEach((interest) => {
      formData.append("interests", interest)
    })

    startTransition(async () => {
      try {
        const response = await fetch("/api/users/profile", {
          method: "PUT",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("保存个人资料失败")
        }

        const payload = await response.json()
        if (payload.code !== 200) {
          throw new Error(payload.message || "保存个人资料失败")
        }

        setSuccess("个人资料已更新")
        setDialogOpen(false)
        setAvatarFile(null)
        setPreviewUrl(null)
        router.refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : "保存个人资料失败"
        setError(message)
      }
    })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      setAvatarFile(null)
      setPreviewUrl(null)
      return
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setError("仅支持 PNG、JPG、WEBP 图片格式")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("头像大小不能超过 2MB")
      return
    }

    setError(null)
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function toggleInterest(tag: string) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-indigo-100">
              <Image
                src={avatarSrc}
                alt="avatar"
                fill
                className="object-cover"
                onError={() => setPreviewUrl(FALLBACK_AVATAR)}
                sizes="64px"
                priority
              />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-gray-900">{profile.name ?? "User"}</h1>
              <p className="text-sm text-gray-500">{profile.email ?? "unlinked email"}</p>
              <p className="text-xs text-gray-400">Role{profile.role ?? "Normal"}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right text-sm text-gray-500">
            {profile.createdAt && (
              <span>join date:{formatDateTime(profile.createdAt) || "--"}</span>
            )}
            <Button variant="outline" onClick={openDialog}>
              EDIT
            </Button>
          </div>
        </div>
      </div>

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProfileStat label="Posts" value={profile.postCount ?? 0} />
        {/* <ProfileStat label="Fans" value={profile.fansCount ?? 0} /> */}
        <ProfileStat label="Follows" value={profile.followsCount ?? 0} />
        <ProfileStat label="Favorites" value={profile.favoritesCount ?? 0} />
        <ProfileStat label="Views" value={profile.totalViews ?? 0} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-medium text-gray-900">Interests</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(profile.interests ?? []).length ? (
            profile.interests!.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-700"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">Not set</span>
          )}
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Edit</h2>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Close
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-indigo-100"
                  onMouseEnter={() => setHoveringAvatar(true)}
                  onMouseLeave={() => setHoveringAvatar(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image
                    src={previewUrl || avatarSrc}
                    alt="avatar"
                    fill
                    className="object-cover"
                    onError={() => setPreviewUrl(FALLBACK_AVATAR)}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white transition-opacity",
                      isHoveringAvatar ? "opacity-100" : "opacity-0",
                    )}
                  >
                    Upload
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-sm text-gray-500">
                  <p className="font-medium text-gray-900">click the image</p>
                  <p>only support PNG / JPG / WEBP,no more than 2MB。</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                id="profile-avatar"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="profile-name">
                  User
                </label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Please input username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="profile-email">
                  Email
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="please input email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Intertests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((tag) => {
                    const active = selectedInterests.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition",
                          active
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600",
                        )}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm} disabled={isPending}>
                  cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "saving..." : "save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

type ProfileStatProps = {
  label: string
  value: number
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}
