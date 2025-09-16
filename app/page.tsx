import Bio from "@/app/ui/home/bio"
import Card from "@/app/ui/home/card"
import RecentPosts from "@/app/ui/home/rencent-posts"
import { Suspense } from "react";
export default function Home() {
  return <div>
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Bio />
      </Suspense>
    </div>
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Card />
      </Suspense>
    </div>
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <RecentPosts />
      </Suspense>
    </div>
  </div>;
}