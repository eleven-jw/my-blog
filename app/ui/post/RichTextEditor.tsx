'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
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
    <div className="relative min-h-[240px] rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus-within:border-primary">
      {placeholder && editor.isEmpty && !editor.isFocused && (
        <span className="pointer-events-none select-none text-gray-400">{placeholder}</span>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
