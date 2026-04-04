import Sidebar from '@/components/admin/Sidebar';
import Navbar from '@/components/admin/Navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="p-5 w-full overflow-y-auto">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
