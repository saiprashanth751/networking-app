import { User } from "../components/User"
import { AppBar } from "../components/AppBar"
import { useEffect, useState } from "react"
import axios from "axios"

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

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/user/profile",{
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((response) => {
            setProfile(response.data.profile)
        })

        axios.get(`http://localhost:3000/api/v1/user/bulk/?minor=${profile?.minor}`,{
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((response) => {
            setUsers(response.data.users)
        })
    }, [profile?.minor])

    return (
        <>
            <AppBar></AppBar>
                    <div className="flex flex-col justify-center gap-2">
                        {users?.map((user: any) => {
                            return <User user={user}></User>
                        })}
                    </div>
            </>
            )
}