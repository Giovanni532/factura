"use client"
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                Gérez vos factures
                <span className="text-primary"> simplement</span>
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-lg text-muted-foreground">
                Factura est la solution tout-en-un pour gérer vos factures, devis, et clients.
                Simplifiez votre gestion administrative et concentrez-vous sur votre métier.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/auth/register"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Commencer maintenant
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/auth/login"
                className="border border-border hover:bg-muted px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                Se connecter
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-xl bg-card">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              <div className="p-6">
                <div className="w-full h-8 rounded-md bg-muted mb-6"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 rounded-md bg-muted"></div>
                  <div className="h-32 rounded-md bg-muted"></div>
                  <div className="h-32 rounded-md bg-muted"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">Fonctionnalités principales</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer efficacement votre activité, dans une seule application.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Facturation simplifiée",
              description: "Créez et envoyez des factures professionnelles en quelques clics",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              )
            },
            {
              title: "Gestion des clients",
              description: "Organisez votre base de clients avec toutes les informations nécessaires",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              )
            },
            {
              title: "Suivi des paiements",
              description: "Suivez en temps réel les paiements et les retards",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              )
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/30 flex items-center justify-center text-primary dark:text-primary-foreground mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-primary text-primary-foreground rounded-2xl p-12 shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-4">Prêt à optimiser votre gestion administrative ?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui gagnent du temps chaque jour grâce à Factura.
          </p>
          <Link
            href="/auth/register"
            className="bg-background text-primary hover:bg-background/90 px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            Essayer gratuitement
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Factura</h3>
            <p className="text-muted-foreground mb-4">
              La solution de gestion administrative qui vous fait gagner du temps.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Connexion</Link></li>
              <li><Link href="/auth/register" className="text-muted-foreground hover:text-foreground transition-colors">Inscription</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link></li>
              <li><Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">Conditions d'utilisation</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Factura. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
