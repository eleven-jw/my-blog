'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import jsonLang from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import { cn } from "@/lib/utils"

lowlight.registerLanguage('javascript', javascript)
lowlight.registerLanguage('typescript', typescript)
lowlight.registerLanguage('json', jsonLang)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('html', html)

export type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const FALLBACK_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Underline,
      Highlight,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
        },
      }),
      Image.configure({ inline: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current) {
      editor.commands.setContent(value, false)
    }
    if (!value && current !== '<p></p>') {
      editor.commands.setContent('<p></p>', false)
    }
  }, [editor, value])

  if (!editor) {
    return <div className="rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400">加载中...</div>
  }

  return (
    <div className="space-y-2">
      <Toolbar editor={editor} />
      <div className="relative min-h-[240px] rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-within:border-primary">
        {placeholder && editor.isEmpty && !editor.isFocused && (
          <span className="pointer-events-none select-none text-gray-400">{placeholder}</span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

type ToolbarProps = {
  editor: ReturnType<typeof useEditor>
}

function Toolbar({ editor }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [color, setColor] = useState('#000000')

  const currentColor = useMemo(() => {
    return editor?.getAttributes('textStyle')?.color || '#000000'
  }, [editor])

  useEffect(() => {
    setColor(currentColor)
  }, [currentColor])

  if (!editor) return null

  const buttonClasses = (active?: boolean) =>
    cn(
      'rounded border px-2 py-1 text-xs transition-colors',
      active ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-600 hover:border-sky-300'
    )

  const onImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    if (!FALLBACK_IMAGE_TYPES.includes(file.type)) {
      alert('仅支持 PNG/JPG/WEBP/GIF 图片格式')
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const payload = await response.json()
      if (payload.code !== 200 || !payload.data?.url) {
        throw new Error(payload.message || '上传失败')
      }

      editor.chain().focus().setImage({ src: payload.data.url, alt: file.name }).run()
    } catch (error) {
      console.error(error)
      alert('图片上传失败')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-gray-50 px-2 py-2">
      <button type="button" className={buttonClasses(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
        加粗
      </button>
      <button type="button" className={buttonClasses(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        斜体
      </button>
      <button type="button" className={buttonClasses(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        下划线
      </button>
      <button type="button" className={buttonClasses(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()}>
        删除线
      </button>
      <button type="button" className={buttonClasses(editor.isActive('highlight'))} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        高亮
      </button>
      <div className="flex items-center gap-2 rounded border border-input bg-white px-2 py-1 text-xs text-gray-600">
        <span>颜色</span>
        <input
          type="color"
          value={color}
          onChange={(event) => {
            const value = event.target.value
            setColor(value)
            editor.chain().focus().setColor(value).run()
          }}
          className="h-6 w-6 cursor-pointer border-none bg-transparent p-0"
        />
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetColor().run()
            setColor('#000000')
          }}
          className="text-xs text-sky-600"
        >
          重置
        </button>
      </div>
      <button type="button" className={buttonClasses(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        无序列表
      </button>
      <button type="button" className={buttonClasses(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        有序列表
      </button>
      <button type="button" className={buttonClasses(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        引用
      </button>
      <button type="button" className={buttonClasses(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        代码块
      </button>
      <button type="button" className={buttonClasses(editor.isActive('link'))} onClick={() => {
        const previousUrl = editor.getAttributes('link').href
        const url = prompt('请输入链接地址', previousUrl || 'https://')
        if (url === null) return
        if (url === '') {
          editor.chain().focus().unsetLink().run()
          return
        }
        editor.chain().focus().setLink({ href: url }).run()
      }}>
        链接
      </button>
      <button type="button" className={buttonClasses(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()}>
        行内代码
      </button>
      <button type="button" className={buttonClasses(false)} onClick={() => fileInputRef.current?.click()}>
        插入图片
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={FALLBACK_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          onImageUpload(file)
          event.target.value = ''
        }}
      />
      <button type="button" className={buttonClasses(false)} onClick={() => editor.chain().focus().undo().run()}>
        撤销
      </button>
      <button type="button" className={buttonClasses(false)} onClick={() => editor.chain().focus().redo().run()}>
        重做
      </button>
    </div>
  )
}
