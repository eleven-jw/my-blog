'use client'

import { Button } from "@/components/ui/button"

type DialogProps = {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  confirmDisabled?: boolean
  cancelDisabled?: boolean
}

export default function Dialog({
  open,
  title,
  description,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  confirmDisabled,
  cancelDisabled,
}: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={cancelDisabled}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
