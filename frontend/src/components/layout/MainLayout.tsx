import { ReactNode, useState, useEffect } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

interface MainLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

/**
 * MainLayout - Three-column professional layout
 * 
 * Structure:
 * - Left: Collapsible navigation sidebar (280px/72px on desktop)
 * - Center: Scrollable content area with max-width for readability
 * - Right: Fixed suggestions sidebar (320px on desktop, optional)
 * 
 * Mobile: 
 * - Left sidebar slides in via hamburger menu
 * - Center content takes full width
 * - Right sidebar hidden
 */
export function MainLayout({ children, showRightSidebar = true }: MainLayoutProps) {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state changes from localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setIsLeftSidebarCollapsed(JSON.parse(saved));
      }
    };

    checkSidebarState();

    // Listen for storage changes
    window.addEventListener('storage', checkSidebarState);
    return () => window.removeEventListener('storage', checkSidebarState);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Left Sidebar - Navigation */}
      <LeftSidebar />

      {/* Main Content Area - Center Column */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: isLeftSidebarCollapsed ? '72px' : '280px',
          marginRight: showRightSidebar ? '320px' : '0',
        }}
      >
        <div className="min-h-screen max-w-[680px] mx-auto">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Suggestions (Optional) */}
      {showRightSidebar && <RightSidebar />}
    </div>
  );
}