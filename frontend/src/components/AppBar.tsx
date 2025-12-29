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
import { SPACING, Small, Caption } from '@/components/layout';

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
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8 gap-3 md:gap-4">
                {/* Logo */}
                <button 
                    className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80"
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">C</span>
                    </div>
                    <span className="hidden sm:inline text-xl font-bold tracking-tight">Connect</span>
                </button>

                {/* Search Bar - Mobile First */}
                <div className="flex-1 max-w-md">
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSearch(); 
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9 h-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-ring transition-all"
                                />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent 
                            className="w-[calc(100vw-2rem)] sm:w-[400px] p-0"
                            align="start"
                            sideOffset={8}
                        >
                            {isLoading ? (
                                <div className={`flex items-center justify-center ${SPACING.container.md}`}>
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                                    <Small className="text-muted-foreground">Searching...</Small>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                                    <div className={`p-2 ${SPACING.stack.xs}`}>
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.id}
                                                className={cn(
                                                    "w-full p-3 rounded-lg transition-all",
                                                    "flex items-center gap-3",
                                                    "hover:bg-accent text-left",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                )}
                                                onClick={() => handleResultClick(user.id)}
                                            >
                                                <Avatar className="h-10 w-10 border-2 border-border shrink-0">
                                                    <AvatarImage src={user.profile?.profilePic} />
                                                    <AvatarFallback className="text-xs bg-muted">
                                                        {getUserInitials(user)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <Small className="font-medium truncate block">
                                                        {user.firstName} {user.lastName}
                                                    </Small>
                                                    {user.department && (
                                                        <Caption className="truncate block">
                                                            {user.department}
                                                        </Caption>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : searchQuery ? (
                                <div className={`p-8 text-center ${SPACING.stack.sm}`}>
                                    <UserIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                    <Small className="font-medium">No users found</Small>
                                    <Caption>Try searching with a different name</Caption>
                                </div>
                            ) : (
                                <div className={`p-8 text-center ${SPACING.stack.sm}`}>
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                                    {/* <Small className="font-medium">Search for users</Small> */}
                                    <Caption>Start typing to find people</Caption>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Actions - Mobile Optimized */}
                <div className={`flex items-center ${SPACING.inline.xs}`}>
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-10 w-10"
                        onClick={() => {
                            // TODO: Implement notifications
                        }}
                    >
                        <Bell className="h-5 w-5" />
                    </Button>

                    {/* Mobile Menu Trigger */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-10 w-10"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* User Menu - Desktop */}
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
                                <span className="hidden md:inline text-sm font-medium">
                                    {currentUser?.firstName}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className={SPACING.stack.xs}>
                                    <Small className="font-medium leading-none">
                                        {currentUser?.firstName} {currentUser?.lastName}
                                    </Small>
                                    {/* <Caption className="leading-none">
                                        {currentUser?.email}
                                    </Caption> */}
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