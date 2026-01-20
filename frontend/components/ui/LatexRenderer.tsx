'use client';

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LatexRendererProps {
    content: string;
    className?: string;
}

/**
 * Renders text with embedded LaTeX.
 * Supports both inline ($$...$$) and block ($$...$$) LaTeX.
 * Also handles HTML entities like &lt; &gt; &amp;
 */
export default function LatexRenderer({ content, className }: LatexRendererProps) {
    if (!content) return null;

    // First, decode HTML entities
    let decoded = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<br\s*\/?>/gi, '\n');

    // Remove HTML tags except for basic formatting
    decoded = decoded.replace(/<\/?(p|div|span)[^>]*>/gi, '');

    // Split by $$ delimiters (LaTeX blocks)
    const parts = decoded.split(/(\$\$[^$]+\$\$)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                // Check if this part is LaTeX
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    const latex = part.slice(2, -2).trim();
                    try {
                        // Use InlineMath for shorter expressions, BlockMath for longer ones
                        if (latex.includes('\\begin') || latex.length > 100) {
                            return <BlockMath key={index} math={latex} />;
                        }
                        return <InlineMath key={index} math={latex} />;
                    } catch (e) {
                        // If KaTeX fails, show raw text
                        console.warn('KaTeX render error:', e);
                        return <code key={index} className="text-red-500">{latex}</code>;
                    }
                }
                // Regular text
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
}
