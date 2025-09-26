'use client';
import { useState } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { SessionProvider } from 'next-auth/react'; // 导入 SessionProvider


type CommentSectionProps = {
  postId: string;
  initialComments: any[];
};

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  const handleCommentSubmit = async () => {
    const newComments = await fetch(`/api/comments/?postId=${postId}`).then(res => res.json());
    setComments(newComments);
  };

  return (
    <section className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Comment</h2>
        <SessionProvider>
            <CommentForm postId={postId} onsubmit={handleCommentSubmit} />
        </SessionProvider>
      <CommentList comments={comments} />
    </section>
  );
}