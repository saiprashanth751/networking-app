import { useEffect, useState } from "react";
import { InputBox } from "../components/InputBox";
import { Heading } from "../components/Heading";
import { Button } from "../components/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UpdateProfile() {
    const [bio, setBio] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [leetcode, setLeetcode] = useState("");
    const [codeforces, setCodeforces] = useState("");
    const [gfg, setGFG] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null); 
    const [currentProfilePic, setCurrentProfilePic] = useState(""); 
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        // Fetch existing profile data
        axios.get("http://localhost:3000/api/v1/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((response) => {
            const profileData = response.data.profile;
            
            setBio(profileData.bio || "");
            setLinkedin(profileData.linkedin || "");
            setGithub(profileData.github || "");
            setLeetcode(profileData.leetcode || "");
            setCodeforces(profileData.codeforces || "");
            setGFG(profileData.geekforgeeks || "");
            setCurrentProfilePic(profileData.profilePic || ""); 
        }).catch((error) => {
            console.error("Failed to fetch profile data:", error);
            setError("Failed to fetch profile data. Please try again.");
        });
    }, [navigate]);

    const handleUpdateProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }
        try {
            // New Concept : Form uploads. Revise Later
            const formData = new FormData();
            if (bio.trim() !== "") formData.append("bio", bio);
            if (linkedin.trim() !== "") formData.append("linkedin", linkedin);
            if (github.trim() !== "") formData.append("github", github);
            if (leetcode.trim() !== "") formData.append("leetcode", leetcode);
            if (codeforces.trim() !== "") formData.append("codeforces", codeforces);
            if (gfg.trim() !== "") formData.append("geekforgeeks", gfg);
            if (profilePic) formData.append("profilePic", profilePic); 

           
            await axios.put("http://localhost:3000/api/v1/user/profile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data", 
                },
            });

            navigate("/userprofile");
        } catch (error) {
            console.error("Failed to update profile:", error);
            setError("Failed to update profile. Please try again.");
        }
    };

    const getImageUrl = (photo: string) => {
        if (!photo) return "";

        
        const formattedUrl = photo.replace(/\\/g, "/");

        
        if (!formattedUrl.startsWith("http") && !formattedUrl.startsWith("/uploads")) {
            return `/uploads/${formattedUrl.split("/").pop()}`;
        }

        return formattedUrl;
    };

    const imgUrl = getImageUrl(currentProfilePic)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-7">
                <Heading label="Update Your Profile" />

                {/* Profile Picture Upload */}
                <div className="mb-6 mt-2">
                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {currentProfilePic && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">Current Profile Picture:</p>
                            <img
                                src={`http://localhost:3000${imgUrl}`}
                                alt="Current Profile"
                                className="w-24 h-24 rounded-full border-2 border-gray-300 mt-2"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <InputBox 
                        onChange={(e) => setBio(e.target.value)} 
                        label="Bio" 
                        value={bio}
                        type={"text"} 
                    />
                    <InputBox 
                        onChange={(e) => setLinkedin(e.target.value)} 
                        label="LinkedIn Profile" 
                        value={linkedin}
                        type={"text"} 
                    />
                    <InputBox 
                        onChange={(e) => setGithub(e.target.value)} 
                        label="GitHub Profile" 
                        value={github}
                        type={"text"} 
                    />
                    <InputBox 
                        onChange={(e) => setLeetcode(e.target.value)} 
                        label="LeetCode Profile" 
                        value={leetcode}
                        type={"text"} 
                    />
                    <InputBox 
                        onChange={(e) => setCodeforces(e.target.value)} 
                        label="Codeforces Profile" 
                        value={codeforces}
                        type={"text"} 
                    />
                    <InputBox 
                        onChange={(e) => setGFG(e.target.value)} 
                        label="GeeksforGeeks Profile" 
                        value={gfg}
                        type={"text"} 
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                )}

                <div className="mt-6 flex justify-center">
                    <Button 
                        onClick={handleUpdateProfile}
                        label="Update Profile"
                    />
                </div>
            </div>
        </div>
    );
}