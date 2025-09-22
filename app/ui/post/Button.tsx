'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

type CreatePostButtonProps = {
  href?: string
  label?: string
}

export default function CreatePostButton({
  href = '/posts/create',
  label = '新建文章',
}: CreatePostButtonProps) {
  const router = useRouter()

  return (
    <Button onClick={() => router.push(href)}>{label}</Button>
  )
}
