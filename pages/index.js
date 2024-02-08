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
    const [followList, setFollowList] = useState([]);
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

        const fetchFollow = async () => {
            try {
                if (session?.user?.id) {
                    const { data, error } = await supabase
                        .from('followers')
                        .select()
                        .eq('user_id', session.user.id);

                    if (error) {
                        console.error('Error fetching following:', error.message);
                    } else if (data.length) {
                        setFollowList(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching following:', error.message);
            }
        };

        fetchProfile();
        fetchFollow();
    }, [session?.user?.id]);

    useEffect(() => {
        supabase
          .from("posts")
          .select('id, song, song_id, description, artist, artist_id, genre, album, album_id, popularity, artwork_url, created_at, profiles(id, avatar, username)')
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
            <UserContext.Provider value={{ profile }}>
                <div className="items-center">
                    <FormCard />
                    {posts?.length > 0 &&
                        posts
                            .filter((post) => {
                                const isCurrentUserPost = post.profiles.id === session.user.id;
                                let isFollowingPost = false;
                                for (let i = 0; i < followList.length; i++) {
                                    if (followList[i].following === post.profiles.id) {
                                        isFollowingPost = true;
                                        break;
                                    }
                                }
                                return isCurrentUserPost || isFollowingPost;
                            })
                            .map((post) => (
                                <PostCard
                                    song={post.song}
                                    song_id={post.song_id}
                                    artist={post.artist}
                                    artist_id={post.artist_id}
                                    genre={post.genre}
                                    album={post.album}
                                    album_id={post.album_id}
                                    popularity={post.popularity}
                                    artworkUrl={post.artwork_url}
                                    key={post.created_at}
                                    {...post}
                                />
                            ))}
                </div>
            </UserContext.Provider>
        </Layout>
    );
}
