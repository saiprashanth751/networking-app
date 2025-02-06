import { useEffect, useState } from "react"
import { Button } from "./Button"
import {Link} from "react-router-dom"
import axios from "axios"

export function User({user}: {user: any}) {
    
    const [follow, setFollow] = useState(false)
    useEffect(() => {
        axios.get(`http://localhost:3000/api/v1/follow/?id=${user.id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        ).then((response) => {
            setFollow(response.data.following)
        })
    },[])

    return (
        <>
    <Link to={`/profile/${user.id}`}>
    <div className="flex items-center justify-between bg-slate-300 p-2 rounded-lg shadow-md w-full max-w-xl m-auto">
        {/* Left Section: Profile Image & Info */}
        <div className="flex items-center gap-x-4">
            <img 
                alt="Profile" 
                src="/public/vite.svg" 
                className="w-12 h-12 flex-none rounded-full bg-gray-100 object-cover"
            />
            <div>
                <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.profile.department} - {user.profile.graduationYear}</p>
            </div>
        </div>

        {/* Right Section: Status & Role */}
        <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm text-gray-900 font-medium">{user.profile.bio}</p>
            <div className="flex items-center gap-x-2 mt-1 px-2">

                {/* Memory Button */}
                <Button onClick={ async () => {
                    if(follow===false){
                        await axios.post(`http://localhost:3000/api/v1/follow/?id=${user.id}`, 
                        {}, 
                        {
                            headers : {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        })
                        setFollow(true)
                    }
                    else{ 
                        await axios.delete(`http://localhost:3000/api/v1/follow/?id=${user.id}`, {
                            headers : {
                                Authorization: `Bearer ${localStorage.getItem("token")}`
                            }
                        })
                        setFollow(false)
                    }
                }}

                label={follow === true ? "Unfollow" : "Follow"}></Button>

            </div>
        </div>
    </div>
    </Link>
</>

    )
}



