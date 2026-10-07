import { useEffect, useMemo, useState } from 'react';
import Avatar from './components/Avatar';
import Composer from './components/Composer';
import Icon from './components/Icon';
import PostCard from './components/PostCard';
import { ME, users } from './data';
import { usePosts } from './store';
import type { View } from './types';

const nav: { view: View; label: string; icon: 'home' | 'bookmark' | 'user' }[] = [
  { view: 'home', label: 'Home', icon: 'home' },
  { view: 'saved', label: 'Saved', icon: 'bookmark' },
  { view: 'profile', label: 'Profile', icon: 'user' },
];

export default function App() {
  const [posts, dispatch] = usePosts();
  const [view, setView] = useState<View>('home');
  const [sort, setSort] = useState<'latest' | 'top'>('latest');
  const [tag, setTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState<string[]>(['nino']);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light');

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('huddle-theme', next);
    } catch {
      setTheme(next);
    }
    setTheme(next);
  };

  const goTo = (next: View) => {
    setView(next);
    setTag(null);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showTag = (value: string) => {
    setView('home');
    setTag(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts
      .filter((p) => view !== 'saved' || p.saved)
      .filter((p) => view !== 'profile' || p.authorId === ME)
      .filter((p) => !tag || p.text.toLowerCase().includes(`#${tag}`))
      .filter((p) => !query || p.text.toLowerCase().includes(query) || users[p.authorId].name.toLowerCase().includes(query))
      .sort((a, b) =>
        sort === 'top' && view === 'home'
          ? b.likes.length + b.comments.length * 2 - (a.likes.length + a.comments.length * 2)
          : b.createdAt - a.createdAt,
      );
  }, [posts, view, tag, search, sort]);

  const trending = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const match of post.text.toLowerCase().matchAll(/#([\p{L}\d_]+)/gu)) {
        counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [posts]);

  const myPosts = posts.filter((p) => p.authorId === ME);
  const likesReceived = myPosts.reduce((sum, p) => sum + p.likes.length, 0);
  const suggestions = Object.values(users).filter((u) => u.id !== ME).slice(0, 4);

  return (
    <div className="layout">
      <header className="topbar">
        <span className="logo">
          <span className="logo-mark" aria-hidden="true" />
          huddle
        </span>
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </header>

      <aside className="left">
        <span className="logo">
          <span className="logo-mark" aria-hidden="true" />
          huddle
        </span>
        <nav className="side-nav" aria-label="Main">
          {nav.map((item) => (
            <button
              key={item.view}
              type="button"
              className={view === item.view ? 'is-active' : ''}
              aria-current={view === item.view ? 'page' : undefined}
              onClick={() => goTo(item.view)}
            >
              <Icon name={item.icon} size={22} filled={view === item.view} />
              <span>{item.label}</span>
            </button>
          ))}
          <button type="button" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={22} />
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </nav>
        <button type="button" className="me-card" onClick={() => goTo('profile')}>
          <Avatar user={users[ME]} size={40} />
          <span>
            <strong>{users[ME].name}</strong>
            <small>@{users[ME].handle}</small>
          </span>
        </button>
      </aside>

      <main className="feed">
        {view === 'profile' ? (
          <section className="card profile">
            <div className="profile-cover" aria-hidden="true" />
            <div className="profile-body">
              <Avatar user={users[ME]} size={88} />
              <h1>{users[ME].name}</h1>
              <p className="muted">@{users[ME].handle}</p>
              <p>{users[ME].bio}</p>
              <dl className="profile-stats">
                <div>
                  <dt>Posts</dt>
                  <dd>{myPosts.length}</dd>
                </div>
                <div>
                  <dt>Likes received</dt>
                  <dd>{likesReceived}</dd>
                </div>
                <div>
                  <dt>Following</dt>
                  <dd>{following.length}</dd>
                </div>
              </dl>
            </div>
          </section>
        ) : (
          <h1 className="feed-title">{view === 'saved' ? 'Saved posts' : 'Home'}</h1>
        )}

        {view === 'home' && (
          <>
            <Composer
              onPost={(text, image) => {
                dispatch({ type: 'create', text, image });
                setSort('latest');
                setTag(null);
                setToast('Posted');
              }}
              onError={setToast}
            />
            <div className="feed-tools">
              <div className="tabs" role="tablist" aria-label="Sort posts">
                <button type="button" role="tab" aria-selected={sort === 'latest'} onClick={() => setSort('latest')}>
                  Latest
                </button>
                <button type="button" role="tab" aria-selected={sort === 'top'} onClick={() => setSort('top')}>
                  Top
                </button>
              </div>
              {tag && (
                <button type="button" className="chip" onClick={() => setTag(null)}>
                  #{tag}
                  <Icon name="close" size={14} />
                  <span className="sr-only">Clear tag filter</span>
                </button>
              )}
              {search && (
                <button type="button" className="chip" onClick={() => setSearch('')}>
                  “{search}”
                  <Icon name="close" size={14} />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>
          </>
        )}

        <div className="posts">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} dispatch={dispatch} onTag={showTag} onToast={setToast} />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="card empty">
            {view === 'saved' ? (
              <>
                <Icon name="bookmark" size={28} />
                <strong>Nothing saved yet</strong>
                <p>Tap Save on any post to keep it here for later.</p>
                <button type="button" className="primary-btn" onClick={() => goTo('home')}>
                  Browse the feed
                </button>
              </>
            ) : view === 'profile' ? (
              <>
                <strong>You haven't posted yet</strong>
                <p>Share a thought or a photo with your huddle.</p>
                <button type="button" className="primary-btn" onClick={() => goTo('home')}>
                  Write your first post
                </button>
              </>
            ) : (
              <>
                <Icon name="search" size={28} />
                <strong>No posts match</strong>
                <p>Try another search or clear the filters.</p>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setTag(null);
                    setSearch('');
                  }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </main>

      <aside className="right">
        <label className="search">
          <Icon name="search" size={18} />
          <span className="sr-only">Search posts</span>
          <input
            type="search"
            placeholder="Search Huddle"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setView('home');
            }}
          />
        </label>

        <section className="card rail-card">
          <h2>Trending</h2>
          <ul className="trending">
            {trending.map(([name, count]) => (
              <li key={name}>
                <button type="button" onClick={() => showTag(name)}>
                  <strong>#{name}</strong>
                  <span>
                    {count} {count === 1 ? 'post' : 'posts'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card rail-card">
          <h2>People to follow</h2>
          <ul className="people">
            {suggestions.map((user) => {
              const isFollowing = following.includes(user.id);
              return (
                <li key={user.id}>
                  <Avatar user={user} size={40} />
                  <span>
                    <strong>{user.name}</strong>
                    <small>@{user.handle}</small>
                  </span>
                  <button
                    type="button"
                    className={isFollowing ? 'follow is-following' : 'follow'}
                    aria-pressed={isFollowing}
                    onClick={() =>
                      setFollowing((list) => (isFollowing ? list.filter((id) => id !== user.id) : [...list, user.id]))
                    }
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <button
          type="button"
          className="reset"
          onClick={() => {
            dispatch({ type: 'reset' });
            setToast('Demo data restored');
          }}
        >
          Reset demo data
        </button>
      </aside>

      <nav className="bottom-nav" aria-label="Main">
        {nav.map((item) => (
          <button
            key={item.view}
            type="button"
            className={view === item.view ? 'is-active' : ''}
            aria-current={view === item.view ? 'page' : undefined}
            onClick={() => goTo(item.view)}
          >
            <Icon name={item.icon} size={22} filled={view === item.view} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
