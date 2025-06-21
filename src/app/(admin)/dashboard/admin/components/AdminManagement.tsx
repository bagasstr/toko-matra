'use client'

import { Button } from '@/components/ui/button'
import { AdminTable } from './AdminTable'
import { AdminDialog } from './AdminDialog'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminManagementProps {
  initialAdmins: any[]
}

export function AdminManagement({ initialAdmins }: AdminManagementProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Manage Admins</h1>
        <AdminDialog
          trigger={
            <Button>
              <Plus className='w-4 h-4 mr-2' />
              Add Admin
            </Button>
          }
          onSuccess={handleSuccess}
        />
      </div>

      <AdminTable admins={initialAdmins} onAdminUpdated={handleSuccess} />
    </>
  )
}
