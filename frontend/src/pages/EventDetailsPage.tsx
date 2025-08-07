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

// --- Themed Confirmation Modal ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
}) => {
  if (!isOpen) return null;

  const isDestructive = !!onConfirm;

  return (
    <div
      className="fixed inset-0 bg-primary-background/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card-background p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md relative border border-button-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-primary-text">{title}</h2>
        <p className="text-secondary-text mb-6">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {isDestructive && (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-transparent border border-button-border text-primary-text rounded-lg hover:bg-border transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary-button-background text-primary-button-text hover:bg-primary-button-hover-background"
            }`}
          >
            {isDestructive ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Themed Detail Item ---
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm font-semibold text-secondary-text uppercase tracking-wider">
      {label}
    </p>
    <p className="text-lg text-primary-text">{value}</p>
  </div>
);

// --- Themed & Responsive Event Detail Page ---
const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  const { data: eventData, isLoading, error } = useGetEventByIdQuery(eventId!, { skip: !eventId });
  const event = eventData?.event;
  const isOrganizer = user && event && user.id === event.organizer_id;
  const { data: statsData } = useGetEventStatsQuery(eventId!, { skip: !isOrganizer || !eventId });

  const [fetchCalendarLink] = useLazyGetGoogleCalendarLinkQuery();
  const [fetchShareLink, { data: shareData }] = useLazyGetShareableLinkQuery();
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  const [addBookmark, { isLoading: isBookmarking }] = useAddBookmarkMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  // --- Handlers ---
  const handleRegisterClick = async () => {
    if (!isAuthenticated) return dispatch(openLoginModal());
    if (eventId) {
      try {
        await registerForEvent(eventId).unwrap();
        setModalContent({ title: "Success", message: "You have been successfully registered for the event.", onConfirm: undefined });
        setIsConfirmModalOpen(true);
      } catch (err: any) {
        setModalContent({ title: "Registration Failed", message: err.data?.message || "You may already be registered.", onConfirm: undefined });
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
    if (!isAuthenticated) return dispatch(openLoginModal());
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
        if (result?.googleCalendarUrl) window.open(result.googleCalendarUrl, "_blank");
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });

  // --- UI States ---
  if (isLoading) return <div className="text-center text-primary-text py-24">Loading event details...</div>;
  if (error || !event) return <div className="text-center text-primary-text py-24">No event found.</div>;

  // --- Themed Button Styles ---
  const primaryButtonStyles = "w-full text-center px-6 py-3 rounded-full font-semibold text-lg transition-colors disabled:opacity-50 bg-primary-button-background text-primary-button-text hover:bg-primary-button-hover-background";
  const secondaryButtonStyles = "w-full text-center px-6 py-3 rounded-full font-semibold transition-colors disabled:opacity-50 bg-card-background text-primary-text hover:bg-border border border-button-border";
  const destructiveButtonStyles = "flex items-center justify-center bg-red-600/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-full hover:bg-red-600/30 font-semibold text-lg disabled:opacity-50";

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-primary-text">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-3">
            <img
              src={event.image_url || "https://placehold.co/1200x800/e2e8f0/475569?text=Event+Image"}
              alt={event.title}
              className="w-full h-auto object-cover rounded-xl shadow-lg border border-border"
            />
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            <div className="space-y-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold">{event.title}</h1>
                <DetailItem label="Date & Time" value={formatDate(event.start_time)} />
                <DetailItem label="Location" value={event.location} />
                <DetailItem label="Organized by" value={event.organizer_name || "Anonymous"} />
            </div>

            {isOrganizer && statsData?.stats && (
              <div className="border-t border-border pt-6 space-y-4">
                <h2 className="text-xl font-bold">Event Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Registrations" value={`${statsData.stats.registration_breakdown.total_confirmed}`} />
                  <DetailItem label="Waitlisted" value={`${statsData.stats.registration_breakdown.waitlisted}`} />
                  <DetailItem label="Bookmarks" value={`${statsData.stats.engagement.bookmarks}`} />
                  <DetailItem label="Capacity Used" value={`${statsData.stats.capacity_info.percentage_used}%`} />
                </div>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-bold">About this event</h2>
              <p className="text-secondary-text whitespace-pre-wrap mt-2">{event.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              {isOrganizer ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/events/${eventId}/edit`} className={`${primaryButtonStyles} flex-grow flex justify-center items-center`}>Edit</Link>
                  <button onClick={handleEventDelete} disabled={isDeleting} className={destructiveButtonStyles}>
                    <Trash2 size={20} /> {isDeleting && "..."}
                  </button>
                </div>
              ) : (
                <button onClick={handleRegisterClick} disabled={isRegistering} className={primaryButtonStyles}>
                  {isRegistering ? "Registering..." : "Register Now"}
                </button>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleBookmarkClick} disabled={isBookmarking} className={secondaryButtonStyles}>
                  {isBookmarking ? "Saving..." : "Bookmark"}
                </button>
                <button onClick={handleShareClick} className={secondaryButtonStyles}>Share</button>
              </div>
              <button onClick={handleCalendarClick} className={secondaryButtonStyles}>Add to Calendar</button>
            </div>
          </div>
        </div>
      </div>
      
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} shareUrl={shareData?.shareUrl} qrCode={shareData?.qrCode} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title={modalContent.title} message={modalContent.message} onConfirm={modalContent.onConfirm} />
    </>
  );
};

export default EventDetailPage;