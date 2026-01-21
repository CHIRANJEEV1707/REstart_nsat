/**
 * Comprehensive LaTeX/Math text formatter for question display
 * Converts LaTeX notation to HTML for rendering in React components
 */

// Greek letter mappings
const GREEK_LETTERS: Record<string, string> = {
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    // Uppercase
    '\\Gamma': 'Γ',
    '\\Delta': 'Δ',
    '\\Theta': 'Θ',
    '\\Lambda': 'Λ',
    '\\Xi': 'Ξ',
    '\\Pi': 'Π',
    '\\Sigma': 'Σ',
    '\\Phi': 'Φ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω',
};

// Math operators and symbols
const MATH_SYMBOLS: Record<string, string> = {
    '\\times': '×',
    '\\div': '÷',
    '\\pm': '±',
    '\\mp': '∓',
    '\\cdot': '·',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\neq': '≠',
    '\\approx': '≈',
    '\\equiv': '≡',
    '\\infty': '∞',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\forall': '∀',
    '\\exists': '∃',
    '\\in': '∈',
    '\\notin': '∉',
    '\\subset': '⊂',
    '\\supset': '⊃',
    '\\cup': '∪',
    '\\cap': '∩',
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\leftrightarrow': '↔',
    '\\therefore': '∴',
    '\\because': '∵',
    '\\angle': '∠',
    '\\triangle': '△',
    '\\degree': '°',
    '\\circ': '°',
    '\\sqrt': '√',
    '\\sum': '∑',
    '\\prod': '∏',
    '\\int': '∫',
    // Trig functions (will be handled as text)
    '\\sin': 'sin',
    '\\cos': 'cos',
    '\\tan': 'tan',
    '\\cot': 'cot',
    '\\sec': 'sec',
    '\\csc': 'csc',
    '\\log': 'log',
    '\\ln': 'ln',
    '\\exp': 'exp',
    '\\lim': 'lim',
};

/**
 * Convert LaTeX fraction notation to readable format
 * Handles: \frac{a}{b}, {a \over b}, a/b patterns
 */
function processFractions(text: string): string {
    let result = text;

    // Handle \frac{numerator}{denominator}
    result = result.replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '($1)/($2)');

    // Handle {numerator \over denominator} - common in LaTeX
    result = result.replace(/\{([^}]+)\s*\\over\s*([^}]+)\}/g, '($1)/($2)');

    // Handle simple a \over b (outside braces)
    result = result.replace(/(\S+)\s*\\over\s*(\S+)/g, '($1)/($2)');

    return result;
}

/**
 * Convert LaTeX square root notation
 * Handles: \sqrt{x}, \sqrt[n]{x}
 */
function processSquareRoots(text: string): string {
    let result = text;

    // Handle \sqrt[n]{x} (nth root)
    result = result.replace(/\\sqrt\s*\[([^\]]+)\]\s*\{([^}]+)\}/g, '∛$2'); // simplified

    // Handle \sqrt{x}
    result = result.replace(/\\sqrt\s*\{([^}]+)\}/g, '√($1)');

    // Handle simple \sqrt followed by number or parentheses
    result = result.replace(/\\sqrt\s*\(([^)]+)\)/g, '√($1)');
    result = result.replace(/\\sqrt\s*(\d+)/g, '√$1');

    return result;
}

/**
 * Process superscripts and subscripts
 */
function processScripts(text: string): string {
    let result = text;

    // Handle ^{exponent}
    result = result.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');

    // Handle ^single_char (like x^2)
    result = result.replace(/\^(\d+)/g, '<sup>$1</sup>');
    result = result.replace(/\^([a-zA-Z])/g, '<sup>$1</sup>');

    // Handle _{subscript}
    result = result.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');

    // Handle _single_char
    result = result.replace(/_(\d+)/g, '<sub>$1</sub>');
    result = result.replace(/_([a-zA-Z])/g, '<sub>$1</sub>');

    return result;
}

/**
 * Process vectors and special notations
 */
function processVectors(text: string): string {
    let result = text;

    // Handle \overrightarrow{X} (vector notation)
    result = result.replace(/\\overrightarrow\s*\{?([A-Za-z]+)\}?/g, '<span style="text-decoration: overline;">$1</span>→');

    // Handle \vec{x}
    result = result.replace(/\\vec\s*\{([^}]+)\}/g, '<span style="text-decoration: overline;">$1</span>→');

    // Handle \widehat{x} (unit vector)
    result = result.replace(/\\widehat\s*\{?([a-zA-Z])\}?/g, '$1̂');

    // Handle \bar{x}
    result = result.replace(/\\bar\s*\{([^}]+)\}/g, '<span style="text-decoration: overline;">$1</span>');

    return result;
}

/**
 * Clean up LaTeX delimiters and spacing
 */
function cleanDelimiters(text: string): string {
    let result = text;

    // Remove $$ delimiters (display math)
    result = result.replace(/\$\$/g, '');

    // Remove $ delimiters (inline math)
    result = result.replace(/\$/g, '');

    // Remove \[ \] delimiters
    result = result.replace(/\\\[/g, '');
    result = result.replace(/\\\]/g, '');

    // Remove \( \) delimiters
    result = result.replace(/\\\(/g, '');
    result = result.replace(/\\\)/g, '');

    // Clean up \, \; \: \! (LaTeX spacing)
    result = result.replace(/\\[,;:!]/g, ' ');

    // Clean up \mkern (kerning)
    result = result.replace(/\\mkern\s*\d+mu/g, ' ');

    // Clean up \left \right
    result = result.replace(/\\left/g, '');
    result = result.replace(/\\right/g, '');

    // Clean up \text{...}
    result = result.replace(/\\text\s*\{([^}]+)\}/g, '$1');

    // Clean up \mathrm{...}, \mathbf{...}, etc
    result = result.replace(/\\math[a-z]+\s*\{([^}]+)\}/g, '$1');

    return result;
}

/**
 * Process HTML tags in text
 */
function processHtmlTags(text: string): string {
    let result = text;

    // Ensure <br> tags work
    result = result.replace(/<br\s*\/?>/gi, '<br/>');

    // Preserve <sup> and <sub> tags
    // (already handled, just ensure they're valid)

    // Convert \n to <br/>
    result = result.replace(/\\n/g, '<br/>');
    result = result.replace(/\n/g, '<br/>');

    return result;
}

/**
 * Main function to format LaTeX/math text for HTML display
 * @param text - The raw question or option text with LaTeX
 * @returns HTML-safe string with math symbols rendered
 */
export function formatMath(text: string): string {
    if (!text) return '';

    let result = text;

    // Step 1: Process fractions first (they're complex)
    result = processFractions(result);

    // Step 2: Process square roots
    result = processSquareRoots(result);

    // Step 3: Process vectors and special notations
    result = processVectors(result);

    // Step 4: Replace Greek letters
    for (const [latex, symbol] of Object.entries(GREEK_LETTERS)) {
        // Use word boundaries to avoid partial replacements
        const regex = new RegExp(latex.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g');
        result = result.replace(regex, symbol);
    }

    // Step 5: Replace math symbols
    for (const [latex, symbol] of Object.entries(MATH_SYMBOLS)) {
        const regex = new RegExp(latex.replace(/\\/g, '\\\\') + '(?![a-zA-Z])', 'g');
        result = result.replace(regex, symbol);
    }

    // Step 6: Process superscripts and subscripts
    result = processScripts(result);

    // Step 7: Clean up delimiters
    result = cleanDelimiters(result);

    // Step 8: Process HTML tags
    result = processHtmlTags(result);

    // Step 9: Clean up excess whitespace
    result = result.replace(/\s+/g, ' ').trim();

    return result;
}

/**
 * Alias for backward compatibility
 */
export const formatQuestionText = formatMath;

export default formatMath;
