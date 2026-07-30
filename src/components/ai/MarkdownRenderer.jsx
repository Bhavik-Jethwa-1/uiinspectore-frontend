/**
 * Shared MarkdownRenderer — used by ALL AI modules.
 * Import once, use everywhere.
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import { useState, useRef, useEffect } from 'react';
import { Copy, CheckCheck } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

/* ── Inline code ── */
function InlineCode({ children }) {
  return (
    <code
      className="px-1.5 py-0.5 rounded-md text-[13px] font-mono"
      style={{ background: 'rgba(124,92,255,0.12)', color: '#c4b5fd' }}
    >
      {children}
    </code>
  );
}

/* ── Code block with copy button ── */
function CodeBlock({ children, className }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  useEffect(() => {
    if (ref.current && match) {
      ref.current.innerHTML = children;
      hljs.highlightElement(ref.current);
    }
  }, [children, match]);

  const copy = () => {
    navigator.clipboard.writeText(String(children)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group rounded-xl overflow-hidden my-2" style={{ background: '#0d1117' }}>
      {match && (
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderBottom: '1px solid #21262d' }}
        >
          <span className="text-[11px] font-medium" style={{ color: '#8b949e' }}>
            {match[1]}
          </span>
          <button
            onClick={copy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-all"
            style={{ color: copied ? '#3fb950' : '#8b949e' }}
          >
            {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code ref={ref} className={className}>{children}</code>
      </pre>
    </div>
  );
}

/* ── Main Markdown renderer ── */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }) {
          const isInline =
            !className &&
            !String(children).includes('\n') &&
            String(children).length < 60;

          if (isInline) return <InlineCode {...props}>{children}</InlineCode>;
          return (
            <CodeBlock className={className}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
              style={{ color: '#9d7aff' }}
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table
                className="w-full text-sm border-collapse"
                style={{ border: '1px solid #2a2a35' }}
              >
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th
              className="text-left px-3 py-2 text-xs font-semibold"
              style={{ background: '#1a1a26', color: '#9090a8', borderBottom: '1px solid #2a2a35' }}
            >
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td
              className="px-3 py-2"
              style={{ color: '#d0d0e0', borderBottom: '1px solid #2a2a35' }}
            >
              {children}
            </td>
          );
        },
        ul({ children }) {
          return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
        },
        blockquote({ children }) {
          return (
            <blockquote
              className="border-l-4 pl-4 my-3 italic"
              style={{ borderColor: '#7c5cff', color: '#9090a8' }}
            >
              {children}
            </blockquote>
          );
        },
        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2" style={{ color: '#f0f0fa' }}>{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2" style={{ color: '#f0f0fa' }}>{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1" style={{ color: '#f0f0fa' }}>{children}</h3>,
        h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1" style={{ color: '#e0e0f0' }}>{children}</h4>,
        p: ({ children }) => <p className="my-2 leading-relaxed" style={{ color: '#e0e0f0' }}>{children}</p>,
        strong: ({ children }) => <strong style={{ color: '#f0f0fa' }}>{children}</strong>,
        em: ({ children }) => <em style={{ color: '#c0c0d0' }}>{children}</em>,
        hr: () => <hr className="my-4" style={{ borderColor: '#2a2a35' }} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
