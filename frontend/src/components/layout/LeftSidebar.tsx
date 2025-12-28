import { useState, useEffect } from 'react';
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { cn } from '@/lib/utils';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get current user data
  const { data: currentUserData } = useCurrentUser();
  const { data: currentProfileData } = useCurrentProfile();
  const { data: unreadData } = useUnreadCount();
  const { data: notificationUnreadData } = useNotificationUnreadCount();

  const currentUser = currentUserData?.user;
  const currentProfile = currentProfileData?.profile;
  const unreadCount = unreadData?.unreadCount || 0;
  const notificationUnreadCount = notificationUnreadData?.unread || 0;

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    // Trigger storage event for MainLayout
    window.dispatchEvent(new Event('storage'));
  };

  // Navigation sections
  const PRIMARY_NAV: NavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Users, label: 'Network', path: '/network' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: notificationUnreadCount },
    { icon: Mail, label: 'Messages', path: '/messages', badge: unreadCount },
  ];

  const ACADEMIC_NAV: NavItem[] = [
    { icon: Briefcase, label: 'Projects', path: '/projects' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  ];

  const PERSONAL_NAV: NavItem[] = [
    { icon: User, label: 'Profile', path: '/userprofile' },
    { icon: Settings, label: 'Settings', path: '/updateprofile' },
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

  // Calculate profile completion
  const getProfileCompletion = () => {
    if (!currentProfile) return 0;
    let completed = 0;
    const fields = [
      currentProfile.profilePic,
      currentProfile.bio,
      currentProfile.department,
      currentProfile.graduationYear,
      currentProfile.linkedin || currentProfile.github,
    ];
    fields.forEach(field => { if (field) completed++; });
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = getProfileCompletion();

  return (
    <>
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-black/90 border-b border-neutral-800">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-all duration-150"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-neutral-800 rounded-md flex items-center justify-center border border-neutral-700">
              <span className="text-sm font-semibold">C</span>
            </div>
            <span className="text-base font-semibold">Connect</span>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen border-r border-neutral-800 z-40",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-[280px]",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        "bg-background",
        "pt-14 lg:pt-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header with logo and toggle */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-4">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-neutral-800 rounded-md flex items-center justify-center border border-neutral-700">
                  <span className="text-sm font-semibold">C</span>
                </div>
                <span className="text-sm font-semibold">Connect</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground",
                isCollapsed && "mx-auto"
              )}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
            {/* Primary Navigation */}
            <NavSection title="Navigate" isCollapsed={isCollapsed}>
              {PRIMARY_NAV.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={isActive(item.path)}
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </NavSection>

            <Separator className="bg-neutral-800" />

            {/* Academic Section */}
            <NavSection title="Academic" isCollapsed={isCollapsed}>
              {ACADEMIC_NAV.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={isActive(item.path)}
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </NavSection>

            <Separator className="bg-neutral-800" />

            {/* Personal Section */}
            <NavSection title="Personal" isCollapsed={isCollapsed}>
              {PERSONAL_NAV.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  active={isActive(item.path)}
                  isCollapsed={isCollapsed}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                />
              ))}
            </NavSection>

            {/* Profile Completion Widget - Only when expanded */}
            {!isCollapsed && profileCompletion < 100 && (
              <div className="mx-1 mt-6 rounded-md border border-neutral-800 bg-neutral-900/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium">Profile Strength</span>
                  <span className="text-xs font-semibold text-blue-400">{profileCompletion}%</span>
                </div>
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Complete your profile to connect better
                </p>
              </div>
            )}
          </nav>

          {/* Create Post Button */}
          <div className="px-3 pb-3">
            <Button
              onClick={() => setIsCreatePostOpen(true)}
              className={cn(
                "w-full bg-blue-600 hover:bg-blue-700 transition-all duration-150",
                isCollapsed ? "px-0" : "gap-2"
              )}
            >
              {isCollapsed ? (
                <span className="text-xl">+</span>
              ) : (
                <>
                  <span className="text-xl">+</span>
                  <span>Create</span>
                </>
              )}
            </Button>
          </div>

          {/* User Profile Footer */}
          <div className="border-t border-neutral-800 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center w-full hover:bg-neutral-900 rounded-lg transition-all duration-150",
                  isCollapsed ? "justify-center p-2" : "gap-3 p-2"
                )}>
                  <Avatar className={cn(
                    "border border-neutral-700",
                    isCollapsed ? "h-9 w-9" : "h-10 w-10"
                  )}>
                    <AvatarImage
                      src={currentProfile?.profilePic}
                      alt={currentUser?.firstName}
                    />
                    <AvatarFallback className="bg-neutral-800 text-xs font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 overflow-hidden text-left">
                      <div className="font-medium text-sm truncate">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {currentProfile?.department || 'Student'}
                      </div>
                    </div>
                  )}
                  {!isCollapsed && (
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium leading-none">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground leading-none">
                      {currentProfile?.department || 'Student'}
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
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavSection({
  title,
  isCollapsed,
  children,
}: {
  title: string;
  isCollapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  isCollapsed,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: number;
  isCollapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-neutral-800 text-white"
          : "text-muted-foreground hover:bg-neutral-900 hover:text-white",
        isCollapsed && "justify-center"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="flex-1 text-left">{label}</span>}
      {badge !== undefined && badge > 0 && !isCollapsed && (
        <span className={cn(
          "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
          active ? "bg-blue-600 text-white" : "bg-neutral-800 text-white"
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {badge !== undefined && badge > 0 && isCollapsed && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-600" />
      )}
    </button>
  );
}