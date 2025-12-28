import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { queryClient } from './lib/queryClient';
import { MainLayout } from './components/layout/MainLayout';
import { SocketProvider } from './contexts/SocketContext';

import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import UpdateProfile from "./pages/UpdateProfile";
import UserProfile from "./pages/UserProfile";
import Profile from "./pages/Profile";
import Verify from "./pages/Verify";

import ProjectDetail from "./pages/ProjectDetail";
import PostDetail from "./pages/PostDetail";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import Bookmarks from "./pages/Bookmarks";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
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
                path="/post/:id"
                element={
                  <MainLayout showRightSidebar={true}>
                    <PostDetail />
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
                    <Notifications />
                  </MainLayout>
                }
              />

              <Route
                path="/settings/notifications"
                element={
                  <MainLayout showRightSidebar={false}>
                    <NotificationSettings />
                  </MainLayout>
                }
              />

              <Route
                path="/bookmarks"
                element={
                  <MainLayout showRightSidebar={true}>
                    <Bookmarks />
                  </MainLayout>
                }
              />

              {/* Messages - Custom Layout (No MainLayout wrapper) */}
              <Route path="/messages" element={<Messages />} />

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
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </SocketProvider>

        {/* {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </QueryClientProvider >
    </>
  )
}

export default App