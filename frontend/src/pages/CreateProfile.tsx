import { useEffect, useState } from "react";
import { InputBox } from "../components/InputBox";
import { Select } from "../components/DepartSelect";
import { MinorSelect } from "../components/MinorSelect";
import { Heading } from "../components/Heading";
import { Button } from "../components/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateProfile() {
    const [bio, setBio] = useState("");
    const [graduation, setGraduation] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState<{ name: string } | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<{ name: string } | null>(null);
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if(!token){
            navigate("/signin")
        }

        axios.get("https://uni-networking-app.onrender.com/api/v1/user/profile", {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        }).then((response) => {
            setProfile(response.data)
        })

        if(profile){
            navigate("/dashboard")
        }

    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-7">
                <Heading label="Create Your Profile" />
                
                <div className="space-y-4">
                    <InputBox 
                        onChange={(e) => setBio(e.target.value)} 
                        label="Bio" 
                    />

                    <InputBox 
                        onChange={(e) => setGraduation(Number(e.target.value))} 
                        label="Graduation Year" 
                    />

                    <Select 
                        label="Department" 
                        selected={selectedDepartment} 
                        setSelected={setSelectedDepartment} 
                    />

                    <MinorSelect 
                        label="Engineering Minor" 
                        selected={selectedMinor} 
                        setSelected={setSelectedMinor} 
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
                            await axios.post("https://uni-networking-app.onrender.com/api/v1/user/profile", {
                                bio,
                                graduationYear: graduation,
                                department: selectedDepartment ? selectedDepartment.name : "",
                                minor: selectedMinor ? selectedMinor.name : "",
                                linkedin,
                                github,
                            }, {
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                            });
                            navigate("/dashboard")
                        }}
                        label="Create Profile"
                    />
                </div>
            </div>
        </div>
    );
}
