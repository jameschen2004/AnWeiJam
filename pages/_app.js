import "@/styles/globals.css";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json'

TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

export default function App({ Component, pageProps }) {
  
  const [supabaseClient] = useState(() => createPagesBrowserClient({supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY}))
  const session = useSession();

  useEffect(() => {
    const refresh = async () => {
      try {
        const { data, error } = await supabaseClient.auth.api.refreshAccessToken();
        if (error) {
          console.error("Error refreshing token:", error.message);
        } else {
          console.log("Token refreshed successfully:", data);
        }
      } catch (error) {
        console.error("Error refreshing token:", error.message);
      }
    };

    if (session?.expires_in && session.expires_in < 60) {
      refresh();
    }
  }, [session]);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
