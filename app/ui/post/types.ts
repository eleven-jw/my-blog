export type PostComment = {
  id: string
  postId: string
  authorId: string | null
  content: string
  status: string
  createdAt: string | Date
  updatedAt: string | Date
  authorName: string
  author?: {
    id: string
    name: string | null
  } | null
}
