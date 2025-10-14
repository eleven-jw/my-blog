'use client';
import Bio from "@/app/ui/home/bio"
import OverView from "@/app/ui/home/overview"
import RecentPosts from "@/app/ui/home/rencent-posts"
import { Suspense, useState } from "react";
import type { DataTableColumnDef } from "@/app/ui/common/data-table";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import { UserInfo } from "@/types/use";
import { StatItem } from "@/types/home";
// import { useSession } from "next-auth/react";


type Article = {
  id: string;
  title: string;
  impressions: number;
  reads: number;
  comments: number;
  likes: number;
  saves: number;
};

type PostsListApiItem = {
  id: string;
  title: string;
  likes?: number;
  views?: number;
  commentsCount?: number;
  saves?: number;
};

const columns: DataTableColumnDef<Article, unknown>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "impressions", header: "Impressions" },
  { accessorKey: "reads", header: "Reads" },
  { accessorKey: "comments", header: "Comments" },
  { accessorKey: "likes", header: "Likes" },
  { accessorKey: "saves", header: "Saves" },
];


export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo>({
    name: '',
    fansCount: 0,
    postCount: 0
  });
  const [states, setStates] = useState<StatItem[]>([]);
  const [posts, setPosts] = useState<Article[]>([]);
  // const { data: session, status } = useSession();
  
  const handleRowClick = (article: Article) => {
    router.push(`/posts/${article.id}`);
  };

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/login');
  //   }
  // }, [status, router]);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, statsRes, postsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/states'),
          fetch('/api/posts/list')
        ]);

        if (!userRes.ok) throw new Error('Failed to get user info');
        if (!statsRes.ok) throw new Error('Failed to get states');
        if (!postsRes.ok) throw new Error('Failed to get posts');

        const userData = await userRes.json();
        const stateData = await statsRes.json();
        const postsData = await postsRes.json();
        if (userData.code !== 200) throw new Error(userData.message);
        if (stateData.code !== 200) throw new Error(stateData.message);
        if (postsData.code !== 200) throw new Error(postsData.message);

        setUser({
          image: '',
          name: '',
          ...userData.data
        });
        setStates(Array.isArray(stateData.data) ? stateData.data : []);
        const postsList = Array.isArray(postsData.data?.list)
          ? postsData.data.list.map((post: PostsListApiItem) => ({
              id: post.id,
              title: post.title,
              impressions: post.views ?? 0,
              reads: post.views ?? 0,
              comments: post.commentsCount ?? 0,
              likes: post.likes ?? 0,
              saves: post.saves ?? 0,
            }))
          : [];
        setPosts(postsList);
      } catch (err) {
        console.error('数据加载失败:', err);
      } finally {
      }
    };

    loadData();
  }, []);

  return <div>
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Bio userInfo={user}/>
      </Suspense>
    </div>
    <div className="my-6">
      <Suspense fallback={<div>Loading...</div>}>
        <OverView items={states} />
      </Suspense>
    </div>
    <div className="my-6">
      <Suspense fallback={<div>Loading...</div>}>
        <RecentPosts data={posts} columns={columns} onRowClick={handleRowClick}/>
      </Suspense>
    </div>
  </div>;
}
