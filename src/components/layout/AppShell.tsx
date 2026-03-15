import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-background bg-mesh">
      <TopBar />
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
