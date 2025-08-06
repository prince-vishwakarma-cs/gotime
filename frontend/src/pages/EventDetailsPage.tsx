import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/userContext";
import { useApi } from "../hooks/useApi";
import LoginModal from "../modals/LoginModal";
import RegisterModal from "../modals/RegisterModal";
import ShareModal from "../modals/ShareModal";
import {
  addBookmark,
  deleteEvent,
  getEventById,
  getEventStats,
  getGoogleCalendarLink,
  getShareableLink,
  registerForEvent,
} from "../utils/api";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
}: ConfirmationModalProps) => {
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
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div
          className={`flex ${
            onConfirm ? "justify-end" : "justify-center"
          } gap-4`}
        >
          {onConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-md ${
              onConfirm
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-800 hover:bg-gray-700 w-full"
            }`}
          >
            {onConfirm ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm font-semibold text-gray-500 uppercase">{label}</p>
    <p className="text-lg text-gray-800">{value}</p>
  </div>
);

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  const { data, isLoading, error, request: fetchEvent } = useApi(getEventById);
  const { request: performRegister, isLoading: isRegistering } =
    useApi(registerForEvent);
  const { request: performBookmark, isLoading: isBookmarking } =
    useApi(addBookmark);
  const { request: fetchCalendarLink } = useApi(getGoogleCalendarLink);
  const { request: fetchShareLink, data: shareData } = useApi(getShareableLink);
  const { request: performDelete, isLoading: isDeleting } = useApi(deleteEvent);
  const { data: statsData, request: fetchStats } = useApi(getEventStats);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId]);

  const event = data?.event;
  const isOrganizer = user && event && user.id === event.organizer_id;
  useEffect(() => {
    if (isOrganizer && eventId) {
      fetchStats(eventId);
    }
  }, [isOrganizer, eventId]);

  const handleRegisterClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (eventId) {
      try {
        await performRegister(eventId);
        setModalContent({
          title: "Success",
          message: "You have been successfully registered for the event.",
          onConfirm: undefined,
        });
        setIsConfirmModalOpen(true);
        fetchEvent(eventId);
      } catch (e: any) {
        setModalContent({
          title: "Registration Failed",
          message: e.message || "You may already be registered.",
          onConfirm: undefined,
        });
        setIsConfirmModalOpen(true);
      }
    }
  };

  const handleEventDelete = () => {
    setModalContent({
      title: "Delete Event",
      message:
        "Are you sure you want to delete this event? This action cannot be undone.",
      onConfirm: async () => {
        if (eventId) {
          try {
            await performDelete(eventId);
            toast.success("Event deleted successfully");
            navigate("/explore");
          } catch (err: any) {
            toast.error(err.message || "Failed to delete event.");
          }
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleBookmarkClick = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (eventId) {
      try {
        await performBookmark(eventId);
        setModalContent({
          title: "Success",
          message: "Event has been added to your bookmarks.",
          onConfirm: undefined,
        });
        setIsConfirmModalOpen(true);
      } catch (e: any) {
        setModalContent({
          title: "Error",
          message: e.message || "You may have already bookmarked this event.",
          onConfirm: undefined,
        });
        setIsConfirmModalOpen(true);
      }
    }
  };

  const handleCalendarClick = async () => {
    if (eventId) {
      const result = await fetchCalendarLink(eventId);
      if (result?.googleCalendarUrl) {
        window.open(result.googleCalendarUrl, "_blank");
      }
    }
  };

  const handleShareClick = () => {
    if (eventId) {
      fetchShareLink(eventId);
      setIsShareModalOpen(true);
    }
  };

  const openRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };
  const openLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  if (isLoading)
    return <div className="text-center py-24">Loading event details...</div>;
  if (error)
    return <div className="text-center py-24 text-red-600">Error: {error}</div>;
  if (!event) return <div className="text-center py-24">No event found.</div>;

  return (
    <>
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <img
              src={
                event.image_url ||
                "https://placehold.co/1200x800/e2e8f0/475569?text=Event+Image"
              }
              alt={event.title}
              className="w-full h-auto object-cover rounded-xl shadow-lg"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-900">
              {event.title}
            </h1>

            <div className="space-y-4">
              <DetailItem
                label="Date & Time"
                value={formatDate(event.start_time)}
              />
              <DetailItem label="Location" value={event.location} />
              <DetailItem
                label="Organized by"
                value={event.organizer_name || "Anonymous"}
              />
            </div>

            {isOrganizer && statsData?.stats && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Event Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="Registrations"
                    value={`${statsData.stats.registration_breakdown.total_confirmed}`}
                  />
                  <DetailItem
                    label="Waitlisted"
                    value={`${statsData.stats.registration_breakdown.waitlisted}`}
                  />
                  <DetailItem
                    label="Bookmarks"
                    value={`${statsData.stats.engagement.bookmarks}`}
                  />
                  <DetailItem
                    label="Capacity Used"
                    value={`${statsData.stats.capacity_info.percentage_used}%`}
                  />
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                About this event
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              {isOrganizer ? (
                <div className="flex gap-4">
                  <Link
                    to={`/events/${eventId}/edit`}
                    className="flex-grow flex justify-center text-center bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 font-semibold text-lg"
                  >
                    Edit Event
                  </Link>
                  <button
                    onClick={handleEventDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 font-semibold text-lg disabled:opacity-50"
                  >
                    <Trash2 />
                    {isDeleting ? "..." : ""}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegisterClick}
                  disabled={isRegistering}
                  className="w-full bg-gray-900 text-white px-8 py-3 rounded-md hover:bg-gray-700 font-semibold text-lg disabled:opacity-50"
                >
                  {isRegistering ? "Registering..." : "Register Now"}
                </button>
              )}
              <div className="flex gap-4">
                <button
                  onClick={handleBookmarkClick}
                  disabled={isBookmarking}
                  className="w-full bg-gray-200 text-gray-800 px-8 py-3 rounded-md hover:bg-gray-300 font-semibold disabled:opacity-50"
                >
                  {isBookmarking ? "Saving..." : "Bookmark"}
                </button>
                <button
                  onClick={handleShareClick}
                  className="w-full bg-gray-200 text-gray-800 px-8 py-3 rounded-md hover:bg-gray-300 font-semibold"
                >
                  Share
                </button>
              </div>
              <button
                onClick={handleCalendarClick}
                className="w-full bg-gray-200 text-gray-800 px-8 py-3 rounded-md hover:bg-gray-300 font-semibold"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareData?.shareUrl}
        qrCode={shareData?.qrCode}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
      />
    </>
  );
};

export default EventDetailPage;
