import { Language } from './stores/languageStore';

export const translations = {
  // Navegación y UI general
  loading: {
    es: 'Cargando...',
    en: 'Loading...',
    fr: 'Chargement...',
    de: 'Laden...',
    it: 'Caricamento...',
  },
  close: {
    es: 'Cerrar',
    en: 'Close',
    fr: 'Fermer',
    de: 'Schließen',
    it: 'Chiudi',
  },
  back: {
    es: 'Volver',
    en: 'Back',
    fr: 'Retour',
    de: 'Zurück',
    it: 'Indietro',
  },
  upgradePlan: {
    es: '⭐ Mejorar Plan',
    en: '⭐ Upgrade Plan',
    fr: '⭐ Améliorer',
    de: '⭐ Upgrade',
    it: '⭐ Migliora',
  },
  adBannerTitle: {
    es: '🚀 Desbloquea la Experiencia Completa',
    en: '🚀 Unlock the Full Experience',
    fr: '🚀 Débloquez l\'Expérience Complète',
    de: '🚀 Schalte die Vollversion frei',
    it: '🚀 Sblocca l\'Esperienza Completa',
  },
  adBannerDescription: {
    es: 'Accede a POIs exclusivos, sin anuncios y mucho más con Premium',
    en: 'Access exclusive POIs, ad-free experience and more with Premium',
    fr: 'Accédez aux POIs exclusifs, sans publicité et plus avec Premium',
    de: 'Zugriff auf exklusive POIs, werbefrei und mehr mit Premium',
    it: 'Accedi a POI esclusivi, senza pubblicità e altro con Premium',
  },
  adBannerButton: {
    es: '⭐ Mejorar a Premium',
    en: '⭐ Upgrade to Premium',
    fr: '⭐ Passer à Premium',
    de: '⭐ Auf Premium upgraden',
    it: '⭐ Passa a Premium',
  },
  dismissAd: {
    es: 'Cerrar',
    en: 'Dismiss',
    fr: 'Fermer',
    de: 'Schließen',
    it: 'Chiudi',
  },

  // POI Detail Modal
  premium: {
    es: 'Premium',
    en: 'Premium',
    fr: 'Premium',
    de: 'Premium',
    it: 'Premium',
  },
  points: {
    es: 'puntos',
    en: 'points',
    fr: 'points',
    de: 'Punkte',
    it: 'punti',
  },
  minutes: {
    es: 'min',
    en: 'min',
    fr: 'min',
    de: 'Min',
    it: 'min',
  },
  audioGuideAvailable: {
    es: 'Audio-guía disponible',
    en: 'Audio guide available',
    fr: 'Audio-guide disponible',
    de: 'Audioführung verfügbar',
    it: 'Audioguida disponibile',
  },
  scanToUnlock: {
    es: 'Escanear para desbloquear',
    en: 'Scan to unlock',
    fr: 'Scanner pour déverrouiller',
    de: 'Scannen zum Entsperren',
    it: 'Scansiona per sbloccare',
  },
  navigateHere: {
    es: 'Navegar hasta aquí',
    en: 'Navigate here',
    fr: 'Naviguer ici',
    de: 'Hierher navigieren',
    it: 'Naviga qui',
  },
  alreadyVisited: {
    es: 'Ya visitado',
    en: 'Already visited',
    fr: 'Déjà visité',
    de: 'Bereits besucht',
    it: 'Già visitato',
  },
  clickForDetails: {
    es: 'Click para ver detalles',
    en: 'Click for details',
    fr: 'Cliquez pour les détails',
    de: 'Klicken für Details',
    it: 'Clicca per dettagli',
  },

  // Dificultad
  difficulty: {
    easy: {
      es: 'Fácil',
      en: 'Easy',
      fr: 'Facile',
      de: 'Leicht',
      it: 'Facile',
    },
    medium: {
      es: 'Medio',
      en: 'Medium',
      fr: 'Moyen',
      de: 'Mittel',
      it: 'Medio',
    },
    hard: {
      es: 'Difícil',
      en: 'Hard',
      fr: 'Difficile',
      de: 'Schwer',
      it: 'Difficile',
    },
  },

  // User Progress
  level: {
    es: 'Nivel',
    en: 'Level',
    fr: 'Niveau',
    de: 'Stufe',
    it: 'Livello',
  },
  xpFor: {
    es: 'XP para',
    en: 'XP for',
    fr: 'XP pour',
    de: 'XP für',
    it: 'XP per',
  },
  pois: {
    es: 'POIs',
    en: 'POIs',
    fr: 'POIs',
    de: 'POIs',
    it: 'POI',
  },
  poisVisited: {
    es: 'POIs visitados',
    en: 'POIs visited',
    fr: 'POIs visités',
    de: 'Besuchte POIs',
    it: 'POI visitati',
  },
  totalPoints: {
    es: 'Puntos totales',
    en: 'Total points',
    fr: 'Points totaux',
    de: 'Gesamtpunkte',
    it: 'Punti totali',
  },
  completed: {
    es: 'completados',
    en: 'completed',
    fr: 'complétés',
    de: 'abgeschlossen',
    it: 'completati',
  },

  // Map
  centerOnMe: {
    es: 'Centrar en mi ubicación',
    en: 'Center on my location',
    fr: 'Centrer sur ma position',
    de: 'Auf meinen Standort zentrieren',
    it: 'Centra sulla mia posizione',
  },
  poisCounter: {
    es: 'POIs',
    en: 'POIs',
    fr: 'POIs',
    de: 'POIs',
    it: 'POI',
  },

  // Scan Modal
  scanQRCode: {
    es: 'Escanear Código QR',
    en: 'Scan QR Code',
    fr: 'Scanner le code QR',
    de: 'QR-Code scannen',
    it: 'Scansiona codice QR',
  },
  scanInstructions: {
    es: 'Apunta tu cámara al código QR del POI para verificar tu visita',
    en: 'Point your camera at the POI QR code to verify your visit',
    fr: 'Pointez votre caméra sur le code QR du POI pour vérifier votre visite',
    de: 'Richten Sie Ihre Kamera auf den QR-Code des POI, um Ihren Besuch zu verifizieren',
    it: 'Punta la fotocamera sul codice QR del POI per verificare la tua visita',
  },
  cameraPermission: {
    es: 'Se necesita permiso de cámara',
    en: 'Camera permission needed',
    fr: 'Autorisation de caméra nécessaire',
    de: 'Kameraberechtigung erforderlich',
    it: 'Autorizzazione fotocamera necessaria',
  },
  allowCamera: {
    es: 'Permitir acceso a la cámara',
    en: 'Allow camera access',
    fr: 'Autoriser l\'accès à la caméra',
    de: 'Kamerazugriff erlauben',
    it: 'Consenti accesso alla fotocamera',
  },
  scanning: {
    es: 'Escaneando...',
    en: 'Scanning...',
    fr: 'Analyse en cours...',
    de: 'Scannen...',
    it: 'Scansione...',
  },
  cancel: {
    es: 'Cancelar',
    en: 'Cancel',
    fr: 'Annuler',
    de: 'Abbrechen',
    it: 'Annulla',
  },
  manualCode: {
    es: 'Ingresar código manualmente',
    en: 'Enter code manually',
    fr: 'Entrer le code manuellement',
    de: 'Code manuell eingeben',
    it: 'Inserisci codice manualmente',
  },
  enterCode: {
    es: 'Ingresa el código del POI',
    en: 'Enter the POI code',
    fr: 'Entrez le code du POI',
    de: 'Geben Sie den POI-Code ein',
    it: 'Inserisci il codice del POI',
  },
  verify: {
    es: 'Verificar',
    en: 'Verify',
    fr: 'Vérifier',
    de: 'Überprüfen',
    it: 'Verifica',
  },

  // Success Messages
  congratulations: {
    es: '¡Felicitaciones!',
    en: 'Congratulations!',
    fr: 'Félicitations!',
    de: 'Glückwunsch!',
    it: 'Congratulazioni!',
  },
  visitCompleted: {
    es: 'Visita completada',
    en: 'Visit completed',
    fr: 'Visite terminée',
    de: 'Besuch abgeschlossen',
    it: 'Visita completata',
  },
  youEarned: {
    es: 'Has ganado',
    en: 'You earned',
    fr: 'Vous avez gagné',
    de: 'Sie haben verdient',
    it: 'Hai guadagnato',
  },
  youVisited: {
    es: 'Has visitado:',
    en: 'You visited:',
    fr: 'Vous avez visité:',
    de: 'Sie haben besucht:',
    it: 'Hai visitado:',
  },
  continue: {
    es: 'Continuar',
    en: 'Continue',
    fr: 'Continuer',
    de: 'Weiter',
    it: 'Continua',
  },

  // Error Messages
  error: {
    es: 'Error',
    en: 'Error',
    fr: 'Erreur',
    de: 'Fehler',
    it: 'Errore',
  },
  invalidCode: {
    es: 'Código inválido',
    en: 'Invalid code',
    fr: 'Code invalide',
    de: 'Ungültiger Code',
    it: 'Codice non valido',
  },
  alreadyScanned: {
    es: 'Ya has visitado este POI',
    en: 'You have already visited this POI',
    fr: 'Vous avez déjà visité ce POI',
    de: 'Sie haben diesen POI bereits besucht',
    it: 'Hai già visitato questo POI',
  },
  tryAgain: {
    es: 'Intentar de nuevo',
    en: 'Try again',
    fr: 'Réessayer',
    de: 'Erneut versuchen',
    it: 'Riprova',
  },

  // Categories
  categories: {
    MONUMENT: {
      es: 'Monumento',
      en: 'Monument',
      fr: 'Monument',
      de: 'Denkmal',
      it: 'Monumento',
    },
    MUSEUM: {
      es: 'Museo',
      en: 'Museum',
      fr: 'Musée',
      de: 'Museum',
      it: 'Museo',
    },
    VIEWPOINT: {
      es: 'Mirador',
      en: 'Viewpoint',
      fr: 'Point de vue',
      de: 'Aussichtspunkt',
      it: 'Punto panoramico',
    },
    RESTAURANT: {
      es: 'Restaurante',
      en: 'Restaurant',
      fr: 'Restaurant',
      de: 'Restaurant',
      it: 'Ristorante',
    },
    BEACH: {
      es: 'Playa',
      en: 'Beach',
      fr: 'Plage',
      de: 'Strand',
      it: 'Spiaggia',
    },
    PARK: {
      es: 'Parque',
      en: 'Park',
      fr: 'Parc',
      de: 'Park',
      it: 'Parco',
    },
    HISTORIC: {
      es: 'Histórico',
      en: 'Historic',
      fr: 'Historique',
      de: 'Historisch',
      it: 'Storico',
    },
    CULTURE: {
      es: 'Cultural',
      en: 'Cultural',
      fr: 'Culturel',
      de: 'Kulturell',
      it: 'Culturale',
    },
    NATURE: {
      es: 'Naturaleza',
      en: 'Nature',
      fr: 'Nature',
      de: 'Natur',
      it: 'Natura',
    },
    SHOPPING: {
      es: 'Tienda',
      en: 'Shopping',
      fr: 'Boutique',
      de: 'Einkaufen',
      it: 'Negozio',
    },
  },

  // NFC Scan Page
  nfcScan: {
    es: 'Escaneo NFC',
    en: 'NFC Scan',
    fr: 'Scan NFC',
    de: 'NFC-Scan',
    it: 'Scansione NFC',
  },
  confirmVisit: {
    es: 'Confirmar Visita',
    en: 'Confirm Visit',
    fr: 'Confirmer la Visite',
    de: 'Besuch bestätigen',
    it: 'Conferma Visita',
  },
  confirmVisitDescription: {
    es: 'Confirma tu visita para ganar puntos y experiencia',
    en: 'Confirm your visit to earn points and experience',
    fr: 'Confirmez votre visite pour gagner des points et de l\'expérience',
    de: 'Bestätigen Sie Ihren Besuch, um Punkte und Erfahrung zu sammeln',
    it: 'Conferma la tua visita per guadagnare punti ed esperienza',
  },
  processing: {
    es: 'Procesando...',
    en: 'Processing...',
    fr: 'Traitement...',
    de: 'Verarbeitung...',
    it: 'Elaborazione...',
  },
  locationPermissionNote: {
    es: 'Al confirmar, registraremos tu ubicación para verificar que estás en el lugar',
    en: 'By confirming, we will register your location to verify you are at the place',
    fr: 'En confirmant, nous enregistrerons votre emplacement pour vérifier que vous êtes sur place',
    de: 'Durch Bestätigung werden wir Ihren Standort registrieren, um zu überprüfen, dass Sie vor Ort sind',
    it: 'Confermando, registreremo la tua posizione per verificare che sei sul posto',
  },
  alreadyVisitedError: {
    es: 'Ya has visitado este lugar anteriormente',
    en: 'You have already visited this place',
    fr: 'Vous avez déjà visité cet endroit',
    de: 'Sie haben diesen Ort bereits besucht',
    it: 'Hai già visitato questo luogo',
  },
  locationPermissionError: {
    es: 'Necesitamos acceso a tu ubicación para verificar tu visita',
    en: 'We need access to your location to verify your visit',
    fr: 'Nous avons besoin d\'accéder à votre emplacement pour vérifier votre visite',
    de: 'Wir benötigen Zugriff auf Ihren Standort, um Ihren Besuch zu überprüfen',
    it: 'Abbiamo bisogno di accedere alla tua posizione per verificare la tua visita',
  },
  scanProcessError: {
    es: 'Error al procesar el escaneo',
    en: 'Error processing scan',
    fr: 'Erreur lors du traitement du scan',
    de: 'Fehler beim Verarbeiten des Scans',
    it: 'Errore nell\'elaborazione della scansione',
  },
  backToMap: {
    es: 'Volver al Mapa',
    en: 'Back to Map',
    fr: 'Retour à la Carte',
    de: 'Zurück zur Karte',
    it: 'Torna alla Mappa',
  },

  pageNotFound: {
    es: 'Página no encontrada',
    en: 'Page not found',
    fr: 'Page non trouvée',
    de: 'Seite nicht gefunden',
    it: 'Pagina non trovata',
  },

  pageNotFoundDesc: {
    es: 'La página que buscas no existe o ha sido movida.',
    en: 'The page you are looking for does not exist or has been moved.',
    fr: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    de: 'Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.',
    it: 'La pagina che stai cercando non esiste o è stata spostata.',
  },

  // Homepage translations
  discoverEstepona: {
    es: 'Descubre Estepona',
    en: 'Discover Estepona',
    fr: 'Découvrez Estepona',
    de: 'Entdecke Estepona',
    it: 'Scopri Estepona',
  },
  heroSubtitle: {
    es: 'Tu aventura gamificada por la ciudad más encantadora de la Costa del Sol',
    en: 'Your gamified adventure through the most charming city on the Costa del Sol',
    fr: 'Votre aventure gamifiée dans la ville la plus charmante de la Costa del Sol',
    de: 'Dein gamifiziertes Abenteuer durch die bezauberndste Stadt an der Costa del Sol',
    it: 'La tua avventura gamificata nella città più affascinante della Costa del Sol',
  },
  beaches: {
    es: 'Playas',
    en: 'Beaches',
    fr: 'Plages',
    de: 'Strände',
    it: 'Spiagge',
  },
  monuments: {
    es: 'Monumentos',
    en: 'Monuments',
    fr: 'Monuments',
    de: 'Denkmäler',
    it: 'Monumenti',
  },
  gastronomy: {
    es: 'Gastronomía',
    en: 'Gastronomy',
    fr: 'Gastronomie',
    de: 'Gastronomie',
    it: 'Gastronomia',
  },
  challenges: {
    es: 'Desafíos',
    en: 'Challenges',
    fr: 'Défis',
    de: 'Herausforderungen',
    it: 'Sfide',
  },
  choosePlanTitle: {
    es: 'Elige tu plan y comienza',
    en: 'Choose your plan and start',
    fr: 'Choisissez votre plan et commencez',
    de: 'Wähle deinen Plan und beginne',
    it: 'Scegli il tuo piano e inizia',
  },
  choosePlanSubtitle: {
    es: 'Selecciona el plan que mejor se adapte a tu aventura',
    en: 'Select the plan that best suits your adventure',
    fr: 'Sélectionnez le plan qui correspond le mieux à votre aventure',
    de: 'Wähle den Plan, der am besten zu deinem Abenteuer passt',
    it: 'Seleziona il piano che meglio si adatta alla tua avventura',
  },
  freePlan: {
    es: 'Gratuito',
    en: 'Free',
    fr: 'Gratuit',
    de: 'Kostenlos',
    it: 'Gratuito',
  },
  premiumPlan: {
    es: 'Premium',
    en: 'Premium',
    fr: 'Premium',
    de: 'Premium',
    it: 'Premium',
  },
  familyPlan: {
    es: 'Familiar',
    en: 'Family',
    fr: 'Familial',
    de: 'Familie',
    it: 'Familiare',
  },
  mostPopular: {
    es: 'MÁS POPULAR',
    en: 'MOST POPULAR',
    fr: 'LE PLUS POPULAIRE',
    de: 'AM BELIEBTESTEN',
    it: 'PIÙ POPOLARE',
  },
  perMonth: {
    es: '/mes',
    en: '/month',
    fr: '/mois',
    de: '/Monat',
    it: '/mese',
  },

  // Free plan features
  basicPoisAccess: {
    es: 'Acceso a POIs básicos',
    en: 'Access to basic POIs',
    fr: 'Accès aux POI de base',
    de: 'Zugang zu grundlegenden POIs',
    it: 'Accesso ai POI di base',
  },
  gamificationSystem: {
    es: 'Sistema de gamificación',
    en: 'Gamification system',
    fr: 'Système de gamification',
    de: 'Gamification-System',
    it: 'Sistema di gamificazione',
  },
  interactiveMap: {
    es: 'Mapa interactivo',
    en: 'Interactive map',
    fr: 'Carte interactive',
    de: 'Interaktive Karte',
    it: 'Mappa interattiva',
  },
  basicBadges: {
    es: 'Badges básicos',
    en: 'Basic badges',
    fr: 'Badges de base',
    de: 'Grundlegende Abzeichen',
    it: 'Badge di base',
  },
  progressStats: {
    es: 'Progreso y estadísticas',
    en: 'Progress and statistics',
    fr: 'Progrès et statistiques',
    de: 'Fortschritt und Statistiken',
    it: 'Progresso e statistiche',
  },

  // Premium plan features
  everythingFree: {
    es: 'Todo lo de Gratuito',
    en: 'Everything from Free',
    fr: 'Tout du plan Gratuit',
    de: 'Alles vom kostenlosen Plan',
    it: 'Tutto dal piano Gratuito',
  },
  allPremiumPois: {
    es: 'Acceso a todos los POIs premium',
    en: 'Access to all premium POIs',
    fr: 'Accès à tous les POI premium',
    de: 'Zugang zu allen Premium-POIs',
    it: 'Accesso a tutti i POI premium',
  },
  exclusiveBadges: {
    es: 'Badges exclusivos',
    en: 'Exclusive badges',
    fr: 'Badges exclusifs',
    de: 'Exklusive Abzeichen',
    it: 'Badge esclusivi',
  },
  noAds: {
    es: 'Sin anuncios',
    en: 'No ads',
    fr: 'Sans publicité',
    de: 'Keine Werbung',
    it: 'Senza pubblicità',
  },
  businessDiscounts: {
    es: 'Descuentos en comercios',
    en: 'Business discounts',
    fr: 'Remises commerciales',
    de: 'Geschäftsrabatte',
    it: 'Sconti commerciali',
  },
  prioritySupport: {
    es: 'Soporte prioritario',
    en: 'Priority support',
    fr: 'Support prioritaire',
    de: 'Prioritäts-Support',
    it: 'Supporto prioritario',
  },

  // Family plan features
  everythingPremium: {
    es: 'Todo lo de Premium',
    en: 'Everything from Premium',
    fr: 'Tout du plan Premium',
    de: 'Alles vom Premium-Plan',
    it: 'Tutto dal piano Premium',
  },
  sixFamilyAccounts: {
    es: 'Hasta 6 cuentas familiares',
    en: 'Up to 6 family accounts',
    fr: 'Jusqu\'à 6 comptes familiaux',
    de: 'Bis zu 6 Familienkonten',
    it: 'Fino a 6 account familiari',
  },
  sharedProgress: {
    es: 'Progreso compartido',
    en: 'Shared progress',
    fr: 'Progrès partagé',
    de: 'Geteilter Fortschritt',
    it: 'Progresso condiviso',
  },
  familyChallenges: {
    es: 'Desafíos familiares',
    en: 'Family challenges',
    fr: 'Défis familiaux',
    de: 'Familien-Herausforderungen',
    it: 'Sfide familiari',
  },
  exclusiveEvents: {
    es: 'Eventos exclusivos',
    en: 'Exclusive events',
    fr: 'Événements exclusifs',
    de: 'Exklusive Veranstaltungen',
    it: 'Eventi esclusivi',
  },
  additionalDiscounts: {
    es: 'Descuentos adicionales',
    en: 'Additional discounts',
    fr: 'Remises supplémentaires',
    de: 'Zusätzliche Rabatte',
    it: 'Sconti aggiuntivi',
  },

  // Buttons and actions
  signInFree: {
    es: 'Iniciar sesión gratis',
    en: 'Sign in for free',
    fr: 'Se connecter gratuitement',
    de: 'Kostenlos anmelden',
    it: 'Accedi gratuitamente',
  },
  continueToPayment: {
    es: 'Continuar al pago',
    en: 'Continue to payment',
    fr: 'Continuer au paiement',
    de: 'Weiter zur Zahlung',
    it: 'Continua al pagamento',
  },
  continueWithEmail: {
    es: 'Continuar con Email',
    en: 'Continue with Email',
    fr: 'Continuer avec Email',
    de: 'Mit E-Mail fortfahren',
    it: 'Continua con Email',
  },
  backToLoginOptions: {
    es: '← Volver a opciones de inicio de sesión',
    en: '← Back to login options',
    fr: '← Retour aux options de connexion',
    de: '← Zurück zu den Anmeldeoptionen',
    it: '← Torna alle opzioni di accesso',
  },

  // Legal and disclaimers
  termsConditions: {
    es: 'Al continuar, aceptas nuestros términos y condiciones',
    en: 'By continuing, you accept our terms and conditions',
    fr: 'En continuant, vous acceptez nos termes et conditions',
    de: 'Mit dem Fortfahren akzeptieren Sie unsere Geschäftsbedingungen',
    it: 'Continuando, accetti i nostri termini e condizioni',
  },
  paymentProcess: {
    es: 'Primero iniciarás sesión, luego procederás con el pago seguro en Stripe',
    en: 'First you will sign in, then proceed with secure payment on Stripe',
    fr: 'Vous vous connecterez d\'abord, puis procéderez au paiement sécurisé sur Stripe',
    de: 'Zuerst melden Sie sich an, dann fahren Sie mit der sicheren Zahlung über Stripe fort',
    it: 'Prima accederai, poi procederai con il pagamento sicuro su Stripe',
  },

  // Feature highlights
  gamificationTitle: {
    es: 'Gamificación',
    en: 'Gamification',
    fr: 'Gamification',
    de: 'Gamification',
    it: 'Gamificazione',
  },
  gamificationDesc: {
    es: 'Gana puntos, desbloquea badges y sube de nivel mientras exploras',
    en: 'Earn points, unlock badges and level up while exploring',
    fr: 'Gagnez des points, débloquez des badges et montez de niveau en explorant',
    de: 'Sammle Punkte, schalte Abzeichen frei und steige auf, während du erkundest',
    it: 'Guadagna punti, sblocca badge e sali di livello mentre esplori',
  },
  nfcScanningTitle: {
    es: 'Escaneo NFC',
    en: 'NFC Scanning',
    fr: 'Scan NFC',
    de: 'NFC-Scan',
    it: 'Scansione NFC',
  },
  nfcScanningDesc: {
    es: 'Escanea códigos en ubicaciones reales para obtener recompensas',
    en: 'Scan codes at real locations to get rewards',
    fr: 'Scannez les codes dans des lieux réels pour obtenir des récompenses',
    de: 'Scanne Codes an echten Orten, um Belohnungen zu erhalten',
    it: 'Scansiona i codici in luoghi reali per ottenere ricompense',
  },
  competitionsTitle: {
    es: 'Competencias',
    en: 'Competitions',
    fr: 'Compétitions',
    de: 'Wettbewerbe',
    it: 'Competizioni',
  },
  competitionsDesc: {
    es: 'Compite con otros exploradores en el ranking global',
    en: 'Compete with other explorers in the global ranking',
    fr: 'Concourez avec d\'autres explorateurs dans le classement mondial',
    de: 'Konkurriere mit anderen Entdeckern im globalen Ranking',
    it: 'Gareggia con altri esploratori nella classifica globale',
  },
  or: {
    es: 'o',
    en: 'or',
    fr: 'ou',
    de: 'oder',
    it: 'o',
  },

  // Rewards System
  rewardsTitle: {
    es: 'Tus Premios',
    en: 'Your Rewards',
    fr: 'Vos Récompenses',
    de: 'Deine Belohnungen',
    it: 'I Tuoi Premi',
  },
  rewards: {
    es: 'Premios',
    en: 'Rewards',
    fr: 'Récompenses',
    de: 'Belohnungen',
    it: 'Premi',
  },
  totalPoints: {
    es: 'puntos totales',
    en: 'total points',
    fr: 'points totaux',
    de: 'Gesamtpunkte',
    it: 'punti totali',
  },
  upgradeToPremuim: {
    es: '¡Actualiza a Premium!',
    en: 'Upgrade to Premium!',
    fr: 'Passez à Premium !',
    de: 'Auf Premium upgraden!',
    it: 'Passa a Premium!',
  },
  rewardsOnlyPremium: {
    es: 'Los premios están disponibles solo para usuarios Premium',
    en: 'Rewards are available only for Premium users',
    fr: 'Les récompenses sont disponibles uniquement pour les utilisateurs Premium',
    de: 'Belohnungen sind nur für Premium-Benutzer verfügbar',
    it: 'I premi sono disponibili solo per gli utenti Premium',
  },
  rewardsExclusiveOnlyPremium: {
    es: 'Los premios exclusivos están disponibles solo para usuarios Premium',
    en: 'Exclusive rewards are available only for Premium users',
    fr: 'Les récompenses exclusives sont disponibles uniquement pour les utilisateurs Premium',
    de: 'Exklusive Belohnungen sind nur für Premium-Benutzer verfügbar',
    it: 'I premi esclusivi sono disponibili solo per gli utenti Premium',
  },
  seePlans: {
    es: 'Ver Planes',
    en: 'View Plans',
    fr: 'Voir les Plans',
    de: 'Pläne ansehen',
    it: 'Vedi Piani',
  },
  seePremiumPlans: {
    es: 'Ver Planes Premium',
    en: 'View Premium Plans',
    fr: 'Voir les Plans Premium',
    de: 'Premium-Pläne ansehen',
    it: 'Vedi Piani Premium',
  },
  claimed: {
    es: 'Reclamado',
    en: 'Claimed',
    fr: 'Réclamé',
    de: 'Eingelöst',
    it: 'Reclamato',
  },
  available: {
    es: '¡Disponible!',
    en: 'Available!',
    fr: 'Disponible !',
    de: 'Verfügbar!',
    it: 'Disponibile!',
  },
  youReachedReward: {
    es: '¡Has alcanzado este premio!',
    en: 'You reached this reward!',
    fr: 'Vous avez atteint cette récompense !',
    de: 'Du hast diese Belohnung erreicht!',
    it: 'Hai raggiunto questo premio!',
  },
  needMorePoints: {
    es: 'Necesitas {points} puntos más',
    en: 'You need {points} more points',
    fr: 'Vous avez besoin de {points} points de plus',
    de: 'Du brauchst noch {points} Punkte',
    it: 'Ti servono altri {points} punti',
  },
  claimRewards: {
    es: 'Reclamar Premios',
    en: 'Claim Rewards',
    fr: 'Réclamer les Récompenses',
    de: 'Belohnungen einlösen',
    it: 'Reclama Premi',
  },
  claimRewardsCount: {
    es: 'Reclamar Premios ({count})',
    en: 'Claim Rewards ({count})',
    fr: 'Réclamer les Récompenses ({count})',
    de: 'Belohnungen einlösen ({count})',
    it: 'Reclama Premi ({count})',
  },
  claimReward: {
    es: 'Reclamar {count} Premio{plural}',
    en: 'Claim {count} Reward{plural}',
    fr: 'Réclamer {count} Récompense{plural}',
    de: '{count} Belohnung{plural} einlösen',
    it: 'Reclama {count} Premi{plural}',
  },
  availableCount: {
    es: '{count} disponible{plural}',
    en: '{count} available',
    fr: '{count} disponible{plural}',
    de: '{count} verfügbar',
    it: '{count} disponibile{plural}',
  },

  // Claim Reward Modal
  claimYourReward: {
    es: '¡Reclama tu Premio!',
    en: 'Claim Your Reward!',
    fr: 'Réclamez Votre Récompense !',
    de: 'Hol dir deine Belohnung!',
    it: 'Reclama il Tuo Premio!',
  },
  uploadPhoto: {
    es: 'Sube una foto',
    en: 'Upload a photo',
    fr: 'Télécharger une photo',
    de: 'Foto hochladen',
    it: 'Carica una foto',
  },
  uploadPhotoDescription: {
    es: 'Sube una imagen para recibir tu premio personalizado',
    en: 'Upload an image to receive your personalized reward',
    fr: 'Téléchargez une image pour recevoir votre récompense personnalisée',
    de: 'Lade ein Bild hoch, um deine personalisierte Belohnung zu erhalten',
    it: 'Carica un\'immagine per ricevere il tuo premio personalizzato',
  },
  selectImage: {
    es: 'Seleccionar Imagen',
    en: 'Select Image',
    fr: 'Sélectionner une Image',
    de: 'Bild auswählen',
    it: 'Seleziona Immagine',
  },
  changeImage: {
    es: 'Cambiar Imagen',
    en: 'Change Image',
    fr: 'Changer l\'Image',
    de: 'Bild ändern',
    it: 'Cambia Immagine',
  },
  uploading: {
    es: 'Subiendo...',
    en: 'Uploading...',
    fr: 'Téléchargement...',
    de: 'Hochladen...',
    it: 'Caricamento...',
  },
  addMessage: {
    es: 'Agregar mensaje (opcional)',
    en: 'Add message (optional)',
    fr: 'Ajouter un message (facultatif)',
    de: 'Nachricht hinzufügen (optional)',
    it: 'Aggiungi messaggio (opzionale)',
  },
  yourMessageHere: {
    es: 'Tu mensaje aquí...',
    en: 'Your message here...',
    fr: 'Votre message ici...',
    de: 'Deine Nachricht hier...',
    it: 'Il tuo messaggio qui...',
  },
  cancel: {
    es: 'Cancelar',
    en: 'Cancel',
    fr: 'Annuler',
    de: 'Abbrechen',
    it: 'Annulla',
  },
  claiming: {
    es: 'Reclamando...',
    en: 'Claiming...',
    fr: 'Réclamation...',
    de: 'Einlösen...',
    it: 'Reclamando...',
  },
  confirmClaim: {
    es: 'Confirmar Reclamación',
    en: 'Confirm Claim',
    fr: 'Confirmer la Réclamation',
    de: 'Einlösung bestätigen',
    it: 'Conferma Reclamo',
  },
  rewardClaimedSuccess: {
    es: '¡Premio reclamado con éxito!',
    en: 'Reward claimed successfully!',
    fr: 'Récompense réclamée avec succès !',
    de: 'Belohnung erfolgreich eingelöst!',
    it: 'Premio reclamato con successo!',
  },
  errorClaimingReward: {
    es: 'Error al reclamar el premio',
    en: 'Error claiming reward',
    fr: 'Erreur lors de la réclamation de la récompense',
    de: 'Fehler beim Einlösen der Belohnung',
    it: 'Errore durante il reclamo del premio',
  },
  errorUploadingPhoto: {
    es: 'Error al subir la foto',
    en: 'Error uploading photo',
    fr: 'Erreur lors du téléchargement de la photo',
    de: 'Fehler beim Hochladen des Fotos',
    it: 'Errore durante il caricamento della foto',
  },
  pleaseSelectPhoto: {
    es: 'Por favor selecciona una foto primero',
    en: 'Please select a photo first',
    fr: 'Veuillez d\'abord sélectionner une photo',
    de: 'Bitte wähle zuerst ein Foto aus',
    it: 'Seleziona prima una foto',
  },
  invalidImageFile: {
    es: 'Por favor selecciona una imagen válida',
    en: 'Please select a valid image',
    fr: 'Veuillez sélectionner une image valide',
    de: 'Bitte wähle ein gültiges Bild aus',
    it: 'Seleziona un\'immagine valida',
  },
  imageTooLarge: {
    es: 'La imagen es muy grande. Máximo 10MB',
    en: 'Image is too large. Maximum 10MB',
    fr: 'L\'image est trop grande. Maximum 10 Mo',
    de: 'Das Bild ist zu groß. Maximal 10 MB',
    it: 'L\'immagine è troppo grande. Massimo 10MB',
  },

  // Warning messages
  pointsResetWarning: {
    es: '⚠️ Importante: Al reclamar este premio, tus puntos se reiniciarán a 0',
    en: '⚠️ Important: Claiming this reward will reset your points to 0',
    fr: '⚠️ Important : Réclamer cette récompense réinitialisera vos points à 0',
    de: '⚠️ Wichtig: Das Einlösen dieser Belohnung setzt deine Punkte auf 0 zurück',
    it: '⚠️ Importante: Reclamando questo premio, i tuoi punti torneranno a 0',
  },
  continueAccumulating: {
    es: '¿Quieres continuar acumulando puntos para un premio mayor?',
    en: 'Do you want to continue accumulating points for a bigger reward?',
    fr: 'Voulez-vous continuer à accumuler des points pour une plus grande récompense ?',
    de: 'Möchtest du weiter Punkte für eine größere Belohnung sammeln?',
    it: 'Vuoi continuare ad accumulare punti per un premio maggiore?',
  },
  yesClaimNow: {
    es: 'Sí, reclamar ahora',
    en: 'Yes, claim now',
    fr: 'Oui, réclamer maintenant',
    de: 'Ja, jetzt einlösen',
    it: 'Sì, reclama ora',
  },
  noKeepAccumulating: {
    es: 'No, seguir acumulando',
    en: 'No, keep accumulating',
    fr: 'Non, continuer à accumuler',
    de: 'Nein, weiter sammeln',
    it: 'No, continua ad accumulare',
  },
  currentPoints: {
    es: 'Tienes actualmente {points} puntos',
    en: 'You currently have {points} points',
    fr: 'Vous avez actuellement {points} points',
    de: 'Du hast derzeit {points} Punkte',
    it: 'Hai attualmente {points} punti',
  },

  // Common
  pts: {
    es: 'pts',

    en: 'or',
    fr: 'ou',
    de: 'oder',
    it: 'o',
  },

  alreadyHaveAccount: {
    es: '¿Ya tienes una cuenta?',
    en: 'Already have an account?',
    fr: 'Vous avez déjà un compte?',
    de: 'Sie haben bereits ein Konto?',
    it: 'Hai già un account?',
  },

  signInExisting: {
    es: 'Iniciar sesión',
    en: 'Sign in',
    fr: 'Se connecter',
    de: 'Anmelden',
    it: 'Accedi',
  },

  existingUserMessage: {
    es: 'Si ya compraste un plan premium, simplemente inicia sesión para acceder a tu cuenta.',
    en: 'If you already purchased a premium plan, simply sign in to access your account.',
    fr: 'Si vous avez déjà acheté un plan premium, connectez-vous simplement pour accéder à votre compte.',
    de: 'Wenn Sie bereits einen Premium-Plan gekauft haben, melden Sie sich einfach an, um auf Ihr Konto zuzugreifen.',
    it: 'Se hai già acquistato un piano premium, accedi semplicemente per accedere al tuo account.',
  },

  // Payment Success Modal
  paymentSuccessTitle: {
    es: '¡Pago realizado con éxito!',
    en: 'Payment successful!',
    fr: 'Paiement réussi !',
    de: 'Zahlung erfolgreich!',
    it: 'Pagamento riuscito!',
  },

  paymentSuccessMessage: {
    es: 'Tu suscripción premium ha sido activada. Ahora puedes iniciar sesión y disfrutar de todas las funciones premium de la aplicación.',
    en: 'Your premium subscription has been activated. You can now sign in and enjoy all the premium features of the app.',
    fr: 'Votre abonnement premium a été activé. Vous pouvez maintenant vous connecter et profiter de toutes les fonctionnalités premium de l\'application.',
    de: 'Ihr Premium-Abonnement wurde aktiviert. Sie können sich jetzt anmelden und alle Premium-Funktionen der App genießen.',
    it: 'Il tuo abbonamento premium è stato attivato. Ora puoi accedere e goderti tutte le funzionalità premium dell\'app.',
  },

  paymentErrorTitle: {
    es: 'Error al procesar el pago',
    en: 'Payment processing error',
    fr: 'Erreur de traitement du paiement',
    de: 'Fehler bei der Zahlungsabwicklung',
    it: 'Errore nell\'elaborazione del pagamento',
  },

  paymentErrorMessage: {
    es: 'Hubo un problema al verificar tu pago. Por favor, contacta con soporte si el problema persiste.',
    en: 'There was a problem verifying your payment. Please contact support if the problem persists.',
    fr: 'Un problème est survenu lors de la vérification de votre paiement. Veuillez contacter le support si le problème persiste.',
    de: 'Bei der Überprüfung Ihrer Zahlung ist ein Problem aufgetreten. Bitte wenden Sie sich an den Support, wenn das Problem weiterhin besteht.',
    it: 'Si è verificato un problema nella verifica del pagamento. Contatta il supporto se il problema persiste.',
  },

  paymentCanceledTitle: {
    es: 'Pago cancelado',
    en: 'Payment canceled',
    fr: 'Paiement annulé',
    de: 'Zahlung abgebrochen',
    it: 'Pagamento annullato',
  },

  paymentCanceledMessage: {
    es: 'Has cancelado el proceso de pago. Puedes intentarlo de nuevo cuando quieras seleccionando un plan.',
    en: 'You have canceled the payment process. You can try again anytime by selecting a plan.',
    fr: 'Vous avez annulé le processus de paiement. Vous pouvez réessayer à tout moment en sélectionnant un plan.',
    de: 'Sie haben den Zahlungsvorgang abgebrochen. Sie können es jederzeit erneut versuchen, indem Sie einen Plan auswählen.',
    it: 'Hai annullato il processo di pagamento. Puoi riprovare in qualsiasi momento selezionando un piano.',
  },

  closeButton: {
    es: 'Cerrar',
    en: 'Close',
    fr: 'Fermer',
    de: 'Schließen',
    it: 'Chiudi',
  },
};

// Helper function to get translation
export const translate = (key: keyof typeof translations, lang: Language): string => {
  const translation = translations[key];
  if (typeof translation === 'object' && translation !== null && lang in translation) {
    return (translation as any)[lang];
  }
  // Fallback to Spanish if language not found
  if (typeof translation === 'object' && translation !== null && 'es' in translation) {
    return (translation as any)['es'];
  }
  return String(key);
};

// Helper function for nested translations (like difficulty and categories)
export const translateNested = (
  category: keyof typeof translations,
  key: string,
  lang: Language
): string => {
  const categoryTranslations = translations[category] as any;

  // Normalize key to uppercase for categories
  const normalizedKey = key.toUpperCase();

  if (categoryTranslations && categoryTranslations[normalizedKey] && categoryTranslations[normalizedKey][lang]) {
    return categoryTranslations[normalizedKey][lang];
  }

  // Try lowercase for difficulty
  const lowerKey = key.toLowerCase();
  if (categoryTranslations && categoryTranslations[lowerKey] && categoryTranslations[lowerKey][lang]) {
    return categoryTranslations[lowerKey][lang];
  }

  // Fallback to Spanish
  if (categoryTranslations && categoryTranslations[normalizedKey] && categoryTranslations[normalizedKey]['es']) {
    return categoryTranslations[normalizedKey]['es'];
  }

  if (categoryTranslations && categoryTranslations[lowerKey] && categoryTranslations[lowerKey]['es']) {
    return categoryTranslations[lowerKey]['es'];
  }

  return key;
};
