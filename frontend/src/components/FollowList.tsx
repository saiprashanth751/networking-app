
interface FollowListProps {
    title: string;
    users: any
    onMessageClick: (userId: string) => void; // Add this prop
}

export function FollowList  ({ title, users, onMessageClick }: FollowListProps) {
    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-bold mb-4">{title}</h4>
            <div className="max-h-64 overflow-y-auto">
                {users.map((user:any, index:any) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-600 rounded-lg">
                        <span className="text-gray-300">{user.firstName}</span>
                        <button
                            onClick={() => onMessageClick(user.id)} // Call the callback
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-lg"
                        >
                            Message
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};