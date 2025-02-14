// import React from "react";

export function Post({post}: {post : any} ) {

  return (
    <>
      {/* <div className="flex-1 bg-gray-800 rounded-lg p-6"> */}
    {/* <h3 className="text-xl font-bold mb-6">Your Posts</h3> */}
    {/* <div className="space-y-6"> */}
        {/* Example Post 1 */}
        <div className="bg-gray-700 rounded-lg p-6 mb-3 overflow-auto">
            <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                    <img
                        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold text-white">{post?.user.firstName} {post?.user.lastName}</p>
                        {/* <p className="text-sm text-gray-400"></p> */}
                    </div>
                </div>
                {/* Timestamp */}
                {/* <p className="text-sm text-gray-400">2h ago</p> */}
            </div>

            {/* Post Content */}
            <p className="mt-4 text-gray-300">
                {post?.title}
            </p>
            <p className="mt-4 text-gray-300">
                {post?.description}
            </p>

            {/* Engagement Buttons */}
            <div className="flex items-center justify-between mt-6">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                    <span>👍</span>
                    <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                    <span>💬</span>
                    <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500">
                    <span>🔗</span>
                    <span>Share</span>
                </button>
            </div>
        </div>
    {/* </div> */}
{/* </div> */}
    </>
  );
}