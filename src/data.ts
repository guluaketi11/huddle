import type { Post, User } from './types';

export const ME = 'me';

export const users: Record<string, User> = {
  me: { id: 'me', name: 'Alex Rivera', handle: 'alex', color: '#5b3df5', bio: 'Frontend developer. Coffee, mountains, clean code.' },
  nino: { id: 'nino', name: 'Nino Beridze', handle: 'ninob', color: '#e5484d', bio: 'Photographer based in Tbilisi.' },
  luka: { id: 'luka', name: 'Luka Tsereteli', handle: 'luka.t', color: '#12a594', bio: 'Product designer. Weekend hiker.' },
  mariam: { id: 'mariam', name: 'Mariam Gelashvili', handle: 'mariam', color: '#f76b15', bio: 'Barista and latte art nerd.' },
  daniel: { id: 'daniel', name: 'Daniel Okafor', handle: 'dokafor', color: '#3e63dd', bio: 'Backend engineer. Talks about databases too much.' },
  sofia: { id: 'sofia', name: 'Sofia Marquez', handle: 'sofiam', color: '#d6409f', bio: 'Travel writer. Currently somewhere by the sea.' },
};

const minutes = (n: number) => Date.now() - n * 60_000;
const hours = (n: number) => minutes(n * 60);

export const seedPosts = (): Post[] => [
  {
    id: 'p1',
    authorId: 'nino',
    text: 'Sunrise from the trail above Kazbegi this morning. Worth every minute of the 5am alarm. #mountains #georgia',
    image: '/photos/mountains.svg',
    createdAt: minutes(42),
    likes: ['luka', 'sofia', 'daniel', 'mariam'],
    comments: [
      { id: 'c1', authorId: 'luka', text: 'Those colours! Which trail was this?', createdAt: minutes(30) },
      { id: 'c2', authorId: 'nino', text: 'The one to Gergeti glacier, about two hours in.', createdAt: minutes(24) },
    ],
    saved: false,
  },
  {
    id: 'p2',
    authorId: 'daniel',
    text: 'Hot take: most "slow app" problems are really missing database indexes. Added two today and a 3s page now loads in 120ms. #webdev',
    createdAt: hours(2),
    likes: ['me', 'luka'],
    comments: [{ id: 'c3', authorId: 'me', text: 'Not a hot take, just the truth 😄', createdAt: hours(1.5) }],
    saved: true,
  },
  {
    id: 'p3',
    authorId: 'mariam',
    text: 'New single-origin from Ethiopia on the bar today. Notes of blueberry and jasmine. Come say hi! ☕ #coffee #tbilisi',
    image: '/photos/coffee.svg',
    createdAt: hours(5),
    likes: ['nino', 'sofia'],
    comments: [],
    saved: false,
  },
  {
    id: 'p4',
    authorId: 'luka',
    text: 'Shipped the redesign of our onboarding flow. Fewer steps, clearer copy, and sign-ups are already up 18%. Small details add up. #design',
    createdAt: hours(9),
    likes: ['daniel', 'me', 'nino', 'mariam', 'sofia'],
    comments: [{ id: 'c4', authorId: 'daniel', text: 'Congrats! The new empty states are great.', createdAt: hours(8) }],
    saved: false,
  },
  {
    id: 'p5',
    authorId: 'sofia',
    text: 'Writing from a tiny café by the Black Sea. Batumi in October is quiet, warm and perfect. #travel',
    image: '/photos/sea.svg',
    createdAt: hours(20),
    likes: ['nino'],
    comments: [],
    saved: false,
  },
  {
    id: 'p6',
    authorId: 'me',
    text: 'Late night in the city, finally fixed that layout bug. #webdev #tbilisi',
    image: '/photos/city.svg',
    createdAt: hours(30),
    likes: ['luka', 'daniel'],
    comments: [],
    saved: false,
  },
];
