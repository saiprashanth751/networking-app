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
    const [graduation, setGraduation] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<{ name: string } | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<{ name: string } | null>(null);
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [leetcode, setLeetcode] = useState("");
    const [codeforces, setCodeforces] = useState("");
    const [geekforgeeks, setGeekforgeeks] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true); 
    const navigate = useNavigate();

 
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        setIsLoading(true);
        axios.get("https://uni-networking-app.onrender.com/api/v1/user/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            const profileData = response.data.profile;
            if (profileData) {
                navigate("/dashboard"); 
            }
        })
        .catch((error) => {
            console.error("Failed to fetch profile:", error);
        })
        .finally(() => {
            setIsLoading(false); 
        });
    }, [navigate]);

    const handleCreateProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        const formData = new FormData();
        formData.append("bio", bio);
        formData.append("graduationYear", graduation.toString());
        formData.append("department", selectedDepartment?.name || "");
        formData.append("minor", selectedMinor?.name || "");
        formData.append("linkedin", linkedin);
        formData.append("github", github);
        formData.append("leetcode", leetcode);
        formData.append("codeforces", codeforces);
        formData.append("geekforgeeks", geekforgeeks);

        if (profilePic) {
            formData.append("profilePic", profilePic);
        }

        try {
            await axios.post("https://uni-networking-app.onrender.com/api/v1/user/profile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to create profile:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-7">
                <Heading label="Create Your Profile" />
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <InputBox 
                        onChange={(e) => setBio(e.target.value)} 
                        label="Bio" 
                        value={bio}
                        type={"text"}
                    />

                    <InputBox 
                        onChange={(e) => setGraduation(e.target.value)} 
                        label="Graduation Year"
                        value={graduation}
                        type={"text"}
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
                        value={linkedin}
                        type={"text"}
                    />

                    <InputBox 
                        onChange={(e) => setGithub(e.target.value)} 
                        label="GitHub Username" 
                        value={github}
                        type={"text"}
                    />

                    <InputBox 
                        onChange={(e) => setLeetcode(e.target.value)} 
                        label="LeetCode Username" 
                        value={leetcode}
                        type={"text"}
                    />

                    <InputBox 
                        onChange={(e) => setCodeforces(e.target.value)} 
                        label="Codeforces Username" 
                        value={codeforces}
                        type={"text"}
                    />

                    <InputBox 
                        onChange={(e) => setGeekforgeeks(e.target.value)} 
                        label="GeeksforGeeks Username"
                        value={geekforgeeks}
                        type={"text"} 
                    />
                </div>

                <div className="mt-6 flex justify-center">
                    <Button 
                        onClick={handleCreateProfile}
                        label="Create Profile"
                    />
                </div>
            </div>
        </div>
    );
}