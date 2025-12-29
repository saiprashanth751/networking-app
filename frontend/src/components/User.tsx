import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFollowStatus } from "@/hooks/queries/follow";
import { useToggleFollow } from "@/hooks/mutations/follow";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Loader2 } from "lucide-react";
import { SPACING, Small, Caption } from "@/components/layout";

export function User({ user }: { user: any }) {
  // Fetch follow status using React Query
  const { data: followStatus } = useFollowStatus(user.id);

  // Toggle follow mutation
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
    <Card className="group border-border bg-card hover:shadow-md hover:border-primary/50 transition-all duration-200">
      <CardContent className={SPACING.container.sm}>
        <div className={`flex items-start ${SPACING.inline.sm}`}>
          {/* Profile Image */}
          <Link 
            to={`/profile/${user.id}`}
            className="flex-shrink-0"
          >
            <Avatar className="h-12 w-12 border-2 border-border group-hover:border-primary transition-colors">
              <AvatarImage 
                src={profileUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {getUserInitials() || <UserIcon className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <Link 
              to={`/profile/${user.id}`}
              className="block group/link"
            >
              <Small className="font-semibold truncate block group-hover/link:text-primary transition-colors">
                {user.firstName} {user.lastName}
              </Small>
            </Link>
            
            {user.department && (
              <Caption className="truncate block mt-0.5">
                {user.department}
              </Caption>
            )}

            {user.profile?.bio && (
              <Caption className="line-clamp-2 mt-1.5 leading-relaxed">
                {user.profile.bio}
              </Caption>
            )}

            {/* Follow Status Badge - Mobile Friendly */}
            {followStatus?.following && (
              <Badge 
                variant="outline" 
                className="mt-2 text-xs border-primary/30 text-primary"
              >
                Following
              </Badge>
            )}
          </div>

          {/* Follow Button - Always Visible on Desktop, Compact on Mobile */}
          <div className="flex-shrink-0">
            <Button
              onClick={toggleFollow}
              disabled={isToggling}
              variant={followStatus?.following ? "outline" : "default"}
              size="sm"
              className="h-8 min-w-[70px] md:min-w-[80px]"
            >
              {isToggling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                followStatus?.following ? "Unfollow" : "Follow"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}