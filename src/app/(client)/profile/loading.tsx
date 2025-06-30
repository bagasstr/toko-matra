const Loading = () => {
  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2 animate-pulse'>
          Profil
        </h1>
      </div>

      {/* Profile header section */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse'>
        <div className='flex items-center gap-4'>
          {/* Avatar placeholder */}
          <div className='h-20 w-20 bg-gray-200 rounded-full'></div>
          <div className='flex-1'>
            {/* Name placeholder */}
            <div className='h-6 bg-gray-200 rounded w-1/3 mb-2'></div>
            {/* Email placeholder */}
            <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
            {/* Phone placeholder */}
            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
          </div>
        </div>
      </div>

      {/* Address section */}
      <div className='bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse'>
        <div className='flex justify-between items-center mb-4'>
          <div className='h-5 bg-gray-200 rounded w-1/4'></div>
          <div className='h-8 w-24 bg-gray-200 rounded'></div>
        </div>

        {/* Address cards */}
        <div className='space-y-4'>
          {[...Array(2)].map((_, index) => (
            <div key={index} className='border rounded-lg p-4'>
              <div className='flex justify-between items-center mb-2'>
                <div className='h-5 bg-gray-200 rounded w-1/3'></div>
                <div className='h-4 bg-gray-200 rounded w-16'></div>
              </div>
              <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            </div>
          ))}
        </div>
      </div>

      {/* Order history section */}
      <div className='bg-white rounded-lg shadow-md p-6 animate-pulse'>
        <div className='h-5 bg-gray-200 rounded w-1/4 mb-4'></div>
        <div className='space-y-3'>
          {[...Array(3)].map((_, index) => (
            <div key={index} className='flex justify-between items-center'>
              <div className='h-4 bg-gray-200 rounded w-1/3'></div>
              <div className='h-4 bg-gray-200 rounded w-20'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Loading
