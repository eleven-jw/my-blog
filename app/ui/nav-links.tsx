"use client"
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const links = [
  {
    name: "Explore",
    href: "/explore",
    icon: GlobeAltIcon,
  },
  { name: "Home", href: "/", icon: HomeIcon },
  {
    name: "Posts",
    href: "/posts",
    icon: DocumentDuplicateIcon,
  },

  {
    name: "Profile",
    href: "/profile",
    icon: UserGroupIcon,
  },
]

export default function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-4 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        )
      })}
    </>
  )
}
