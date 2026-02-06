import { Redirect } from 'expo-router';

// This screen is never shown — the tab press is intercepted to open the Add Customer modal.
export default function AddPlaceholder() {
  return <Redirect href="/(tabs)" />;
}
