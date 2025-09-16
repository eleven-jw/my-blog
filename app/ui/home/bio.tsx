import Image from 'next/image';
import {
  Card,
  CardContent
} from "@/components/ui/card"

export default function Bio() {
  return (
    <Card>
        <CardContent className='flex flex-row gap-4 margin-0 p-4'>
            <div>
                <Image src="/avatar.jpg" alt="avatar" width={50} height={50} className='rounded-full' />
            </div>
            <div className='flex flex-col justify-space-around'>
                <div className='font-bold'>UserName</div>
                <div className='flex flex-row gap-2 text-sm'>
                    <div>
                        <span className='font-bold'>18</span><span className='m-1'>Fans</span>
                    </div>
                    <div>
                        <span className='font-bold'>20</span><span className='m-1'>Articles</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
 )
}
