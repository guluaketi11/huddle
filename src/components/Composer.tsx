import { useRef, useState } from 'react';
import Avatar from './Avatar';
import Icon from './Icon';
import { users, ME } from '../data';

const LIMIT = 500;

const resizeImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file is not an image we can read'));
    };
    img.src = url;
  });

type Props = {
  onPost: (text: string, image?: string) => void;
  onError: (message: string) => void;
};

export default function Composer({ onPost, onError }: Props) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const remaining = LIMIT - text.length;
  const canPost = (text.trim().length > 0 || !!image) && remaining >= 0;

  const pickImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError('Choose an image file (JPG, PNG, WebP or GIF)');
      return;
    }
    try {
      setImage(await resizeImage(file));
    } catch (err) {
      onError((err as Error).message);
    }
  };

  const submit = () => {
    if (!canPost) return;
    onPost(text.trim(), image);
    setText('');
    setImage(undefined);
    if (fileRef.current) fileRef.current.value = '';
    if (textRef.current) textRef.current.style.height = '';
  };

  return (
    <form
      className="card composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Avatar user={users[ME]} size={44} />
      <div className="composer-body">
        <label className="sr-only" htmlFor="composer">
          Write a post
        </label>
        <textarea
          id="composer"
          ref={textRef}
          rows={2}
          value={text}
          placeholder="What's on your mind, Alex?"
          onChange={(event) => {
            setText(event.target.value);
            event.target.style.height = 'auto';
            event.target.style.height = `${event.target.scrollHeight}px`;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit();
          }}
        />
        {image && (
          <div className="composer-preview">
            <img src={image} alt="Selected photo preview" />
            <button type="button" className="icon-btn on-image" onClick={() => setImage(undefined)} aria-label="Remove photo">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        <div className="composer-bar">
          <button type="button" className="ghost-btn" onClick={() => fileRef.current?.click()}>
            <Icon name="image" />
            Photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => pickImage(event.target.files?.[0])}
          />
          <span className={`counter ${remaining < 0 ? 'is-over' : remaining < 50 ? 'is-near' : ''}`}>
            {remaining < 100 ? remaining : ''}
          </span>
          <button type="submit" className="primary-btn" disabled={!canPost}>
            Post
          </button>
        </div>
      </div>
    </form>
  );
}
