"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, LogIn, FileText, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { paths } from "@/paths"
import { useAuthStore } from "@/store/auth-store"

const navItems = [
    { name: "Accueil", href: paths.home },
    { name: "Fonctionnalités", href: paths.public.features },
    { name: "Tarifs", href: paths.public.pricing },
    { name: "Blog", href: paths.public.blog },
    { name: "À propos", href: paths.public.about },
    { name: "Contact", href: paths.public.contact },
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
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    if (isLoading) {
        return null
    }

    // Si l'utilisateur est dans le dashboard, ne pas afficher la navbar publique
    if (pathname?.startsWith('/dashboard')) {
        return null
    }

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-background/80 backdrop-blur-md shadow-sm"
                : "bg-background"
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href={paths.home} className="flex items-center space-x-2">
                    <motion.div
                        className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        F
                    </motion.div>
                    <motion.span
                        className="text-xl font-bold"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Factura
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
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
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
                                            className="absolute -bottom-1 left-3 right-3 h-0.5 bg-primary"
                                            layoutId="navbar-indicator"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center space-x-3">
                    {/* Toggle theme button */}
                    {isMounted && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>
                    )}

                    <div className="hidden md:flex space-x-2">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="border-border hover:bg-muted"
                                >
                                    <Link href={paths.dashboard.home}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="hover:bg-muted"
                                >
                                    <Link href={paths.auth.signIn}>
                                        Connexion
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    asChild
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <Link href={paths.auth.signUp}>
                                        Essayer gratuitement
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[80vw] sm:w-[350px] p-0 border-border">
                                <div className="h-full flex flex-col">
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <Link href={paths.home} className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                                F
                                            </div>
                                            <span className="text-xl font-bold">Factura</span>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                            <X className="h-5 w-5" />
                                        </Button>
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
                                                            className={`block py-2 px-4 text-base rounded-md transition-colors ${isActive
                                                                ? "font-medium text-foreground bg-muted"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
                                    <div className="p-4 flex flex-col space-y-3 border-t border-border">
                                        {isMounted && (
                                            <Button
                                                variant="outline"
                                                onClick={toggleTheme}
                                                className="w-full justify-start"
                                            >
                                                {theme === 'dark' ? (
                                                    <>
                                                        <Sun className="h-4 w-4 mr-2" />
                                                        Mode clair
                                                    </>
                                                ) : (
                                                    <>
                                                        <Moon className="h-4 w-4 mr-2" />
                                                        Mode sombre
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {isAuthenticated ? (
                                            <>
                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                                    asChild
                                                >
                                                    <Link href={paths.dashboard.home} onClick={() => setIsOpen(false)}>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        Dashboard
                                                    </Link>
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-border"
                                                    asChild
                                                >
                                                    <Link href={paths.auth.signIn} onClick={() => setIsOpen(false)}>
                                                        <LogIn className="h-4 w-4 mr-2" />
                                                        Connexion
                                                    </Link>
                                                </Button>
                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                                    asChild
                                                >
                                                    <Link href={paths.auth.signUp} onClick={() => setIsOpen(false)}>
                                                        Essayer gratuitement
                                                    </Link>
                                                </Button>
                                            </>
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

