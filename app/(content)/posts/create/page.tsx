import PostForm from "@/app/ui/post/PostForm"
import PostBreadcrumb from "@/app/ui/post/PostBreadcrumb"

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <PostBreadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '文章管理', href: '/posts' },
          { label: '新建文章' },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">新建文章</h1>
        <p className="text-sm text-gray-500">填写文章内容并保存，稍后可以继续编辑。</p>
      </div>
      <PostForm />
    </div>
  )
}
