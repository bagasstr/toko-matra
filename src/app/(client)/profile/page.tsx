import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'
import AuthSection from '@/components/ui/AuthSection'
import ProfileClient, { UserProfile } from './ProfileClient'
import { headers } from 'next/headers'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = await searchParams
  const { user } = params
  console.log(user)

  const userSession = await validateSession()

  if (!user) {
    return <AuthSection />
  }

  const userId = userSession?.user?.id

  console.log(userId)

  if (userId !== user) {
    return <AuthSection />
  }

  const userProfile: UserProfile = {
    id: userSession?.user?.id,
    role: userSession?.user?.role,
    email: userSession?.user?.email,
    emailVerified: userSession?.user?.emailVerified,
    profile: userSession?.user?.profile
      ? {
          fullName: userSession?.user?.profile.fullName,
          userName: userSession?.user?.profile.userName,
          phoneNumber: userSession?.user?.profile.phoneNumber,
          gender: userSession?.user?.profile.gender as
            | 'male'
            | 'female'
            | 'other',
          dateOfBirth: userSession?.user?.profile.dateOfBirth,
          bio: userSession?.user?.profile.bio,
          companyName: userSession?.user?.profile.companyName,
          taxId: userSession?.user?.profile.taxId,
          imageUrl: userSession?.user?.profile.imageUrl,
        }
      : undefined,
    address: userSession?.user?.address.map((addr) => ({
      id: addr.id,
      labelAddress: addr.labelAddress,
      recipientName: addr.recipientName,
      address: addr.address,
      province: addr.province,
      regency: addr.city, // Map city to regency
      district: addr.district,
      village: addr.village,
      postalCode: addr.postalCode,
      isPrimary: addr.isPrimary,
      isActive: addr.isActive,
    })),
    orderCount:
      userSession?.user?._count?.order ?? userSession?.user?.order?.length ?? 0,
  }

  return <ProfileClient user={userProfile} />
}
