import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

export default function Header({ hide }) {
  const supabase = useSupabaseClient();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm.trim() === "") {
      // If the search term is empty, do not fetch any users
      setUsers([]);
    } else {
      // If there is a search term, fetch users whose name or username matches the search term
      supabase
        .from("profiles")
        .select("id, avatar, name, username")
        .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .then((result) => {
          setUsers(result.data);
        });
    }
  }, [searchTerm]);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="flex items-center bg-emerald-300 px-4 relative">
      <div className="flex items-center">
        <img src={"/logo.png"} className="size-20" alt="Logo" />
        <h1 className="text-gray-700 ml-1">安慰JAM</h1>
      </div>
      <div className="flex-grow flex items-center justify-center mr-10 relative">
        {!hide && (
          <input
            type="text"
            placeholder="Search users by name or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-full w-1/3 bg-gray-200 focus:outline-none focus:ring focus:border-emerald-400"
          />
        )}
        {/* Display search results */}
        {users.length > 0 && (
          <div className="absolute bg-white border border-gray-200 rounded-lg shadow-md py-1 w-64 top-full mt-1">
            {users.map((user) => (
              <Link href={"/profile/"+user.id}>
              <div key={user.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex gap-3">
                <Avatar url={user.avatar} />
                <div>
                  <p>{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.username}</p>
                </div>
              </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="text-gray-700 w-1/8 flex">
        {!hide && (
          <button
            onClick={logout}
            className="flex gap-2 py-2 px-3 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white hover:scale-110"
          >
            Logout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
              />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
