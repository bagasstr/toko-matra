import { validateSession } from '@/app/actions/session'
import { redirect } from 'next/navigation'
import AuthSection from '@/components/ui/AuthSection'
import ProfileClient, { UserProfile } from './ProfileClient'
import { headers } from 'next/headers'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const { user } = searchParams

  const userSession = await validateSession()

  if (!user) {
    return <AuthSection />
  }

  const userId = userSession?.user?.profile.id

  if (userId.toLowerCase() !== user) {
    return <AuthSection />
  }

  const userProfile: UserProfile = {
    id: userSession?.user?.profile.id,
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
    order: userSession?.user?.order,
    review: userSession?.user?.review,
  }

  return <ProfileClient user={userProfile} />
}
