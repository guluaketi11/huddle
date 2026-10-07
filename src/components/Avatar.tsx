import type { User } from '../types';

export default function Avatar({ user, size = 40 }: { user: User; size?: number }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: user.color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
