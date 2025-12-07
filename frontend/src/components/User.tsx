import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFollowStatus } from "@/hooks/queries/follow";
import { useToggleFollow } from "@/hooks/mutations/follow";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";

export function User({ user }: { user: any }) {
  // ✅ Fetch follow status using React Query
  const { data: followStatus } = useFollowStatus(user.id);

  // ✅ Toggle follow mutation
  const { toggleFollow, isLoading: isToggling } = useToggleFollow(
    user.id,
    followStatus?.following || false
  );

  const profileUrl = user?.profile?.profilePic ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white hover:bg-gray-750 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Profile Image & Info */}
          <Link 
            to={`/profile/${user.id}`}
            className="flex items-center gap-x-4 flex-1 min-w-0"
          >
            <Avatar className="h-12 w-12 flex-none border-2 border-gray-700">
              <AvatarImage 
                src={profileUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-700 text-gray-300">
                {getUserInitials() || <UserIcon className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              {user.department && (
                <p className="text-xs text-gray-400 truncate">{user.department}</p>
              )}
            </div>
          </Link>

          {/* Right Section: Follow Button */}
          <div className="ml-4">
            <Button
              onClick={toggleFollow}
              disabled={isToggling}
              variant={followStatus?.following ? "destructive" : "default"}
              size="sm"
              className="whitespace-nowrap"
            >
              {isToggling ? "..." : (followStatus?.following ? "Unfollow" : "Follow")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}