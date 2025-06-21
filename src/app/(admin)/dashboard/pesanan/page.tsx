import { getAllOrders } from '@/app/actions/orderAction'
import OrderDashboard from './OrderDashboard'

export default async function OrderManagementPage() {
  const response = await getAllOrders()
  const orders = response.success ? response.data : []
  console.log(orders)

  return <OrderDashboard initialOrders={orders} />
}
