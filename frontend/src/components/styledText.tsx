import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Dark theme for code highlighting

interface StyledTextProps {
  text: string;
}

const StyledText: React.FC<StyledTextProps> = ({ text }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Apply syntax highlighting to all code blocks
      contentRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [text]);

  return (
    <div ref={contentRef} className="styled-content">
      <style>{`
        .styled-content {
          line-height: 1.8;
          color: hsl(var(--foreground));
        }

        /* Headings */
        .styled-content h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.6));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid hsl(var(--primary) / 0.2);
        }

        .styled-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          color: hsl(var(--primary));
          padding-left: 1rem;
          border-left: 4px solid hsl(var(--primary));
        }

        .styled-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: hsl(var(--foreground));
          position: relative;
          padding-left: 1.5rem;
        }

        .styled-content h3::before {
          content: '▶';
          position: absolute;
          left: 0;
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
          background: hsl(var(--muted));
          border: 2px solid hsl(var(--primary) / 0.2);
          border-left: 5px solid hsl(var(--primary));
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2.5rem 0;
          overflow-x: auto;
          box-shadow: 0 8px 16px -4px rgb(0 0 0 / 0.15);
          position: relative;
          background-image: linear-gradient(to bottom right, hsl(var(--muted)), hsl(var(--muted) / 0.8));
        }

        .styled-content pre::before {
          content: 'CODE';
          position: absolute;
          top: 0.5rem;
          right: 0.75rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: hsl(var(--primary) / 0.5);
          letter-spacing: 0.1em;
        }

        .styled-content pre code {
          background: transparent;
          padding: 0;
          font-size: 0.9rem;
          line-height: 1.8;
          font-family: 'Fira Code', 'Courier New', Courier, monospace;
          color: hsl(var(--foreground));
          display: block;
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
          white-space: nowrap;
        }

        /* Prevent inline code inside pre from getting double styling */
        .styled-content pre code {
          background: transparent;
          padding: 0;
          border: none;
          white-space: pre-wrap;
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
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          overflow: hidden;
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
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
};

export default StyledText;