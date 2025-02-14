import { CheckCircle, Calendar, Link as LinkIcon, GraduationCap, Book } from 'lucide-react';
import { useEffect, useState } from 'react';
import {User} from "../components/User"
import { Post } from '../components/Post';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ProfileBody {
    bio?: string;
    graduationYear?: string;
    department?: string;
    minor?: string;
    linkedin?: string;
    github?: string;
}

interface UserBody {
    firstName?: string;
    lastName?: string;
}

interface FollowingBody {
    following?: string[];
    followers?: string[];
    count?: number;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<ProfileBody | null>(null);
    const [user, setUser] = useState<UserBody | null>(null);
    const [posts, setPosts] = useState([])
    const [users, setUsers] = useState([])
    const [following, setFollowing] = useState<FollowingBody | null>(null);
    const [followers, setFollowers] = useState<FollowingBody | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/signin');

        axios.get('https://uni-networking-app.onrender.com/api/v1/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setProfile(response.data.profile));

        axios.get('https://uni-networking-app.onrender.com/api/v1/user/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setUser(response.data.user));

        axios.get('https://uni-networking-app.onrender.com/api/v1/follow/following', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setFollowing(response.data));

        axios.get('https://uni-networking-app.onrender.com/api/v1/follow/followers', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setFollowers(response.data));

        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/bulk/?minor=${profile?.minor}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setUsers(response.data.users)
        })
        axios.get("https://uni-networking-app.onrender.com/api/v1/post/userAll",{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            setPosts(response.data.posts)
        })

    }, [profile?.minor, following, followers]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex p-8 space-x-8">
            {/* Left Profile Section */}
            <div className="w-1/3 bg-gray-800 rounded-lg p-6 overflow-auto">
                {/* Profile Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <img
                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-gray-800"
                        />
                    </div>
                    <button
                        onClick={() => {
                            navigate("/updateProfile")
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                        Edit Profile
                    </button>
                </div>
    
                <div className="mt-6">
                    <h2 className="text-2xl font-bold">
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-400">@{user?.firstName?.toLowerCase()}</p>
                    <div className="flex justify-center items-center text-gray-400 gap-40 mt-2">
                        <div>
                            <p className="text-lg font-bold">{followers?.count}</p>
                            <p className="text-xs">Followers</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold">{following?.count}</p>
                            <p className="text-xs">Following</p>
                        </div>
                    </div>
    
                    <p className="mt-7 text-gray-300">{profile?.bio}</p>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center text-gray-400">
                            <GraduationCap className="w-5 h-5 mr-2" />
                            <p>{profile?.department} ({profile?.graduationYear})</p>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <Book className="w-5 h-5 mr-2" />
                            <p>Minor in {profile?.minor}</p>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <LinkIcon className="w-5 h-5 mr-2" />
                            <a
                                href={profile?.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500"
                            >
                                LinkedIn
                            </a>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <LinkIcon className="w-5 h-5 mr-2" />
                            <a
                                href={profile?.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
    
            {/* Posts Section */}
            <div className="flex-1 bg-gray-800 rounded-lg p-6 overflow-auto">
                <h3 className="text-xl font-bold mb-6">Your Posts</h3>
                <div>
                    {posts.map((post) => (
                        <Post post={post}></Post>
                    ))}
                </div>
            </div>
    
            {/* Right Sidebar (Followers Section) */}
            <div className="w-95 bg-gray-800 rounded-lg p-6 h-screen sticky top-0 overflow-y-auto">
                <h3 className="text-xl font-bold mt-6 mb-4">You might like</h3>
                <div className="flex flex-col justify-center gap-2">
                    {users?.map((user: any) => (
                        <User user={user}></User>
                    ))}
                </div>
            </div>
        </div>
    );
    
};

export default ProfilePage;