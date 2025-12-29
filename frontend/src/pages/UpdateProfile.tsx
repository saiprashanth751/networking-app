import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentProfile } from "@/hooks/queries/profile";
import { useUpdateProfile } from "@/hooks/mutations/profile";
import { 
  User, 
  GraduationCap, 
  Link as LinkIcon,
  Upload,
  Loader2,
  Save,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Mechatronics Engineering",
  "Civil Engineering",
];

const minors = [
  "Full Stack Web Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Software Methodology",
  "Cyber Security",
];

export default function UpdateProfile() {
    const navigate = useNavigate();
    
    // Form state
    const [bio, setBio] = useState("");
    const [graduationYear, setGraduationYear] = useState("");
    const [department, setDepartment] = useState("");
    const [minor, setMinor] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [leetcode, setLeetcode] = useState("");
    const [codeforces, setCodeforces] = useState("");
    const [geekforgeeks, setGeekforgeeks] = useState("");
    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    // Query and mutation
    const { 
      data: profileData, 
      isLoading, 
      isError,
      error: profileError 
    } = useCurrentProfile();
    
    const updateProfileMutation = useUpdateProfile();

    // Populate form with existing data
    useEffect(() => {
        if (profileData?.profile) {
            const profile = profileData.profile;
            setBio(profile.bio || "");
            setGraduationYear(profile.graduationYear || "");
            setDepartment(profile.department || "");
            setMinor(profile.minor || "");
            setLinkedin(profile.linkedin || "");
            setGithub(profile.github || "");
            setLeetcode(profile.leetcode || "");
            setCodeforces(profile.codeforces || "");
            setGeekforgeeks(profile.geekforgeeks || "");
            setPreviewUrl(profile.profilePic || "");
        }
    }, [profileData]);

    // Handle profile picture preview
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File size should be less than 5MB");
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert("Please upload an image file");
                return;
            }
            
            setProfilePic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Build update payload
        const updates: any = {};
        
        // Only include changed fields
        if (bio.trim() !== (profileData?.profile?.bio || "")) updates.bio = bio.trim();
        if (graduationYear !== (profileData?.profile?.graduationYear || "")) updates.graduationYear = graduationYear;
        if (department !== (profileData?.profile?.department || "")) updates.department = department;
        if (minor !== (profileData?.profile?.minor || "")) updates.minor = minor;
        if (linkedin !== (profileData?.profile?.linkedin || "")) updates.linkedin = linkedin;
        if (github !== (profileData?.profile?.github || "")) updates.github = github;
        if (leetcode !== (profileData?.profile?.leetcode || "")) updates.leetcode = leetcode;
        if (codeforces !== (profileData?.profile?.codeforces || "")) updates.codeforces = codeforces;
        if (geekforgeeks !== (profileData?.profile?.geekforgeeks || "")) updates.geekforgeeks = geekforgeeks;
        if (profilePic) updates.profilePic = profilePic;

        // Don't make API call if nothing changed
        if (Object.keys(updates).length === 0) {
            alert("No changes detected");
            return;
        }

        updateProfileMutation.mutate(updates, {
            onSuccess: () => {
                setTimeout(() => {
                    navigate('/userprofile');
                }, 1500);
            }
        });
    };

    // Form validation - only require academic fields
    const isFormValid =  String(graduationYear).trim() && department && minor;
    const hasChanges = () => {
        if (!profileData?.profile) return true;
        const profile = profileData.profile;
        return bio.trim() !== (profile.bio || "") ||
               graduationYear !== (profile.graduationYear || "") ||
               department !== (profile.department || "") ||
               minor !== (profile.minor || "") ||
               linkedin !== (profile.linkedin || "") ||
               github !== (profile.github || "") ||
               leetcode !== (profile.leetcode || "") ||
               codeforces !== (profile.codeforces || "") ||
               geekforgeeks !== (profile.geekforgeeks || "") ||
               profilePic !== null;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Skeleton className="h-64 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-destructive">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                <AlertCircle className="h-16 w-16 text-destructive" />
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        Failed to Load Profile
                                    </h2>
                                    <p className="text-muted-foreground mt-2">
                                        {profileError?.message || "We couldn't load your profile data. Please try again."}
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button onClick={() => navigate(-1)} variant="outline">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Go Back
                                    </Button>
                                    <Button onClick={() => window.location.reload()}>
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        onClick={() => navigate('/userprofile')}
                        variant="ghost"
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Profile
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                        <p className="text-muted-foreground">
                            Update your personal and professional information
                        </p>
                    </div>
                </div>

                {/* Success Alert */}
                {updateProfileMutation.isSuccess && (
                    <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            Profile updated successfully! Redirecting...
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Alert */}
                {updateProfileMutation.isError && (
                    <Alert className="mb-6 border-destructive">
                        <AlertDescription className="text-destructive">
                            Failed to update profile. Please try again.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Card className="shadow-lg">
                        <CardContent className="p-6 space-y-8">
                            {/* Profile Picture Section */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Profile Picture
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload a professional photo (Max 5MB, JPG/PNG)
                                    </p>
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <Avatar className="h-32 w-32 border-4 border-border">
                                        <AvatarImage 
                                            src={previewUrl || profileData?.profile?.profilePic} 
                                            alt="Profile preview"
                                        />
                                        <AvatarFallback className="bg-muted">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            id="profilePic"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="max-w-sm"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {profilePic 
                                                ? `Selected: ${profilePic.name}`
                                                : "No file selected"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Basic Information
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">
                                            Bio
                                        </Label>
                                        <Textarea
                                            id="bio"
                                            placeholder="Tell us about yourself..."
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Share your interests, goals, or a brief introduction
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="graduationYear" className="required">
                                            Graduation Year
                                        </Label>
                                        <Input
                                            id="graduationYear"
                                            type="text"
                                            placeholder="e.g., 2025"
                                            value={graduationYear}
                                            onChange={(e) => setGraduationYear(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Academic Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Academic Details
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="required">
                                            Department
                                        </Label>
                                        <Select 
                                            value={department} 
                                            onValueChange={setDepartment}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept} value={dept}>
                                                        {dept}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minor" className="required">
                                            Engineering Minor
                                        </Label>
                                        <Select 
                                            value={minor} 
                                            onValueChange={setMinor}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Minor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {minors.map((minorOpt) => (
                                                    <SelectItem key={minorOpt} value={minorOpt}>
                                                        {minorOpt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Social & Professional Links */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5" />
                                    Social & Professional Links
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                                        <Input
                                            id="linkedin"
                                            type="url"
                                            placeholder="https://linkedin.com/in/username"
                                            value={linkedin}
                                            onChange={(e) => setLinkedin(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="github">GitHub Username</Label>
                                        <Input
                                            id="github"
                                            type="text"
                                            placeholder="username"
                                            value={github}
                                            onChange={(e) => setGithub(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="leetcode">LeetCode Username</Label>
                                        <Input
                                            id="leetcode"
                                            type="text"
                                            placeholder="username"
                                            value={leetcode}
                                            onChange={(e) => setLeetcode(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="codeforces">Codeforces Username</Label>
                                        <Input
                                            id="codeforces"
                                            type="text"
                                            placeholder="username"
                                            value={codeforces}
                                            onChange={(e) => setCodeforces(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="geekforgeeks">GeeksforGeeks Username</Label>
                                        <Input
                                            id="geekforgeeks"
                                            type="text"
                                            placeholder="username"
                                            value={geekforgeeks}
                                            onChange={(e) => setGeekforgeeks(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <Button
                                    type="button"
                                    onClick={() => navigate('/userprofile')}
                                    variant="outline"
                                    disabled={updateProfileMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!isFormValid || !hasChanges() || updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}