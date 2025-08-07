import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";


const MainLayout = () => {
  return (
    <div className="relative h-full overflow-x-hidden  bg-gray-900 text-white no-scrollbar">
      <Navbar />
      <main className="relative h-full z-10 pt-10 ">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
