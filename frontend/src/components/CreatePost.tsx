import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreatePost } from '@/hooks/mutations/post';
import { CreatePostInput, PostLabel } from '@/types/types';
import { useCurrentUser } from "@/hooks/queries/user";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Image, Link2, X, Sparkles } from "lucide-react";
import { useCurrentProfile } from '@/hooks/queries/profile';

const labelsList: PostLabel[] = [
    "Achievements",
    "Study Resources",
    "Collaboration Requests",
    "Internship/Job Openings",
    "Coursework Discussions",
    "Research & Innovations",
    "Bounty",
    "Contribution",
];

function LabelSelector({ 
    selectedLabels, 
    onLabelClick 
}: { 
    selectedLabels: PostLabel[]; 
    onLabelClick: (label: PostLabel) => void 
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {labelsList.map((label) => (
                <Badge
                    key={label}
                    variant={selectedLabels.includes(label) ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 ${
                        selectedLabels.includes(label)
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => onLabelClick(label)}
                >
                    {label}
                </Badge>
            ))}
        </div>
    );
}

export function CreatePost() {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [labels, setLabels] = useState<PostLabel[]>([]);
    const [photos, setPhotos] = useState<File[]>([]);
    const [links, setLinks] = useState<string[]>(['']);
    
    // Get current user
    const { data: currentUserData } = useCurrentUser();
    const currentUser = currentUserData?.user;

    const { data: currentProfileData } = useCurrentProfile();
    const currentProfile = currentProfileData?.profile;

    // Use the mutation hook
    const createPostMutation = useCreatePost();

    const handleLabelClick = (label: PostLabel) => {
        if (labels.includes(label)) {
            setLabels(labels.filter((l) => l !== label));
        } else {
            setLabels([...labels, label]);
        }
    };

    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
    };

    const addLinkField = () => {
        setLinks([...links, '']);
    };

    const removeLinkField = (index: number) => {
        if (links.length > 1) {
            const newLinks = links.filter((_, i) => i !== index);
            setLinks(newLinks);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setPhotos(files);
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            toast.warning('Title and description are required.');
            return;
        }

        const postData: CreatePostInput = {
            title: title.trim(),
            description: description.trim(),
            labels,
            links: links.filter(link => link.trim() !== ''),
            photos,
        };

        createPostMutation.mutate(postData, {
            onSuccess: () => {
                // Reset form after successful post
                setIsFormVisible(false);
                setTitle('');
                setDescription('');
                setLabels([]);
                setPhotos([]);
                setLinks(['']);
            },
        });
    };

    const getUserInitials = () => {
        if (!currentUser) return "U";
        return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
    };

    return (
        <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                {!isFormVisible ? (
                    /* Collapsed State - LinkedIn Style */
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage 
                                src={currentProfile?.profilePic} 
                                alt={currentUser?.firstName}
                            />
                            <AvatarFallback className="bg-muted text-muted-foreground">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={() => setIsFormVisible(true)}
                            className="flex-1 text-left px-4 py-2.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
                        >
                            Share something with your network...
                        </button>
                    </div>
                ) : (
                    /* Expanded State - Full Form */
                    <div className="space-y-4 animate-in">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-border">
                                <AvatarImage 
                                    src={currentProfile?.profilePic} 
                                    alt={currentUser?.firstName}
                                />
                                <AvatarFallback className="bg-muted text-muted-foreground">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-foreground">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Create a post
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Title Input */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium">
                                Title
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Give your post a title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border-border focus-visible:ring-2"
                            />
                        </div>

                        {/* Description Textarea */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Share your thoughts, ideas, or updates..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="border-border resize-none min-h-[120px] focus-visible:ring-2"
                                rows={5}
                            />
                        </div>

                        {/* Labels */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Categories (optional)
                            </Label>
                            <LabelSelector 
                                selectedLabels={labels} 
                                onLabelClick={handleLabelClick} 
                            />
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="photos" className="text-sm font-medium flex items-center gap-2">
                                <Image className="h-4 w-4 text-primary" />
                                Photos (optional)
                            </Label>
                            <Input
                                id="photos"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="border-border file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                            />
                            {photos.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {photos.map((photo, index) => (
                                        <div 
                                            key={index}
                                            className="relative group"
                                        >
                                            <div className="h-20 w-20 rounded-lg border-2 border-border overflow-hidden bg-muted">
                                                <img
                                                    src={URL.createObjectURL(photo)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removePhoto(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Links */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Link2 className="h-4 w-4 text-primary" />
                                    Links (optional)
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={addLinkField}
                                    className="h-8 text-xs"
                                >
                                    + Add Link
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {links.map((link, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={link}
                                            onChange={(e) => handleLinkChange(index, e.target.value)}
                                            className="border-border"
                                        />
                                        {links.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLinkField(index)}
                                                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsFormVisible(false);
                                    setTitle('');
                                    setDescription('');
                                    setLabels([]);
                                    setPhotos([]);
                                    setLinks(['']);
                                }}
                                disabled={createPostMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={createPostMutation.isPending}
                            >
                                {createPostMutation.isPending ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}