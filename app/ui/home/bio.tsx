import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import type { BioProps } from '@/types/use'

const FALLBACK_AVATAR = '/avatar.jpg'

export default function Bio({ userInfo }: BioProps) {
  const [errored, setErrored] = useState(false)

  const avatarSrc = useMemo(() => {
    if (errored) return FALLBACK_AVATAR

    const src = userInfo?.image?.trim()
    if (!src) {
      return FALLBACK_AVATAR
    }

    // Accept remote HTTP(S) images and local files starting with a slash
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
      return src
    }

    // Otherwise consider it invalid and fall back to default
    return FALLBACK_AVATAR
  }, [errored, userInfo?.image])

  return (
    <Card>
      <CardContent className="flex flex-row gap-4 p-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-100">
          <Image
            src={avatarSrc}
            alt="avatar"
            fill
            className="object-cover"
            onError={() => setErrored(true)}
            sizes="56px"
            priority
          />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="text-base font-semibold text-gray-900">{userInfo?.name || '未命名用户'}</div>
          <div className="flex flex-row gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold text-gray-900">{userInfo?.fansCount ?? 0}</span>
              <span className="ml-1">粉丝</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{userInfo?.postCount ?? 0}</span>
              <span className="ml-1">文章</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
