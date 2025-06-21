'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, Trash } from 'lucide-react'
import { useState } from 'react'
import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AdminDialog } from '@/app/(admin)/dashboard/admin/components/AdminDialog'
import { DeleteDialog } from './DeleteDialog'
import { useRouter } from 'next/navigation'

interface AdminTableProps {
  admins: any[]
  onAdminUpdated: () => void
}

export function AdminTable({ admins, onAdminUpdated }: AdminTableProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.profile?.fullName}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.profile?.phoneNumber || '-'}</TableCell>
              <TableCell className='capitalize'>
                {admin.role.replace('_', ' ')}
              </TableCell>
              <TableCell className='text-right space-x-2'>
                <AdminDialog
                  admin={admin}
                  onSuccess={handleSuccess}
                  trigger={
                    <Button
                      onClick={() => setSelectedAdmin(admin)}
                      variant='ghost'
                      size='icon'>
                      <Edit className='h-4 w-4' />
                    </Button>
                  }
                />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <Trash className='h-4 w-4' />
                    </Button>
                  </AlertDialogTrigger>
                  <DeleteDialog adminId={admin.id} onSuccess={handleSuccess} />
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
