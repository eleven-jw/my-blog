import Image from 'next/image';
import {
  Card,
  CardContent
} from "@/components/ui/card"

interface UserInfo {
  name: string;
  fansCount: number;
  postCount: number;
}

interface BioProps {
  userInfo: UserInfo;
}

export default function Bio({userInfo}: BioProps) {
  return (
    <Card>
        <CardContent className='flex flex-row gap-4 margin-0 p-4'>
            <div>
                <Image src="/avatar.jpg" alt="avatar" width={50} height={50} className='rounded-full' />
            </div>
            <div className='flex flex-col justify-space-around'>
                <div className='font-bold'>{userInfo?.name}</div>
                <div className='flex flex-row gap-2 text-sm'>
                    <div>
                        <span className='font-bold'>{userInfo?.fansCount}</span><span className='m-1'>Fans</span>
                    </div>
                    <div>
                        <span className='font-bold'>{userInfo?.postCount}</span><span className='m-1'>Articles</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
 )
}
