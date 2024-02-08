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
          <h2 className="font-semibold">About the Creator:</h2>
          <h3 className="text-sm">{`:)`}</h3>
        </Card>
      </Layout>
    );
}