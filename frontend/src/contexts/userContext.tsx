import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";

import {
  getMyProfile,
  loginUser,
  logoutUser,
  type LoginCredentials,
  type User,
} from "../utils/api";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import toast from "react-hot-toast";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  openLoginModal: () => void;
  openRegisterModal: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // State for modals is now managed globally here
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await getMyProfile();
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log("No active session found.");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      await loginUser(credentials);
      const profileResponse = await getMyProfile();
      setUser(profileResponse.data.user);
      setIsLoginModalOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage =
        axiosError.response?.data?.error || "An unexpected error occurred.";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    setUser,
    openLoginModal,
    openRegisterModal,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      {/* Render modals globally here */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={openRegisterModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={openLoginModal}
      />
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
