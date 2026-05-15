/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  // Force light-only on web as well.
  // Keep the hook signature the same for callers.
  return 'light';
}
