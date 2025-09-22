import PostForm from "@/app/ui/post/PostForm"

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">新建文章</h1>
        <p className="text-sm text-gray-500">填写文章内容并保存，稍后可以继续编辑。</p>
      </div>
      <PostForm />
    </div>
  )
}
