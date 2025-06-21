'use server'

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getCartItems } from '@/app/actions/cartAction'
import { validateSession } from '@/app/actions/session'

export async function GET() {
  const session = await validateSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendCartData = async () => {
        try {
          const cartResult = await getCartItems()
          if (cartResult.success) {
            const data = {
              type: 'INITIAL_CART',
              cart: cartResult.data,
            }
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
          } else {
            throw new Error(cartResult.error || 'Failed to fetch cart data')
          }
        } catch (error: any) {
          console.error('Error fetching initial cart data:', error)
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'ERROR',
              message: error.message || 'Failed to fetch cart data',
            })}\n\n`
          )
        }
      }

      await sendCartData()

      const intervalId = setInterval(sendCartData, 30000) // Poll every 30 seconds

      controller.close = () => {
        clearInterval(intervalId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
