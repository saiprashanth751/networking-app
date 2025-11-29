import { useEffect, useState } from "react";
import { InputBox } from "../components/InputBox";
import { Select } from "../components/DepartSelect";
import { MinorSelect } from "../components/MinorSelect";
import { Heading } from "../components/Heading";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useCurrentProfile } from "@/hooks/queries/profile";
import { useCreateProfile } from "@/hooks/mutations/profile";

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
    const navigate = useNavigate();

    // ✅ Check if profile already exists
    const { data: profileData, isLoading } = useCurrentProfile({
        retry: false, // Don't retry if profile doesn't exist
    });

    // ✅ Use mutation hook
    const createProfileMutation = useCreateProfile();

    // If profile exists, redirect to dashboard
    useEffect(() => {
        if (profileData?.profile) {
            navigate("/dashboard");
        }
    }, [profileData, navigate]);

    const handleCreateProfile = () => {
        if (!bio.trim() || !graduation || !selectedDepartment || !selectedMinor) {
            // Add validation toast if needed
            return;
        }

        // ✅ Mutation automatically navigates on success (see hooks/mutations/profile.ts)
        createProfileMutation.mutate({
            bio,
            graduationYear: graduation,
            department: selectedDepartment.name,
            minor: selectedMinor.name,
            linkedin,
            github,
            leetcode,
            codeforces,
            geekforgeeks,
            profilePic: profilePic || undefined,
        });
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
                        type="text"
                    />

                    <InputBox 
                        onChange={(e) => setGraduation(e.target.value)} 
                        label="Graduation Year"
                        value={graduation}
                        type="text"
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
                        type="text"
                    />

                    <div className="font-semibold text-md my-1">
                        <span className="font-bold">Note:</span> At least 2 profiles are recommended.
                    </div>
                    
                    <InputBox 
                        onChange={(e) => setGithub(e.target.value)} 
                        label="GitHub Username (optional)" 
                        value={github}
                        type="text"
                    />

                    <InputBox 
                        onChange={(e) => setLeetcode(e.target.value)} 
                        label="LeetCode Username (optional)" 
                        value={leetcode}
                        type="text"
                    />

                    <InputBox 
                        onChange={(e) => setCodeforces(e.target.value)} 
                        label="Codeforces Username (optional)" 
                        value={codeforces}
                        type="text"
                    />

                    <InputBox 
                        onChange={(e) => setGeekforgeeks(e.target.value)} 
                        label="GeeksforGeeks Username (optional)"
                        value={geekforgeeks}
                        type="text" 
                    />
                </div>

                <div className="mt-6 flex justify-center">
                    <Button 
                        onClick={handleCreateProfile}
                        label={createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                        disabled={createProfileMutation.isPending}
                    />
                </div>
            </div>
        </div>
    );
}