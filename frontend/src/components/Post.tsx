
export function Post({ post }: { post: any }) {

    const getImageUrl = (photo: string) => {
        if (!photo) return "";
    
        const formattedUrl = photo.replace(/\\/g, "/");
    

        const filename = formattedUrl.split("/").pop();
    

        if (formattedUrl.startsWith("https")) {
            return formattedUrl;
        }
    
        if (formattedUrl.startsWith("/uploads")) {
            return formattedUrl;
        }
    
 
        if (formattedUrl.startsWith("/opt/render/project/src/backend/dist/uploads")) {
            return `/uploads/${filename}`;
        }
    
        return `/uploads/${filename}`;
    };

    const profileUrl = getImageUrl(post?.user?.profile?.profilePic)

    return (
        <div className="bg-gray-800 rounded-lg p-6  overflow-auto">
            {/* User Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img
                        src={
                            profileUrl
                                ? `https://uni-networking-app.onrender.com${profileUrl}`
                                : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                        }
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-semibold text-white">
                            {post?.user?.firstName} {post?.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{post?.user?.department}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400">{new Date(post?.createdAt).toLocaleString()}</p>
            </div>

            {/* Labels */}
            {post?.labels?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.labels.map((label: string, index: number) => (
                        <span key={index} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full">
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Post Content */}
            <p className="mt-4 text-gray-300 font-bold">{post?.title}</p>
            <p className="mt-2 text-gray-300">{post?.description}</p>
            
            {post?.links?.length > 0 && (
                <>
                    {post.links.map((link: string, index: number) => (
                        <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="text-white">Link : {link} </a>
                    ))}
                </>
            )}

            {/* Photos */}
            {post?.photos?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {post.photos.map((photo: string, index: number) => {
                        const imageUrl = getImageUrl(photo);
                        return (
                            <img
                                key={index}
                                src={`https://uni-networking-app.onrender.com${imageUrl}`}
                                alt={`Post photo ${index + 1}`}
                                className="w-full h-auto rounded-lg"
                                onError={(e) => {
                                    console.error(`Failed to load image: ${imageUrl}`, e);
                                    (e.target as HTMLImageElement).src = "/default-placeholder.png";
                                }}
                            />
                        );
                    })}
                </div>
            )}


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
    );
}