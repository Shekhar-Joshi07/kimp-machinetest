import PermissionsMatrix from '@/components/PermissionsMatrix';

export default function AdminPermissions() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Permissions Matrix</h1>
      <PermissionsMatrix />
    </div>
  );
}