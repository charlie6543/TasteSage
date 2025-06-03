// Get the base URL for API calls based on environment
export const getApiBaseUrl = () => {
  // In production (like Vercel), use the deployed URL
  if (import.meta.env.PROD) {
    // In production, we use relative URLs since the API is on the same domain
    return '';
  }
  // In development, use the local server
  return '';
};

// Helper function to build API URLs
export const apiUrl = (path: string) => {
  return `${getApiBaseUrl()}${path}`;
}; 