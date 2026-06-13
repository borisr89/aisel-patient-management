import { ProtectedRoute } from '@/components/auth/protected-route';
import { PatientsScreen } from '@/components/patients/patients-screen';

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <PatientsScreen />
    </ProtectedRoute>
  );
}
