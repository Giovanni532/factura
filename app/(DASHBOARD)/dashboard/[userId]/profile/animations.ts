// Animations variants pour Framer Motion
export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  }
  
  export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }
  
  export const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }
  
  export const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }
  
  // Animations pour l'état de chargement
  export const pulseAnimation = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 0.8, 0.6],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  }
  
  export const containerAnimation = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }
  
  export const itemAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }
  
  