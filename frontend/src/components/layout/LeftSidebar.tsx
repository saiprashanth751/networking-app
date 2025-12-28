import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Bell,
  Mail,
  Users,
  Bookmark,
  User,
  MoreHorizontal,
  Menu,
  X as XIcon,
  Settings,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/queries/user";
import { useCurrentProfile } from '@/hooks/queries/profile';
import { useUnreadCount } from '@/hooks/queries/conversation';
import { useUnreadCount as useNotificationUnreadCount } from '@/hooks/queries/notification';
import { CreatePostModal } from '../posts/CreatePostModal';

interface NavItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

export function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Get current user data
  const { data: currentUserData } = useCurrentUser();
  const { data: currentProfileData } = useCurrentProfile();
  const { data: unreadData } = useUnreadCount();
  const { data: notificationUnreadData } = useNotificationUnreadCount();

  const currentUser = currentUserData?.user;
  const currentProfile = currentProfileData?.profile;
  const unreadCount = unreadData?.unreadCount || 0;
  const notificationUnreadCount = notificationUnreadData?.unread || 0;

  // Build NAV_ITEMS dynamically with unread count
  const NAV_ITEMS: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: notificationUnreadCount },
    { icon: Mail, label: 'Messages', path: '/messages', badge: unreadCount },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Users, label: 'Network', path: '/network' },
    { icon: User, label: 'Profile', path: '/userprofile' },
  ];

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    return `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase();
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm border-b border-neutral-800">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-neutral-900 rounded-full transition-colors"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">C</span>
            </div>
            <span className="text-lg font-bold">Connect</span>
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-[275px] border-r border-neutral-800 px-3 z-40
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        bg-background
        pt-14 lg:pt-0
      `}>
        <div className="flex flex-col h-full py-2">
          {/* Logo - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 mb-2">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-base font-bold">C</span>
            </div>
            <span className="text-xl font-bold">Connect</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center gap-5 px-3 py-3 rounded-full transition-colors w-full
                    ${active ? 'font-bold' : 'hover:bg-neutral-900'}
                  `}
                >
                  <div className="relative">
                    <Icon className="h-[26px] w-[26px]" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-[18px] min-w-[18px] flex items-center justify-center px-1 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xl">{item.label}</span>
                </button>
              );
            })}

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-5 px-3 py-3 rounded-full hover:bg-neutral-900 transition-colors w-full">
                  <MoreHorizontal className="h-[26px] w-[26px]" />
                  <span className="text-xl">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/updateprofile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notification Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Post Button */}
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 mb-4 text-[17px] transition-colors"
          >
            Post
          </button>

          {/* User Profile at Bottom */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between px-3 py-3 hover:bg-neutral-900 rounded-full transition-colors w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage
                      src={currentProfile?.profilePic}
                      alt={currentUser?.firstName}
                    />
                    <AvatarFallback className="bg-muted text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="font-bold text-[15px] truncate">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </span>
                    <span className="text-neutral-500 text-[15px] truncate">
                      @{currentUser?.firstName?.toLowerCase() || 'user'}
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium leading-none">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground leading-none">
                    @{currentUser?.firstName?.toLowerCase()}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/userprofile')}>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/updateprofile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}