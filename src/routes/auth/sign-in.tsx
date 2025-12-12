import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { prisma } from '@/utils/db'
import { hashPassword } from '@/utils/auth/password';
import { generateSession, generateSessionCookie } from '@/utils/auth/session';
import polarlearn_logo from '@/../public/icon.svg'
import { Image } from '@unpic/react'
import { Input } from "@/components/ui/input"
import { GoogleSignIn } from '@/components/button/GoogleSignIn';
import { EntreeSignIn } from '@/components/button/EntreeSignIn';
import { Label } from '@/components/ui/label';
import Button1 from '@/components/button/Button1';
import { setCookie } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { QOUTES } from '@/utils/constants';
import { Key } from 'lucide-react';

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      err: search.err as string | undefined,
    }
  },

  loader: async () => {
    // Voor quote met SSR, niet met je tengels er aan zitten!!
    const quote = QOUTES[Math.floor(Math.random() * QOUTES.length)];
    return quote;
  },
  server: {
    handlers: {
      // Inlog route nadat de form is verzonden
      POST: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          throw redirect({
            to: '/auth/sign-in',
            search: {
              err: 'invalid_credentials',
            },
            statusCode: 303
          })
        }

        const hashedPassword = await hashPassword(password, user.salt)
        if (hashedPassword !== user.password) {
          throw redirect({
            to: '/auth/sign-in',
            search: {
              err: 'invalid_credentials',
            },
            statusCode: 303
          })
        };

        const session = await generateSession(user.id);
        const cookieValue = await generateSessionCookie(session.sessionID);

        setCookie('polarlearn.session', cookieValue, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        })

        if (!user.loginAllowed) {
          throw redirect({ to: '/auth/banned' })
        }

        throw redirect({ to: '/app/start' })
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { err } = Route.useSearch();
  const serverQuote = Route.useLoaderData() as string | undefined;
  const router = useRouter();
  useEffect(() => {
    if (err) {
      if (err === 'user_exists') toast.error("Er bestaat al een account met dit e-mailadres. Probeer in te loggen.");
      else if (err === 'invalid_credentials') {
        toast.error("Verkeerde inloggegevens. Probeer het opnieuw, of klik op \"Wachtwoord vergeten\".");
      }
      router.history.replace('/auth/sign-in');
    }
  }, [])

  const quote = serverQuote ?? QOUTES[Math.floor(Math.random() * QOUTES.length)];
  return (
    <>
      <section className="bg-neutral-900 font-(family-name:--font-geist-sans) w-screen h-screen flex flex-row">
        {/* <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">

          <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 bg-neutral-800 border-neutral-700">
            <div className="p-3 space-y-4 md:space-y-6 sm:p-8 text-center">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
                Log in
              </h1>
            </div>



          </div>
        </div> */}
        <div className='hidden md:flex md:w-2/3 h-screen items-center justify-center overflow-hidden flex-col'>
          <div className="flex flex-row items-center justify-center mt-2 mb-3 text-2xl font-semibold text-gray-900">
            <Image
              className="ml-4 px-3"
              src={polarlearn_logo}
              alt="PolarLearn Logo"
              height={75}
              width={75}
            />
            <p className="text-center text-5xl font-extrabold leading-tight bg-linear-to-r from-sky-400 to-sky-100 bg-clip-text text-transparent">
              PolarLearn
            </p>
          </div>
          <h1 className='m-4 max-h-full font-bold text-center leading-tight wrap-break-word px-6 max-w-4xl text-[clamp(1.5rem,6vw,4.5rem)]'>
            {quote}
          </h1>
        </div>
        <div className="flex h-screen w-full items-center justify-center bg-neutral-800 md:w-1/2">
          <div className="flex w-full max-w-md flex-col items-center justify-center px-6 py-12">
            <h1 className="w-full text-center text-4xl font-bold">Log in</h1>

            <div className="mt-6 w-full">
              <div className="flex flex-row items-center justify-center gap-6">
                <GoogleSignIn url="" />
                <EntreeSignIn url="" />
              </div>

              <div className="flex items-center py-6">
                <hr className="grow border-neutral-600" />
                <span className="mx-4 text-gray-500 dark:text-gray-400">of</span>
                <hr className="grow border-neutral-600" />
              </div>

              <form method="POST" className="flex flex-col gap-4">
                <div className="flex flex-col text-left">
                  <Label htmlFor="email" className="text-lg">Jouw e-mailadres</Label>
                  <Input type="email" name="email" id="email" className="h-10" placeholder="you@example.com" />
                </div>

                <div className="flex flex-col text-left">
                  <Label htmlFor="password" className="text-lg">Jouw wachtwoord</Label>
                  <Input type="password" name="password" id="password" className="h-10" placeholder="••••••••" />
                </div>

                <Button1 type="submit" text="Log In" className="w-full" />

                <p className="text-center text-neutral-500">
                  Heb je nog geen account?
                  <Link to="/auth/sign-up" search={{ err: undefined }} className="pl-2 font-bold text-neutral-400">Maak een account aan!</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
