"use client"

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { deleteProduct } from '@/actions/produit'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface DeleteProductButtonProps {
    itemId: string
    itemName: string
}

export default function DeleteProductButton({ itemId, itemName }: DeleteProductButtonProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            setError(null)
            await deleteProduct({ id: itemId })
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            console.error('Erreur lors de la suppression du produit:', error)
            setError(error.message || "Une erreur est survenue lors de la suppression")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                    </Button>
                </motion.div>
            </DialogTrigger>
            <DialogContent>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <DialogHeader>
                        <DialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</DialogTitle>
                        <DialogDescription>
                            Vous êtes sur le point de supprimer le produit <strong>{itemName}</strong>. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <motion.div
                            className="bg-destructive/15 text-destructive p-3 rounded-md mt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isDeleting}
                            >
                                Annuler
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Suppression..." : "Supprimer"}
                            </Button>
                        </motion.div>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
} 