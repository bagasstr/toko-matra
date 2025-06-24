import { useEffect, useState, useCallback } from 'react'
import { Clock } from 'lucide-react'

interface CountdownProps {
  expiryTime: string
}

export function CountdownTimer({ expiryTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const calculateTimeLeft = useCallback(() => {
    const expiry = new Date(expiryTime).getTime()
    const now = new Date().getTime()
    const difference = expiry - now

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    }
  }, [expiryTime])

  useEffect(() => {
    // Update immediately
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      // Stop timer if expired
      if (
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return (
    <div className='flex items-center gap-2 text-sm text-red-600'>
      <Clock className='h-4 w-4' />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
