import { GlobeAltIcon } from "@heroicons/react/24/solid"
import { lusitana } from "./fonts"

export default function MBLOGLogo() {
  return (
    <div className={`${lusitana.className} flex flex-row items-center leading-none text-white`}>
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">MBLOG</p>
    </div>
  )
}
