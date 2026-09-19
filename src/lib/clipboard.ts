/**
 * Robust cross-browser and iframe-safe clipboard copy utility.
 * Handles restricted iframe permissions policies, non-HTTPS contexts,
 * and mobile touch selection.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof text !== 'string') return false;

  const cleanText = text.trim();

  // 1. Try modern navigator.clipboard API
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(cleanText);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText restricted or failed, falling back to execCommand:', err);
    }
  }

  // 2. Reliable fallback: temporary textarea with document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = cleanText;
    
    // Prevent zooming and scrolling on mobile devices
    textArea.style.fontSize = '12pt';
    textArea.style.border = '0';
    textArea.style.padding = '0';
    textArea.style.margin = '0';
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return true;
    }
  } catch (err) {
    console.error('execCommand copy fallback failed:', err);
  }

  return false;
}
