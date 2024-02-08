import Layout from "../components/Layout";
import Card from "../components/Card";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function LoginPage() {

  const supabase = useSupabaseClient();
  
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.provider_token) {
      window.localStorage.setItem('oauth_provider_token', session.provider_token)
    }

    if (session && session.provider_refresh_token) {
      window.localStorage.setItem('oauth_provider_refresh_token', session.provider_refresh_token)
    }

    if (event === 'SIGNED_OUT') {
      window.localStorage.removeItem('oauth_provider_token')
      window.localStorage.removeItem('oauth_provider_refresh_token')
    }
  })


  const loginWithSpotify = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: 'user-top-read user-read-playback-state', 
      },
    });
  };

  return (
    <Layout hideContent={true}>
      <div className="h-screen flex items-center">
        <div className="max-w-xs mx-auto grow -mt-48">
          <h1 className="text-6xl mb-4 text-gray-300 text-center">Login</h1>
          <Card noPadding={true}>
            <div className="rounded-md mt-8">
              <button onClick={loginWithSpotify} className="flex w-full gap-4 items-center justify-center p-4 hover:font-semibold hover:bg-blue-300 hover:rounded-md transition-all hover:scale-110">
                <img src={"/Spotify_Icon.png"} alt="Spotify Logo" className="w-8 h-8"></img>           
                Login with Spotify
              </button>
            </div>
          </Card>
          <div className="text-gray-500 mt-10 text-center"> {/* Add margin-top here */}
            <h3 className="">If you do not have an account, you may use these login credentials:</h3>
            <ul>
              <li className="mt-1">Email: t65007913@gmail.com</li>
              <li>Password: V@M2cBk7fZMHp7P</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
