import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Dark theme for code highlighting

interface StyledTextProps {
  text: string;
}

const StyledText: React.FC<StyledTextProps> = ({ text }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const createCalloutBlock = (label: string, body: string) => {
    const normalizedLabel = label.trim();
    const tone = /warning|alert/i.test(normalizedLabel)
      ? 'warning'
      : /important/i.test(normalizedLabel)
        ? 'important'
        : /tip|remember/i.test(normalizedLabel)
          ? 'success'
          : 'info';

    return `
      <div class="content-callout content-callout-${tone}">
        <div class="content-callout-label">${normalizedLabel}</div>
        <div class="content-callout-body">${body.trim()}</div>
      </div>
    `;
  };

  const normalizeCallouts = (html = '') =>
    html
      .replace(
        /<p>\s*(?:<strong>|<b>)(Note|Important|Warning|Tip|Info|Remember|Key Point|Takeaway|Alert)\s*:?\s*(?:<\/strong>|<\/b>)\s*([\s\S]*?)<\/p>/gi,
        (_match, label, body) => createCalloutBlock(label, body)
      )
      .replace(
        /<p>\s*(Note|Important|Warning|Tip|Info|Remember|Key Point|Takeaway|Alert)\s*:\s*([\s\S]*?)<\/p>/gi,
        (_match, label, body) => createCalloutBlock(label, body)
      );

  const normalizedText = normalizeCallouts(
    text?.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
      const languageClass = lang ? ` class="language-${lang}"` : '';
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre><code${languageClass}>${escapedCode}</code></pre>`;
    })
  );

  useEffect(() => {
    if (contentRef.current) {
      // Apply syntax highlighting to all code blocks
      contentRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [normalizedText]);

  return (
    <div ref={contentRef} className="styled-content">
      <style>{`
        .styled-content {
          line-height: 1.8;
          color: hsl(var(--foreground));
          font-size: 1.02rem;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .styled-content > *:first-child {
          margin-top: 0 !important;
        }

        /* Headings */
        .styled-content h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1.25rem;
          background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.6));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid hsl(var(--primary) / 0.2);
        }

        @media (min-width: 768px) {
          .styled-content h1 {
            font-size: 2.25rem;
            margin-top: 3rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 3px solid hsl(var(--primary) / 0.2);
          }
        }

        .styled-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: hsl(var(--primary));
          padding: 0.75rem 1rem;
          border: 1px solid hsl(var(--primary) / 0.18);
          border-left: 4px solid hsl(var(--primary));
          border-radius: 0.75rem;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--background)));
          box-shadow: 0 8px 24px -18px hsl(var(--primary) / 0.55);
        }

        @media (min-width: 768px) {
          .styled-content h2 {
            font-size: 1.875rem;
            margin-top: 2.5rem;
            margin-bottom: 1.25rem;
            padding: 1rem 1.25rem;
            border-left: 6px solid hsl(var(--primary));
            border-radius: 1rem;
          }
        }

        .styled-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--foreground));
          position: relative;
          padding: 0.7rem 0.75rem 0.7rem 2.2rem;
          border: 1px solid hsl(var(--border));
          border-radius: 0.75rem;
          background: hsl(var(--muted) / 0.35);
        }

        @media (min-width: 768px) {
          .styled-content h3 {
            font-size: 1.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            padding: 0.9rem 1rem 0.9rem 2.8rem;
            border-radius: 0.9rem;
          }
        }

        .styled-content h3::before {
          content: '▶';
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--primary));
          font-size: 0.875rem;
        }

        .styled-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: hsl(var(--muted-foreground));
        }

        /* Paragraphs */
        .styled-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
        }

        .styled-content h2 + p,
        .styled-content h3 + p,
        .styled-content h4 + p {
          padding-left: 0.25rem;
        }

        /* Lists */
        .styled-content ul {
          margin: 1.5rem 0;
          padding-left: 2rem;
          list-style: none;
        }

        .styled-content ul li {
          position: relative;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
        }

        .styled-content ul li::before {
          content: '●';
          position: absolute;
          left: 0;
          color: hsl(var(--primary));
          font-weight: bold;
          font-size: 1.2em;
        }

        .styled-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
          counter-reset: list-counter;
          list-style: none;
        }

        .styled-content ol li {
          position: relative;
          margin-bottom: 0.75rem;
          padding-left: 2.5rem;
          counter-increment: list-counter;
        }

        .styled-content ol li::before {
          content: counter(list-counter) '.';
          position: absolute;
          left: 0;
          color: hsl(var(--primary));
          font-weight: 700;
          font-size: 1.1em;
          min-width: 2rem;
        }

        /* Nested lists */
        .styled-content ul li ul,
        .styled-content ol li ol,
        .styled-content ul li ol,
        .styled-content ol li ul {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        /* Code blocks - Enhanced separation */
        .styled-content pre {
          background: linear-gradient(135deg, #0f172a 0%, #111827 100%);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-left: 5px solid #3b82f6;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2.5rem 0;
          overflow-x: auto;
          box-shadow: 0 12px 24px -8px rgb(15 23 42 / 0.35);
          position: relative;
          white-space: pre;
        }

        .styled-content pre::before {
          content: 'CODE';
          position: absolute;
          top: 0.5rem;
          right: 0.75rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(148, 163, 184, 0.75);
          letter-spacing: 0.1em;
        }

        .styled-content pre code {
          background: transparent;
          padding: 0;
          font-size: 0.9rem;
          line-height: 1.6;
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          color: #e5eefb;
          display: block;
          white-space: pre;
          word-break: normal;
          overflow-wrap: normal;
          tab-size: 2;
        }

        .styled-content pre .hljs {
          background: transparent;
          color: #e5eefb;
        }

        .styled-content pre .hljs-keyword,
        .styled-content pre .hljs-selector-tag,
        .styled-content pre .hljs-literal,
        .styled-content pre .hljs-section,
        .styled-content pre .hljs-link {
          color: #ff7ab6;
        }

        .styled-content pre .hljs-title,
        .styled-content pre .hljs-title.function_,
        .styled-content pre .hljs-function .hljs-title,
        .styled-content pre .hljs-attr,
        .styled-content pre .hljs-selector-id,
        .styled-content pre .hljs-selector-class {
          color: #82aaff;
        }

        .styled-content pre .hljs-string,
        .styled-content pre .hljs-meta .hljs-string,
        .styled-content pre .hljs-regexp,
        .styled-content pre .hljs-template-string {
          color: #c3e88d;
        }

        .styled-content pre .hljs-number,
        .styled-content pre .hljs-symbol,
        .styled-content pre .hljs-bullet,
        .styled-content pre .hljs-variable,
        .styled-content pre .hljs-template-variable {
          color: #f78c6c;
        }

        .styled-content pre .hljs-comment,
        .styled-content pre .hljs-quote {
          color: #7f8c98;
          font-style: italic;
        }

        .styled-content pre .hljs-built_in,
        .styled-content pre .hljs-type,
        .styled-content pre .hljs-class .hljs-title {
          color: #ffd166;
        }

        .styled-content pre .hljs-params,
        .styled-content pre .hljs-property,
        .styled-content pre .hljs-operator,
        .styled-content pre .hljs-punctuation {
          color: #d6deeb;
        }

        /* Inline code - Better distinction */
        .styled-content code {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          padding: 0.25rem 0.6rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          font-weight: 600;
          border: 1px solid hsl(var(--primary) / 0.3);
          white-space: pre-wrap;
          word-break: break-all;
        }

        /* Prevent inline code inside pre from getting double styling */
        .styled-content pre code {
          background: transparent;
          padding: 0;
          border: none;
          white-space: pre;
        }

        /* Blockquotes */
        .styled-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          background: hsl(var(--muted) / 0.4);
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
        }

        .styled-content blockquote p {
          margin: 0;
        }

        .styled-content .content-callout {
          margin: 1.75rem 0;
          border-radius: 1rem;
          border: 1px solid hsl(var(--border));
          border-left-width: 5px;
          padding: 1rem 1.1rem;
          background: linear-gradient(135deg, hsl(var(--muted) / 0.55), hsl(var(--background)));
          box-shadow: 0 18px 32px -26px hsl(var(--foreground) / 0.3);
        }

        .styled-content .content-callout-label {
          display: inline-flex;
          align-items: center;
          margin-bottom: 0.7rem;
          padding: 0.35rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .styled-content .content-callout-body > :last-child {
          margin-bottom: 0;
        }

        .styled-content .content-callout-info {
          border-color: hsl(206 90% 60% / 0.28);
          border-left-color: hsl(204 94% 44%);
          background: linear-gradient(135deg, hsl(204 100% 97%), hsl(var(--background)));
        }

        .styled-content .content-callout-info .content-callout-label {
          background: hsl(204 94% 44% / 0.12);
          color: hsl(204 94% 34%);
        }

        .dark .styled-content .content-callout-info {
          background: linear-gradient(135deg, hsl(217 54% 11%), hsl(var(--background)));
        }

        .styled-content .content-callout-important {
          border-color: hsl(32 95% 56% / 0.28);
          border-left-color: hsl(32 95% 44%);
          background: linear-gradient(135deg, hsl(38 100% 96%), hsl(var(--background)));
        }

        .styled-content .content-callout-important .content-callout-label {
          background: hsl(32 95% 44% / 0.14);
          color: hsl(25 95% 32%);
        }

        .dark .styled-content .content-callout-important {
          background: linear-gradient(135deg, hsl(30 45% 12%), hsl(var(--background)));
        }

        .styled-content .content-callout-warning {
          border-color: hsl(0 84% 60% / 0.22);
          border-left-color: hsl(0 72% 51%);
          background: linear-gradient(135deg, hsl(0 86% 97%), hsl(var(--background)));
        }

        .styled-content .content-callout-warning .content-callout-label {
          background: hsl(0 72% 51% / 0.12);
          color: hsl(0 72% 41%);
        }

        .dark .styled-content .content-callout-warning {
          background: linear-gradient(135deg, hsl(0 42% 13%), hsl(var(--background)));
        }

        .styled-content .content-callout-success {
          border-color: hsl(158 64% 40% / 0.24);
          border-left-color: hsl(158 84% 32%);
          background: linear-gradient(135deg, hsl(151 81% 96%), hsl(var(--background)));
        }

        .styled-content .content-callout-success .content-callout-label {
          background: hsl(158 84% 32% / 0.12);
          color: hsl(158 84% 24%);
        }

        .dark .styled-content .content-callout-success {
          background: linear-gradient(135deg, hsl(158 42% 12%), hsl(var(--background)));
        }

        /* Links */
        .styled-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-decoration-color: hsl(var(--primary) / 0.3);
          text-underline-offset: 0.25rem;
          transition: all 0.2s ease;
        }

        .styled-content a:hover {
          text-decoration-color: hsl(var(--primary));
          color: hsl(var(--primary) / 0.8);
        }

        /* Tables */
        .styled-content table {
          display: block;
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .styled-content th {
          background: hsl(var(--muted));
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid hsl(var(--border));
        }

        .styled-content td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid hsl(var(--border));
        }

        .styled-content tr:last-child td {
          border-bottom: none;
        }

        .styled-content tr:hover {
          background: hsl(var(--muted) / 0.3);
        }

        /* Strong/Bold */
        .styled-content strong {
          font-weight: 700;
          color: hsl(var(--primary));
        }

        /* Emphasis/Italic */
        .styled-content em {
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        /* Horizontal rule */
        .styled-content hr {
          margin: 2rem 0;
          border: none;
          border-top: 2px solid hsl(var(--border));
          opacity: 0.6;
        }

        /* Images */
        .styled-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        /* Keyboard keys */
        .styled-content kbd {
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-size: 0.875em;
          font-family: monospace;
          box-shadow: 0 1px 0 hsl(var(--border));
        }

        /* Mark/Highlight */
        .styled-content mark {
          background: hsl(var(--primary) / 0.2);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: normalizedText }} />
    </div>
  );
};

export default StyledText;
