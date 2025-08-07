import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";

const MainLayout = () => {
  return (
    <div className="relative h-full overflow-x-hidden  bg-gray-900 text-white no-scrollbar">
      <Navbar />
      <main className="relative h-full z-10 pt-10 ">
        <Outlet />
        <LoginModal />
        <RegisterModal />
      </main>
    </div>
  );
};

export default MainLayout;
