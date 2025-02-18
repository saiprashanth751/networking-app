import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import { GraduationCap, Book, Link as LinkIcon } from 'lucide-react';
import { Post } from "../components/Post";

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

export default function Profile() {
    const { id } = useParams();
    const [profile, setProfile] = useState<ProfileBody | null>(null);
    const [user, setUser] = useState<UserBody | null>(null);
    const [following, setFollowing] = useState<FollowingBody | null>(null);
    const [followers, setFollowers] = useState<FollowingBody | null>(null);
    interface PostBody {
        id: string;
        // Add other properties of a post here
    }

    const [posts, setPosts] = useState<PostBody[]>([]); // State for posts


    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
        }

        // Fetch profile data
        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/nativeProfile/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setProfile(response.data.profile);
        });

        // Fetch user data
        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/userProfile/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setUser(response.data.user);
        });

        // Fetch following and followers data
        axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowing/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setFollowing(response.data);
        });

        axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowers/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setFollowers(response.data);
        });

        // Fetch user's posts
        axios.get(`https://uni-networking-app.onrender.com/api/v1/post/${id}`).then((response) => {
            setPosts(response.data.posts);
        });

    }, [id, navigate]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex p-8 space-x-8">
            {/* Left Profile Section */}
            <div className="w-1/3 bg-gray-800 rounded-lg p-6">
                {/* Profile Header */}
                <div className="flex items-start justify-between">
                    {/* Profile Picture */}
                    <div>
                        <img
                            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                            alt="Profile"
                            className="w-24 h-24 rounded-full border-4 border-gray-800"
                        />
                    </div>

                    {/* Back Button */}
                    <Link
                        to="/dashboard"
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                    >
                        Back
                    </Link>
                </div>

                {/* Profile Details */}
                <div className="mt-6">
                    <div className="flex items-center gap-9">
                        <h2 className="text-2xl font-bold">
                            {user?.firstName} {user?.lastName}
                        <p className="text-gray-400 text-sm">@{user?.firstName?.toLowerCase()}</p>
                        </h2>
                        <Link
                            to={`/messaging/${id}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg "
                        >
                            Message
                        </Link>
                    </div>
                    {/* Followers and Following Counts */}
                    <div className="flex justify-center items-center text-gray-400 gap-40 mt-4">
                        <div>
                            <p className="text-lg font-bold text-center">{followers?.count}</p>
                            <p className="text-xs">Followers</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-center">{following?.count}</p>
                            <p className="text-xs">Following</p>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-7 text-gray-300">{profile?.bio}</p>

                    {/* Additional Profile Info */}
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
            <div className="flex-1 bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Posts</h3>
                <div className="space-y-6">
                    {posts?.map((post) => {
                        return <Post post={post} />
                    })}
                </div>
            </div>
        </div>
    );
}