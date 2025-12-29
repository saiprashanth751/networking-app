import { ReactNode } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

interface MainLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

/**
 * MainLayout - Three-column X-inspired layout
 * 
 * Structure:
 * - Left: Fixed navigation sidebar (275px on desktop)
 * - Center: Scrollable content area (main)
 * - Right: Fixed suggestions sidebar (380px on desktop, optional)
 * 
 * Mobile: 
 * - Left sidebar slides in via hamburger menu
 * - Center content takes full width
 * - Right sidebar hidden
 */
export function MainLayout({ children, showRightSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Left Sidebar - Navigation */}
      <LeftSidebar />

      {/* Main Content Area - Center Column */}
      <main className={`
        min-h-screen
        lg:ml-[275px]
        ${showRightSidebar ? 'lg:mr-[380px]' : ''}
      `}>
        <div className="border-r border-neutral-800 min-h-screen">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Suggestions (Optional) */}
      {showRightSidebar && <RightSidebar />}
    </div>
  );
}