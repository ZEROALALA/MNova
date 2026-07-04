const TITLE_ID = '75517'; // Replace with env var if needed, e.g., import.meta.env.VITE_PLAYFAB_TITLE_ID

// Extract global PlayFab objects loaded from CDN in index.html
const PlayFab = window.PlayFab || {};
const PlayFabClient = window.PlayFabClientAPI || {};

// Initialize PlayFab configuration
if (PlayFab.settings) {
  PlayFab.settings.titleId = TITLE_ID;
}

// Helper to wrap PlayFab callbacks in Promises
export const playFabPromisify = (apiMethod, request) => {
  return new Promise((resolve, reject) => {
    if (!apiMethod) {
      return reject(new Error('PlayFab API method not found. Is the CDN script loaded?'));
    }
    apiMethod(request, (result, error) => {
      // PlayFab callback signature is sometimes (result, error) or (error, result).
      // Actually, official docs say it's (result, error) where error is the second param if result is null,
      // but in some SDK versions it's (error, result). Let's handle both.
      if (error) {
        console.error('PlayFab Error:', error);
        reject(error);
      } else if (result && result.code !== 200) {
        console.error('PlayFab Error Result:', result);
        reject(result);
      } else {
        resolve(result?.data || result);
      }
    });
  });
};

export { PlayFab, PlayFabClient };
