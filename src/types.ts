export type User = {
  id: string;
  name: string;
  handle: string;
  color: string;
  bio: string;
};

export type Comment = {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
};

export type Post = {
  id: string;
  authorId: string;
  text: string;
  image?: string;
  createdAt: number;
  likes: string[];
  comments: Comment[];
  saved: boolean;
};

export type View = 'home' | 'saved' | 'profile';
