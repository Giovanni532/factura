"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

import { pulseAnimation, containerAnimation, itemAnimation } from "./animations"

export default function ProfileLoading() {
  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl"
      initial="initial"
      animate="animate"
      variants={containerAnimation}
    >
      <div className="flex flex-col space-y-8">
        {/* En-tête */}
        <motion.div className="flex flex-col space-y-2" variants={itemAnimation}>
          <motion.div variants={pulseAnimation}>
            <Skeleton className="h-10 w-48" />
          </motion.div>
          <motion.div variants={pulseAnimation}>
            <Skeleton className="h-5 w-96" />
          </motion.div>
        </motion.div>

        {/* Contenu principal */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="personal" className="flex items-center">
              <span className="mr-2">👤</span>
              Personnel
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center">
              <span className="mr-2">🏢</span>
              Entreprise
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations Personnelles */}
          <TabsContent value="personal" className="space-y-6">
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={containerAnimation}>
              {/* Informations de base */}
              <motion.div className="lg:col-span-2" variants={itemAnimation}>
                <Card>
                  <CardHeader>
                    <motion.div variants={pulseAnimation}>
                      <Skeleton className="h-7 w-64 mb-2" />
                    </motion.div>
                    <motion.div variants={pulseAnimation}>
                      <Skeleton className="h-5 w-96" />
                    </motion.div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nom et prénom */}
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerAnimation}>
                      <motion.div className="space-y-2" variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-10 w-full" />
                        </motion.div>
                      </motion.div>
                      <motion.div className="space-y-2" variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-10 w-full" />
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Email */}
                    <motion.div className="space-y-2" variants={itemAnimation}>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-5 w-24" />
                      </motion.div>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-10 w-full" />
                      </motion.div>
                    </motion.div>

                    {/* Mot de passe */}
                    <motion.div className="space-y-2" variants={itemAnimation}>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-5 w-24" />
                      </motion.div>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-12 w-full" />
                      </motion.div>
                    </motion.div>

                    {/* Photo de profil */}
                    <motion.div className="space-y-2" variants={itemAnimation}>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-5 w-32" />
                      </motion.div>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-4 w-64" />
                      </motion.div>
                      <div className="flex items-center gap-4">
                        <motion.div
                          variants={pulseAnimation}
                          animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.6, 0.8, 0.6],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2,
                            ease: "easeInOut",
                          }}
                        >
                          <Skeleton className="h-20 w-20 rounded-full" />
                        </motion.div>
                        <div className="space-y-2">
                          <motion.div variants={pulseAnimation}>
                            <Skeleton className="h-9 w-32" />
                          </motion.div>
                          <motion.div variants={pulseAnimation}>
                            <Skeleton className="h-4 w-24" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Informations sur l'abonnement */}
              <motion.div className="space-y-6" variants={containerAnimation}>
                <motion.div variants={itemAnimation}>
                  <Card>
                    <CardHeader>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-7 w-32 mb-2" />
                      </motion.div>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-5 w-48" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div className="flex items-center justify-between" variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </motion.div>
                      </motion.div>
                      <motion.div className="flex items-center justify-between" variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </motion.div>
                      </motion.div>
                      <motion.div className="flex items-center justify-between" variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                      </motion.div>
                      <Separator className="my-2" />
                      <motion.div variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-9 w-full" />
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemAnimation}>
                  <Card>
                    <CardHeader>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-7 w-32 mb-2" />
                      </motion.div>
                      <motion.div variants={pulseAnimation}>
                        <Skeleton className="h-5 w-48" />
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.div className="flex items-center justify-between" variants={itemAnimation}>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-5 w-24" />
                        </motion.div>
                        <motion.div variants={pulseAnimation}>
                          <Skeleton className="h-6 w-32 rounded-full" />
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Boutons d'action */}
          <motion.div className="flex justify-between mt-8" variants={containerAnimation}>
            <motion.div variants={itemAnimation}>
              <motion.div variants={pulseAnimation}>
                <Skeleton className="h-10 w-32" />
              </motion.div>
            </motion.div>
            <motion.div variants={itemAnimation}>
              <motion.div variants={pulseAnimation}>
                <Skeleton className="h-10 w-48" />
              </motion.div>
            </motion.div>
          </motion.div>
        </Tabs>
      </div>
    </motion.div>
  )
}

