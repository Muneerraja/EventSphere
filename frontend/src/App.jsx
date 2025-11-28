import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "./contexts/ProtectedRoutes";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import {
  Homepage,
  About,
  Expos,
  Contact,
  Auth,
  Dashboard,
  IndividualExpoPage,
  ExhibitorSearch,
  AnalyticsDashboard,
  ApprovalsManagement,
  UserManagement,
  SystemSettings,
  ExposManagement,
  SessionsManagement,
  CreateExpo,
  MyExpos,
  ViewExpo,
  EditExpo,
  ExhibitorApprovals,
  SessionManagement,
  BoothManagement,
  AttendeeManagement,
  MyBooths,
  ApplyForExpos,
  ExhibitorProfile,
  MyEvents,
  EventDiscovery,
  Accounts,
  MessagesCenter,
  SessionDetails,
} from "./pages";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Homepage />} />
            <Route path="about" element={<About />} />
            <Route path="expos" element={<Expos />} />
            <Route path="expos/:id" element={<IndividualExpoPage />} />
            <Route path="exhibitors" element={<ExhibitorSearch />} />
            <Route path="contact" element={<Contact />} />
            {/* Auth route */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />
          </Route>

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Admin-only routes */}
            <Route path="admin/expos" element={
              <ProtectedRoute requiredRole="admin">
                <ExposManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/approvals" element={
              <ProtectedRoute requiredRole="admin">
                <ApprovalsManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/sessions" element={
              <ProtectedRoute requiredRole="admin">
                <SessionsManagement />
              </ProtectedRoute>
            } />

            {/* Organizer routes (admin can also access) */}
            <Route path="organizer/my-expos" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <MyExpos />
              </ProtectedRoute>
            } />
            <Route path="organizer/create-expo" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <CreateExpo />
              </ProtectedRoute>
            } />
            <Route path="organizer/exhibitor-approvals" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <ExhibitorApprovals />
              </ProtectedRoute>
            } />
            <Route path="organizer/sessions" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <SessionManagement />
              </ProtectedRoute>
            } />
            <Route path="organizer/booths" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <BoothManagement />
              </ProtectedRoute>
            } />
            <Route path="organizer/attendees" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <AttendeeManagement />
              </ProtectedRoute>
            } />
            <Route path="organizer/expo/:id/view" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <ViewExpo />
              </ProtectedRoute>
            } />
            <Route path="organizer/expo/:id/edit" element={
              <ProtectedRoute requiredRole={["admin", "organizer"]}>
                <EditExpo />
              </ProtectedRoute>
            } />

            {/* Exhibitor routes (admin can also access) */}
            <Route path="exhibitor/booths" element={
              <ProtectedRoute requiredRole={["admin", "exhibitor"]}>
                <MyBooths />
              </ProtectedRoute>
            } />
            <Route path="exhibitor/apply" element={
              <ProtectedRoute requiredRole={["admin", "exhibitor"]}>
                <ApplyForExpos />
              </ProtectedRoute>
            } />
            <Route path="exhibitor/profile" element={
              <ProtectedRoute requiredRole={["admin", "exhibitor"]}>
                <ExhibitorProfile />
              </ProtectedRoute>
            } />

            {/* Attendee routes (admin can also access) */}
            <Route path="attendee/my-events" element={
              <ProtectedRoute requiredRole={["admin", "attendee"]}>
                <MyEvents />
              </ProtectedRoute>
            } />
            <Route path="attendee/discovery" element={
              <ProtectedRoute requiredRole={["admin", "attendee"]}>
                <EventDiscovery />
              </ProtectedRoute>
            } />

            {/* Shared routes (all roles can access) */}
            <Route path="analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="accounts" element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            } />
            <Route path="messages" element={
              <ProtectedRoute>
                <MessagesCenter />
              </ProtectedRoute>
            } />
            <Route path="session/:id" element={
              <ProtectedRoute>
                <SessionDetails />
              </ProtectedRoute>
            } />
          </Route>

          {/* Redirect root to public if no match */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
