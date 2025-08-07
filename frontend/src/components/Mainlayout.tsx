import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";

const MainLayout = () => {
  return (
    <div className="relative h-full overflow-x-hidden bg-primary-background text-primary-text no-scrollbar">
      <div
        className="
          absolute top-0 left-0 right-0 z-0 h-[40vh]
          bg-[url('https://lh3.googleusercontent.com/g9lup2u8M2TMJh2ef3Ty3D_eMe0e9O-lInUnEBVteBg04KsAGcpiq8rllqF0xTPUnoLPSaejp9hKUQ=w1500-h844-l90-rj')]
          bg-cover bg-center
        "
      />
      <div
        className="
          absolute top-0 left-0 right-0 z-0 h-[40vh]
          bg-gradient-to-b from-transparent to-primary-background 
        "
      />

      <Navbar />
      <main className="relative h-full z-10 pt-10">
        <Outlet />
        <LoginModal />
        <RegisterModal />
      </main>
    </div>
  );
};

export default MainLayout;
