"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { paths } from "@/paths"
export default function NotFound() {
    const router = useRouter()
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4">
            <motion.div
                className="flex flex-col items-center text-center max-w-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="relative mb-8 bg-background rounded-full p-6 shadow-sm"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FileX className="h-12 w-12" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-4">404 - Page non trouvée</h1>
                <p className="text-muted-foreground mb-8">
                    Désolé, nous n&apos;avons pas pu trouver la page que vous recherchez. Elle a peut-être été déplacée ou
                    supprimée.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm items-center justify-center">
                    <Button asChild className="w-full" size="lg">
                        <Link href={paths.home}>Retour à l&apos;accueil</Link>
                    </Button>

                    <Button variant="outline" className="w-full" size="lg" onClick={() => router.back()}>
                        Page précédente
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-16">
                    Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, veuillez contacter le support.
                </p>
            </motion.div>
        </div>
    )
}

