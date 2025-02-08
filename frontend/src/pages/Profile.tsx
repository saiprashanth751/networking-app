import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate,Link, useParams } from "react-router-dom";

interface profileBody {
    bio?: string,
    graduationYear?: string,
    department?: string,
    minor?: string,
    linkedin?: string,
    github?: string
}

interface userBody {
    firstName?: string,
    lastName?: string 
}

interface followingBody {
    following?: string[],
    followers?: string[],
    count?: number
}


export default function Profile() {
    const {id} = useParams()
    const [profile, setProfile] = useState<profileBody | null>(null)
    const [user, setUser] = useState<userBody | null>(null)
    const [following, setFollowing] = useState<followingBody | null>(null)
    const [followers, setFollowers] = useState<followingBody | null>(null)
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/signin")
        }
        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/nativeProfile/?id=${id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        ).then((response) => {
            setProfile(response.data.profile)
        })

        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/userProfile/?id=${id}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        ).then((response) => {
            setUser(response.data.user)
        })

        axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowing/?id=${id}`,
            {
                headers: {Authorization: `Bearer ${token}`}
            }
        ).then((response) => {setFollowing(response.data)})

        axios.get(`https://uni-networking-app.onrender.com/api/v1/follow/userFollowers/?id=${id}`,
            {
            headers: {Authorization: `Bearer ${token}`}
        }).then((response) => {setFollowers(response.data)})
    }, [id])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-slate-300 to-white">
            <div className="relative bg-white shadow-lg rounded-2xl p-32 text-center">
            {/* <div className="text-blue-500 hover:text-blue-700 absolute right-5 top-5"><Link to={"/updateprofile"}>Edit Profile</Link></div> */}
            <div className="text-blue-500 hover:text-blue-700 absolute left-7 top-5"><Link to={"/dashboard"}>Back</Link></div>
                {/* Profile Image */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <img
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="Profile"
                        className="w-40 h-40 rounded-full border-4 border-white shadow-lg"
                    />
                </div>

                {/* Connect & Message Buttons */}
                {/* <div className="flex justify-between text-blue-500 text-sm font-semibold mt-8">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                        <FaUserPlus />
                        <span>Connect</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                        <FaCommentDots />
                        <span>Message</span>
                    </div>
                </div> */}

                {/* User Info */}
                    <h2 className="text-xl font-bold text-gray-800 mt-4 text-center">{user?.firstName} {user?.lastName}</h2>
                <div className="flex flex-col gap-2 items-start">
                    <p className="text-gray-600 text-sm mt-2">{profile?.bio}</p>
                    <p className="text-gray-500 text-sm">Graduation Year : {profile?.graduationYear}</p>
                    <p className="text-gray-500 text-sm">Department : {profile?.department}</p>
                    <p className="text-gray-500 text-sm">Engineering Minor : {profile?.minor}</p>
                    <p className="text-gray-500 text-sm">Linkedin : {profile?.linkedin}</p>
                    <p className="text-gray-500 text-sm">GitHub : {profile?.github}</p>
                </div>
                {/* Stats Section */}
                <div className="flex justify-between mt-6 text-gray-700 mx-9">
                    <div>
                        <p className="text-lg font-bold">{followers?.count}</p>
                        <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold">{following?.count}</p>
                        <p className="text-xs text-gray-500">Following</p>
                    </div>
                </div>

                {/* Show More Button */}
                {/* <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
          Show more
        </button> */}
            </div>
        </div>
    );
}
