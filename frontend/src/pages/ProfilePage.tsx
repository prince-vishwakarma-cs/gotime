import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  useGetMyBookmarksQuery,
  useGetMyCreatedEventsQuery,
  useGetMyRegistrationsQuery,
} from "../redux/api/eventAPI";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useLogoutUserMutation,
  useUpdateUserProfileMutation,
} from "../redux/api/authAPI";

const EventListCard = ({
  event,
  type,
}: {
  event: any;
  type: "registration" | "bookmark" | "created";
}) => {
  const formattedDate = new Date(event.start_time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <Link
      to={`/events/${event.id}`}
      className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <img
        src={
          event.image_url ||
          "https://placehold.co/100x100/e2e8f0/475569?text=Event"
        }
        alt={event.title}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1">
        <p className="font-bold text-gray-800">{event.title}</p>
        <p className="text-sm text-gray-500">{formattedDate}</p>
        <p className="text-sm text-gray-500">{event.location}</p>
        {type === "registration" && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              event.status === "registered"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {event.status}
          </span>
        )}
        {type === "created" && (
          <p className="text-sm text-gray-600 mt-1">
            {event.registration_count} Registrations
          </p>
        )}
      </div>
    </Link>
  );
};

const SettingsModal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const MyProfilePage = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [activeTab, setActiveTab] = useState<
    "registrations" | "bookmarks" | "created" | "settings"
  >("registrations");

  const [isUpdateProfileOpen, setUpdateProfileOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: registrationData, isLoading: regLoading } =
    useGetMyRegistrationsQuery(undefined, { skip: !isAuthenticated });
  const { data: bookmarkData, isLoading: bookLoading } = useGetMyBookmarksQuery(
    undefined,
    { skip: !isAuthenticated }
  );
  const { data: createdEventsData, isLoading: createdLoading } =
    useGetMyCreatedEventsQuery({}, { skip: !isAuthenticated });

  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();
  const [logoutUser] = useLogoutUserMutation();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ name }).unwrap();
      toast.success("Profile updated successfully!");
      setUpdateProfileOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to update profile.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success("Password changed successfully!");
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to change password.");
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPassword !== "delete my account") {
      toast.error('Please type "delete my account" to confirm.');
      return;
    }
    try {
      await deleteAccount({ password: currentPassword }).unwrap();
      toast.success("Account deleted successfully.");
      await logoutUser().unwrap();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to delete account.");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold">
          Please log in to view your profile.
        </h1>
        <p className="text-gray-600 mt-2">
          You need to be authenticated to access this page.
        </p>
      </div>
    );
  }

  const renderContent = () => {
    const isLoading = regLoading || bookLoading || createdLoading;
    if (isLoading && activeTab !== "settings")
      return <div className="text-center p-8">Loading your data...</div>;

    switch (activeTab) {
      case "registrations":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Upcoming</h3>
            {registrationData?.registrations.upcoming.map((event) => (
              <EventListCard key={event.id} event={event} type="registration" />
            ))}
            {registrationData?.registrations.upcoming.length === 0 && (
              <p className="text-gray-500">No upcoming registrations.</p>
            )}
            <h3 className="text-xl font-semibold mt-8">Past</h3>
            {registrationData?.registrations.past.map((event) => (
              <EventListCard key={event.id} event={event} type="registration" />
            ))}
            {registrationData?.registrations.past.length === 0 && (
              <p className="text-gray-500">No past registrations.</p>
            )}
          </div>
        );
      case "bookmarks":
        return (
          <div className="space-y-4">
            {bookmarkData?.bookmarks.map((event) => (
              <EventListCard key={event.id} event={event} type="bookmark" />
            ))}
            {bookmarkData?.bookmarks.length === 0 && (
              <p className="text-gray-500">
                You haven't bookmarked any events yet.
              </p>
            )}
          </div>
        );
      case "created":
        return (
          <div className="space-y-4">
            {createdEventsData?.events.map((event) => (
              <EventListCard key={event.id} event={event} type="created" />
            ))}
            {createdEventsData?.events.length === 0 && (
              <p className="text-gray-500">
                You haven't created any events yet.
              </p>
            )}
          </div>
        );
      case "settings":
        return (
          <div className="max-w-lg mx-auto space-y-4">
            <button
              onClick={() => setUpdateProfileOpen(true)}
              className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              Update Profile
            </button>
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="w-full text-left p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
            >
              Change Password
            </button>
            <button
              onClick={() => setDeleteAccountOpen(true)}
              className="w-full text-left p-4 bg-red-50 text-red-700 rounded-lg shadow-sm hover:bg-red-100"
            >
              Delete Account
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container mx-auto py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">{user?.name}</h1>
          <p className="text-lg text-gray-200">{user?.email}</p>
        </header>

        <div className="border-b border-gray-200 mb-8">
          <nav
            className="-mb-px flex justify-center space-x-8"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("registrations")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "registrations"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Registrations
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "bookmarks"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Bookmarks
            </button>
            <button
              onClick={() => setActiveTab("created")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "created"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Created Events
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-white text-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        <div>{renderContent()}</div>
      </div>

      <SettingsModal
        isOpen={isUpdateProfileOpen}
        onClose={() => setUpdateProfileOpen(false)}
        title="Update Profile"
      >
        <form onSubmit={handleUpdateProfile}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full bg-gray-800 text-white p-2 rounded"
          >
            {isUpdatingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </SettingsModal>
      <SettingsModal
        isOpen={isChangePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current Password"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isChangingPassword}
            className="w-full bg-gray-800 text-white p-2 rounded"
          >
            {isChangingPassword ? "Saving..." : "Change Password"}
          </button>
        </form>
      </SettingsModal>
      <SettingsModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        title="Delete Account"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-sm text-gray-600">
            This action is irreversible. Please enter your password to confirm.
          </p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Your Password"
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-600">
            Type "delete my account" to confirm.
          </p>
          <input
            type="text"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="delete my account"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isDeletingAccount}
            className="w-full bg-red-600 text-white p-2 rounded"
          >
            {isDeletingAccount ? "Deleting..." : "Delete My Account"}
          </button>
        </form>
      </SettingsModal>
    </>
  );
};

export default MyProfilePage;
