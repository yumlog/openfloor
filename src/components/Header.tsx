"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  menuName: string;
  menuIcon?: React.ReactNode;
  menuPath: string;
}

const menuNav: MenuItem[] = [
  {
    menuName: "홈",
    menuIcon: (
      <Image
        aria-hidden
        src="/images/window.svg"
        alt="Window icon"
        width={16}
        height={16}
      />
    ),
    menuPath: "/",
  },
  {
    menuName: "메인",
    menuPath: "/main",
  },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="flex-shrink-0 flex gap-5 justify-around bg-white border border-gray-1 rounded-t px-5">
      {menuNav.map((menu) => {
        const isActive =
          (pathname === menu.menuPath || pathname.startsWith(menu.menuPath)) &&
          (menu.menuPath !== "/" || pathname === "/");

        return (
          <Link
            key={menu.menuName}
            href={menu.menuPath}
            className={`w-[54px] h-[60px] flex gap-1 items-center justify-center text-center ${
              isActive ? "text-primary" : "text-gray-6"
            }`}
          >
            {menu.menuIcon && menu.menuIcon}
            <p className="text-xxs leading-4">{menu.menuName}</p>
          </Link>
        );
      })}
    </div>
  );
}
