import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loader from "./components/Loader";
import { UserContextProvider, useUser } from "./contexts/userContext";

const MainLayout = lazy(() => import("./components/Mainlayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ExploreEventsPage = lazy(() => import("./pages/ExplorePage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailsPage"));
const MyProfilePage = lazy(() => import("./pages/ProfilePage"));
const UpcomingEventsPage = lazy(() => import("./pages/UpcomingPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));

const AppContent = () => {
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader />
      </div>
    );
  }

  return (
    <Suspense
      fallback={<div className="text-center p-10">Loading Page...</div>}
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
    <BrowserRouter>
      <UserContextProvider>
        <Toaster position="top-center" />
        <AppContent />
      </UserContextProvider>
    </BrowserRouter>
  );
};

export default App;
