import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const labelsList = [
    "Achievements",
    "Study Resources",
    "Collaboration Requests",
    "Internship/Job Openings",
    "Coursework Discussions",
    "Research & Innovations",
    "Bounty",
    "Contribution",
];

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

function LabelSelector({ selectedLabels, onLabelClick }: { selectedLabels: string[]; onLabelClick: (label: string) => void }) {
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

export function CreatePost({ onCreate }: { onCreate: () => void }) {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [photos, setPhotos] = useState<File[]>([]);
    const [links, setLinks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLabelClick = (label: string) => {
        if (labels.includes(label)) {
            setLabels(labels.filter((l) => l !== label));
        } else {
            setLabels([...labels, label]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            toast.warning('Title and description are required.');
            return;
        }

        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('labels', JSON.stringify(labels));
        formData.append('links', JSON.stringify(links));
        photos.forEach((photo) => formData.append('photos', photo));

        try {
            await axios.post('https://uni-networking-app.onrender.com/api/v1/post/create', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post created successfully!');
            onCreate(); 
            setIsFormVisible(false); 
            setTitle(''); 
            setDescription('');
            setLabels([]);
            setPhotos([]);
            setLinks([]);
        } catch (error) {
            console.error(error);
            setError('Failed to create post. Please try again.');
            toast.error('Failed to create post. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                    {error && <p className="text-red-500 mb-4">{error}</p>}
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
                    />
                    <LabelSelector selectedLabels={labels} onLabelClick={handleLabelClick} />
                    <div className="mb-4">
                        <label className="block mb-2">Photos</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Links</label>
                        <input
                            type="text"
                            placeholder="Add a link"
                            value={links.join(', ')}
                            onChange={(e) => setLinks(e.target.value.split(', '))}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsFormVisible(false)}
                            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                        >
                            {isLoading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            )}

            {/* Toast Container for Notifications */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}