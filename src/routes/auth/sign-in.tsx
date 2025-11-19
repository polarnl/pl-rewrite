import { createFileRoute } from '@tanstack/react-router'
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
import { setCookie } from '@tanstack/start/server'

export const Route = createFileRoute('/auth/sign-in')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const formData = await request.formData()
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          return Response.redirect('/auth/sign-in?error=invalid_credentials', 301)
        }

        const hashedPassword = await hashPassword(password, user.salt)
        if (hashedPassword !== user.password) {
          return Response.redirect('/auth/sign-in?error=invalid_credentials', 301)
        }

        const session = await generateSession(user.id)
        const cookieValue = await generateSessionCookie(session.sessionID)

        setCookie('polarlearn.session', cookieValue, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        })

        if (!user.loginAllowed) {
          return Response.redirect('/auth/banned', 301)
        }

        return Response.redirect('/home/start', 301)
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <section className="bg-neutral-900 font-[family-name:var(--font-geist-sans)] py-5">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
          <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
            <Image
              className="ml-4 px-3"
              src={polarlearn_logo}
              alt="PolarLearn Logo"
              height={75}
              width={75}
            />
            <p className="text-center text-4xl font-extrabold leading-tight bg-gradient-to-r from-sky-400 to-sky-100 bg-clip-text text-transparent">
              PolarLearn
            </p>
          </div>
          <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 bg-neutral-800 border-neutral-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8 text-center">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
                Log in
              </h1>
            </div>
            <div className='w-full items-center justify-center flex flex-row gap-6'>
              <GoogleSignIn url="" />
              <EntreeSignIn url="" />
            </div>
            <div className="flex items-center m-4">
              <hr className="grow border-neutral-600" />
              <span className="mx-4 text-gray-500 dark:text-gray-400">of</span>
              <hr className="grow border-neutral-600" />
            </div>
            <form method='POST' className='mx-4'>
              <Label htmlFor="email" className="my-4 text-lg">Your email</Label>
              <Input type="email" name="email" id="email" className=" w-full h-10" placeholder="you@example.com" />
              <Label htmlFor="password" className="my-4 text-lg">Your password</Label>
              <Input type="password" name="password" id="password" className="mb-6 w-full h-10" placeholder="••••••••" />
              <Button1
                type="submit"
                text={"Sign In"}
                className='w-full mb-5'
              />
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
