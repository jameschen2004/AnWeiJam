import Card from "@/components/Card";
import Layout from "@/components/Layout";
import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";

export default function AboutPage() {
  const session = useSession();

  if (!session) {
    return <LoginPage />
  }

  return (
      <Layout>
        <Card>
          <h2 className="font-semibold">Privacy Policy:</h2>
          <h3 className="text-sm">Spotify data has been taken in order to track the top songs and artists that you have listened to.
            Only email data is saved onto the database. If you would like to delete your account, please email me with the email address you would like to delete.
          </h3>
        </Card>
      </Layout>
    );
}