'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

type CommentFormProps = {
  postId: string;
  onSubmit: () => Promise<void>; // 提交成功后的回调（如刷新评论列表）
};

export default function CommentForm({ postId, onSubmit}: CommentFormProps) {
  const [formData, setFormData] = useState({
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, authorId: session?.user?.id, ...formData }),
      });
      if (!res.ok) {
        console.log('res', res.ok);
        const errData = await res.json();
        throw new Error(errData.error || '提交失败');
      }
      await onSubmit();
      setFormData({content: '' });
    } catch (err) {
      setError(err.message || 'error提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <textarea
        placeholder="write your comment"
        value={formData.content}
        onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? '提交中...' : '提交评论'}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
}
