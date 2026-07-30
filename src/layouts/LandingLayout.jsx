import { Outlet } from 'react-router-dom';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white font-sans">
      {/* Page content — LandingPage has its own nav */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
