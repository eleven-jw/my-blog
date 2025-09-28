'use client';
import { useState } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { SessionProvider } from 'next-auth/react';

type CommentSectionProps = {
  postId: string;
  initialComments: any[];
};

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  const handleCommentSubmit = async () => {
    console.log('handleCommentSubmit');
    try {
      const timestamp = Date.now();
      console.log('url', `/api/comments/?postId=${postId}&t=${timestamp}`);
      const res = await fetch(`/api/comments/?postId=${postId}&t=${timestamp}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'update comments failed');
      }
      const newComments = await res.json();
      setComments(newComments);
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