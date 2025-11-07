import { useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import Button1 from "./button/Button1";

export function PolarNavBar() {
  const location = useLocation().pathname

  if (
    location.startsWith('/auth') ||
    location.startsWith("/learn")
  ) {
    return null
  }

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 max-h-16 h-full border-b border-neutral-800/60 bg-neutral-900/80 backdrop-blur">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between">
          <Image
            src="/icon.svg"
            width={50}
            height={50}
            className="mx-2"
          />
          {location === '/' && (
            <>
              <div className="grow" />
              <Button1 text={"Log in"} redirectTo="/auth/sign-in" className="mr-4" useClNav={true} />
            </>
          )}
        </div>
      </nav>
      <div className="h-16" />
    </>
  )
}