'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useState } from 'react'
import { createAdmin, updateAdmin } from '@/app/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  fullName: z.string().min(2),
  phoneNumber: z.string().optional(),
  role: z.enum(['ADMIN'], {
    required_error: 'Role is required',
  }),
})

const userRoles = [{ label: 'Admin', value: 'ADMIN' }] as const

interface AdminDialogProps {
  trigger: React.ReactNode
  admin?: any
  onSuccess: () => void
}

export function AdminDialog({ trigger, admin, onSuccess }: AdminDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!admin
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: admin?.email || '',
      password: '',
      fullName: admin?.profile?.fullName || '',
      phoneNumber: admin?.profile?.phoneNumber || '',
      role: 'ADMIN',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing) {
        const result = await updateAdmin(admin.id, values)
        if (result.error) {
          toast.error(result.error)
          return
        }
      } else {
        if (!values.password) {
          toast.error('Password is required for new admins')
          return
        }
        const result = await createAdmin(values as any)
        if (result.error) {
          toast.error(result.error)
          return
        }
      }

      toast.success(isEditing ? 'Admin updated' : 'Admin created')
      router.refresh()
      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Admin' : 'Create Admin'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password {isEditing && '(leave empty to keep current)'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'ADMIN'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select admin role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end'>
              <Button type='submit'>
                {isEditing ? 'Update Admin' : 'Create Admin'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
