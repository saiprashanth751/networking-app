import { BrowserRouter,  Routes, Route } from "react-router-dom"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateProfile from "./pages/CreateProfile"
import UpdateProfile from "./pages/UpdateProfile"
import Profile from "./pages/Profile"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signin/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/signin" element={<Signin/>}></Route>
          <Route path="/createprofile" element={<CreateProfile/>}></Route>
          <Route path="/updateprofile" element={<UpdateProfile/>}></Route>
          <Route path="/profile" element={<Profile/>}></Route>
          <Route path="/dashboard" element={<Dashboard/>}></Route>
          </Routes>  
      </BrowserRouter>
    </>
  )
}

export default App
