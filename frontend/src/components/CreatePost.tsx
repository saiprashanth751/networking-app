import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreatePost } from '@/hooks/mutations/post';
import { CreatePostInput, PostLabel } from '@/types/types';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const labelsList: PostLabel[] = [
    "Achievements",
    "Study Resources",
    "Collaboration Requests",
    "Internship/Job Openings",
    "Coursework Discussions",
    "Research & Innovations",
    "Bounty",
    "Contribution",
]

function LabelSelector({ selectedLabels, onLabelClick }: { selectedLabels: PostLabel[]; onLabelClick: (label: PostLabel) => void }) {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {labelsList.map((label) => (
                <Badge
                    key={label}
                    variant={selectedLabels.includes(label) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 text-sm hover:bg-primary/80 transition-colors"
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
    const [links, setLinks] = useState<string[]>(['']); // Start with one empty link

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

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            toast.warning('Title and description are required.');
            return;
        }

        // Prepare the data according to CreatePostInput type
        const postData: CreatePostInput = {
            title: title.trim(),
            description: description.trim(),
            labels,
            links: links.filter(link => link.trim() !== ''), // Filter empty links
            photos, // File array
        };

        // Use mutation - it handles success/error automatically
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
            // Error handling is already done globally in queryClient.ts
            // But you can add custom error handling here if needed
        });
    };

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md mb-6">
            {!isFormVisible ? (
                <Input
                    type="text"
                    placeholder="What's on your mind?"
                    onClick={() => setIsFormVisible(true)}
                    className="cursor-pointer"
                />
            ) : (
                <div className="transition-all duration-300 ease-in-out space-y-4">
                    <h3 className="text-xl font-bold">Create Post</h3>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Enter post title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What would you like to share?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white resize-none"
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Labels (optional)</Label>
                        <LabelSelector selectedLabels={labels} onLabelClick={handleLabelClick} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="photos">Photos (optional)</Label>
                        <Input
                            id="photos"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                            className="bg-gray-800 border-gray-700 text-white file:text-white file:bg-gray-700 file:border-0 file:mr-4"
                        />
                        {photos.length > 0 && (
                            <p className="text-sm text-gray-400">
                                {photos.length} file{photos.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Links (optional)</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLinkField}
                                className="text-xs"
                            >
                                Add Link
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
                                        className="bg-gray-800 border-gray-700 text-white"
                                    />
                                    {links.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeLinkField(index)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
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
        </div>
    );
}