import { getAllCustomers } from '@/app/actions/customerAction'
import { ClientCustomerPage } from './ClientCustomerPage'

export default async function CustomerPage() {
  const result = await getAllCustomers()

  return (
    <ClientCustomerPage
      initialCustomers={result.success ? result.customers : []}
    />
  )
}
