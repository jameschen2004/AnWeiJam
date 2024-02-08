import React, { useContext } from 'react';
import Card from "./Card";
import Avatar from './Avatar';
import { UserContext } from '@/contexts/UserContext';

export default function FormCard() {

    const {profile} = useContext(UserContext);

    return (
        <Card>
            <div className="flex items-center justify-between">
                <Avatar url={profile?.avatar} size={'md'} />
                <div className='flex flex-col items-center'>
                    <div className='text-xl font-semibold'>
                        {`Welcome back, ${profile?.username}!`}
                    </div>
                </div>
                <img src={"Spotify_Icon.png"} alt="Spotify Logo" className="w-16 h-16"></img>
            </div>
        </Card>
    );
}
