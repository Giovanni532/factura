export default function Loading() {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background transition-colors dark:bg-slate-950">
            <div className="flex flex-col items-center justify-center space-y-6 px-4 py-8 text-center">
                {/* Remplacer le spinner par un cercle qui pulse */}
                {/* Cercle qui pulse du plus petit au plus grand */}
                <div className="relative flex items-center justify-center h-24 w-24">
                    {/* Cercle principal */}
                    <div className="h-16 w-16 rounded-full bg-primary/80 animate-pulse-grow"></div>

                    {/* Premier cercle concentrique */}
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-expand"></div>

                    {/* Deuxième cercle concentrique (plus grand) */}
                    <div className="absolute -inset-4 rounded-full bg-primary/20 animate-pulse-outer"></div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">Chargement en cours...</h2>
                    <p className="text-sm italic text-muted-foreground mt-2">
                        Votre succès financier se construit à chaque facture
                    </p>
                </div>
            </div>

        </div>
    )
}

