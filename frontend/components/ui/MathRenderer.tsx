'use client';

import { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
    text: string;
    className?: string;
    inline?: boolean;
}

/**
 * Renders text with LaTeX math expressions using KaTeX
 * Supports: $...$, $$...$$, \(...\), \[...\]
 * Also auto-detects bare LaTeX patterns like \frac, \sqrt, etc.
 */
export function MathRenderer({ text, className = '', inline = false }: MathRendererProps) {
    const rendered = useMemo(() => renderMath(text), [text]);

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    );
}

/**
 * Utility function to render math in text
 * Handles multiple LaTeX delimiter formats AND auto-wraps bare LaTeX
 * Supports: $...$, $$...$$, \(...\), \[...\], <inlineMath>...</inlineMath>, <blockMath>...</blockMath>
 */
export function renderMath(text: string): string {
    if (!text) return '';

    try {
        let result = text;

        // Decode HTML entities first (e.g., &lt;inlineMath&gt; -> <inlineMath>)
        result = result
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&nbsp;/g, ' ')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');

        // Handle <inlineMath>...</inlineMath> tags (from NSAT questions)
        result = result.replace(/<inlineMath>([\s\S]*?)<\/inlineMath>/g, (match, formula) => {
            try {
                return katex.renderToString(formula.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        // Handle <blockMath>...</blockMath> tags
        result = result.replace(/<blockMath>([\s\S]*?)<\/blockMath>/g, (match, formula) => {
            try {
                return katex.renderToString(formula.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        // First, check if the text has any delimiters already
        const hasDelimiters = /\$|\\\[|\\\(/.test(result);

        // If no delimiters but contains LaTeX commands, wrap the whole thing
        // CRITICAL FIX: Do NOT auto-wrap if the text looks like HTML (contains tags), 
        // as this breaks questions that are full HTML strings.
        const hasHtmlTags = /<[a-z][\s\S]*>/i.test(result);

        if (!hasDelimiters && !hasHtmlTags && /\\(frac|sqrt|sum|int|alpha|beta|gamma|delta|theta|lambda|pi|infty|cdot|times|div|pm|leq|geq|neq|left|right)/.test(result)) {
            // Wrap the entire text as inline math
            try {
                return katex.renderToString(result, {
                    displayMode: false,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                // If KaTeX fails, return original text
                return result;
            }
        }

        // Handle display math \[...\] - match literal \[ and \]
        result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
            try {
                return katex.renderToString(formula.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        // Handle inline math \(...\) - match literal \( and \)
        result = result.replace(/\\\(([\s\S]*?)\\\)/g, (match, formula) => {
            try {
                return katex.renderToString(formula.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        // Handle display math $$...$$
        result = result.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula.trim(), {
                    displayMode: true,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        // Handle inline math $...$
        result = result.replace(/\$([^$]+)\$/g, (match, formula) => {
            try {
                return katex.renderToString(formula.trim(), {
                    displayMode: false,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        // Handle bare LaTeX environments \begin{...} ... \end{...}
        result = result.replace(/\\begin\{([a-zA-Z0-9\*]+)\}([\s\S]*?)\\end\{\1\}/g, (match, env, content) => {
            try {
                return katex.renderToString(match, {
                    displayMode: false,
                    throwOnError: false,
                    strict: false
                });
            } catch {
                return match;
            }
        });

        return result;
    } catch (error) {
        console.error('renderMath error:', error);
        return text;
    }
}

export default MathRenderer;
