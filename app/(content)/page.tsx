'use client';
import Bio from "@/app/ui/home/bio"
import OverView from "@/app/ui/home/overview"
import RecentPosts from "@/app/ui/home/rencent-posts"
import { Suspense, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import router from "next/router";
import { useEffect } from "react";
import { UserInfo } from "@/types/use";
import { StatItem } from "@/types/home";
// import { useSession } from "next-auth/react";

// TODO fetch data
// const defaultItems: StatItem[] = [
//   { label: 'Total Views', value: '23,569', change: '+37', changeVariant: 'up' },
//   { label: 'Total Renenue', value: '¥ 0' },
//   { label: 'Follows', value: 181 },
//   { label: 'Stars', value: 352 },
// ];

type Article = {
  id: string;
  title: string;
  impressions: number;
  reads: number;
  comments: number;
  likes: number;
  saves: number;
};

const columns: ColumnDef<Article>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "impressions", header: "Impressions" },
  { accessorKey: "reads", header: "Reads" },
  { accessorKey: "comments", header: "Comments" },
  { accessorKey: "likes", header: "Likes" },
  { accessorKey: "saves", header: "Saves" },
];

// const articles: Article[] = [
//   {
//     id: "1",
//     title: "github上react开箱即用的模板 (仅供自己...",
//     impressions: 1315,
//     reads: 1028,
//     comments: 0,
//     likes: 8,
//     saves: 14,
//   },
//   {
//     id: "2",
//     title: "npm fund 命令的作用",
//     impressions: 2540,
//     reads: 912,
//     comments: 0,
//     likes: 4,
//     saves: 1,
//   },
//   {
//     id: "3",
//     title: "npm fund 命令的作用",
//     impressions: 2540,
//     reads: 912,
//     comments: 0,
//     likes: 4,
//     saves: 1,
//   },
//   {
//     id: "4",
//     title: "npm fund 命令的作用",
//     impressions: 2540,
//     reads: 912,
//     comments: 0,
//     likes: 4,
//     saves: 1,
//   },
//   {
//     id: "5",
//     title: "npm fund 命令的作用",
//     impressions: 2540,
//     reads: 912,
//     comments: 0,
//     likes: 4,
//     saves: 1,
//   }
// ];

const handleRowClick = (article: Article) => {
  console.log("click:", article);
  router.push(`/posts/${article.id}`);
};

export default function Home() {
  const [user, setUser] = useState<UserInfo>({
    name: '',
    fansCount: 0,
    postCount: 0
  });
  const [states, setStates] = useState<StatItem[]>([]);
  const [posts, setPosts] = useState<Article[]>([]);
  // const { data: session, status } = useSession();
  
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

        console.log('userRes', await userRes.json());
        console.log('statsRes', await statsRes.json());
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
        console.log(Array.isArray(stateData.data) ? stateData.data : []);
        setStates(Array.isArray(stateData.data) ? stateData.data : []);
        setPosts(postsData.data)
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