'use client';
import Bio from "@/app/ui/home/bio"
import OverView from "@/app/ui/home/overview"
import RecentPosts from "@/app/ui/home/rencent-posts"
import { Suspense } from "react";
import { StatItem } from "@/app/ui/home/overview";
import { ColumnDef } from "@tanstack/react-table";
import router from "next/router";

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
  return <div>
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Bio />
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