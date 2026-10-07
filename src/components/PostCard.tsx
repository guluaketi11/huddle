import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';
import RichText from './RichText';
import { ME, users } from '../data';
import { timeAgo } from '../time';
import type { Dispatch } from '../store';
import type { Post } from '../types';

type Props = {
  post: Post;
  dispatch: Dispatch;
  onTag: (tag: string) => void;
  onToast: (message: string) => void;
};

export default function PostCard({ post, dispatch, onTag, onToast }: Props) {
  const author = users[post.authorId];
  const liked = post.likes.includes(ME);
  const [showComments, setShowComments] = useState(post.comments.length > 0 && post.comments.length <= 2);
  const [comment, setComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const like = () => {
    if (!liked) setPop(true);
    dispatch({ type: 'like', id: post.id });
  };

  const share = async () => {
    const url = `${location.origin}/#post-${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onToast('Link copied');
    } catch {
      onToast('Copy the link from the address bar');
    }
  };

  const likedBy = post.likes.filter((id) => id !== ME).map((id) => users[id]?.name.split(' ')[0]);

  return (
    <article className="card post" id={`post-${post.id}`}>
      <header className="post-head">
        <Avatar user={author} size={44} />
        <div className="post-meta">
          <strong>{author.name}</strong>
          <span>
            @{author.handle} · <time dateTime={new Date(post.createdAt).toISOString()}>{timeAgo(post.createdAt)}</time>
          </span>
        </div>
        {post.authorId === ME && (
          <div className="menu" ref={menuRef}>
            <button
              type="button"
              className="icon-btn"
              aria-label="Post options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name="more" />
            </button>
            {menuOpen && (
              <div className="menu-list" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  onClick={() => {
                    dispatch({ type: 'delete', id: post.id });
                    onToast('Post deleted');
                  }}
                >
                  <Icon name="trash" size={18} />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {post.text && (
        <p className="post-text">
          <RichText text={post.text} onTag={onTag} />
        </p>
      )}

      {post.image && (
        <div className="post-image" onDoubleClick={() => !liked && like()}>
          <img src={post.image} alt={`Photo shared by ${author.name}`} loading="lazy" />
        </div>
      )}

      {(post.likes.length > 0 || post.comments.length > 0) && (
        <div className="post-stats">
          <span>
            {post.likes.length > 0 &&
              (liked
                ? likedBy.length
                  ? `You and ${likedBy.length} ${likedBy.length === 1 ? 'other' : 'others'}`
                  : 'You'
                : likedBy.length <= 2
                  ? likedBy.join(' and ')
                  : `${likedBy[0]} and ${likedBy.length - 1} others`)}
          </span>
          {post.comments.length > 0 && (
            <button type="button" className="link-btn" onClick={() => setShowComments((v) => !v)}>
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      <div className="post-actions">
        <button
          type="button"
          className={`action ${liked ? 'is-liked' : ''} ${pop ? 'pop' : ''}`}
          aria-pressed={liked}
          onClick={like}
          onAnimationEnd={() => setPop(false)}
        >
          <Icon name="heart" filled={liked} />
          <span>Like</span>
        </button>
        <button type="button" className="action" onClick={() => setShowComments(true)} aria-expanded={showComments}>
          <Icon name="comment" />
          <span>Comment</span>
        </button>
        <button type="button" className="action" onClick={share}>
          <Icon name="share" />
          <span>Share</span>
        </button>
        <button
          type="button"
          className={`action ${post.saved ? 'is-saved' : ''}`}
          aria-pressed={post.saved}
          onClick={() => {
            dispatch({ type: 'save', id: post.id });
            onToast(post.saved ? 'Removed from saved' : 'Saved');
          }}
        >
          <Icon name="bookmark" filled={post.saved} />
          <span>{post.saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {showComments && (
        <section className="comments" aria-label="Comments">
          {post.comments.map((c) => (
            <div className="comment" key={c.id}>
              <Avatar user={users[c.authorId]} size={32} />
              <div>
                <div className="comment-bubble">
                  <strong>{users[c.authorId].name}</strong>
                  <p>{c.text}</p>
                </div>
                <span className="comment-time">{timeAgo(c.createdAt)}</span>
              </div>
            </div>
          ))}
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              dispatch({ type: 'comment', id: post.id, text: comment.trim() });
              setComment('');
            }}
          >
            <Avatar user={users[ME]} size={32} />
            <label className="sr-only" htmlFor={`comment-${post.id}`}>
              Write a comment
            </label>
            <input
              id={`comment-${post.id}`}
              value={comment}
              maxLength={300}
              placeholder="Write a comment…"
              onChange={(event) => setComment(event.target.value)}
            />
            <button type="submit" className="icon-btn send" disabled={!comment.trim()} aria-label="Send comment">
              <Icon name="send" size={18} />
            </button>
          </form>
        </section>
      )}
    </article>
  );
}
