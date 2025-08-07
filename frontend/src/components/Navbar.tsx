import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLogoutUserMutation } from "../redux/api/authAPI";
import { openLoginModal } from "../redux/reducer/uiSlice";
import type { RootState } from "../redux/store";

export const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <header className="backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-border text-white">
        <nav className="container mx-auto px-4 md:px-8 lg:px-16 flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold ">
            Gatherly
          </Link>
          {/* --- DESKTOP NAVIGATION (Correct) --- */}
          <div className="hidden md:flex items-center space-x-4 md:space-x-6">
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                isActive ? "font-bold" : "text-white"
              }
            >
              Explore
            </NavLink>
            <NavLink
              to="/upcoming"
              className={({ isActive }) =>
                isActive ? "font-bold" : "text-white"
              }
            >
              Upcoming
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/events/new"
                  className={({ isActive }) =>
                    isActive ? "font-bold" : "text-white"
                  }
                >
                  Create Event
                </NavLink>
                <NavLink
                  to="/me"
                  className={({ isActive }) =>
                    isActive ? "font-bold" : "text-white"
                  }
                >
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                className=" px-4 py-2 rounded-full text-sm font-medium bg-primary-button-background text-primary-button-text hover:bg-primary-button-hover-background"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <button
                onClick={() => dispatch(openLoginModal())}
                className=" px-4 py-2 rounded-full text-sm font-medium bg-primary-button-background text-primary-button-text hover:bg-primary-button-hover-background"
              >
                Login
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsDrawerOpen(true)}>
              <Menu className="h-6 w-6 text-white" />
            </button>
          </div>
        </nav>
      </header>

      {/* --- MOBILE DRAWER --- */}
      <div
        className={`fixed inset-0 z-50 transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={closeDrawer}
        ></div>
        <div className="fixed top-0 right-0 h-full w-full max-w-xs bg-gray-900 shadow-lg p-6">
          <button onClick={closeDrawer} className="absolute top-4 right-4">
            <X className="h-6 w-6 text-white" />
          </button>
          <nav className="mt-12 flex flex-col items-center space-y-6">
            {/* FIXED: Added the missing navigation links for the mobile view */}
            <NavLink
              to="/explore"
              onClick={closeDrawer}
              className={({ isActive }) =>
                `text-lg ${isActive ? "font-bold" : "text-white"}`
              }
            >
              Explore
            </NavLink>
            <NavLink
              to="/upcoming"
              onClick={closeDrawer}
              className={({ isActive }) =>
                `text-lg ${isActive ? "font-bold" : "text-white"}`
              }
            >
              Upcoming
            </NavLink>

            <hr className="w-full border-gray-700" />

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/events/new"
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `text-lg ${isActive ? "font-bold" : "text-white"}`
                  }
                >
                  Create Event
                </NavLink>
                <NavLink
                  to="/me"
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `text-lg ${isActive ? "font-bold" : "text-white"}`
                  }
                >
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    closeDrawer();
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-center text-lg text-white disabled:opacity-50"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  closeDrawer();
                  setTimeout(() => dispatch(openLoginModal()), 350); // 350ms delay
                }}
                className="w-full text-center text-lg text-white"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};
