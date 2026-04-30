/**
 * Speakable Browser Extension — Content Script
 *
 * Runs on every page. Listens for messages from the popup
 * and responds with the page's HTML for analysis.
 */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_PAGE_HTML') {
    const html = document.documentElement.outerHTML;
    const selector = message.selector || null;

    if (selector) {
      // Return only matching elements' outerHTML
      try {
        const elements = document.querySelectorAll(selector);
        const fragments = Array.from(elements).map((el) => el.outerHTML);
        sendResponse({
          success: true,
          html: fragments.join('\n'),
          url: window.location.href,
          title: document.title,
          elementCount: elements.length,
        });
      } catch (err) {
        sendResponse({
          success: false,
          error: `Invalid selector: ${selector}`,
        });
      }
    } else {
      sendResponse({
        success: true,
        html,
        url: window.location.href,
        title: document.title,
      });
    }
  }

  // Return true to indicate async response
  return true;
});
