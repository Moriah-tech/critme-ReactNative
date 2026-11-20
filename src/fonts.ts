import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';

/** Loads Inter (body), Space Grotesk (names, numbers) and Sora (feed tabs, CritMe title). Returns true once they are ready (or failed, so the app still opens). */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Sora_600SemiBold,
    Sora_700Bold,
  });
  return loaded || !!error;
}
