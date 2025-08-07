import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loader from "./components/Loader";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useGetMyProfileQuery } from "./redux/api/authAPI";

const MainLayout = lazy(() => import("./components/Mainlayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ExploreEventsPage = lazy(() => import("./pages/ExplorePage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailsPage"));
const MyProfilePage = lazy(() => import("./pages/ProfilePage"));
const UpcomingEventsPage = lazy(() => import("./pages/UpcomingPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));

const AppContent = () => {
  const { isLoading } = useGetMyProfileQuery();

 if (isLoading) {
  return (
    // This container now covers the full screen and centers its content
    <div className="fixed inset-0 flex items-center justify-center bg-primary-background text-primary-text">
      {/* Background Image Layer */}
      <div
        className="
          absolute top-0 left-0 right-0 z-0 h-[40vh]
          bg-[url('https://lh3.googleusercontent.com/g9lup2u8M2TMJh2ef3Ty3D_eMe0e9O-lInUnEBVteBg04KsAGcpiq8rllqF0xTPUnoLPSaejp9hKUQ=w1500-h844-l90-rj')]
          bg-cover bg-center
        "
      />
      {/* Gradient Fade-out Overlay */}
      <div
        className="
          absolute top-0 left-0 right-0 z-0 h-[40vh]
          bg-gradient-to-b from-transparent to-primary-background 
        "
      />
      {/* The Loader is now on a higher z-index to ensure it's on top */}
      <div className="z-10">
        <Loader />
      </div>
    </div>
  );
}
  return (
    <Suspense
      fallback={
       <div className="fixed inset-0 flex items-center justify-center bg-primary-background text-primary-text">
      {/* Background Image Layer */}
      <div
        className="
          absolute top-0 left-0 right-0 z-0 h-[40vh]
          bg-[url('https://lh3.googleusercontent.com/g9lup2u8M2TMJh2ef3Ty3D_eMe0e9O-lInUnEBVteBg04KsAGcpiq8rllqF0xTPUnoLPSaejp9hKUQ=w1500-h844-l90-rj')]
          bg-cover bg-center
        "
      />
      {/* Gradient Fade-out Overlay */}
      <div
        className="
          absolute top-0 left-0 right-0 z-0 h-[40vh]
          bg-gradient-to-b from-transparent to-primary-background 
        "
      />
      {/* The Loader is now on a higher z-index to ensure it's on top */}
      <div className="z-10">
        <Loader />
      </div>
    </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExploreEventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/me" element={<MyProfilePage />} />
          <Route path="/upcoming" element={<UpcomingEventsPage />} />
          <Route path="/events/new" element={<CreateEventPage />} />
          <Route path="/events/:eventId/edit" element={<EditEventPage />} />
        </Route>
        <Route path="*" element={<div>Not Found Page Placeholder</div>} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
          <Toaster position="top-center" />
          <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
