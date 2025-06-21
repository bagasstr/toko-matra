import { validateSession } from '../actions/session'
import Navbar from './components/navbar/navbar'
import FooterMobile from './components/footerMobile'
import Footer from './components/footer'
import { SSEProvider } from '../context/SseProvidet'

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await validateSession()
  const userId = session?.user?.id

  return (
    <>
      <SSEProvider userId={userId}>
        <Navbar />
        <main className='py-4 mt-16 lg:mt-20'>{children}</main>
        <Footer />
        <FooterMobile />
      </SSEProvider>
    </>
  )
}
