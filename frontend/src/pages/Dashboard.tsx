import { User } from "../components/User"
import { AppBar } from "../components/AppBar"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

// There is a small glitch in dashboard. Issue: Need to reload to get users.
// Add Profile for every user.
interface profileBody {
    bio?: string,
    graduationYear?: string,
    department?: string,
    minor?: string,
    linkedin?: string,
    github?: string
}

export default function Dashboard() {
    const [profile, setProfile] = useState<profileBody | null>(null)
    const [users, setUsers] = useState([])
    const navigate = useNavigate()
    useEffect(() => {

        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/signin")
        }

        axios.get("https://uni-networking-app.onrender.com/api/v1/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setProfile(response.data.profile)
        })

        axios.get(`https://uni-networking-app.onrender.com/api/v1/user/bulk/?minor=${profile?.minor}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            setUsers(response.data.users)
        })
    }, [profile?.minor])

    return (
        <>
            <AppBar></AppBar>
            <div className="w-64 bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">You might like</h3>
                <div className="space-y-4">
                    {users?.map((user: any) => (
                        <User key={user.id} user={user} />
                    ))}
                </div>
            </div>
        </>
    )
}