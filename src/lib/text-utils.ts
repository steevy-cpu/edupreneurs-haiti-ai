/** Strip HTML tags and extract plain text */
export const stripHtmlToText = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
};
