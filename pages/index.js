import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import FormCard from "@/components/FormCard";
import { UserContext } from "@/contexts/UserContext";

export default function Home() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [posts, setPosts] = useState([]);
    const [friendList, setFriendList] = useState([]);
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

        const fetchFriends = async () => {
            try {
                if (session?.user?.id) {
                    const { data, error } = await supabase
                        .from('friends')
                        .select()
                        .eq('id', session.user.id)
                        .eq('is_friend', true);

                    if (error) {
                        console.error('Error fetching friends:', error.message);
                    } else if (data.length) {
                        setFriendList(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching friends:', error.message);
            }
        };

        fetchProfile();
        fetchFriends();
    }, [session?.user?.id]);

    useEffect(() => {
        supabase
          .from("posts")
          .select('id, song, description, artist, genre, album, popularity, artwork_url, created_at, profiles(id, avatar, username)')
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
            <FormCard />
            {posts?.length > 0 && posts.filter(post => {
                return post.profiles.id === session.user.id || friendList.some(friend => friend.friend_id === post.author);
            }).map(post => (
                <PostCard song={post.song} artist={post.artist} genre={post.genre} album={post.album} popularity={post.popularity} artworkUrl={post.artwork_url} key={post.created_at} {...post} />
            ))}
          </div>
          </UserContext.Provider>
        </Layout>
    );
}
