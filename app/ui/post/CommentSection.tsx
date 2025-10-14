'use client';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { SessionProvider } from 'next-auth/react';
import type { PostComment } from './types';

type CommentSectionProps = {
  postId: string;
  comments: PostComment[];
  onCommentsChange?: (comments: PostComment[]) => void;
};

const INITIAL_VISIBLE_COMMENTS = 10;

export default function CommentSection({ postId, comments, onCommentsChange }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (comments.length <= INITIAL_VISIBLE_COMMENTS) {
      setExpanded(false);
    }
  }, [comments.length]);

  const handleCommentSubmit = async () => {
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/comments/?postId=${postId}&t=${timestamp}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'update comments failed');
      }
      const newComments: PostComment[] = await res.json();
      if (newComments.length > INITIAL_VISIBLE_COMMENTS) {
        setExpanded(true);
      }
      onCommentsChange?.(newComments);
    } catch (err) {
      console.error('update Failed:', err);
    }
  };

  const canToggle = comments.length > INITIAL_VISIBLE_COMMENTS;
  const shouldShowAll = expanded || !canToggle;
  const visibleComments = shouldShowAll
    ? comments
    : comments.slice(0, INITIAL_VISIBLE_COMMENTS);

  return (
    <section className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Comment</h2>
      <SessionProvider>
        <CommentForm postId={postId} onSubmit={handleCommentSubmit} />
      </SessionProvider>
      <CommentList comments={visibleComments} />
      {canToggle && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm text-blue-600 shadow-sm transition hover:bg-blue-50 hover:text-blue-500"
          >
            {expanded ? 'Collapse' : `Expand (${comments.length})`}
            {expanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
