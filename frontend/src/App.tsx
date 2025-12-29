import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

import { queryClient } from './lib/queryClient';
import { MainLayout } from './components/layout/MainLayout';
import { SocketProvider } from './contexts/SocketContext';
import { MessageEventCoordinator } from './contexts/MessageEventCoordinator';
import { useNotifications } from './hooks/useNotifications';

// 🔥 LAZY LOADING: Code splitting for better performance
const Signin = lazy(() => import("./pages/Signin"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateProfile = lazy(() => import("./pages/CreateProfile"));
const UpdateProfile = lazy(() => import("./pages/UpdateProfile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Profile = lazy(() => import("./pages/Profile"));
const Verify = lazy(() => import("./pages/Verify"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Explore = lazy(() => import("./pages/Explore"));
const Messages = lazy(() => import("./pages/Messages"));
const Search = lazy(() => import("./pages/Search"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  // 🔥 Initialize push notifications
  useNotifications();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <MessageEventCoordinator>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
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
          </MessageEventCoordinator>
        </SocketProvider>

        {/* {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )} */}
      </QueryClientProvider >
    </>
  )
}

export default App