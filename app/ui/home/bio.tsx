import Image from 'next/image';
import {
  Card,
  CardContent
} from "@/components/ui/card"
import type { BioProps } from '@/types/use';


export default function Bio({ userInfo }: BioProps) {
  const avatarSrc = userInfo?.image || '/avatar.jpg'
  return (
    <Card>
      <CardContent className="flex flex-row gap-4 p-4">
        <div>
          <Image
            src={avatarSrc}
            alt="avatar"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
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
