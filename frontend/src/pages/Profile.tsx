// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate,Link, useParams } from "react-router-dom";

// interface profileBody {
//     bio?: string,
//     graduationYear?: string,
//     department?: string,
//     minor?: string,
//     linkedin?: string,
//     github?: string
// }

// interface userBody {
//     firstName?: string,
//     lastName?: string 
// }

// interface followingBody {
//     following?: string[],
//     followers?: string[],
//     count?: number
// }


// export default function Profile() {
//     const {id} = useParams()
//     const [profile, setProfile] = useState<profileBody | null>(null)
//     const [user, setUser] = useState<userBody | null>(null)
//     const [following, setFollowing] = useState<followingBody | null>(null)
//     const [followers, setFollowers] = useState<followingBody | null>(null)
//     const navigate = useNavigate()
//     useEffect(() => {
//         const token = localStorage.getItem("token")
//         if (!token) {
//             navigate("/signin")
//         }
//         axios.get(`https://uni-networking-app.onrender.com/api/v1/user/nativeProfile/?id=${id}`,
//             {
//                 headers: { Authorization: `Bearer ${token}` },
//             }
//         ).then((response) => {
//             setProfile(response.data.profile)
//         })

//         axios.get(`https://uni-networking-app.onrender.com/api/v1/user/userProfile/?id=${id}`,
//             {
//                 headers: { Authorization: `Bearer ${token}` },
//             }
//         ).then((response) => {
//             setUser(response.data.user)
//         })

//         axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowing/?id=${id}`,
//             {
//                 headers: {Authorization: `Bearer ${token}`}
//             }
//         ).then((response) => {setFollowing(response.data)})

//         axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowers/?id=${id}`,
//             {
//             headers: {Authorization: `Bearer ${token}`}
//         }).then((response) => {setFollowers(response.data)})
//     }, [id])

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-slate-300 to-white">
//             <div className="relative bg-white shadow-lg rounded-2xl p-32 text-center">
//             {/* <div className="text-blue-500 hover:text-blue-700 absolute right-5 top-5"><Link to={"/updateprofile"}>Edit Profile</Link></div> */}
//             <div className="text-blue-500 hover:text-blue-700 absolute left-7 top-5"><Link to={"/dashboard"}>Back</Link></div>
//                 {/* Profile Image */}
//                 <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
//                     <img
//                         src="https://randomuser.me/api/portraits/women/44.jpg"
//                         alt="Profile"
//                         className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
//                     />
//                 </div>

//                 {/* Connect & Message Buttons */}
//                 {/* <div className="flex justify-between text-blue-500 text-sm font-semibold mt-8">
//                     <div className="flex items-center gap-2 cursor-pointer hover:text-blue-700">
//                         <FaUserPlus />
//                         <span>Connect</span>
//                     </div>
//                     <div className="flex items-center gap-2 cursor-pointer hover:text-blue-700">
//                         <FaCommentDots />
//                         <span>Message</span>
//                     </div>
//                 </div> */}

//                 {/* User Info */}
//                     <h2 className="text-xl font-bold text-gray-800 mt-4 text-center">{user?.firstName} {user?.lastName}</h2>
//                 <div className="flex flex-col gap-2 items-start">
//                     <p className="text-gray-600 text-sm mt-2">{profile?.bio}</p>
//                     <p className="text-gray-500 text-sm">Graduation Year : {profile?.graduationYear}</p>
//                     <p className="text-gray-500 text-sm">Department : {profile?.department}</p>
//                     <p className="text-gray-500 text-sm">Engineering Minor : {profile?.minor}</p>
//                     <p className="text-gray-500 text-sm">Linkedin : {profile?.linkedin}</p>
//                     <p className="text-gray-500 text-sm">GitHub : {profile?.github}</p>
//                 </div>
//                 {/* Stats Section */}
//                 <div className="flex justify-between mt-6 text-gray-700 mx-9">
//                     <div>
//                         <p className="text-lg font-bold">{followers?.count}</p>
//                         <p className="text-xs text-gray-500">Followers</p>
//                     </div>
//                     <div>
//                         <p className="text-lg font-bold">{following?.count}</p>
//                         <p className="text-xs text-gray-500">Following</p>
//                     </div>
//                 </div>

//                 {/* Show More Button */}
//                 {/* <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
//           Show more
//         </button> */}
//             </div>
//         </div>
//     );
// }


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
            setPosts(response.data.post);
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
                    <h2 className="text-2xl font-bold">
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-400">@{user?.firstName?.toLowerCase()}</p>

                    {/* Followers and Following Counts */}
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
                    return <Post key={post.id} post={post} />
                    })}
                </div>
            </div>
        </div>
    );
}