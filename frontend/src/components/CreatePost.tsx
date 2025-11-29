import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCreatePost } from '@/hooks/mutations/post';
import { CreatePostInput, PostLabel } from '@/types/types';

const labelsList : PostLabel[] = [
    "Achievements",
    "Study Resources",
    "Collaboration Requests",
    "Internship/Job Openings",
    "Coursework Discussions",
    "Research & Innovations",
    "Bounty",
    "Contribution",
]

function Label({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selected ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
        >
            {label}
        </button>
    );
}

function LabelSelector({ selectedLabels, onLabelClick }: { selectedLabels: PostLabel[]; onLabelClick: (label: PostLabel) => void }) {
    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {labelsList.map((label) => (
                <Label
                    key={label}
                    label={label}
                    selected={selectedLabels.includes(label)}
                    onClick={() => onLabelClick(label)}
                />
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
    const [links, setLinks] = useState<string[]>([]);

    //  Use the mutation hook
    const createPostMutation = useCreatePost();

    const handleLabelClick = (label: PostLabel) => {
        if (labels.includes(label)) {
            setLabels(labels.filter((l) => l !== label));
        } else {
            setLabels([...labels, label]);
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

        // ✅ Use mutation - it handles success/error automatically
        createPostMutation.mutate(postData, {
            onSuccess: () => {
                // Reset form after successful post
                setIsFormVisible(false);
                setTitle('');
                setDescription('');
                setLabels([]);
                setPhotos([]);
                setLinks([]);
            },
            // Error handling is already done globally in queryClient.ts
            // But you can add custom error handling here if needed
        });
    };

    return (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md mb-6">
            {!isFormVisible ? (
                <input
                    type="text"
                    placeholder="What's on your mind?"
                    onClick={() => setIsFormVisible(true)}
                    className="w-full p-2 mb-4 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ) : (
                <div className="transition-all duration-300 ease-in-out">
                    <h3 className="text-xl font-bold mb-4">Create Post</h3>
                    
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                    />
                    
                    <LabelSelector selectedLabels={labels} onLabelClick={handleLabelClick} />
                    
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Photos (optional)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {photos.length > 0 && (
                            <p className="text-sm text-gray-400 mt-1">
                                {photos.length} file{photos.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Links (optional)</label>
                        <input
                            type="text"
                            placeholder="Add links separated by commas"
                            value={links.join(', ')}
                            onChange={(e) => setLinks(e.target.value.split(',').map(link => link.trim()))}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setIsFormVisible(false);
                                // Reset form on cancel
                                setTitle('');
                                setDescription('');
                                setLabels([]);
                                setPhotos([]);
                                setLinks([]);
                            }}
                            disabled={createPostMutation.isPending}
                            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={createPostMutation.isPending}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {createPostMutation.isPending ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}