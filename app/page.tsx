'use client';
import Bio from "@/app/ui/home/bio"
import OverView from "@/app/ui/home/overview"
import RecentPosts from "@/app/ui/home/rencent-posts"
import { Suspense, useState } from "react";
import { StatItem } from "@/app/ui/home/overview";
import { ColumnDef } from "@tanstack/react-table";
import router from "next/router";
import { useEffect } from "react";

// TODO fetch data
const defaultItems: StatItem[] = [
  { label: 'Total Views', value: '23,569', change: '+37', changeVariant: 'up' },
  { label: 'Total Renenue', value: '¥ 0' },
  { label: 'Follows', value: 181 },
  { label: 'Stars', value: 352 },
];

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

const articles: Article[] = [
  {
    id: "1",
    title: "github上react开箱即用的模板 (仅供自己...",
    impressions: 1315,
    reads: 1028,
    comments: 0,
    likes: 8,
    saves: 14,
  },
  {
    id: "2",
    title: "npm fund 命令的作用",
    impressions: 2540,
    reads: 912,
    comments: 0,
    likes: 4,
    saves: 1,
  },
  {
    id: "3",
    title: "npm fund 命令的作用",
    impressions: 2540,
    reads: 912,
    comments: 0,
    likes: 4,
    saves: 1,
  },
  {
    id: "4",
    title: "npm fund 命令的作用",
    impressions: 2540,
    reads: 912,
    comments: 0,
    likes: 4,
    saves: 1,
  },
  {
    id: "5",
    title: "npm fund 命令的作用",
    impressions: 2540,
    reads: 912,
    comments: 0,
    likes: 4,
    saves: 1,
  }
];

const handleRowClick = (article: Article) => {
  console.log("click:", article);
  router.push(`/posts/${article.id}`);
};

export default function Home() {
  const [user, setUser] = useState<any>(null); // 用户信息
   // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {

        const [userRes] = await Promise.all([
          fetch('/api/users'),
        ]);

        if (!userRes.ok) throw new Error('用户信息获取失败');

        const userData = await userRes.json();

        if (userData.code !== 200) throw new Error(userData.message);

        setUser(userData.data);
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
        <OverView items={defaultItems} />
      </Suspense>
    </div>
    <div className="my-6">
      <Suspense fallback={<div>Loading...</div>}>
        <RecentPosts data={articles} columns={columns} onRowClick={handleRowClick}/>
      </Suspense>
    </div>
  </div>;
}