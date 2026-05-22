import ReactMarkdown from 'react-markdown';

/** Gemini often returns `* **Venue**` inline; ensure list markers start on their own line. */
export function normalizeAssistantMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/([^\n*])\s+(\*\s+)/g, '$1\n\n$2')
    .replace(/([^\n-])\s+(-\s+)/g, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc pl-5 space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal pl-5 space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-playo-green font-medium hover:underline"
    >
      {children}
    </a>
  ),
};

export default function ChatMarkdown({ content, className = '' }) {
  if (!content?.trim()) return null;
  return (
    <div className={`ai-chat-markdown ${className}`.trim()}>
      <ReactMarkdown components={components}>{normalizeAssistantMarkdown(content)}</ReactMarkdown>
    </div>
  );
}
