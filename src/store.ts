import { useEffect, useReducer } from 'react';
import { ME, seedPosts } from './data';
import type { Post } from './types';

type Action =
  | { type: 'create'; text: string; image?: string }
  | { type: 'delete'; id: string }
  | { type: 'like'; id: string }
  | { type: 'save'; id: string }
  | { type: 'comment'; id: string; text: string }
  | { type: 'reset' };

const KEY = 'huddle-posts-v1';

const uid = () => Math.random().toString(36).slice(2, 10);

const load = (): Post[] => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    return seedPosts();
  }
  return seedPosts();
};

const update = (posts: Post[], id: string, change: (post: Post) => Post) =>
  posts.map((post) => (post.id === id ? change(post) : post));

const reducer = (posts: Post[], action: Action): Post[] => {
  switch (action.type) {
    case 'create':
      return [
        {
          id: uid(),
          authorId: ME,
          text: action.text,
          image: action.image,
          createdAt: Date.now(),
          likes: [],
          comments: [],
          saved: false,
        },
        ...posts,
      ];
    case 'delete':
      return posts.filter((post) => post.id !== action.id);
    case 'like':
      return update(posts, action.id, (post) => ({
        ...post,
        likes: post.likes.includes(ME) ? post.likes.filter((id) => id !== ME) : [...post.likes, ME],
      }));
    case 'save':
      return update(posts, action.id, (post) => ({ ...post, saved: !post.saved }));
    case 'comment':
      return update(posts, action.id, (post) => ({
        ...post,
        comments: [...post.comments, { id: uid(), authorId: ME, text: action.text, createdAt: Date.now() }],
      }));
    case 'reset':
      return seedPosts();
  }
};

export function usePosts() {
  const [posts, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(posts));
    } catch {
      return;
    }
  }, [posts]);

  return [posts, dispatch] as const;
}

export type Dispatch = ReturnType<typeof usePosts>[1];
