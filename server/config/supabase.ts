import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://apexlbtxgewjesqewdtw.supabase.co';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0cWL8rZcoTKtVTj54-tkgw_8Vm69hRP';

// Polyfill globalThis.WebSocket for Node < 22 environments / Metro bundling
if (typeof globalThis.WebSocket === 'undefined') {
  if (typeof window !== 'undefined' && window.WebSocket) {
    globalThis.WebSocket = window.WebSocket;
  } else {
    class DummyWebSocket {}
    (globalThis as any).WebSocket = DummyWebSocket;
  }
}

console.log("SUPABASE URL:", supabaseUrl);
console.log(
  "SUPABASE KEY:",
  supabasePublishableKey
    ? "CLAVE DETECTADA"
    : "CLAVE NO DETECTADA"
);

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      ...(Platform.OS !== 'web'
        ? { storage: AsyncStorage }
        : {}),

      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}