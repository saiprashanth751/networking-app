import { BrowserRouter,  Routes, Route } from "react-router-dom"
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { queryClient } from './lib/queryClient';

//importing pages
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateProfile from "./pages/CreateProfile"
import UpdateProfile from "./pages/UpdateProfile"
import UserProfile from "./pages/UserProfile"
import Profile from "./pages/Profile"
import Verify from "./pages/Verify"

function App() {

  return (
    <>
    <QueryClientProvider client={queryClient}>
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
          <Route path="/dashboard" element={<Dashboard/>}></Route>
          {/* <Route path="/messaging/:userId" element={<MessageBox/>}></Route> */}
          </Routes>  
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      </QueryClientProvider>
    </>
  )
}

export default App
