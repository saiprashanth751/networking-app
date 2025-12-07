import { useEffect, useState } from "react";
import { Heading } from "../components/Heading";
import { Button } from "../components/ui/button";
import { useCurrentProfile } from "@/hooks/queries/profile";
import { useUpdateProfile } from "@/hooks/mutations/profile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function UpdateProfile() {
    const [bio, setBio] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [leetcode, setLeetcode] = useState("");
    const [codeforces, setCodeforces] = useState("");
    const [gfg, setGFG] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);

    // ✅ Fetch current profile data
    const { data: profileData, isLoading, isError } = useCurrentProfile();

    // ✅ Use mutation hook
    const updateProfileMutation = useUpdateProfile();

    // Populate form with existing data
    useEffect(() => {
        if (profileData?.profile) {
            const profile = profileData.profile;
            setBio(profile.bio || "");
            setLinkedin(profile.linkedin || "");
            setGithub(profile.github || "");
            setLeetcode(profile.leetcode || "");
            setCodeforces(profile.codeforces || "");
            setGFG(profile.geekforgeeks || "");
        }
    }, [profileData]);

    const handleUpdateProfile = () => {
        // Build update object with only changed fields
        const updates: any = {};

        if (bio.trim() !== "") updates.bio = bio;
        if (linkedin.trim() !== "") updates.linkedin = linkedin;
        if (github.trim() !== "") updates.github = github;
        if (leetcode.trim() !== "") updates.leetcode = leetcode;
        if (codeforces.trim() !== "") updates.codeforces = codeforces;
        if (gfg.trim() !== "") updates.geekforgeeks = gfg;
        if (profilePic) updates.profilePic = profilePic;

        // ✅ Mutation handles success/navigation automatically
        updateProfileMutation.mutate(updates);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load profile data</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    const profile = profileData?.profile;
    const profilePicUrl = profile?.profilePic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

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
                    <div className="space-y-2">
                        <Label htmlFor="profile">Profile Picture</Label>
                        <Input
                            id="profile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                        ></Input>
                    </div>
                    {profile?.profilePic && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">Current Profile Picture:</p>
                            <img
                                src={profilePicUrl}
                                alt="Current Profile"
                                className="w-24 h-24 rounded-full border-2 border-gray-300 mt-2"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">


                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                            id="bio"
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></Input>
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                            id="linkedin"
                            type="text"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                        ></Input>
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                            id="github"
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                        ></Input>
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="leetcode">LeetCode Profile</Label>
                        <Input
                            id="leetcode"
                            type="text"
                            value={leetcode}
                            onChange={(e) => setLeetcode(e.target.value)}
                        ></Input>
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="codeforces">Codeforces Profile</Label>
                        <Input
                            id="codeforces"
                            type="text"
                            value={codeforces}
                            onChange={(e) => setCodeforces(e.target.value)}
                        ></Input>
                    </div>



                    <div className="space-y-2">
                        <Label htmlFor="gfg">GeeksforGeeks Profile</Label>
                        <Input
                            id="gfg"
                            type="text"
                            value={gfg}
                            onChange={(e) => setGFG(e.target.value)}
                        ></Input>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <Button
                        onClick={handleUpdateProfile}
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                </div>
            </div>
        </div>
    );
}