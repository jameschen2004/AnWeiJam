import { useEffect, useState } from 'react';
import axios from 'axios';
import Card from "./Card";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function SpotifyStats() {
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [topSongs, setTopSongs] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const session = useSession();
  const token = session?.provider_token;
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session?.expires_in && session.expires_in < 60) {
        supabase.auth.refreshSession();
        fetchTopArtists();
        fetchTopSongs();
      }
    }, [session, supabase]);

  useEffect(() => {
      axios.get(`https://api.spotify.com/v1/me`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
      })
      .then(response => {
      setSpotifyProfile(response.data);
      })
      .catch(error => {
      console.error('Error fetching Spotify profile:', error);
      });
  }, [token]);

  useEffect(() => {
    fetchTopSongs();
    fetchTopArtists();
  },  [token])

  const fetchTopSongs = async () => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/me/top/tracks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const uniqueSongsAndArtists = new Set();
      const filteredSongs = response.data.items.filter((song) => {
        const key = `${song.name}-${song.artists[0].name}`;
        const isDuplicate = uniqueSongsAndArtists.has(key);
        uniqueSongsAndArtists.add(key);
        return !isDuplicate;
      });

      const top10Songs = filteredSongs.slice(0, 10);
      setTopSongs(top10Songs);
    } catch (error) {
      console.log('Error retrieving top songs:', error);
    }
  };

  const fetchTopArtists = async () => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/me/top/artists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const uniqueArtists = new Set();
      const filteredArtists = response.data.items.filter((artist) => {
        const key = artist.name;
        const isDuplicate = uniqueArtists.has(key);
        uniqueArtists.add(key);
        return !isDuplicate;
      });

      const top5Artists = filteredArtists.slice(0, 5);
      setTopArtists(top5Artists);
    } catch (error) {
      console.log('Error retrieving top artists:', error);
    }
  };

  return (
    <div className="w-1/4 min-h-1000">
      <Card>
        <div className="flex gap-2 justify-center">
          <h2 className="text-md mb-3 py-1 text-green-500 font-bold">Stats provided by Spotify</h2>
          <img src="/Spotify_Icon.png" alt="Spotify Icon" className="w-8 h-8" />
        </div>
        {spotifyProfile && (
          <div className='justify-center items-center mx-auto'>
            <p className="font-semibold">Display Name: {spotifyProfile.display_name}</p>
            <p className='font-semibold'>Spotify ID: {spotifyProfile.id}</p>
          </div>
        )}
        {topSongs?.length > 0 && (
          <div className='space-y-1'>
            <h3 className="text-lg font-semibold mt-4">Top 10 Songs:</h3>
            <ul className='text-sm items-center space-y-3'>
              {topSongs.map((song, index) => (
                <li key={index}>
                  <span className="font-semibold">{song.name}</span> by {song.artists[0].name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {topArtists?.length > 0 && (
          <div className='space-y-1'>
            <h3 className="text-lg font-semibold mt-4">Top 5 Artists:</h3>
            <ul className='text-sm items-center space-y-3'>
              {topArtists.map((artist, index) => (
                <li key={index}>
                  <span className="font-semibold">{artist.name}</span>
                  <br />
                  {artist.genres && artist.genres.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
        {topSongs?.length === 0 && (
          <div className='mt-3 text-sm'>
            You have not listened to any songs yet!
          </div>
        )}
      </Card>
    </div>
  );
}
