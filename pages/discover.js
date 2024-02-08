import Layout from "../components/Layout";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import Card from "@/components/Card";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { UserContext } from "@/contexts/UserContext";

export default function DiscoverPage() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (session?.user?.id) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select()
                        .eq('id', session.user.id);

                    if (error) {
                        console.error('Error fetching profile:', error.message);
                    } else if (data.length) {
                        setProfile(data[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error.message);
            }
        };

        fetchProfile();
    }, [session?.user?.id]);

    useEffect(() => {
        supabase
          .from("posts")
          .select('id, song, description, artist, genre, album, popularity, created_at, artwork_url, profiles(id, avatar, username)')
          .eq('parent', 0)
          .order('created_at', {ascending: false})
          .then(result => {
            setPosts(result.data);
          })
    }, []);

    if (!session) {
        return <LoginPage />
    }

    return (
        <Layout>
          <UserContext.Provider value={{profile}}>
          <div className="items-center">
            <Card>
              Discover Other People's Posts!
            </Card>
            {posts?.length > 0 && posts.map(post => (
                <PostCard song={post.song} artist={post.artist} genre={post.genre} album={post.album} popularity={post.popularity} artworkUrl={post.artwork_url} key={post.created_at} {...post} />
            ))}
          </div>
          </UserContext.Provider>
        </Layout>
    );
}