import Bottleneck from 'bottleneck';

// Create a global rate limiter with bottleneck using reservoir strategy
// This strictly limits to 3 requests per second as per AMap API requirements
export const weatherApiLimiter = new Bottleneck({
  reservoir: 3, // initial "tokens"
  reservoirRefreshAmount: 3, // tokens to add each refresh
  reservoirRefreshInterval: 1000, // refresh every 1000ms (1 second)
  maxConcurrent: 1, // process at most 1 request concurrently
  minTime: 333 // at least 333ms between requests (1000ms/3)
});

// We can remove the exponential backoff function since bottleneck handles rate limiting
// Remove fetchWithBackoff function

export default weatherApiLimiter;
