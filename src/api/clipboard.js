/**
 * Copy text to clipboard (with fallback)
 */
export async function copyToClipboard(text) {
  const isSecure = typeof window !== 'undefined'
    ? (window.isSecureContext || window.location.hostname === 'localhost')
    : true;

  if (!isSecure) {
    return { success: false, error: 'Clipboard unavailable in insecure context' };
  }

  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      // Fall through to legacy method
    }
  }

  // Fallback: hidden textarea method
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


