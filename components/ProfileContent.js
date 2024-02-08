import { useEffect, useState } from "react";
import Card from "./Card";
import Avatar from "./Avatar";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PostCard from "./PostCard";

export default function ProfileContent({activeTab, userId}) {
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [friendList, setFriendList] = useState([]);
    const [about, setAbout] = useState('');
    const [editMode, setEditMode] = useState(false);
    const session = useSession();
    const supabase = useSupabaseClient();
    
    useEffect(() => {
        if (!userId) {
            return;
        }
        fetchUser();
        fetchFriends();
        if (activeTab === 'posts') {
            loadPosts().then(() => {})
        }
    },  [userId])

    function fetchUser() {
      supabase.from("profiles")
        .select()
        .eq('id', userId)
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          if (result.data) {
            setProfile(result.data[0]);
            loadPosts();
          }
      });
    }

    function fetchFriends() {
      supabase.from("friends")
        .select('profiles!friends_following_fkey(id, avatar, name, username)')
        .eq('id', userId)
        .eq('is_friend', true)
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          if (result.data) {
            setFriendList(result.data);
          }
      });
    }

    async function loadPosts() {
        const posts = await userPosts(userId);
        const profile = await userProfile(userId);
        setPosts(posts);
        setProfile(profile);
    }

    async function userPosts(userId) {
        const {data} = await supabase
          .from('posts')
          .select('id, song, description, artist, genre, album, popularity, created_at, artwork_url, profiles(id, avatar, username)')
          .eq('author', userId)
          .eq('parent', 0)
          .order('created_at', {ascending: false})
        return data;    
    }
    
    async function userProfile(userId) {
        const {data} = await supabase
          .from('profiles')
          .select()
          .eq('id', userId)
        return data[0];
    }

    function saveAbout() {
      supabase.from("profiles")
      .update({about})
      .eq('id', session.user.id)
      .then(result => {
        if (result.error) {
          alert('Maximum character length exceeded.');
        }
        if (!result.error) {
          setAbout(prev => ({...prev, about}));
        }
        fetchUser();
        setEditMode(false);
      });

    }

    return (
      <div>
        { activeTab === 'posts' && (
          <div>
            {posts?.length > 0 && posts.map(post => (
                <PostCard {...post} song={post.song} artist={post.artist} genre={post.genre} album={post.album} popularity={post.popularity} artworkUrl={post.artwork_url} key={post.created_at} {...post} />
            ))}
          </div>
        )}
        { activeTab === 'about' && (
          <div>
            <Card>
              <div className="flex">
                <h2 className="text-xl mb-4">About Me</h2>
                <div className="ml-auto mb-auto">
                  {session?.user?.id === userId && !editMode && (
                    <button onClick={() => {
                        setEditMode(true);
                        setAbout(profile?.about);
                    }}
                        className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex mx-1 gap-1">
                      Edit
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  )}
                  {session?.user?.id === userId && editMode && (
                    <button onClick={saveAbout}
                        onChange={ev => setAbout(ev.target.value)}
                        className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex mx-1 gap-1">
                      Save
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  )}
                  {session?.user?.id === userId && editMode && (
                    <button onClick={() => setEditMode(false)} className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex gap-1 mt-4">
                      Cancel
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  </div>
              </div>
              {editMode && (
                <div>
                  <textarea 
                    className="border py-2 px-3 rounded-md w-full mt-3"
                    placeholder="Set an About Me"
                    value={about}
                    onChange={ev => setAbout(ev.target.value)}
                    rows={4}
                  />
                </div>
              )}
              {!editMode && (
                  <h3 className="">
                  {profile?.about?.length > 0 ? profile?.about : "This user has not set an About Me"}
                </h3>
              )}
            </Card>
          </div>
        )}
        { activeTab === 'friends' && (
          <div>
            <Card>
              <h2 className="text-xl mb-2">Friends</h2>
              {friendList.length > 0 && (
                friendList.map(friend => (
                  <a href={`/profile/${friend.profiles.id}`}>
                    <div key={friend.profiles.id} className="border-b border-b-gray-100 p-4 -mx-4 hover:bg-blue-200 hover:rounded-xl">
                      <div className="flex gap-3">
                        <Avatar url={friend.profiles.avatar} />
                        <div>
                          <h3 className="font-semibold text-md">{friend.profiles.name}</h3>
                          <div className="text-xs leading-3">{friend.profiles.username}</div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </Card>
          </div>
        )}
      </div>
    );
}