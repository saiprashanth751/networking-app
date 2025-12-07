import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Search, 
  LogOut, 
  User as UserIcon,
  Settings,
  Bell,
  Menu,
} from "lucide-react";
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useCurrentUser } from "@/hooks/queries/user";
import { useCurrentProfile } from '@/hooks/queries/profile';

export function AppBar() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    // Get current user for profile menu
    const { data: currentUserData } = useCurrentUser();
    const currentUser = currentUserData?.user;

    const { data: currentProfileData } = useCurrentProfile();
    const currentProfile = currentProfileData?.profile;
 
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]); 
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);
        try {
            const response = await axios.get(
                `${import.meta.env.BASE_API_URL}/user/search?name=${searchQuery}`, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
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
        setSearchResults([]);
    };

    const getUserInitials = (user: any) => {
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/signin');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div 
                    className="flex items-center gap-2 cursor-pointer transition-smooth hover:opacity-80"
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">C</span>
                    </div>
                    <span className="hidden sm:inline text-xl font-bold tracking-tight">Connect</span>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSearch(); 
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9 h-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-ring transition-smooth"
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent 
                            className="w-[400px] p-0"
                            align="start"
                            sideOffset={8}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center p-6">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                                    <span className="text-sm text-muted-foreground">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                    <div className="p-2 space-y-1">
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                className={cn(
                                                    "w-full p-3 rounded-lg transition-smooth",
                                                    "flex items-center gap-3",
                                                    "hover:bg-accent text-left",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                )}
                                                onClick={() => handleResultClick(user.id)}
                                            >
                                                <Avatar className="h-10 w-10 border-2 border-border">
                                                    <AvatarImage src={user.profile?.profilePic} />
                                                    <AvatarFallback className="text-xs bg-muted">
                                                        {getUserInitials(user)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    {user.department && (
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {user.department}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : searchQuery ? (
                                <div className="p-8 text-center">
                                    <UserIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        No users found
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Try searching with a different name
                                    </p>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Search for users
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Start typing to find people
                                    </p>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {/* Notifications - Placeholder for now */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-10 w-10"
                        onClick={() => {
                            // TODO: Implement notifications
                        }}
                    >
                        <Bell className="h-5 w-5" />
                        {/* Notification badge - uncomment when ready */}
                        {/* <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            3
                        </Badge> */}
                    </Button>

                    {/* Mobile Menu */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="sm:hidden h-10 w-10"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                className="relative h-10 gap-2 px-2 hover:bg-accent"
                            >
                                <Avatar className="h-8 w-8 border-2 border-border">
                                    <AvatarImage 
                                        src={currentProfile?.profilePic} 
                                        alt={currentUser?.firstName}
                                    />
                                    <AvatarFallback className="bg-muted text-xs">
                                        {currentUser ? getUserInitials(currentUser) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline text-sm font-medium">
                                    {currentUser?.firstName}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {currentUser?.firstName} {currentUser?.lastName}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {currentUser?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => navigate('/userprofile')}
                                className="cursor-pointer"
                            >
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate('/updateprofile')}
                                className="cursor-pointer"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}