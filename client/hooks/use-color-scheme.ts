// Force a light-only color scheme for the app.
// Returning a constant keeps behavior consistent across platforms and
// avoids the complexity of toggles or system-based theming.
export function useColorScheme(): 'light' {
	return 'light';
}
