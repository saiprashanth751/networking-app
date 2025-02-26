import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Link } from "react-router-dom";
import axios from "axios";

export function User({ user }: { user: any }) {
  const [follow, setFollow] = useState(false);

  useEffect(() => {
    axios
      .get(`https://uni-networking-app.onrender.com/api/v1/follow/?id=${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setFollow(response.data.following);
      });
  }, []);

  const getImageUrl = (photo: string) => {
    if (!photo) return "";
    const formattedUrl = photo.replace(/\\/g, "/");
    if (!formattedUrl.startsWith("https") && !formattedUrl.startsWith("/uploads")) {
      return `/uploads/${formattedUrl.split("/").pop()}`;
    }
    return formattedUrl;
  };

  const profileUrl = getImageUrl(user?.profile?.profilePic);

  return (
    <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg shadow-md w-full max-w-xl m-auto text-white">
      {/* Left Section: Profile Image & Info */}
      <Link to={`/profile/${user.id}`}>
        <div className="flex items-center gap-x-4">
          <img
            alt="Profile"
            src={`https://uni-networking-app.onrender.com${profileUrl} || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"`}
            className="w-12 h-12 flex-none rounded-full bg-gray-700 object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-white">{user.firstName}</p>
          </div>
        </div>
      </Link>

      {/* Right Section: Follow Button */}
      <div className="hidden sm:flex flex-col items-end">
        <div className="flex items-center gap-x-2 mt-1 px-2">
          <Button
            onClick={async () => {
              if (!follow) {
                await axios.post(
                  `hhttps://uni-networking-app.onrender.com/api/v1/follow/?id=${user.id}`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                setFollow(true);
              } else {
                await axios.delete(
                  `https://uni-networking-app.onrender.com/api/v1/follow/?id=${user.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                setFollow(false);
              }
            }}
            label={follow ? "Unfollow" : "Follow"}
          />
        </div>
      </div>
    </div>
  );
}
