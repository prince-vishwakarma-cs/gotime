import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useLoginUserMutation } from "../redux/api/authAPI";
import { closeModals, switchToRegister } from "../redux/reducer/uiSlice";

const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const { isLoginModalOpen } = useSelector((state: any) => state.ui);
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser({ email, password }).unwrap();
      toast.success("Logged in successfully!");
      setEmail("");
      setPassword("");
      dispatch(closeModals());
    } catch (err: any) {
       toast.error(err.data?.message || "Login failed.");
    }
  };

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setEmail("");
    setPassword("");
    dispatch(closeModals());
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login to Continue
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="login-email"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="login-password"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="******************"
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs italic mb-4">
              {"status" in error && "error" in (error.data as any)
                ? (error.data as any).error
                : "Login failed"}
            </p>
          )}
          <div className="flex items-center justify-between">
            <button
              className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => dispatch(switchToRegister())}
              className="font-bold text-blue-500 hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
