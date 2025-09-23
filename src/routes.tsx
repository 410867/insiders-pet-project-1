import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Trips from "./pages/Trips/Trips";
import TripDetails from "./pages/TripDetails/TripDetails";
import TripAccess from "./pages/TripAccess/TripAccess";
import InviteAccept from "./pages/InviteAccept/InviteAccept";
import GuestRoute from "./components/GuestRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        element: <GuestRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Trips /> },
          { path: "trips", element: <Trips /> },
          { path: "trips/:id", element: <TripDetails /> },
          { path: "trips/:id/access", element: <TripAccess /> },
        ],
      },

      { path: "invite/:token", element: <InviteAccept /> },
    ],
  },
]);

