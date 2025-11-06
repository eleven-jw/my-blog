import { render, screen } from "@testing-library/react"
import CommentItem from "@/app/ui/post/CommentItem"
import type { PostComment } from "@/app/ui/post/types"

const baseDate = new Date("2024-05-01T08:00:00Z")

describe("CommentItem", () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(baseDate)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("renders author metadata, sanitized content, and formatted dates", () => {
    const comment: PostComment = {
      id: "comment-1",
      postId: "post-1",
      authorId: null,
      content: "<p>Hello</p><script>alert('xss')</script>",
      status: "published",
      createdAt: new Date(baseDate.getTime() - 60 * 1000).toISOString(),
      updatedAt: baseDate.toISOString(),
      authorName: "Alice",
    }

    const { container } = render(<CommentItem comment={comment} />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("1 分钟前")).toBeInTheDocument()
    expect(screen.getByText("2024/05/01 07:59")).toBeInTheDocument()
    expect(screen.getByText("Hello")).toBeInTheDocument()
    expect(container.querySelector("script")).toBeNull()
  })
})
