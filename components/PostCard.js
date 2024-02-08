import Card from "./Card";
import Avatar from "./Avatar";

import Link from "next/link";
import ReactTimeAgo from "react-time-ago";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function PostCard({id, song, artist, genre, album, popularity, description, created_at, artworkUrl, profiles:authorProfile}) {
  const {profile:myProfile} = useContext(UserContext);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const supabase = useSupabaseClient();
  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [])
  
  function fetchLikes() {
    supabase
      .from('likes')
      .select()
      .eq('post_id', id)
      .then(result => setLikes(result.data));
  }

  function fetchComments() {
    supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('parent', id)
      .then(result => setComments(result.data))
  }

  const isLikedByMe = !!likes?.find(like => like.user_id === myProfile.id);

  function toggleLike() {
    if (isLikedByMe) {
      supabase
      .from('likes')
      .delete()
      .eq('post_id', id)
      .eq('user_id', myProfile.id)
      .then(fetchLikes())
      return;
    }
    supabase
      .from('likes')
      .insert({post_id: id, user_id: myProfile.id})
      .then(fetchLikes())
  }

  function postComment(ev) {
    ev.preventDefault();
    supabase
      .from('posts')
      .insert({
        author: myProfile.id,
        description: commentText,
        parent: id
      })
      .then((result) => {
        console.log(result);
        fetchComments();
        setCommentText('');
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
      });
  }

  function deletePost() {
    supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .then();

    supabase
      .from('posts')
      .delete()
      .eq('parent', id)
      .then(() => {window.location.reload()})
  }

  function deleteComment({postId, createdAt}) {
    supabase
      .from('posts')
      .delete()
      .eq('parent', postId)
      .eq('created_at', createdAt)
      .then(fetchComments())
  }

  return (
    <Card>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Link href={'/profile/'+authorProfile.id}>
            <span className="cursor-pointer">
              <Avatar url={authorProfile?.avatar} />
            </span>
          </Link>
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <Link href={'/profile/'+authorProfile.id}>
                <span className="font-semibold hover:underline cursor-pointer">
                  {authorProfile?.username}
                </span> 
              </Link>
              <span className="ml-1">shared a post</span>
            </div>
            {(authorProfile?.id === myProfile?.id) && (
              <button onClick={() => deletePost()} className="rounded-md hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            <ReactTimeAgo date={Date.parse(created_at)} locale="en-US"/>
          </p>
        </div>
      </div>
      <div className="my-3">
        <p>{description}</p>
      </div>
      <div className="flex gap-3 items-center my-3">
        <div className="w-1/2 h-[200px]">
          <img
            src={artworkUrl ? artworkUrl : "../Empty_Artwork.png"}
            alt="Post Image"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-1/2 flex flex-col items-center mb-3">
          <p className="text-xl font-bold mb-3">{song}</p>
          <div className="flex items-center mb-3">
            <p className="text-sm font-semibold mb-2">Spotify Details</p>
            <img src="/Spotify_Icon.png" className="ml-2 mb-1 w-6 h-6"></img>
          </div>
          <ul className="list-disc pl-5">
            <li>Artist: {artist}</li>
            {genre &&
              <li>Genre: {genre}</li>}
            <li>Album: {album}</li>
            <li>Popularity: Top {popularity}%</li>
          </ul>
        </div>
      </div>
      <div className="mt-5 flex gap-8">
        <button onClick={toggleLike} className={"flex gap-2 items-center"} >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"w-6 h-6 " + (isLikedByMe ? 'fill-red-500' : '')} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          {likes?.length}
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          {comments?.length}
        </button>
        <button className="flex gap-2 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          0
        </button>
      </div>
      <div className="flex mt-4 gap-3">
        <div className="flex-shrink-0">
          <Avatar url={myProfile?.avatar} />
        </div>
        <div className="flex-grow rounded-full">
          <form onSubmit={postComment}>
          <input 
            value={commentText}
            onChange={ev => setCommentText(ev.target.value)}
            className="block w-full p-2 px-4 h-9 text-sm border rounded-full" placeholder="Leave a Comment" />
          </form>
        </div>
      </div>
      <div>
        {comments?.length > 0 && comments.map(comment => (
          <div key={comment.id} className="mt-2 flex gap-2 items-center">
          <Avatar url={comment.profiles.avatar} />
          <div className="bg-green-100 py-2 px-4 rounded-3xl flex-grow relative">
            <div className="flex items-center gap-2">
              <Link href={'profile/' + comment.profiles.id}>
                <span className="hover:underline font-semibold ml-1">
                  {comment.profiles.username}<br />
                </span>
              </Link>
              <span className="text-sm text-gray-400">
                <ReactTimeAgo timeStyle={'twitter'} date={(new Date(comment.created_at)).getTime()} />
              </span>
              {(comment.profiles.id === myProfile.id) && (<button onClick={() => deleteComment({postId:comment.parent, createdAt:comment.created_at})} className="rounded-md hover:text-blue-600 ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>)}
            </div>
            <div className="flex gap-2 items-center justify-between ml-1">
              <p className="text-sm">{comment.description}</p>
            </div>
          </div>
        </div>
        
        ))}
      </div>
    </Card>
  );
}
