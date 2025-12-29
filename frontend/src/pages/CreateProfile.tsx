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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useCurrentProfile } from "@/hooks/queries/profile";
import { useCreateProfile } from "@/hooks/mutations/profile";
import { 
  User, 
  GraduationCap,
  Link as LinkIcon,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { PageLayout, H1, H2, Body, Caption, SPACING } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    const [previewUrl, setPreviewUrl] = useState<string>("");
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

    // Handle profile picture preview
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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

    // Check if form is valid
    const isFormValid = bio.trim() && graduation && selectedDepartment && selectedMinor;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className={`text-center ${SPACING.stack.md}`}>
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                    <Body className="text-muted-foreground">Loading...</Body>
                </div>
            </div>
        );
    }

    return (
        <PageLayout containerSize="md" spacing="normal">
            <Card className="shadow-lg">
                <CardHeader className={SPACING.container.lg}>
                    <div className={`text-center ${SPACING.stack.sm}`}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <H1>Create Your Profile</H1>
                        <Body className="text-muted-foreground">
                            Let's set up your profile to get started
                        </Body>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className={SPACING.container.lg}>
                    <div className={SPACING.stack.lg}>
                        
                        {/* Profile Picture Section */}
                        <div className={`${SPACING.stack.md} text-center`}>
                            <Label className="text-base font-semibold">Profile Picture</Label>
                            <div className={`flex flex-col items-center ${SPACING.stack.sm}`}>
                                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-border">
                                    <AvatarImage src={previewUrl} />
                                    <AvatarFallback className="bg-muted">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </AvatarFallback>
                                </Avatar>
                                <Input
                                    id="profilePic"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="max-w-sm"
                                />
                                <Caption>Upload a professional photo</Caption>
                            </div>
                        </div>

                        <Separator />

                        {/* Basic Info Section */}
                        <div className={SPACING.stack.md}>
                            <div className={`flex items-center ${SPACING.inline.sm}`}>
                                <User className="h-5 w-5 text-primary" />
                                <H2 className="text-lg">Basic Information</H2>
                            </div>

                            <div className={SPACING.stack.sm}>
                                <div>
                                    <Label htmlFor="bio">
                                        Bio <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="bio"
                                        type="text"
                                        placeholder="Tell us about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="mt-2"
                                    />
                                    <Caption className="mt-1">A brief description about you</Caption>
                                </div>

                                <div>
                                    <Label htmlFor="graduation">
                                        Graduation Year <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="graduation"
                                        type="text"
                                        placeholder="e.g., 2025"
                                        value={graduation}
                                        onChange={(e) => setGraduation(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Academic Info Section */}
                        <div className={SPACING.stack.md}>
                            <div className={`flex items-center ${SPACING.inline.sm}`}>
                                <GraduationCap className="h-5 w-5 text-primary" />
                                <H2 className="text-lg">Academic Details</H2>
                            </div>

                            <div className={SPACING.stack.sm}>
                                <div>
                                    <Label>
                                        Department <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                        <SelectTrigger className="mt-2">
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

                                <div>
                                    <Label>
                                        Engineering Minor <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={selectedMinor} onValueChange={setSelectedMinor}>
                                        <SelectTrigger className="mt-2">
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
                            </div>
                        </div>

                        <Separator />

                        {/* Social Links Section */}
                        <div className={SPACING.stack.md}>
                            <div>
                                <div className={`flex items-center ${SPACING.inline.sm} mb-2`}>
                                    <LinkIcon className="h-5 w-5 text-primary" />
                                    <H2 className="text-lg">Social & Professional Links</H2>
                                </div>
                                <Caption>
                                    <strong>Note:</strong> LinkedIn is required. Add at least 1 more profile for better visibility.
                                </Caption>
                            </div>

                            <div className={SPACING.stack.sm}>
                                <div>
                                    <Label htmlFor="linkedin">
                                        LinkedIn Profile <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="linkedin"
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="github">GitHub Username</Label>
                                    <Input
                                        id="github"
                                        type="text"
                                        placeholder="yourusername"
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="leetcode">LeetCode Username</Label>
                                    <Input
                                        id="leetcode"
                                        type="text"
                                        placeholder="yourusername"
                                        value={leetcode}
                                        onChange={(e) => setLeetcode(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="codeforces">Codeforces Username</Label>
                                    <Input
                                        id="codeforces"
                                        type="text"
                                        placeholder="yourusername"
                                        value={codeforces}
                                        onChange={(e) => setCodeforces(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="geekforgeeks">GeeksforGeeks Username</Label>
                                    <Input
                                        id="geekforgeeks"
                                        type="text"
                                        placeholder="yourusername"
                                        value={geekforgeeks}
                                        onChange={(e) => setGeekforgeeks(e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Submit Button */}
                        <Button
                            onClick={handleCreateProfile}
                            disabled={!isFormValid || createProfileMutation.isPending}
                            size="lg"
                            className={`w-full ${SPACING.inline.sm}`}
                        >
                            {createProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Creating Profile...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span>Create Profile</span>
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PageLayout>
    );
}