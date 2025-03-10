import { BrowserRouter,  Routes, Route } from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateProfile from "./pages/CreateProfile"
import UpdateProfile from "./pages/UpdateProfile"
import UserProfile from "./pages/UserProfile"
import Profile from "./pages/Profile"
import Verify from "./pages/Verify"
import UserPost from "./pages/UserPost"
// import MessageBox from "./pages/MessageBox"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/signin" element={<Signin/>}></Route>
          <Route path="/verify" element={<Verify/>}></Route>
          <Route path="/createprofile" element={<CreateProfile/>}></Route>
          <Route path="/updateprofile" element={<UpdateProfile/>}></Route>
          <Route path="/userprofile" element={<UserProfile/>}></Route>
          <Route path="/profile/:id" element={<Profile/>}></Route>
          <Route path="/userPost" element={<UserPost/>}></Route>
          <Route path="/dashboard" element={<Dashboard/>}></Route>
          {/* <Route path="/messaging/:userId" element={<MessageBox/>}></Route> */}
          </Routes>  
      </BrowserRouter>
    </>
  )
}

export default App
