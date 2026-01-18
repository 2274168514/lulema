"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { name: "首页", href: "/", icon: Home },
  { name: "社区", href: "/community", icon: Users },
  { name: "榜单", href: "/ranking", icon: Trophy },
  { name: "我的", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              {/* 顶部指示线 */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <tab.icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={`mb-1 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-ios-gray-1"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-ios-gray-1"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
