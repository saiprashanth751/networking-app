import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import axios from 'axios';

export function AppBar() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]); 
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/user/search?name=${searchQuery}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setSearchResults(response.data.users); 
        } catch (error) {
            console.error('Failed to search users:', error);
            setSearchResults([]); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-gray-900 shadow-md z-50">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 max-w-7xl mx-auto text-white">
                {/* Logo */}
                <div className="text-2xl font-bold text-gray-200">Connect!</div>

                {/* Search Bar */}
                <div className="flex-1 mx-1 max-w-sm relative">
                    <input
                        type="text"
                        placeholder="Search users by name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(); 
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full p-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Search Results Dropdown */}
                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg mt-1 z-50 text-white">
                            {isLoading ? (
                                <div className="p-2 text-gray-400">Loading...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-2 hover:bg-gray-700 cursor-pointer"
                                        onClick={() => navigate(`/profile/${user.id}`)}
                                    >
                                        {user.firstName} {user.lastName}
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-gray-400">No users found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => navigate('/userprofile')}
                        label="Profile"
                        
                    />
                    <Button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/signin');
                        }}
                        label="Sign out"
                        
                    />
                </div>
            </div>
        </div>
    );
}
