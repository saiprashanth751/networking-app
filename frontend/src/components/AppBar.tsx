import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Loader2, Search } from "lucide-react"
import axios from 'axios';

export function AppBar() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]); 
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);
        try {
            const response = await axios.get(`${import.meta.env.BASE_API_URL}/user/search?name=${searchQuery}`, {
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

    const handleResultClick = (userId: string) => {
        navigate(`/profile/${userId}`);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="fixed top-0 left-0 right-0 bg-gray-900 shadow-md z-50">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 max-w-7xl mx-auto text-white">
                {/* Logo */}
                <div className="text-2xl font-bold text-gray-200">Connect!</div>

                {/* Search Bar with Popover */}
                <div className="flex-1 mx-1 max-w-sm">
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search users by name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSearch(); 
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent 
                            className="w-[400px] p-0 bg-gray-800 border-gray-600 text-white"
                            align="start"
                            sideOffset={5}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                                    <span className="text-gray-400">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="max-h-[300px] overflow-y-auto">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            className="w-full p-3 hover:bg-gray-700 cursor-pointer text-left flex items-center gap-3 border-b border-gray-700 last:border-b-0"
                                            onClick={() => handleResultClick(user.id)}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                {user.email && (
                                                    <div className="text-sm text-gray-400">{user.email}</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery ? (
                                <div className="p-4 text-center text-gray-400">
                                    No users found for "{searchQuery}"
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-400">
                                    Start typing to search users
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => navigate('/userprofile')}
                        variant="outline"
                        className="text-white border-gray-600 hover:bg-gray-800"
                    > 
                        Profile
                    </Button>
                    
                    <Button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/signin');
                        }}
                        variant="destructive"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}