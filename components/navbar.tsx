"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, Menu, X, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { paths } from "@/paths"
import { useAuthStore } from "@/store/auth-store"

const navItems = [
    { name: "Accueil", href: paths.home },
    { name: "Services", href: "/services" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
]

export default function Navbar() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    useEffect(() => {
        setIsMounted(true)
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    if (isLoading) {
        return null
    }

    if (isAuthenticated) {
        return null
    }

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-white dark:bg-gray-900"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href={paths.home} className="flex items-center space-x-2">
                    <motion.div
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        A
                    </motion.div>
                    <motion.span
                        className="text-xl font-bold"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        AppName
                    </motion.span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center space-x-1">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                                            layoutId="navbar-indicator"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center space-x-2">
                    <div className="hidden md:block">
                        {isAuthenticated ? (
                            <Button
                                variant="outline"
                                size="icon"
                                asChild
                                className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <Link href="/profile">
                                    <User className="h-5 w-5" />
                                    <span className="sr-only">Profil</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                asChild
                                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                            >
                                <Link href="/auth/sign-in">
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Connexion
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0 border-gray-200 dark:border-gray-700">
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold">
                                                    A
                                                </div>
                                                <span className="text-xl font-bold">AppName</span>
                                            </Link>
                                        </div>
                                    </div>
                                    <nav className="flex-1 overflow-auto py-6 px-4">
                                        <ul className="space-y-4">
                                            {navItems.map((item) => {
                                                const isActive = pathname === item.href

                                                return (
                                                    <motion.li
                                                        key={item.href}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            className={`block py-2 px-4 text-lg rounded-md transition-colors ${isActive
                                                                ? "font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                                                                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                                }`}
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </motion.li>
                                                )
                                            })}
                                        </ul>
                                    </nav>
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                        {isAuthenticated ? (
                                            <Button
                                                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                                                asChild
                                            >
                                                <Link href="/profile" onClick={() => setIsOpen(false)}>
                                                    <User className="h-4 w-4 mr-2" />
                                                    Mon profil
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                                                asChild
                                            >
                                                <Link href={paths.auth.signIn} onClick={() => setIsOpen(false)}>
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    Connexion
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.header>
    )
}

