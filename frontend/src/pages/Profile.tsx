import { Link as LinkIcon, GraduationCap, Book } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Post } from '../components/Post';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

interface ProfileBody {
    bio?: string;
    graduationYear?: string;
    department?: string;
    minor?: string;
    linkedin?: string;
    github?: string;
    leetcode?: string;
    codeforces?: string;
    geekforgeeks?: string;
    profilePic?: string;
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
    const { id } = useParams();
    const [profile, setProfile] = useState<ProfileBody | null>(null);
    const [user, setUser] = useState<UserBody | null>(null);
    const [posts, setPosts] = useState([]);
    const [following, setFollowing] = useState<FollowingBody | null>(null);
    const [followers, setFollowers] = useState<FollowingBody | null>(null);
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();

    
    const fetchFollowStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `https://uni-networking-app.onrender.com/api/v1/follow/?id=${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setIsFollowing(response.data.following);
        } catch (error) {
            console.error("Failed to fetch follow status:", error);
        }
    };

    
    const toggleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!isFollowing) {
                await axios.post(
                    `https://uni-networking-app.onrender.com/api/v1/follow/?id=${id}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                await axios.delete(
                    `https://uni-networking-app.onrender.com/api/v1/follow/?id=${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
        }
    };

    const fetchLeetCodeStats = async (username: string) => {
        try {
            const response = await axios.get(`https://leetcard.jacoblin.cool/${username}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch LeetCode stats:", error);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/signin');

        setLoading(true);
        setError("");

        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/nativeProfile/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(async (response) => {
            const profileData = response.data.profile;
            setProfile(profileData);

            if (profileData.leetcode) {
                const leetcodeStats = await fetchLeetCodeStats(profileData.leetcode);
                setLeetCodeStats(leetcodeStats);
            }
        }).catch((error) => {
            console.error("Failed to fetch profile data:", error);
            setError("Failed to fetch profile data. Please try again.");
        }).finally(() => {
            setLoading(false);
        });

        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/userProfile/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setUser(response.data.user));

        axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowing/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setFollowing(response.data));

        axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowers/?id=${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setFollowers(response.data));

        axios.get(`https://uni-networking-app.onrender.com/api/v1/post/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            setPosts(response.data.posts);
        });

        
        fetchFollowStatus();
    }, [id, navigate]);

    const profileUrl = profile?.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div className="bg-gray-900 text-white min-h-screen flex p-8 space-x-8">
            
            <div className="w-2/3 bg-gray-800 rounded-lg p-6 overflow-auto">
                
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        
                        <div className="flex items-center space-x-4">
                            <img
                                src={profileUrl}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-gray-800"
                            />
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {user?.firstName} {user?.lastName}
                                </h2>
                                <p className="text-gray-400">@{user?.firstName?.toLowerCase()}</p>
                            </div>
                        </div>

                        
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                            >
                                Go to Dashboard
                            </button>
                           
                            <button
                                onClick={toggleFollow}
                                className={`${isFollowing
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-blue-500 hover:bg-blue-600"
                                    } text-white py-2 px-4 rounded-lg`}
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                        </div>
                    </div>

                    
                    <div className="flex justify-start items-center text-gray-400 gap-40 mt-2">
                        <div>
                            <p className="text-lg font-bold text-center">{followers?.count}</p>
                            <p className="text-xs">Followers</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-center">{following?.count}</p>
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

                
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-6">Your Posts</h3>
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                                <Post post={post} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            
            <div className="w-1/3 bg-gray-800 rounded-lg p-6 h-screen sticky top-0 overflow-y-auto">
                <h3 className="text-xl font-bold mt-6 mb-4">Platform Stats</h3>
                {loading && (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                )}

                <div className="space-y-6">
                    
                    {profile?.leetcode && leetCodeStats && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">LeetCode</h4>
                            <div
                                className="w-full overflow-hidden"
                                style={{
                                    aspectRatio: '500 / 200',
                                    height: 'auto'
                                }}
                            >
                                <img
                                    src={`data:image/svg+xml;utf8,${encodeURIComponent(leetCodeStats)}`}
                                    alt="LeetCode Stats"
                                    className="object-contain rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    
                    {profile?.geekforgeeks && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">GeeksforGeeks</h4>
                            <img
                                src={`https://gfgstatscard.vercel.app/${profile.geekforgeeks}`}
                                alt="GeeksforGeeks Stats"
                                className="w-full h-50 object-cover"
                            />
                        </div>
                    )}

                    
                    {profile?.codeforces && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">Codeforces</h4>
                            <img
                                src={`https://codeforces-readme-stats.vercel.app/api/card?username=${profile.codeforces}`}
                                alt="Codeforces Stats"
                                className="w-full h-50 object-cover"
                            />
                        </div>
                    )}

                    
                    {profile?.github && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-bold mb-2">GitHub</h4>
                            <div className="space-y-4 ">
                                <img
                                    src={`https://github-readme-stats.vercel.app/api?username=${profile.github}&show_icons=true&theme=dark&card_width=300`}
                                    alt="GitHub Stats"
                                    className="w-full object-contain border-none"
                                />
                                <img
                                    src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.github}&layout=compact&theme=dark&card_width=400`}
                                    alt="Top Languages"
                                    className="w-full object-contain border-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;