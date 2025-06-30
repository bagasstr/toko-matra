const Loading = () => {
  return (
    <div className='max-w-2xl mx-auto py-10 px-4'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold flex items-center gap-2 animate-pulse'>
          Notifikasi
        </h1>
      </div>

      <div className='space-y-4'>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className='bg-white rounded-lg shadow-md p-4 animate-pulse'>
            <div className='flex justify-between items-center mb-2'>
              <div className='h-5 bg-gray-200 rounded w-1/3'></div>
              <div className='h-4 bg-gray-200 rounded-full w-20'></div>
            </div>
            <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            <div className='flex justify-between items-center mt-3'>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
              <div className='h-6 w-6 bg-gray-200 rounded-full'></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loading
