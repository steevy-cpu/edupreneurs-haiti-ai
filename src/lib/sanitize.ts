import DOMPurify from 'dompurify';

/**
 * Security: XSS Protection Configuration
 * 
 * This configuration provides a secure-by-default sanitization for educational content.
 * It allows common HTML tags for formatting while blocking dangerous elements and attributes.
 * 
 * OWASP Reference: XSS Prevention
 * https://owasp.org/www-community/xss-filter-evasion-cheatsheet
 */
export const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    // Text formatting
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small',
    // Lists
    'ul', 'ol', 'li',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Tables
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'caption', 'colgroup', 'col',
    // Media and links
    'img', 'a', 'figure', 'figcaption',
    // Structure
    'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav',
    // Code
    'code', 'pre', 'blockquote', 'kbd', 'samp', 'var',
    // Other
    'sup', 'sub', 'hr', 'abbr', 'address', 'cite', 'dfn', 'time', 'details', 'summary',
    // Math rendering (for KaTeX)
    'math', 'mi', 'mo', 'mn', 'mrow', 'msup', 'msub', 'mfrac', 'msqrt', 'mroot', 
    'mover', 'munder', 'munderover', 'mtable', 'mtr', 'mtd', 'mtext', 'mspace',
    // Definition lists
    'dl', 'dt', 'dd',
  ],
  ALLOWED_ATTR: [
    // Core attributes
    'href', 'src', 'alt', 'title', 'class', 'id', 'name',
    // Styling (limited)
    'style', 'width', 'height',
    // Tables
    'colspan', 'rowspan', 'scope', 'headers',
    // Links
    'target', 'rel',
    // Images
    'loading', 'decoding',
    // Language
    'lang', 'dir',
    // Time
    'datetime',
  ],
  // Explicitly forbid dangerous elements
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 
    'select', 'textarea', 'style', 'link', 'meta', 'base', 'template',
    'canvas', 'svg', 'audio', 'video', 'source', 'track', 'applet',
    'frame', 'frameset', 'noframes', 'noscript', 'portal'
  ],
  // Explicitly forbid dangerous attributes (event handlers)
  FORBID_ATTR: [
    'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
    'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
    'onmouseenter', 'onmouseleave', 'oncontextmenu', 'ondrag', 'ondragend',
    'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop',
    'onscroll', 'oncopy', 'oncut', 'onpaste', 'onwheel', 'ontouchstart',
    'ontouchmove', 'ontouchend', 'ontouchcancel', 'onpointerdown',
    'onpointermove', 'onpointerup', 'onpointercancel', 'onpointerenter',
    'onpointerleave', 'onpointerover', 'onpointerout', 'ongotpointercapture',
    'onlostpointercapture', 'formaction', 'xlink:href', 'xmlns'
  ],
  // Allow data attributes
  ALLOW_DATA_ATTR: true,
  // Return string instead of TrustedHTML
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (dirty: string | undefined | null): string => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG) as string;
};

/**
 * Sanitize HTML and return it for use with dangerouslySetInnerHTML
 * 
 * @param dirty - The potentially unsafe HTML string
 * @returns Object suitable for dangerouslySetInnerHTML
 */
export const createSanitizedMarkup = (dirty: string | undefined | null): { __html: string } => {
  return { __html: sanitizeHtml(dirty) };
};
