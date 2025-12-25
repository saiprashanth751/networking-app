import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { queryClient } from './lib/queryClient';
import { MainLayout } from './components/layout/MainLayout';

// Importing pages
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateProfile from "./pages/CreateProfile"
import UpdateProfile from "./pages/UpdateProfile"
import UserProfile from "./pages/UserProfile"
import Profile from "./pages/Profile"
import Verify from "./pages/Verify"
import ProjectDetail from "./pages/ProjectDetail"
import Explore from "./pages/Explore"
import Messages from "./pages/Messages"
import Search from "./pages/Search"

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes - No MainLayout */}
            <Route path="/" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/verify" element={<Verify />} />

            {/* Protected Routes - With MainLayout */}
            <Route path="/createprofile" element={<CreateProfile />} />

            <Route
              path="/dashboard"
              element={
                <MainLayout showRightSidebar={true}>
                  <Dashboard />
                </MainLayout>
              }
            />

            <Route
              path="/userprofile"
              element={
                <MainLayout showRightSidebar={true}>
                  <UserProfile />
                </MainLayout>
              }
            />

            <Route
              path="/profile/:id"
              element={
                <MainLayout showRightSidebar={true}>
                  <Profile />
                </MainLayout>
              }
            />

            <Route
              path="/updateprofile"
              element={
                <MainLayout showRightSidebar={false}>
                  <UpdateProfile />
                </MainLayout>
              }
            />

            <Route
              path="/project/:id"
              element={
                <MainLayout showRightSidebar={false}>
                  <ProjectDetail />
                </MainLayout>
              }
            />

            <Route
              path="/explore"
              element={
                <MainLayout showRightSidebar={true}>
                  <Explore />
                </MainLayout>
              }
            />

            <Route
              path="/search"
              element={
                <MainLayout showRightSidebar={true}>
                  <Search />
                </MainLayout>
              }
            />

            <Route
              path="/notifications"
              element={
                <MainLayout showRightSidebar={false}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">Notifications</h1>
                    <p className="text-neutral-500">Coming soon...</p>
                  </div>
                </MainLayout>
              }
            />

            {/* Messages - Custom Layout (No MainLayout wrapper) */}
            <Route path="/messages" element={<Messages />} />

            <Route
              path="/bookmarks"
              element={
                <MainLayout showRightSidebar={true}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">Bookmarks</h1>
                    <p className="text-neutral-500">Coming soon...</p>
                  </div>
                </MainLayout>
              }
            />

            <Route
              path="/network"
              element={
                <MainLayout showRightSidebar={true}>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold mb-2">Network</h1>
                    <p className="text-neutral-500">Coming soon...</p>
                  </div>
                </MainLayout>
              }
            />
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
          theme="dark"
        />

        {/* {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </QueryClientProvider>
    </>
  )
}

export default App