'use client'

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteAdmin } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteDialogProps {
  adminId: string
  onSuccess: () => void
}

export function DeleteDialog({ adminId, onSuccess }: DeleteDialogProps) {
  const router = useRouter()

  async function handleDelete() {
    try {
      const result = await deleteAdmin(adminId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Admin deleted')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the admin
          account.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}
