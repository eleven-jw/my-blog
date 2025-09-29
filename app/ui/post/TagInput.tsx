'use client';

import { Tag } from '@/types/post'
import { useState } from 'react';

interface TagInputProps {
  selectedTags: Tag[];
  existingTags: Tag[];
  onToggleExistingTag: (tags: Tag) => void;
  onAddNewTag: (tagName: string) => void;
  onRemoveTag:(tag: Tag) => void;
  maxTags?: number;
  tagMaxLength?: number;
  error?: string;
}

export default function TagInput ({
  selectedTags,
  existingTags,
  onToggleExistingTag,
  onAddNewTag,
  onRemoveTag,
  maxTags = 5,
  tagMaxLength = 20,
  error,
}: TagInputProps) {
     
    const [inputTag, setInputTag] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputTag(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const trimmed = inputTag.trim();
        if (trimmed) {
          onAddNewTag(trimmed);
          setInputTag(''); 
        }
      }
    };

    const handleExistingTagClick = (tag: Tag) => {
      onToggleExistingTag(tag);
    };

    const handleTagRemove = (tag: Tag) => {
      onRemoveTag(tag);
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
            >
              <span>{tag.name}</span>
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => handleTagRemove(tag)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex-grow">
          <input
            type="text"
            value={inputTag}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="please input tag,press enter or ; to add tag"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-2">
          <span className="text-sm font-medium text-gray-700 mb-1 block">现有标签：</span>
          <div className="flex flex-wrap gap-2">
            {existingTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.some(t => t.id === tag.id) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => handleExistingTagClick(tag)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          only {maxTags}tags，every tag no more than {tagMaxLength}characters!
        </p>
      </div>
    );
}