'use client'

import Layout from "../components/Layout";
import Card from "../components/Card";
import Avatar from "../components/Avatar";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import { UserContextProvider } from "@/contexts/UserContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cover from "@/components/Cover";
import ProfileTabs from "@/components/ProfileTabs";
import ProfileContent from "@/components/ProfileContent";

export default function ProfilePage() {
    const router = useRouter();
    const userId = router.query.id;
    const tab = router?.query?.tab?.[0] || 'posts'; 
    const supabase = useSupabaseClient();
    const session = useSession();
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    const isMyUser = userId === session?.user?.id;

    useEffect(() => {
      if (!userId) {
        return;            
      }

      fetchUser();
    }, [userId])

    useEffect(() => {
      if (profile) {
        fetchFriend();
      }
    }, [profile]);
      
    function fetchUser() {
      supabase.from("profiles")
      .select()
      .eq('id', userId)
      .then(result => {
        if (result.error) {
          throw result.error;
        }
        if (result.data) {
          setProfile(result?.data[0]);
        }
      });
    }

    function saveProfile() {
      supabase.from("profiles")
      .update({name, username})
      .eq('id', session.user.id)
      .then(result => {
        if (result.error) {
          alert('This username is already taken.');
        }
        if (!result.error) {
          setProfile(prev => ({...prev, name, username}));
        }
        setEditMode(false);
      });
    }

    useEffect(() => {
    }, [isFriend]);

    function fetchFriend() {
      supabase.from("friends")
        .select()
        .eq('id', session?.user?.id)
        .eq('following', profile?.id)
        .then(result => {
          if (result?.data?.length > 0) {
            setIsFriend(result.data[0].is_friend); // Set isFriend based on friend status
            setIsPending(result.data[0].is_pending); // Set isPending based on pending status
          } else {
            setIsFriend(false);
            setIsPending(false); // Reset isFriend and isPending if no friend data is found
          }
        });
    }
    

    function addFriend() {
      supabase.from("friends")
        .update({is_friend: true})
        .eq('id', profile?.id)
        .eq('following', session?.user?.id)
        .then(() => {
          supabase.from("friends")
            .insert({
              id: session.user.id,
              following: profile.id,
              is_friend: true
            })
            .then((result) => {
              console.log(result);
              fetchFriend();
              setIsPending(true);
            });
        });
    }
    

    function removeFriend() {
      supabase.from("friends")
        .delete()
        .eq('id', session?.user?.id)
        .eq('following', profile?.id)
        .then(() => {
          setIsFriend(false);
          setIsPending(false);
        })

      supabase.from("friends")
        .update({is_friend:false})
        .eq('id', profile?.id)
        .eq('following', session?.user?.id)
        .then(() => {})
    }

    useEffect(() => {
        supabase
          .from("posts")
          .select('id, song, description, created_at, profiles(id, avatar, username)')
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
        <UserContextProvider value={{}}>
        <Card noPadding={true}>
        <div className="relative overflow-hidden rounded-md">
            <div className="border-b border-b-black">
              <Cover url={profile?.cover} editable={isMyUser} onChange={fetchUser} />
            </div>
            <div className="absolute top-40 left-4 z-20">
              {profile && (
                <Avatar url={profile?.avatar} size={'lg'} editable={isMyUser} onChange={fetchUser} />
              )}
            </div>
            <div className="p-4 pb-0">
              <div className="ml-28 mt-3 flex justify-between">
                <div>
                    {editMode && (
                      <div>
                        <input type="text" 
                          className="border py-2 px-3 rounded-md" 
                          placeholder="Your name" 
                          value={name} 
                          onChange={ev => setName(ev.target.value)} />
                      </div>
                    )}
                    {!editMode && (
                        <h1 className="text-2xl font-bold">
                        {profile?.name}
                      </h1>
                    )}
                    {!editMode && (
                      <div className="text-sm text-gray-500 leading-4 mt-1 ml-1">{profile && (profile.username)}</div>
                    )}
                    {editMode && (
                      <div>
                      <input type="text" 
                        className="border py-2 px-3 rounded-md mt-1" 
                        placeholder="Your username" 
                        value={username} 
                        onChange={ev => setUsername(ev.target.value)} />
                      </div>
                    )}
                </div>
                <div className="grow">
                  <div className="text-right">
                  {!isMyUser && isPending && !isFriend && (
                    <button onClick={() => {
                        removeFriend();
                    }}
                        className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex mx-1 gap-1">
                      Pending
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                    </button>
                  )}
                  {!isMyUser && isFriend && (
                    <button onClick={() => {
                        removeFriend();
                    }}
                        className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex mx-1 gap-1">
                      Remove Friend
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                    </button>
                  )}
                  {!isMyUser && !isFriend && !isPending && (
                    <button onClick={() => {
                        addFriend();
                    }}
                        className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex mx-1 gap-1">
                      Add Friend
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                    </button>
                  )}
                  {isMyUser && !editMode && (
                    <button onClick={() => {
                        setEditMode(true); 
                        setName(profile.name);
                        setUsername(profile.username);
                    }}
                        className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex mx-1 gap-1">
                      Edit profile
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                  )}
                  {isMyUser && editMode && (
                    <button onClick={saveProfile} className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex gap-1">
                      Save
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  )}
                  {isMyUser && editMode && (
                    <button onClick={() => setEditMode(false)} className="bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2 inline-flex gap-1 mt-4">
                      Cancel
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  </div>
                </div>
              </div>
              <ProfileTabs active={tab} userId={profile?.id} />
            </div>
        </div>
        </Card>
        <ProfileContent userId={userId} activeTab={tab} />
        </UserContextProvider>
      </Layout>
    );
  }