import React, { useState } from 'react'
import Link from 'next/link'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    setError('')
    // TODO: Tambahkan logika autentikasi di sini
    alert('Login berhasil (dummy)')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow flex flex-col gap-4'>
      <div className='text-xl font-semibold text-gray-800 mb-2 text-center'>
        Login
      </div>
      {error && <div className='text-red-500 text-sm text-center'>{error}</div>}
      <div>
        <label className='block text-gray-700 text-sm mb-1'>Email</label>
        <input
          type='email'
          className='w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className='block text-gray-700 text-sm mb-1'>Password</label>
        <input
          type='password'
          className='w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button
        type='submit'
        className='w-full py-3 bg-blue-600 text-white rounded font-semibold text-base hover:bg-blue-700 transition'>
        Login
      </button>
      <div className='text-center text-sm text-gray-500 mt-2'>
        Belum punya akun?{' '}
        <Link href='/daftar' className='text-blue-600 hover:underline'>
          Daftar
        </Link>
      </div>
    </form>
  )
}

export default LoginForm
