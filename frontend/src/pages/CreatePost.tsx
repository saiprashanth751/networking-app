// // import { useEffect, useState } from "react";
// // import { InputBox } from "../components/InputBox";
// // import { Heading } from "../components/Heading";
// // import { Button } from "../components/Button";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";

// // export default function CreatePost() {
// //     const[title, setTitle] = useState("")
// //     const[description, setDescription] = useState("")
// //     const navigate = useNavigate()

// //     useEffect(() => {
// //         const token = localStorage.getItem("token")
// //         if(!token){
// //             navigate("/signin")
// //         }

// //     })

// //     return (
// //         <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
// //             <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-7">
// //                 <Heading label="Create Your Profile" />
                
// //                 <div className="space-y-4">
// //                     <InputBox 
// //                         onChange={(e) => setTitle(e.target.value)} 
// //                         label="Title" 
// //                     />

// //                     <InputBox 
// //                         onChange={(e) => setDescription(e.target.value)} 
// //                         label="Content" 
// //                     />
// //                 </div>

// //                 <div className="mt-6 flex justify-center">
// //                     <Button 
// //                         onClick={async () => {
// //                             await axios.post("https://uni-networking-app.onrender.com/api/v1/userPost/", {
// //                                 title,
// //                                 description
// //                             }, {
// //                                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
// //                             });
// //                             navigate("/dashboard")
// //                         }}
// //                         label="Create Profile"
// //                     />
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }


// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar } from "@/components/ui/avatar";
// import { Search, MoreHorizontal } from "lucide-react";

// export default function ProfilePage() {
//   return (
//     <div className="flex min-h-screen bg-black text-white">
//       {/* Sidebar */}
//       <div className="w-64 p-4 border-r border-gray-800 flex flex-col space-y-4">
//         <h1 className="text-xl font-bold">X</h1>
//         <nav className="flex flex-col space-y-4">
//           <a href="#" className="text-lg">Home</a>
//           <a href="#" className="text-lg">Explore</a>
//           <a href="#" className="text-lg">Notifications</a>
//           <a href="#" className="text-lg">Messages</a>
//           <a href="#" className="text-lg">Profile</a>
//         </nav>
//         <Button className="mt-auto">Post</Button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1">
//         {/* Profile Header */}
//         <div className="relative w-full h-48 bg-gray-700"></div>
//         <div className="px-6 -mt-16 flex items-center">
//           <Avatar className="w-24 h-24 border-4 border-black bg-pink-500 text-3xl flex items-center justify-center">
//             S
//           </Avatar>
//           <div className="ml-4">
//             <h2 className="text-2xl font-bold">Sivakumar Nagireddy</h2>
//             <p className="text-gray-400">@Sivakumar_5</p>
//             <Button className="mt-2">Get Verified</Button>
//           </div>
//           <Button className="ml-auto">Edit Profile</Button>
//         </div>

//         {/* Profile Stats */}
//         <div className="px-6 py-4 border-b border-gray-800">
//           <span className="mr-4">99 Following</span>
//           <span>0 Followers</span>
//         </div>
//       </div>

//       {/* Right Sidebar */}
//       <div className="w-72 p-4 border-l border-gray-800">
//         <div className="flex items-center space-x-2 mb-4">
//           <Search className="text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search"
//             className="bg-transparent border-b border-gray-600 outline-none w-full"
//           />
//         </div>

//         {/* Who to Follow */}
//         <Card className="bg-gray-900 p-4 mb-4">
//           <h3 className="text-lg font-bold">Who to follow</h3>
//           <div className="mt-2 space-y-2">
//             <div className="flex justify-between items-center">
//               <p>@EuphoricEagle19</p>
//               <Button size="sm">Follow</Button>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>@9999pardeep</p>
//               <Button size="sm">Follow</Button>
//             </div>
//             <div className="flex justify-between items-center">
//               <p>@BrahmaSai77</p>
//               <Button size="sm">Follow</Button>
//             </div>
//           </div>
//         </Card>
        

//         {/* What's Happening */}
//         <Card className="bg-gray-900 p-4">
//           <h3 className="text-lg font-bold">What's happening</h3>
//           <div className="mt-2">
//             <p>#ChhaavaInCinemas 🍿</p>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }