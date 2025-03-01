import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Post } from '../components/Post';
import { AppBar } from '../components/AppBar';
import { CreatePost } from '../components/CreatePost';
import { User } from '../components/User';
import { motion } from 'framer-motion';
import { FaFilter, FaUser } from 'react-icons/fa';


interface ProfileBody {
    bio?: string;
    graduationYear?: string;
    department?: string;
    minor?: string;
    linkedin?: string;
    github?: string;
    profilePic?: string;
}

export default function Dashboard() {
    const [profile, setProfile] = useState<ProfileBody | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    
    const fetchProfileAndUsers = async (token: string) => {
        try {
           
            const profileResponse = await axios.get('https://uni-networking-app.onrender.com/api/v1/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!profileResponse.data.profile) {
                throw new Error("Profile data not found");
            }
            setProfile(profileResponse.data.profile);

            
            const usersResponse = await axios.get(
                `https://uni-networking-app.onrender.com/api/v1/user/bulk/?minor=${profileResponse.data.profile.minor}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!usersResponse.data.users) {
                throw new Error("Users data not found");
            }

            
            const followedUsersResponse = await axios.get(
                'https://uni-networking-app.onrender.com/api/v1/follow/following',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            
            const followingData = followedUsersResponse.data?.followingUsers;
            const followedUserIds = Array.isArray(followingData)
                ? followingData.map((user: any) => user.id)
                : [];

            
            const filteredUsers = usersResponse.data.users.filter(
                (user: any) => !followedUserIds.includes(user.id)
            );

            setUsers(filteredUsers);
        } catch (error) {
            console.error('Failed to fetch profile or users:', error);
            setError('Failed to fetch profile or users. Please try again later.');
        }
    };

    
    const fetchPosts = async () => {
        try {
            const postsResponse = await axios.get('https://uni-networking-app.onrender.com/api/v1/post/all');
            setPosts(postsResponse.data.posts);
            setFilteredPosts(postsResponse.data.posts); 
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setError('Failed to fetch posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    
    const filterPostsByLabel = (label: string | null) => {
        setSelectedLabel(label);
        if (!label) {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter((post) => post.labels.includes(label));
            setFilteredPosts(filtered);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signin');
            return;
        }

        
        fetchProfileAndUsers(token);
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-gray-700">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <img src="/error-icon.svg" alt="Error" className="w-16 h-16 mb-4" />
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900 dark:bg-gray-950 pt-16">
    {/* Left Sidebar - Label Filters */}
    <div className="w-full lg:w-1/5 border-r-2 border-gray-200 dark:bg-gray-900 p-6 rounded-lg shadow-md dark:shadow-gray-800 overflow-y-auto mb-4 lg:mb-0 lg:mr-4">
        <h3 className="text-xl font-bold mb-6 sticky top-0 dark:bg-gray-900 py-4 flex items-center text-gray-200">
            <FaFilter className="mr-2 text-gray-400" /> Filter by Labels
        </h3>
        <button
            onClick={() => filterPostsByLabel(null)}
            className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                !selectedLabel
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            All Posts
        </button>
        {Array.from(new Set(posts.flatMap((post) => post.labels))).map((label, index) => (
            <button
                key={index}
                onClick={() => filterPostsByLabel(label)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-all duration-200 ${
                    selectedLabel === label
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                {label}
            </button>
        ))}
    </div>

    {/* Main Content - Posts Feed */}
    <div className="flex-1 p-6 overflow-y-auto">
        <AppBar />
        <CreatePost onCreate={fetchPosts}/>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-6"
        >
            {filteredPosts.map((post) => (
                <div key={post.id} className="bg-gray-800 dark:bg-gray-900 p-2 rounded-lg">
                    <Post post={post} />
                </div>
            ))}
        </motion.div>
    </div>

    {/* Right Sidebar - Recommended Users */}
    <div className="w-full lg:w-1/4 dark:bg-gray-900 p-6 rounded-lg shadow-md dark:shadow-gray-800 overflow-y-auto mt-4 lg:mt-0 lg:ml-4">
  <h3 className="text-xl font-bold mb-3 sticky top-0 dark:bg-gray-900 py-4 flex items-center text-gray-200">
    <FaUser className="mr-2 text-gray-400" /> Recommended / Known Users
  </h3>

  {/* Informative Note */}
  <div className="text-sm text-gray-400 mb-4 p-3 bg-gray-800 dark:bg-gray-700 rounded-lg">
    <p>
      Note: The users below are recommended based on your minor. To discover more users
      who share your interests, explore their posts or use the search feature.
    </p>
  </div>

  {/* List of Users */}
  {users.map((user) => (
    <div key={user.id} className="bg-gray-700 dark:bg-gray-800 rounded-lg mb-2 p-0.5">
      <User user={user} />
    </div>
  ))}
</div>
    
</div>

    );
}