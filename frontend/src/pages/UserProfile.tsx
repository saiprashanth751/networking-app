import { Link as LinkIcon, GraduationCap, Book, MessageCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Post } from '../components/Post';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FollowList } from '../components/FollowList';
import MessageBox from './MessageBox';

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
    id: string;
    firstName?: string;
    lastName?: string;
}

interface FollowingBody {
    following?: Array<{ id: string; followingId: string }>;
    followers?: Array<{ id: string; followerId: string }>;
    count?: number;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<ProfileBody | null>(null);
    const [user, setUser] = useState<UserBody | null>(null);
    const [posts, setPosts] = useState([]);
    const [following, setFollowing] = useState<FollowingBody | null>(null);
    const [followers, setFollowers] = useState<FollowingBody | null>(null);
    const [leetCodeStats, setLeetCodeStats] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [followerUsers, setFollowerUsers] = useState<UserBody[]>([]);
    const [followingUsers, setFollowingUsers] = useState<UserBody[]>([]);
    const navigate = useNavigate();

    
    const fetchLeetCodeStats = async (username: string) => {
        try {
            const response = await axios.get(`https://leetcard.jacoblin.cool/${username}`);
            return response.data; 
        } catch (error) {
            console.error("Failed to fetch LeetCode stats:", error);
            return null;
        }
    };

 
    const fetchUserDetails = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://uni-networking-app.onrender.com/api/v1/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.user;
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            return null;
        }
    };

    const fetchAllUserDetails = async (userIds: string[]) => {
        const users = await Promise.all(userIds.map((id) => fetchUserDetails(id)));
        return users.filter((user) => user !== null); 
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/signin');

        setLoading(true);
        setError("");

        
        axios.get('https://uni-networking-app.onrender.com/api/v1/user/profile', {
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

        
        axios.get('https://uni-networking-app.onrender.com/api/v1/user', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => setUser(response.data.user));

        // Fetch followers and following
        axios.get('https://uni-networking-app.onrender.com/api/v1/follow/followers', {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            setFollowers(response.data);
            setFollowerUsers(response.data.followers); 
        });

        axios.get('https://uni-networking-app.onrender.com/api/v1/follow/following', {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            setFollowing(response.data);
            setFollowingUsers(response.data.following);
        });

       
        axios.get("https://uni-networking-app.onrender.com/api/v1/post/userAll", {
            headers: { Authorization: `Bearer ${token}` }
        }).then((response) => {
            setPosts(response.data.posts);
        });
    }, [navigate]);



    const profilePicUrl = profile?.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col lg:flex-row p-8 space-y-8 lg:space-y-0 lg:space-x-8">
            {/* Left Section (User Details + Posts) */}
            <div className="w-full lg:w-2/3 bg-gray-800 rounded-lg p-6 overflow-auto">
                {/* User Details */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={profilePicUrl}
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
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate("/updateProfile")}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        {/* Profile Details */}
                        <div className="w-1/2 pr-8">
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

                        {/* Followers and Following Lists */}
                        <div className="w-1/2 pl-8">
                            <div className="flex flex-col space-y-6">
                                <FollowList
                                    title="Followers"
                                    users={followerUsers.map((user) => ({ id: user.id, firstName: user.firstName || "" }))}
                                    onMessageClick={(userId: any) => setSelectedUserId(userId)} // Pass the callback
                                />
                                <FollowList
                                    title="Following"
                                    users={followingUsers.map((user) => ({ id: user.id, firstName: user.firstName || "" }))}
                                    onMessageClick={(userId: any) => setSelectedUserId(userId)} // Pass the callback
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-6">Your Posts</h3>
                    <div className="space-y-6 bg-gray-800 p-2 rounded-lg">
                        {posts.map((post) => (
                            <Post  post={post} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Section (Platform Stats or MessageBox) */}
            <div className="w-full lg:w-1/3 bg-gray-800 rounded-lg p-6 h-screen sticky top-0 overflow-y-auto">
                {selectedUserId ? (
                    <MessageBox receiverId={selectedUserId} onClose={() => setSelectedUserId(null)} />
                ) : (
                    <>
                        <h3 className="text-xl font-bold mb-6">Platform Stats</h3>
                        {loading && (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                        )}

                        <div className="space-y-6">
                            {/* LeetCode Stat Card */}
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

                            {/* GeeksforGeeks Stat Card */}
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

                            {/* Codeforces Stat Card */}
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

                            {/* GitHub Stat Card */}
                            {profile?.github && (
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-bold mb-2">GitHub</h4>
                                    <div className="space-y-4">
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
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;