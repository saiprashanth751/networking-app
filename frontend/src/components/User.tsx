import { Button } from "./Button";
import { Link } from "react-router-dom";
import { useFollowStatus } from "@/hooks/queries/follow";
import { useToggleFollow } from "@/hooks/mutations/follow";

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

  return (
    <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg shadow-md w-full max-w-xl m-auto text-white">
      {/* Left Section: Profile Image & Info */}
      <Link to={`/profile/${user.id}`}>
        <div className="flex items-center gap-x-4">
          <img
            alt="Profile"
            src={profileUrl}
            className="w-12 h-12 flex-none rounded-full bg-gray-700 object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {user.firstName} {user.lastName}
            </p>
            {user.department && (
              <p className="text-xs text-gray-400">{user.department}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Right Section: Follow Button */}
      <div className="hidden sm:flex flex-col items-end">
        <div className="flex items-center gap-x-2 mt-1 px-2">
          <Button
            onClick={toggleFollow}
            label={isToggling ? "..." : (followStatus?.following ? "Unfollow" : "Follow")}
            disabled={isToggling}
          />
        </div>
      </div>
    </div>
  );
}