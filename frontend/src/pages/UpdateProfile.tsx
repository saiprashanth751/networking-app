import { useEffect, useState } from "react";
import { InputBox } from "../components/InputBox";
import { Heading } from "../components/Heading";
import { Button } from "../components/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// interface profileBody {
//     bio?: string,
//     linkedin?: string,
//     github?: string
// }

export default function UpdateProfile() {
    // const [profile, setProfile] = useState<profileBody | null>(null)
    const [bio, setBio] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const navigate = useNavigate()

    //Bio update problem...
    
    // useEffect(() => {
    //     const token = localStorage.getItem("token")
    //     if (!token) {
    //         navigate("/signin")
    //     }
    //     axios.get("http://localhost:3000/api/v1/user/profile",
    //         {
    //             headers: { Authorization: `Bearer ${token}` },
    //         }
    //     ).then((response) => {
    //         setProfile(response.data.profile)
    //     })
    // }, [])

    useEffect(() => {
            const token = localStorage.getItem("token")
            if(!token){
                navigate("/signin")
            }
        })

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-7">
                <Heading label="Update Your Profile" />
                <div className="space-y-4">
                    <InputBox 
                        onChange={(e) => setBio(e.target.value)} 
                        label="Bio" 
                    />
                    <InputBox 
                        onChange={(e) => setLinkedin(e.target.value)} 
                        label="LinkedIn Profile" 
                    />

                    <InputBox 
                        onChange={(e) => setGithub(e.target.value)} 
                        label="GitHub Profile" 
                    />
                </div>

                <div className="mt-6 flex justify-center">
                    <Button 
                        onClick={async () => {
                            await axios.put("http://localhost:3000/api/v1/user/profile", {
                                bio,
                                linkedin,
                                github,
                            }, {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                            });
                            navigate("/profile")
                        }}
                        label="Update Profile"
                    />
                </div>
            </div>
        </div>
    );
}
