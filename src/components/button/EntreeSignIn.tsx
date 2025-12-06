import { Image } from "@unpic/react"
import entree from "@/img/mef-logo.svg"

export function EntreeSignIn({ url }: { url: string }) {
  return (
    <a
      href={url}
      className="flex md:h-10 h-13 rounded-lg max-w-fit min-h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-750 transition duration-200"
    >
      <div className="flex items-center space-x-2 px-2 w-full text-center">
        <p className="items-center text-white font-medium">Log in met</p>
        <Image src={entree} width={100} height={40} />
      </div>
    </a>
  )
}