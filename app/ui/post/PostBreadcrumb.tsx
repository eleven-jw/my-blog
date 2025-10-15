"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type BreadcrumbItemData = {
  label: string
  href?: string
}

const DEFAULT_SEGMENT_MAP: Record<string, BreadcrumbItemData> = {
  posts: { label: "文章管理", href: "/posts" },
  create: { label: "新建文章" },
  edit: { label: "编辑文章" },
  explore: { label: "文章广场", href: "/explore" },
}

type PostBreadcrumbProps = {
  items?: BreadcrumbItemData[]
  appendItems?: BreadcrumbItemData[]
  className?: string
}

export default function PostBreadcrumb({ items, appendItems, className }: PostBreadcrumbProps) {
  const pathname = usePathname()

  const computedItems = React.useMemo(() => {
    if (items && items.length) {
      return items
    }

    const segments = pathname.split("/").filter(Boolean)
    const result: BreadcrumbItemData[] = [{ label: "首页", href: "/" }]
    let currentPath = ""

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      let config = DEFAULT_SEGMENT_MAP[segment]
      const isLastSegment = index === segments.length - 1
      const hasAppend = !!appendItems?.length

      if (!config) {
        if (isLastSegment && hasAppend) {
          return
        }
        config = {
          label: decodeURIComponent(segment),
          href: currentPath,
        }
      }

      const isLastBreadcrumb = isLastSegment && !hasAppend
      result.push({
        label: config.label,
        href: isLastBreadcrumb ? undefined : (config.href ?? currentPath),
      })
    })

    if (appendItems?.length) {
      result.push(...appendItems)
    }

    return result
  }, [appendItems, items, pathname])

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {computedItems.map((item, index) => {
          const isLast = index === computedItems.length - 1
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export type { BreadcrumbItemData }
