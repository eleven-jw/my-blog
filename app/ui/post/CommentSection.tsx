'use client';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { SessionProvider } from 'next-auth/react';
import type { PostComment } from './types';

type CommentSectionProps = {
  postId: string;
  comments: PostComment[];
  onCommentsChange?: (comments: PostComment[]) => void;
};

export default function CommentSection({ postId, comments, onCommentsChange }: CommentSectionProps) {
  const handleCommentSubmit = async () => {
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/comments/?postId=${postId}&t=${timestamp}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'update comments failed');
      }
      const newComments: PostComment[] = await res.json();
      onCommentsChange?.(newComments);
    } catch (err) {
      console.error('update Failed:', err);
    }
  };

  return (
    <section className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Comment</h2>
      <SessionProvider>
        <CommentForm postId={postId} onSubmit={handleCommentSubmit} />
      </SessionProvider>
      <CommentList comments={comments} />
    </section>
  );
}
