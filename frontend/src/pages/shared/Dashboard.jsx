import { useAuth } from '../../contexts/AuthContext';
import {
  AdminDashboard,
  OrganizerDashboard,
  ExhibitorDashboard,
  AttendeeDashboard
} from '../index';

export default function Dashboard() {
  const { user } = useAuth();

  // Render different dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'organizer') {
    return <OrganizerDashboard />;
  } else if (user?.role === 'exhibitor') {
    return <ExhibitorDashboard />;
  } else if (user?.role === 'attendee') {
    return <AttendeeDashboard />;
  } else {
    // Default to attendee dashboard for other roles or fallback
    return <AttendeeDashboard />;
  }
}
