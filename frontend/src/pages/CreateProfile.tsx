import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heading } from "../components/Heading";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCurrentProfile } from "@/hooks/queries/profile";
import { useCreateProfile } from "@/hooks/mutations/profile";

export default function CreateProfile() {
    const [bio, setBio] = useState("");
    const [graduation, setGraduation] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [selectedMinor, setSelectedMinor] = useState<string>("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [leetcode, setLeetcode] = useState("");
    const [codeforces, setCodeforces] = useState("");
    const [geekforgeeks, setGeekforgeeks] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const navigate = useNavigate();

    const { data: profileData, isLoading } = useCurrentProfile({
        retry: false,
    });

    const createProfileMutation = useCreateProfile();

    useEffect(() => {
        if (profileData?.profile) {
            navigate("/dashboard");
        }
    }, [profileData, navigate]);

    const handleCreateProfile = () => {
        if (!bio.trim() || !graduation || !selectedDepartment || !selectedMinor) {
            return;
        }

        createProfileMutation.mutate({
            bio,
            graduationYear: graduation,
            department: selectedDepartment,
            minor: selectedMinor,
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
                        <Label htmlFor="profilePic">Profile Picture</Label>
                        <Input
                            id="profilePic"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                            className="mt-1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                            id="bio"
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="graduation">Graduation Year</Label>
                        <Input
                            id="graduation"
                            type="text"
                            value={graduation}
                            onChange={(e) => setGraduation(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select 
                            value={selectedDepartment} 
                            onValueChange={setSelectedDepartment}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Computer Science and Engineering">
                                    Computer Science and Engineering
                                </SelectItem>
                                <SelectItem value="Electronics and Communication Engineering">
                                    Electronics and Communication Engineering
                                </SelectItem>
                                <SelectItem value="Mechanical Engineering">
                                    Mechanical Engineering
                                </SelectItem>
                                <SelectItem value="Chemical Engineering">
                                    Chemical Engineering
                                </SelectItem>
                                <SelectItem value="Mechatronics Engineering">
                                    Mechatronics Engineering
                                </SelectItem>
                                <SelectItem value="Civil Engineering">
                                    Civil Engineering
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Engineering Minor</Label>
                        <Select 
                            value={selectedMinor} 
                            onValueChange={setSelectedMinor}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Minor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full Stack Web Development">
                                    Full Stack Web Development
                                </SelectItem>
                                <SelectItem value="Data Science">
                                    Data Science
                                </SelectItem>
                                <SelectItem value="Machine Learning">
                                    Machine Learning
                                </SelectItem>
                                <SelectItem value="Artificial Intelligence">
                                    Artificial Intelligence
                                </SelectItem>
                                <SelectItem value="Software Methodology">
                                    Software Methodology
                                </SelectItem>
                                <SelectItem value="Cyber Security">
                                    Cyber Security
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                            id="linkedin"
                            type="text"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                        />
                    </div>

                    <div className="font-semibold text-md my-1">
                        <span className="font-bold">Note:</span> At least 2 profiles are recommended.
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Username (optional)</Label>
                        <Input
                            id="github"
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="leetcode">LeetCode Username (optional)</Label>
                        <Input
                            id="leetcode"
                            type="text"
                            value={leetcode}
                            onChange={(e) => setLeetcode(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="codeforces">Codeforces Username (optional)</Label>
                        <Input
                            id="codeforces"
                            type="text"
                            value={codeforces}
                            onChange={(e) => setCodeforces(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="geekforgeeks">GeeksforGeeks Username (optional)</Label>
                        <Input
                            id="geekforgeeks"
                            type="text"
                            value={geekforgeeks}
                            onChange={(e) => setGeekforgeeks(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleCreateProfile}
                        disabled={createProfileMutation.isPending}
                    >
                        {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                    </Button>
                </div>
            </div>
        </div>
    );
}