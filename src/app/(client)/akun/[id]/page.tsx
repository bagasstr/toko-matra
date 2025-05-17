import { getUser } from '@/app/actions/profileAction'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Plus, PlusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import CardAddress from '../../components/CardAddress'
import { activeAddress } from '@/app/actions/addressAction'

const page = async ({ params }: { params: { id: number } }) => {
  const { id } = await params
  const user = await getUser(id)

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl font-semibold text-gray-600'>
          Profil pengguna tidak ditemukan
        </p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {/* Header Profil */}
        <div className='mb-4'>
          <h1 className='text-2xl font-semibold'>Profil Akun</h1>
        </div>
        <div className='p-6'>
          <div className='flex flex-col md:flex-row gap-8'>
            {/* Foto Profil */}
            <div className='flex flex-col items-center mb-4'>
              <div className='relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 mb-4'>
                {user.profile?.imageUrl ? (
                  <Image
                    src={user.profile.imageUrl}
                    alt='Foto Profil'
                    fill
                    quality={100}
                    sizes='100vw'
                    className='object-contain'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-300 flex items-center justify-center'>
                    <span className='text-4xl text-gray-600'>
                      {user.profile?.fullName?.charAt(0) ||
                        user.email.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className={cn('font-semibold')}>{user.profile?.userName}</p>
              <p className='text-sm text-gray-500'>
                Bergabung sejak{' '}
                {new Date().toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Informasi Profil */}
            <div className='flex-1'>
              <div className='mb-8'>
                <div className='text-xl flex items-center justify-between font-semibold mb-4 border-b w-full pb-2'>
                  <span>Informasi Personal</span>
                  <Link href={`/akun/edit-profile/${id}`}>
                    <Button
                      variant='ghost'
                      size={'icon'}
                      className='bg-white hover:bg-gray-100'>
                      <Edit />
                    </Button>
                  </Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Nama Lengkap</p>
                    <p className='font-medium'>
                      {user.profile?.fullName || '-'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Email</p>
                    <p className='font-medium'>{user.email}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Nomor Telepon</p>
                    <p className='font-medium'>
                      {user.profile?.phoneNumber || '-'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Jenis Kelamin</p>
                    <p className='font-medium'>{user.profile?.gender || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Tanggal Lahir</p>
                    <p className='font-medium'>
                      {user.profile?.dateOfBirth || '-'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Tipe Pengguna</p>
                    <p className='font-medium capitalize'>
                      {user.typeUser || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <div className='text-xl flex items-center justify-between w-full font-semibold mb-4 border-b pb-2'>
                  <span>Alamat</span>
                  <Link href={`/akun/tambah-alamat/${id}`}>
                    <Button
                      variant='ghost'
                      size={'icon'}
                      className='bg-white hover:bg-gray-100'>
                      <Plus />
                    </Button>
                  </Link>
                </div>

                {user.address.length > 0 ? (
                  <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4')}>
                    <CardAddress address={user.address} userId={user.id} />
                  </div>
                ) : (
                  <div className='flex items-center justify-center h-32 border rounded-lg bg-gray-50'>
                    <p className='text-gray-500'>
                      Tidak ada alamat yang ditambahkan
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
