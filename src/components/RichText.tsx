export default function RichText({ text, onTag }: { text: string; onTag: (tag: string) => void }) {
  const parts = text.split(/(#[\p{L}\d_]+)/u);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('#') ? (
          <button key={index} type="button" className="tag" onClick={() => onTag(part.slice(1).toLowerCase())}>
            {part}
          </button>
        ) : (
          part
        ),
      )}
    </>
  );
}
