import { Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    const titles = {
      "/admin": "Dashboard",
      "/admin/courses": "Courses",
      "/admin/users": "Users",
      "/admin/analytics": "Analytics",
      "/admin/blog": "Blog",
      "/admin/settings": "Settings",
      "/teacher/analytics": "Teacher Analytics",
      "/teacher/analytics/heatmap": "Video Heatmaps",
    };
    return titles[pathname] || "Admin Panel";
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-[#0f172a] z-40 flex flex-col">
        {/* Logo */}
        <div className="h-[48px] flex items-center px-5 border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#2563eb] rounded flex items-center justify-center">
              <span className="text-white font-semibold text-xs">SI</span>
            </div>
            <span className="text-white text-sm font-medium">SashaInfinity</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <NavItem path="/admin" currentPath={location.pathname}>Dashboard</NavItem>
          <NavItem path="/admin/courses" currentPath={location.pathname}>Courses</NavItem>
          <NavItem path="/admin/users" currentPath={location.pathname}>Users</NavItem>
          <NavItem path="/admin/analytics" currentPath={location.pathname}>Analytics</NavItem>
          <NavItem path="/admin/blog" currentPath={location.pathname}>Blog</NavItem>
          <NavItem path="/admin/settings" currentPath={location.pathname}>Settings</NavItem>
        </nav>

        {/* Back to Site */}
        <div className="p-4 border-t border-[#1e293b] shrink-0">
          <a href="/" className="flex items-center gap-2 text-[#94a3b8] hover:text-white text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to site
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-[240px]">
        {/* Top Bar */}
        <header className="h-[48px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-5 shrink-0">
          <h1 className="text-[#0f172a] text-sm font-medium">{getPageTitle(location.pathname)}</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-[#64748b] hover:text-[#0f172a] text-sm">View site</a>
            <div className="w-7 h-7 bg-[#0f172a] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ path, currentPath, children }) => {
  const isActive = currentPath === path || (path !== "/admin" && currentPath.startsWith(path));

  return (
    <a
      href={path}
      className={`flex items-center px-5 py-2 text-sm border-l-2 ${
        isActive
          ? "text-white bg-[#1e293b] border-[#2563eb]"
          : "text-[#94a3b8] border-transparent hover:text-white hover:bg-[#1e293b]"
      }`}
    >
      {children}
    </a>
  );
};

export default AdminLayout;
