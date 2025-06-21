import { getAdmins } from '@/app/actions/admin'
import { AdminManagement } from './components/AdminManagement'
import { requireSuperAdmin } from '@/lib/auth'

export default async function AdminPage() {
  // Check if user is super admin
  await requireSuperAdmin()

  const { data: admins, error } = await getAdmins()

  return (
    <div className='p-6'>
      {error ? (
        <div className='text-red-500'>{error}</div>
      ) : (
        <AdminManagement initialAdmins={admins || []} />
      )}
    </div>
  )
}
