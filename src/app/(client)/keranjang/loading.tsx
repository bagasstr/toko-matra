const Loading = () => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-6 animate-pulse'>
        Keranjang Belanja
      </h1>

      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <div className='space-y-4'>
          {/* Skeleton for cart items */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className='flex items-center gap-4 pb-4 border-b last:border-0'>
              {/* Product image skeleton */}
              <div className='w-20 h-20 bg-gray-200 rounded-md animate-pulse'></div>

              <div className='flex-1'>
                {/* Product name skeleton */}
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse'></div>

                {/* Price skeleton */}
                <div className='h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse'></div>

                {/* Quantity controls skeleton */}
                <div className='flex items-center mt-2'>
                  <div className='h-8 w-8 bg-gray-200 rounded animate-pulse'></div>
                  <div className='h-8 w-10 mx-2 bg-gray-200 rounded animate-pulse'></div>
                  <div className='h-8 w-8 bg-gray-200 rounded animate-pulse'></div>
                </div>
              </div>

              {/* Delete button skeleton */}
              <div className='h-8 w-8 bg-gray-200 rounded-full animate-pulse'></div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary skeleton */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='h-5 bg-gray-200 rounded w-1/3 mb-4 animate-pulse'></div>

        <div className='space-y-3 mb-4'>
          <div className='flex justify-between'>
            <div className='h-4 bg-gray-200 rounded w-1/4 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-1/6 animate-pulse'></div>
          </div>
          <div className='flex justify-between'>
            <div className='h-4 bg-gray-200 rounded w-1/4 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-1/6 animate-pulse'></div>
          </div>
          <div className='flex justify-between'>
            <div className='h-4 bg-gray-200 rounded w-1/4 animate-pulse'></div>
            <div className='h-4 bg-gray-200 rounded w-1/6 animate-pulse'></div>
          </div>
        </div>

        <div className='h-10 bg-gray-200 rounded w-full animate-pulse'></div>
      </div>
    </div>
  )
}

export default Loading
