import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import ShareModal from "../modals/ShareModal";
import {
  useAddBookmarkMutation,
  useDeleteEventMutation,
  useGetEventByIdQuery,
  useGetEventStatsQuery,
  useLazyGetGoogleCalendarLinkQuery,
  useLazyGetShareableLinkQuery,
  useRegisterForEventMutation,
} from "../redux/api/eventAPI";
import { openLoginModal } from "../redux/reducer/uiSlice";
import type { RootState } from "../redux/store";

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
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });
  const {
    data: eventData,
    isLoading,
    error,
  } = useGetEventByIdQuery(eventId!, { skip: !eventId });

  const event = eventData?.event;
  const isOrganizer = user && event && user.id === event.organizer_id;

  const { data: statsData } = useGetEventStatsQuery(eventId!, {
    skip: !isOrganizer || !eventId,
  });

  const [fetchCalendarLink] = useLazyGetGoogleCalendarLinkQuery();
  const [fetchShareLink, { data: shareData }] = useLazyGetShareableLinkQuery();

  const [registerForEvent, { isLoading: isRegistering }] =
    useRegisterForEventMutation();
  const [addBookmark, { isLoading: isBookmarking }] = useAddBookmarkMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    if (eventId) {
      try {
        await registerForEvent(eventId).unwrap();
        setModalContent({
          title: "Success",
          message: "You have been successfully registered for the event.",
          onConfirm: undefined,
        });
        setIsConfirmModalOpen(true);
      } catch (err: any) {
        setModalContent({
          title: "Registration Failed",
          message: err.data?.message || "You may already be registered.",
          onConfirm: undefined,
        });
        setIsConfirmModalOpen(true);
      }
    }
  };

  const handleEventDelete = () => {
    setModalContent({
      title: "Delete Event",
      message: "Are you sure? This action cannot be undone.",
      onConfirm: async () => {
        if (eventId) {
          try {
            await deleteEvent(eventId).unwrap();
            toast.success("Event deleted successfully");
            navigate("/explore");
          } catch (err: any) {
            toast.error(err.data?.message || "Failed to delete event.");
          }
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleBookmarkClick = async () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    if (eventId) {
      try {
        await addBookmark(eventId).unwrap();
        toast.success("Event added to your bookmarks!");
      } catch (err: any) {
        toast.error(err.data?.message || "Could not bookmark event.");
      }
    }
  };

  const handleCalendarClick = async () => {
    if (eventId) {
      try {
        const result = await fetchCalendarLink(eventId).unwrap();
        if (result?.googleCalendarUrl) {
          window.open(result.googleCalendarUrl, "_blank");
        }
      } catch (err) {
        toast.error("Could not generate calendar link.");
      }
    }
  };

  const handleShareClick = () => {
    if (eventId) {
      fetchShareLink(eventId);
      setIsShareModalOpen(true);
    }
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
  {
    error && (
      <p className="text-red-500 text-xs italic mb-4">
        {"status" in error && "error" in (error.data as any)
          ? (error.data as any).error
          : "Login failed"}
      </p>
    );
  }
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
