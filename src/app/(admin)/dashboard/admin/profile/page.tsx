import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/app/actions/profile'
import EditProfileForm from '@/components/ui/EditProfileForm'

function mapGender(gender: string | undefined): 'male' | 'female' | 'other' {
  if (gender === 'male' || gender === 'female' || gender === 'other')
    return gender
  return 'other'
}

export default async function AdminProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    return <div>Unauthorized</div>
  }
  const { data: profile } = await getProfile(user.id)
  const safeProfile = profile
    ? { ...profile, gender: mapGender(profile.gender) }
    : null
  return (
    <div className='max-w-xl mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-6'>Profil Admin</h1>
      <EditProfileForm user={{ id: user.id, profile: safeProfile }} />
    </div>
  )
}
