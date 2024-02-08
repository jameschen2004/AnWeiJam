import Card from "../components/Card";
import Layout from "../components/Layout";
import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import Select from "react-select";
import axios from "axios";

export default function CreatePage() {
    const [description, setDescription] = useState("");
    const [song, setSong] = useState("");
    const supabase = useSupabaseClient();
    const session = useSession();
    const token = session?.provider_token;
    const [options, setOptions] = useState([]);
    const [selectKey, setSelectKey] = useState(0);

    const searchTracks = async (query) => {
        try {
          const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              q: query,
              type: 'track',
            },
          });

          const searchData = response.data.tracks.items.map((track) => ({
            value: track.id,
            label: `${track.name} - ${track.artists.map((artist) => artist.name).join(', ')}`,
            songTitle: track.name
          }));

          setOptions(searchData);
        } catch (error) {
            console.error('Error searching Spotify:', error);
        }
    };

    const handleInputChange = (query) => {
        if (query.length >= 1) {
            searchTracks(query);
        }
    };
      

    if (!session) {
        return <LoginPage />;
    }

    async function createPost() {
        try {
            // Get the selected option from options based on the chosen song
            const selectedOption = options.find(option => option.songTitle === song);

            const response = await axios.get(`https://api.spotify.com/v1/tracks/${selectedOption.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const song_id = response.data.id;
            const artist = response.data.artists.map(artist => artist.name).join(', ');
            const artist_id = response.data.artists.map(artist => artist.id).join(', ');
            const genre = response.data.genres; 
            const album = response.data.album.name;
            const album_id = response.data.album.id;
            const popularity = response.data.popularity;
            const artworkUrl = response.data.album.images[0]?.url;

            const insertResponse = await supabase
                .from("posts")
                .insert({
                    author: session.user.id,
                    song,
                    song_id,
                    description,
                    artist,
                    artist_id,
                    genre,
                    album,
                    album_id,
                    popularity,
                    artwork_url: artworkUrl
                });
    
            if (!insertResponse.error) {
                setDescription('');
                setSong('');
                setSelectKey(prevKey => prevKey + 1);
                alert('Post created!');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
        }
    }
    

    function handleSubmit(event) {
        event.preventDefault(); 
        if (song === "") {
            alert("Please choose a song.");
            return;
        }
        createPost();
    }

    return (
        <Layout>
            <Card>
                <div className="container mx-auto mt-2 flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-4 text-green-500">Create Post</h1>
                    <form className="w-full max-w-sm" onSubmit={handleSubmit}>
                        <div className="mb-4 flex items-center">
                        <Select
                        key={selectKey}
                        options={options}
                        placeholder="Select a song"
                        className="grow"
                        maxMenuHeight={300}
                        onInputChange={handleInputChange}
                        onChange={(selectedOption) => setSong(selectedOption?.songTitle || '')}
                        />
                            <img src="../Spotify_Icon.png" className="w-8 h-8 ml-2" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium bold text-gray-700">Post Description</label>
                            <textarea
                                name="description"
                                placeholder='Create a Description'
                                className="mt-1 p-2 border rounded-md w-full h-40"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </Card>
        </Layout>
    );
}
