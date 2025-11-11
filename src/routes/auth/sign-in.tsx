import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Button1 from '@/components/button/Button1';
import { prisma } from '@/utils/db'
import { hashPassword } from '@/utils/auth/password';
import { generateSession, generateSessionCookie } from '@/utils/auth/session';

export const Route = createFileRoute('/auth/sign-in')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        const user = await prisma.user.findUnique({
          where: {
            email,
          }
        })

        if (!user) {
          return new Response(null, { status: 301, headers: { Location: '/auth/sign-in?error=invalid_credentials' } });
        }

        const hashedPassword = await hashPassword(password, user.salt);
        if (hashedPassword !== user.password) {
          return new Response(null, { status: 301, headers: { Location: '/auth/sign-in?error=invalid_credentials' } });
        }

        const session = await generateSession(user.id);
        const cookie = await generateSessionCookie(session.sessionID);

        const resp = new Response(null, {
          status: 301,
          headers: {
            Location: '',
            'Set-Cookie': cookie,
          },
        });

        if (!user.loginAllowed) {
          resp.headers.set('Location', '/auth/banned');
        }

        resp.headers.set('Location', '/home/start');
        return resp;
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative'>
      <div className='flex flex-col'>
        {/* Google en github inlog knoppen komen later */}
        {/*         <div className="flex flex-row items-center justify-center space-x-4">
          {googleEnabled && <GoogleLogin />}
          {githubEnabled && <GithubLogin />}
        </div> */}

        <div className="flex items-center my-4">
          <hr className="grow border-neutral-600" />
          <span className="mx-4 text-gray-500 dark:text-gray-400">of</span>
          <hr className="grow border-neutral-600" />
        </div>

        <form action="/auth/sign-in" method="post">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-white"
            >
              E-mail
            </label>
            <input
              type="email"
              name="email"
              className="bg-neutral-800 border text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-neutral-700 placeholder-gray-400 dark:text-white focus:border-blue-500"
              placeholder="naam@gmail.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-white"
            >
              Wachtwoord
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="bg-neutral-800 border rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 border-neutral-700 placeholder-gray-400 text-white focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </button>
            </div>
            <br />
          </div>
          <Button1
            text="Inloggen"
            type="submit"
          />
          <p className="text-sm font-light text-gray-500 dark:text-gray-400 text-center mt-2">
            Heb je nog geen account?{" "}
            <Link
              to="/auth/sign-up"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              <strong>Maak er dan eentje!</strong>
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
