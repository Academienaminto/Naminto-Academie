// PROMPT MASTER INTERNATIONALISATION §7, §22-24 : ce catalogue ne couvre
// que le CHROME D'INTERFACE (navigation, boutons, formulaires) — jamais le
// contenu métier (titres de cours/formations, noms de niveaux, grades,
// termes initiatiques, texte des questions de quiz), qui reste dans sa
// langue d'origine quelle que soit la langue de l'interface (§18-21 : ne
// jamais traduire ces termes).
//
// §72 RÈGLE DE NON-INVENTION : seules les chaînes ci-dessous, à faible
// risque (chrome d'interface générique), ont été traduites. Le contenu
// éditorial (FAQ, confidentialité, règlement intérieur) n'existe pas
// encore en anglais dans l'architecture — ne pas l'inventer ici.
//
// Portée volontairement limitée à l'espace public + membre : l'espace
// Seuil (app/(seuil)) reste en français uniquement, c'est un outil
// d'administration interne, pas une surface visiteur/apprenant.
export interface Dictionary {
  nav: {
    cursus: string;
    formations: string;
    bibliotheque: string;
    blog: string;
    connexion: string;
    rejoindre: string;
    monEspace: string;
    ouvrirMenu: string;
    rendezVous: string;
    leSeuil: string;
    deconnexion: string;
    parametres: string;
    contact: string;
    messages: string;
  };
  messagesPage: {
    title: string;
    empty: string;
    back: string;
    replyPlaceholder: string;
    send: string;
    sending: string;
    close: string;
    reopen: string;
    seuilOnline: string;
    seuilOffline: string;
  };
  home: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaDiscover: string;
    ctaCreateAccount: string;
    ctaEnterUniverse: string;
  };
  universPage: {
    title: string;
    intro: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    philosophyTitle: string;
    philosophyText: string;
    corpsCelesteTitle: string;
    corpsCelesteText: string;
  };
  footer: {
    tagline: string;
    whatsapp: string;
    whatsappMessage: string;
    email: string;
  };
  auth: {
    loginTitle: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    noAccount: string;
    createAccount: string;
    restoreAccount: string;
    restoringAccount: string;
    restoreAccountSuccess: string;
    resendVerification: string;
    resendingVerification: string;
    resendVerificationSuccess: string;
    forgotPassword: string;
  };
  forgotPasswordPage: {
    title: string;
    intro: string;
    submit: string;
    submitting: string;
    checkEmailMessage: string;
    backToLogin: string;
  };
  resetPasswordPage: {
    title: string;
    newPassword: string;
    confirmPassword: string;
    submit: string;
    submitting: string;
    success: string;
    invalid: string;
    mismatch: string;
    backToLogin: string;
  };
  register: {
    title: string;
    firstName: string;
    lastName: string;
    submit: string;
    submitting: string;
    haveAccount: string;
    login: string;
    checkEmailTitle: string;
    checkEmailMessage: string;
  };
  verifyEmailPage: {
    title: string;
    verifying: string;
    success: string;
    invalid: string;
    backToLogin: string;
  };
  language: {
    label: string;
    fr: string;
    en: string;
  };
  courseState: {
    locked: string;
    purchaseRequired: string;
    accessible: string;
    closedForDelay: string;
  };
  contactPage: {
    title: string;
    intro: string;
  };
  documentsPage: {
    faqTitle: string;
    confidentialiteTitle: string;
    statutTitle: string;
    reglementInterieurTitle: string;
    reglesPedagogiquesTitle: string;
    reglesDelaisTitle: string;
    reglesSeancesTitle: string;
    empty: string;
    lastUpdated: string;
    accept: string;
    accepting: string;
    accepted: string;
  };
  cursusPage: {
    title: string;
    empty: string;
    level: string;
    coursesUnit: string;
    enroll: string;
    enrolling: string;
  };
  formationsPage: {
    empty: string;
    free: string;
    partsUnit: string;
    coursesUnit: string;
  };
  formationDetail: {
    free: string;
    comingSoon: string;
    enroll: string;
    enrolling: string;
  };
  bibliothequePage: {
    empty: string;
    free: string;
    download: string;
    downloading: string;
    buyToDownload: string;
  };
  blogPage: {
    empty: string;
  };
  blogPost: {
    back: string;
    comments: string;
    commentPlaceholder: string;
    commentSubmit: string;
    commentSubmitting: string;
  };
  membrePage: {
    space: string;
    greeting: string;
    notifications: string;
    emptyEnrollments: string;
    discover: string;
    level: string;
    sessionsUnit: string;
    sessionsUnitPart: string;
    buy: string;
    buyFormation: string;
    whatsapp: string;
    emailUs: string;
    whatsappCursusQuestion: string;
    whatsappFormationQuestion: string;
    emailSubjectPrefix: string;
    unread: string;
    markAsRead: string;
  };
  courseDetail: {
    back: string;
    locked: string;
    buy: string;
    buyAgain: string;
    closedForDelay: string;
    sessions: string;
    sessionsAvailable: string;
    bookAppointment: string;
    quiz: string;
    noQuiz: string;
    material: string;
    download: string;
    downloading: string;
    noMaterial: string;
  };
  appointments: {
    title: string;
    back: string;
    proposeTitle: string;
    proposeSubmit: string;
    proposeSubmitting: string;
    empty: string;
    statusPropose: string;
    statusConfirme: string;
    statusAnnule: string;
    statusTermine: string;
  };
  settings: {
    title: string;
    back: string;
    notificationsHeading: string;
    notificationsEnabled: string;
    soundEnabled: string;
    save: string;
    saving: string;
    saved: string;
    dangerZone: string;
    deleteAccountIntro: string;
    deleteAccountButton: string;
    deleteAccountConfirm: string;
    deleteAccountConfirmButton: string;
    deleting: string;
    deleteAccountCancel: string;
  };
  quiz: {
    validated: string;
    awaitingReview: string;
    pendingEvidence: string;
    passedPrefix: string;
    failedPrefix: string;
    attemptCounter: string;
    maxAttemptsReached: string;
    start: string;
    starting: string;
    uploading: string;
    uploaded: string;
    submit: string;
    submitting: string;
  };
}

export const dictionaries: Record<"fr" | "en", Dictionary> = {
  fr: {
    nav: {
      cursus: "Cursus",
      formations: "Formations",
      bibliotheque: "Bibliothèque",
      blog: "Blog",
      connexion: "Connexion",
      rejoindre: "Rejoindre",
      monEspace: "Mon espace",
      ouvrirMenu: "Ouvrir le menu",
      rendezVous: "Rendez-vous",
      leSeuil: "Le Seuil",
      deconnexion: "Se déconnecter",
      parametres: "Paramètres",
      contact: "Contact",
      messages: "Messages",
    },
    messagesPage: {
      title: "Messages",
      empty: "Aucune conversation pour le moment.",
      back: "← Espace membre",
      replyPlaceholder: "Répondre…",
      send: "Envoyer",
      sending: "…",
      close: "Fermer la conversation",
      reopen: "Rouvrir",
      seuilOnline: "Le Seuil est en ligne",
      seuilOffline: "Le Seuil est hors ligne",
    },
    home: {
      titleLine1: "Un cursus initiatique,",
      titleLine2: "pas à pas.",
      subtitle:
        "Neuf niveaux. Six cours par niveau. Un parcours pensé pour la progression réelle, pas pour la vitesse.",
      ctaDiscover: "Découvrir le cursus",
      ctaCreateAccount: "Créer un compte",
      ctaEnterUniverse: "Entrer dans l'univers de Naminto Académie",
    },
    universPage: {
      title: "L'école du Corps Céleste",
      intro:
        "Naminto Académie est une école initiatique africaine née de longues années de recherche et d'expériences dans diverses traditions spirituelles du continent. Elle se veut le point de contact entre nos savoirs ancestraux et l'éveil véritable, en offrant un chemin clair et structuré vers la création du Corps Céleste.\n\nContrairement aux discours spirituels vagues où chacun projette sa propre définition de l'éveil, Naminto Académie fixe un but initiatique précis : conduire l'initié à manifester son corps de lumière, véhicule ultime de l'âme.",
      missionTitle: "Notre mission",
      missionText:
        "Être le porteur du savoir ancestral africain et le rendre accessible à tous ceux qui cherchent une orientation sérieuse.\n\nOffrir un cursus initiatique structuré composé de 9 niveaux, chacun comprenant 6 cours, garantissant une progression graduelle et cohérente.\n\nTransmettre des sciences spirituelles universelles sanctionnées par des formations pratiques : divination, sorcellerie, rituels, symbolisme, sciences des plantes et bien d'autres disciplines.\n\nFormer des initiés capables de créer leurs propres artefacts spirituels pour concilier les forces qui les entourent avec leur but intérieur.",
      visionTitle: "Notre vision",
      visionText:
        "Naminto Académie n'est pas seulement une école : c'est une voie initiatique qui transforme l'être en profondeur. Chaque étape du cursus est conçue pour éveiller la conscience, nourrir l'âme et élever la fréquence vibratoire, jusqu'à la réalisation du Corps Céleste.",
      philosophyTitle: "Notre philosophie",
      philosophyText:
        "Notre site a une raison d'être clairement identifiable : transmettre, documenter et rendre accessible des connaissances relatives aux spiritualités africaines, en les présentant avec sérieux, profondeur et respect de leur diversité. Il ne s'agit pas simplement de proposer des contenus spirituels, mais de constituer un espace de connaissance permettant d'explorer les traditions, les symboles, les pratiques, les conceptions du monde, et les rapports à la nature, aux ancêtres, au vivant, au sacré et à la communauté.\n\nNous nous adressons aux personnes africaines souhaitant redécouvrir leur patrimoine spirituel, à la diaspora souhaitant renouer avec ces connaissances, à celles et ceux qui souhaitent les étudier avec une approche structurée, ainsi qu'aux chercheurs, étudiants et passionnés d'histoire, de culture et de spiritualité. Le niveau de connaissance du visiteur n'est jamais un obstacle : le débutant comme la personne déjà expérimentée doivent pouvoir trouver leur place.\n\nNous présentons les spiritualités africaines comme des ensembles de systèmes de pensée, de pratiques et de rapports au monde — et non comme une réalité unique et uniforme. Les traditions diffèrent selon les peuples, les régions, les langues et les histoires. Nous distinguons toujours les faits historiques et ethnographiques, les traditions transmises, les interprétations contemporaines, les croyances, les pratiques rituelles et les reconstructions modernes : cette distinction est essentielle à notre crédibilité.\n\nNaminto Académie n'est pas une plateforme qui prétend détenir « la vérité » sur toutes les spiritualités africaines, ni un espace qui mélange indistinctement toutes les traditions, ni un lieu de sensationnalisme ou de mystification. Nous ne présentons jamais une pratique contemporaine comme une tradition ancienne sans preuve, et nous ne réduisons aucune tradition africaine à de la « magie » ou de l'« occultisme » décontextualisés.\n\nNous sommes un espace de transmission, d'étude et de valorisation des connaissances spirituelles africaines, fondé sur la diversité des traditions, leur contexte culturel et historique, et une approche sérieuse de leur compréhension.",
      corpsCelesteTitle: "Le Corps Céleste",
      corpsCelesteText:
        "Dans les sociétés initiatiques africaines, l'humain est perçu comme un être en devenir, porteur d'un esprit embryonnaire qui doit être façonné par des pratiques rituelles et des disciplines opératives. Le Corps Céleste est la forme accomplie de cet esprit, une structure intérieure qui permet à l'initié de dépasser les conditionnements et de devenir maître de son être.\n\nChez les Dogons, l'âme est considérée comme une graine cosmique : les rituels visent à l'activer pour qu'elle devienne un corps autonome capable de dialoguer avec les forces célestes. Chez les Akans, le kra (souffle vital) doit être renforcé par des rites de purification et de régulation des « moi » intérieurs — le Corps Céleste est l'état où le kra devient indestructible. Chez les Yorubas, l'ori inu (tête intérieure) est le siège de la destinée : la construction du Corps Céleste correspond à l'alignement parfait entre l'ori inu et l'ori ode (tête extérieure), donnant à l'initié une autonomie totale. Dans l'Égypte ancienne, l'akh est la partie transfigurée de l'âme, obtenue par des rites précis — le Corps Céleste est l'akh stabilisé, capable de traverser les plans sans se dissoudre.\n\nLe Corps Céleste est bien plus qu'un état spirituel : il est la condition de la liberté humaine. Il permet à l'âme d'éviter la disparition et de conserver sa continuité après la mort. Il donne à l'initié la capacité de concilier les forces qui l'entourent, en harmonisant ses différents « moi ». Il constitue une autonomie spirituelle : l'initié n'est plus soumis aux lois imposées par le mensonge universel, mais devient régulateur de son propre destin. Il est enfin la preuve de la divinisation : l'homme qui a forgé son Corps Céleste devient un être capable de se tenir au même rang que les puissances.\n\nSa construction repose sur des pratiques précises : des rituels de régulation (chants, invocations, rythmes qui structurent l'énergie intérieure), la divination (lecture des forces environnantes pour ajuster le chemin de l'initié), la sorcellerie opérative (maîtrise des forces invisibles pour renforcer l'esprit embryonnaire), le symbolisme initiatique (masques, figures et artefacts comme supports de transformation), et les sciences des plantes (ethnobotanique sacrée qui nourrit et active les centres vitaux).\n\nLe Corps Céleste, dans les traditions africaines, est la forme achevée de l'humain initié. Il n'est pas une abstraction, mais une construction réelle, obtenue par discipline et par les rituels. Sa création est la seule voie vers la maîtrise de l'être, la liberté spirituelle et la divinisation de l'homme.",
    },
    footer: {
      tagline: "Naminto Académie — un cursus initiatique, pas à pas.",
      whatsapp: "Nous contacter sur WhatsApp",
      whatsappMessage: "Bonjour, je souhaite en savoir plus sur Naminto Académie.",
      email: "Nous écrire",
    },
    auth: {
      loginTitle: "Connexion",
      email: "Email",
      password: "Mot de passe",
      submit: "Se connecter",
      submitting: "Connexion…",
      noAccount: "Pas encore de compte ?",
      createAccount: "Créer un compte",
      restoreAccount: "Restaurer mon compte",
      restoringAccount: "Restauration…",
      restoreAccountSuccess: "Compte restauré. Vous pouvez maintenant vous connecter.",
      resendVerification: "Renvoyer l'email de confirmation",
      resendingVerification: "Envoi…",
      resendVerificationSuccess: "Email de confirmation renvoyé. Vérifiez votre boîte mail.",
      forgotPassword: "Mot de passe oublié ?",
    },
    forgotPasswordPage: {
      title: "Mot de passe oublié",
      intro: "Indiquez votre adresse email : si un compte lui est associé, vous recevrez un lien pour réinitialiser votre mot de passe.",
      submit: "Envoyer le lien",
      submitting: "Envoi…",
      checkEmailMessage: "Si un compte existe avec cette adresse, un email vient d'être envoyé avec un lien de réinitialisation.",
      backToLogin: "Retour à la connexion",
    },
    resetPasswordPage: {
      title: "Nouveau mot de passe",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      submit: "Réinitialiser le mot de passe",
      submitting: "Enregistrement…",
      success: "Mot de passe mis à jour. Vous êtes maintenant connecté.",
      invalid: "Ce lien de réinitialisation est invalide ou a expiré.",
      mismatch: "Les mots de passe ne correspondent pas.",
      backToLogin: "Retour à la connexion",
    },
    register: {
      title: "Créer un compte",
      firstName: "Prénom",
      lastName: "Nom",
      submit: "Créer mon compte",
      submitting: "Création…",
      haveAccount: "Déjà un compte ?",
      login: "Se connecter",
      checkEmailTitle: "Vérifiez votre boîte mail",
      checkEmailMessage:
        "Un email de confirmation vient de vous être envoyé. Cliquez sur le lien qu'il contient pour activer votre compte.",
    },
    verifyEmailPage: {
      title: "Confirmation de l'email",
      verifying: "Vérification en cours…",
      success: "Email confirmé, vous êtes maintenant connecté.",
      invalid: "Ce lien de vérification est invalide ou a expiré.",
      backToLogin: "Retour à la connexion",
    },
    language: {
      label: "Langue",
      fr: "Français",
      en: "English",
    },
    courseState: {
      locked: "Verrouillé",
      purchaseRequired: "À acheter",
      accessible: "Accessible",
      closedForDelay: "Fermé (délai dépassé)",
    },
    contactPage: {
      title: "Nous contacter",
      intro:
        "Une question sur le cursus, une formation, ou autre chose ? Écrivez-nous.",
    },
    documentsPage: {
      faqTitle: "Questions fréquentes",
      confidentialiteTitle: "Politique de confidentialité",
      statutTitle: "Statut",
      reglementInterieurTitle: "Règlement intérieur",
      reglesPedagogiquesTitle: "Règles pédagogiques",
      reglesDelaisTitle: "Règles des délais",
      reglesSeancesTitle: "Règles des séances",
      empty: "Ce document n'est pas encore disponible.",
      lastUpdated: "Dernière mise à jour",
      accept: "J'ai lu et j'accepte",
      accepting: "Enregistrement…",
      accepted: "Accepté.",
    },
    cursusPage: {
      title: "Le cursus initiatique",
      empty: "Aucun cursus n'est publié pour le moment.",
      level: "Niveau",
      coursesUnit: "cours",
      enroll: "S'inscrire au cursus",
      enrolling: "Inscription…",
    },
    formationsPage: {
      empty: "Aucune formation n'est publiée pour le moment.",
      free: "Gratuite",
      partsUnit: "partie(s)",
      coursesUnit: "cours",
    },
    formationDetail: {
      free: "Gratuite",
      comingSoon: "Le contenu de cette formation est en cours de préparation.",
      enroll: "S'inscrire à la formation",
      enrolling: "Inscription…",
    },
    bibliothequePage: {
      empty: "Aucun livre n'est publié pour le moment.",
      free: "Gratuit",
      download: "Télécharger",
      downloading: "…",
      buyToDownload: "Acheter pour télécharger",
    },
    blogPage: {
      empty: "Aucun article publié pour le moment.",
    },
    blogPost: {
      back: "← Retour au blog",
      comments: "Commentaires",
      commentPlaceholder: "Ajouter un commentaire…",
      commentSubmit: "Commenter",
      commentSubmitting: "…",
    },
    membrePage: {
      space: "Espace membre",
      greeting: "Bonjour",
      notifications: "Notifications",
      emptyEnrollments: "Vous n'êtes inscrit à aucun cursus pour le moment.",
      discover: "Découvrir le cursus",
      level: "Niveau",
      sessionsUnit: "séances",
      sessionsUnitPart: "séances (partie)",
      buy: "Acheter",
      buyFormation: "Acheter la formation",
      whatsapp: "WhatsApp",
      emailUs: "E-mail",
      whatsappCursusQuestion: "Bonjour, j'ai une question à propos du cursus",
      whatsappFormationQuestion: "Bonjour, j'ai une question à propos de la formation",
      emailSubjectPrefix: "Question",
      unread: "non lues",
      markAsRead: "Marquer comme lu",
    },
    courseDetail: {
      back: "← Espace membre",
      locked: "Ce cours n'est pas encore accessible — validez le cours précédent pour le débloquer.",
      buy: "Acheter ce cours",
      buyAgain: "Acheter à nouveau",
      closedForDelay: "Ce cours a été fermé pour dépassement de délai.",
      sessions: "Séances",
      sessionsAvailable: "disponibles",
      bookAppointment: "prendre rendez-vous",
      quiz: "Quiz",
      noQuiz: "Aucun quiz pour ce cours.",
      material: "Matériel du cours",
      download: "Télécharger",
      downloading: "Préparation…",
      noMaterial: "Aucun fichier disponible pour ce cours pour le moment.",
    },
    appointments: {
      title: "Mes rendez-vous",
      back: "← Espace membre",
      proposeTitle: "Demander un rendez-vous",
      proposeSubmit: "Proposer",
      proposeSubmitting: "Envoi…",
      empty: "Aucun rendez-vous pour le moment.",
      statusPropose: "En attente",
      statusConfirme: "Confirmé",
      statusAnnule: "Annulé",
      statusTermine: "Terminé",
    },
    settings: {
      title: "Paramètres",
      back: "← Espace membre",
      notificationsHeading: "Notifications",
      notificationsEnabled: "Recevoir des notifications",
      soundEnabled: "Son des notifications",
      save: "Enregistrer",
      saving: "Enregistrement…",
      saved: "Préférences enregistrées.",
      dangerZone: "Zone sensible",
      deleteAccountIntro:
        "Supprimer votre compte le place en attente de suppression pendant 30 jours, durant lesquels vous pouvez encore le restaurer en vous reconnectant. Passé ce délai, la suppression devient définitive.",
      deleteAccountButton: "Supprimer mon compte",
      deleteAccountConfirm: "Confirmez-vous la suppression de votre compte ?",
      deleteAccountConfirmButton: "Oui, supprimer mon compte",
      deleting: "Suppression…",
      deleteAccountCancel: "Annuler",
    },
    quiz: {
      validated: "Quiz validé.",
      awaitingReview: "Preuve soumise, en attente de validation par le Seuil.",
      pendingEvidence:
        "Réponses enregistrées. Une preuve pratique est en attente de validation par le Seuil.",
      passedPrefix: "Quiz réussi",
      failedPrefix: "Quiz non validé",
      attemptCounter: "Tentative",
      maxAttemptsReached: "Nombre de tentatives maximum atteint. Contactez le Seuil.",
      start: "Commencer le quiz",
      starting: "…",
      uploading: "Envoi…",
      uploaded: "envoyé.",
      submit: "Soumettre",
      submitting: "Envoi…",
    },
  },
  en: {
    nav: {
      cursus: "Curriculum",
      formations: "Courses",
      bibliotheque: "Library",
      blog: "Blog",
      connexion: "Log in",
      rejoindre: "Join",
      monEspace: "My space",
      ouvrirMenu: "Open menu",
      rendezVous: "Appointments",
      leSeuil: "Le Seuil",
      deconnexion: "Log out",
      parametres: "Settings",
      contact: "Contact",
      messages: "Messages",
    },
    messagesPage: {
      title: "Messages",
      empty: "No conversation yet.",
      back: "← Member space",
      replyPlaceholder: "Reply…",
      send: "Send",
      sending: "…",
      close: "Close conversation",
      reopen: "Reopen",
      seuilOnline: "Le Seuil is online",
      seuilOffline: "Le Seuil is offline",
    },
    home: {
      titleLine1: "An initiatory path,",
      titleLine2: "step by step.",
      subtitle:
        "Nine levels. Six courses per level. A path designed for real progress, not speed.",
      ctaDiscover: "Discover the curriculum",
      ctaCreateAccount: "Create an account",
      ctaEnterUniverse: "Enter the world of Naminto Académie",
    },
    universPage: {
      title: "The School of the Celestial Body",
      intro:
        "Naminto Académie is an African initiatory school born of many years of research and experience across the continent's diverse spiritual traditions. It aims to be the point of contact between our ancestral knowledge and true awakening, offering a clear and structured path toward the creation of the Celestial Body.\n\nUnlike vague spiritual discourses in which everyone projects their own definition of awakening, Naminto Académie sets a precise initiatory goal: to lead the initiate to manifest their body of light, the soul's ultimate vehicle.",
      missionTitle: "Our mission",
      missionText:
        "To carry African ancestral knowledge and make it accessible to all who seek serious guidance.\n\nTo offer a structured initiatory curriculum made up of 9 levels, each comprising 6 courses, ensuring gradual and coherent progression.\n\nTo transmit universal spiritual sciences validated through practical training: divination, sorcery, ritual, symbolism, plant science, and many other disciplines.\n\nTo train initiates capable of creating their own spiritual artifacts to reconcile the forces around them with their inner purpose.",
      visionTitle: "Our vision",
      visionText:
        "Naminto Académie is not merely a school: it is an initiatory path that transforms the being in depth. Every stage of the curriculum is designed to awaken consciousness, nourish the soul, and raise the vibrational frequency, up to the realization of the Celestial Body.",
      philosophyTitle: "Our philosophy",
      philosophyText:
        "Our site has a clearly identifiable purpose: to transmit, document, and make accessible knowledge relating to African spiritualities, presenting it with seriousness, depth, and respect for its diversity. This is not simply about offering spiritual content, but about building a space of knowledge for exploring traditions, symbols, practices, worldviews, and humanity's relationship to nature, to the ancestors, to the living, to the sacred, and to community.\n\nWe speak to African people wishing to rediscover their spiritual heritage, to the diaspora wishing to reconnect with this knowledge, to those who wish to study it through a structured approach, and to researchers, students, and enthusiasts of history, culture, and spirituality. A visitor's level of knowledge is never an obstacle: beginners and experienced practitioners alike must be able to find their place.\n\nWe present African spiritualities as sets of systems of thought, practices, and relationships to the world — never as a single, uniform reality. Traditions differ by people, region, language, and history. We always distinguish between historical and ethnographic facts, transmitted traditions, contemporary interpretations, beliefs, ritual practices, and modern reconstructions: this distinction is essential to our credibility.\n\nNaminto Académie is not a platform that claims to hold \"the truth\" about all African spiritualities, nor a space that indiscriminately blends every tradition, nor a place of sensationalism or mystification. We never present a contemporary practice as an ancient tradition without evidence, and we never reduce any African tradition to decontextualized \"magic\" or \"occultism\".\n\nWe are a space for transmitting, studying, and honoring African spiritual knowledge, grounded in the diversity of traditions, their cultural and historical context, and a serious approach to understanding them.",
      corpsCelesteTitle: "The Celestial Body",
      corpsCelesteText:
        "In African initiatory societies, the human being is seen as a being in the making, carrying an embryonic spirit that must be shaped through ritual practices and operative disciplines. The Celestial Body is the accomplished form of that spirit — an inner structure that allows the initiate to move beyond conditioning and become master of their own being.\n\nAmong the Dogon, the soul is regarded as a cosmic seed: rituals aim to activate it so that it becomes an autonomous body capable of communing with celestial forces. Among the Akan, the kra (vital breath) must be strengthened through rites of purification and the regulation of the inner \"selves\" — the Celestial Body is the state in which the kra becomes indestructible. Among the Yoruba, the ori inu (inner head) is the seat of destiny: building the Celestial Body corresponds to the perfect alignment between the ori inu and the ori ode (outer head), granting the initiate total autonomy. In ancient Egypt, the akh is the transfigured part of the soul, obtained through precise rites — the Celestial Body is the stabilized akh, able to cross the planes without dissolving.\n\nThe Celestial Body is far more than a spiritual state: it is the condition of human freedom. It allows the soul to avoid disappearance and to preserve its continuity after death. It gives the initiate the ability to reconcile the forces around them, harmonizing their different \"selves\". It constitutes spiritual autonomy: the initiate is no longer subject to the laws imposed by the universal Lie, but becomes the regulator of their own destiny. It is, finally, proof of divinization: the person who has forged their Celestial Body becomes a being capable of standing at the same rank as the powers.\n\nIts construction rests on precise practices: rituals of regulation (chants, invocations, rhythms that structure inner energy), divination (reading the surrounding forces to adjust the initiate's path), operative sorcery (mastery of invisible forces to strengthen the embryonic spirit), initiatory symbolism (masks, figures, and artifacts as vehicles of transformation), and plant science (sacred ethnobotany that nourishes and activates the vital centers).\n\nThe Celestial Body, in African traditions, is the completed form of the initiated human being. It is not an abstraction, but a real construction, achieved through discipline and ritual. Its creation is the only path to mastery of the self, spiritual freedom, and the divinization of humankind.",
    },
    footer: {
      tagline: "Naminto Académie — an initiatory path, step by step.",
      whatsapp: "Contact us on WhatsApp",
      whatsappMessage: "Hello, I would like to learn more about Naminto Académie.",
      email: "Email us",
    },
    auth: {
      loginTitle: "Log in",
      email: "Email",
      password: "Password",
      submit: "Log in",
      submitting: "Logging in…",
      noAccount: "Don't have an account yet?",
      createAccount: "Create an account",
      restoreAccount: "Restore my account",
      restoringAccount: "Restoring…",
      restoreAccountSuccess: "Account restored. You can now log in.",
      resendVerification: "Resend confirmation email",
      resendingVerification: "Sending…",
      resendVerificationSuccess: "Confirmation email resent. Check your inbox.",
      forgotPassword: "Forgot your password?",
    },
    forgotPasswordPage: {
      title: "Forgot password",
      intro: "Enter your email address: if an account is linked to it, you will receive a link to reset your password.",
      submit: "Send the link",
      submitting: "Sending…",
      checkEmailMessage: "If an account exists with that address, an email with a reset link has just been sent.",
      backToLogin: "Back to login",
    },
    resetPasswordPage: {
      title: "New password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      submit: "Reset password",
      submitting: "Saving…",
      success: "Password updated. You are now logged in.",
      invalid: "This reset link is invalid or has expired.",
      mismatch: "Passwords do not match.",
      backToLogin: "Back to login",
    },
    register: {
      title: "Create an account",
      firstName: "First name",
      lastName: "Last name",
      submit: "Create my account",
      submitting: "Creating…",
      haveAccount: "Already have an account?",
      login: "Log in",
      checkEmailTitle: "Check your inbox",
      checkEmailMessage:
        "A confirmation email was just sent to you. Click the link inside it to activate your account.",
    },
    verifyEmailPage: {
      title: "Email confirmation",
      verifying: "Verifying…",
      success: "Email confirmed, you are now logged in.",
      invalid: "This verification link is invalid or has expired.",
      backToLogin: "Back to login",
    },
    language: {
      label: "Language",
      fr: "Français",
      en: "English",
    },
    courseState: {
      locked: "Locked",
      purchaseRequired: "Purchase required",
      accessible: "Accessible",
      closedForDelay: "Closed (deadline exceeded)",
    },
    contactPage: {
      title: "Contact us",
      intro:
        "A question about the curriculum, a course, or something else? Write to us.",
    },
    documentsPage: {
      faqTitle: "Frequently asked questions",
      confidentialiteTitle: "Privacy policy",
      statutTitle: "Status",
      reglementInterieurTitle: "Internal rules",
      reglesPedagogiquesTitle: "Academic rules",
      reglesDelaisTitle: "Deadline rules",
      reglesSeancesTitle: "Session rules",
      empty: "This document is not available yet.",
      lastUpdated: "Last updated",
      accept: "I have read and accept",
      accepting: "Saving…",
      accepted: "Accepted.",
    },
    cursusPage: {
      title: "The initiatory curriculum",
      empty: "No curriculum is published yet.",
      level: "Level",
      coursesUnit: "courses",
      enroll: "Enroll in the curriculum",
      enrolling: "Enrolling…",
    },
    formationsPage: {
      empty: "No course is published yet.",
      free: "Free",
      partsUnit: "part(s)",
      coursesUnit: "courses",
    },
    formationDetail: {
      free: "Free",
      comingSoon: "This course's content is being prepared.",
      enroll: "Enroll in this course",
      enrolling: "Enrolling…",
    },
    bibliothequePage: {
      empty: "No book is published yet.",
      free: "Free",
      download: "Download",
      downloading: "…",
      buyToDownload: "Buy to download",
    },
    blogPage: {
      empty: "No article published yet.",
    },
    blogPost: {
      back: "← Back to blog",
      comments: "Comments",
      commentPlaceholder: "Add a comment…",
      commentSubmit: "Comment",
      commentSubmitting: "…",
    },
    membrePage: {
      space: "Member space",
      greeting: "Hello",
      notifications: "Notifications",
      emptyEnrollments: "You are not enrolled in any curriculum yet.",
      discover: "Discover the curriculum",
      level: "Level",
      sessionsUnit: "sessions",
      sessionsUnitPart: "sessions (part)",
      buy: "Buy",
      buyFormation: "Buy this course",
      whatsapp: "WhatsApp",
      emailUs: "Email",
      whatsappCursusQuestion: "Hello, I have a question about the curriculum",
      whatsappFormationQuestion: "Hello, I have a question about the course",
      emailSubjectPrefix: "Question",
      unread: "unread",
      markAsRead: "Mark as read",
    },
    courseDetail: {
      back: "← Member space",
      locked: "This course is not accessible yet — complete the previous course to unlock it.",
      buy: "Buy this course",
      buyAgain: "Buy again",
      closedForDelay: "This course was closed for exceeding the deadline.",
      sessions: "Sessions",
      sessionsAvailable: "available",
      bookAppointment: "book an appointment",
      quiz: "Quiz",
      noQuiz: "No quiz for this course.",
      material: "Course material",
      download: "Download",
      downloading: "Preparing…",
      noMaterial: "No file available for this course yet.",
    },
    appointments: {
      title: "My appointments",
      back: "← Member space",
      proposeTitle: "Request an appointment",
      proposeSubmit: "Propose",
      proposeSubmitting: "Sending…",
      empty: "No appointments yet.",
      statusPropose: "Pending",
      statusConfirme: "Confirmed",
      statusAnnule: "Cancelled",
      statusTermine: "Completed",
    },
    settings: {
      title: "Settings",
      back: "← Member space",
      notificationsHeading: "Notifications",
      notificationsEnabled: "Receive notifications",
      soundEnabled: "Notification sound",
      save: "Save",
      saving: "Saving…",
      saved: "Preferences saved.",
      dangerZone: "Danger zone",
      deleteAccountIntro:
        "Deleting your account puts it on hold for 30 days, during which you can still restore it by logging back in. After that period, the deletion becomes permanent.",
      deleteAccountButton: "Delete my account",
      deleteAccountConfirm: "Do you confirm deleting your account?",
      deleteAccountConfirmButton: "Yes, delete my account",
      deleting: "Deleting…",
      deleteAccountCancel: "Cancel",
    },
    quiz: {
      validated: "Quiz validated.",
      awaitingReview: "Evidence submitted, awaiting review by Le Seuil.",
      pendingEvidence:
        "Answers saved. A practical evidence submission is awaiting review by Le Seuil.",
      passedPrefix: "Quiz passed",
      failedPrefix: "Quiz not passed",
      attemptCounter: "Attempt",
      maxAttemptsReached: "Maximum number of attempts reached. Contact Le Seuil.",
      start: "Start the quiz",
      starting: "…",
      uploading: "Uploading…",
      uploaded: "uploaded.",
      submit: "Submit",
      submitting: "Sending…",
    },
  },
};

export type Locale = keyof typeof dictionaries;

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

// Messages d'erreur serveur (AppError.messageKey, voir lib/errors.ts et
// lib/api/response.ts). Portée volontairement restreinte aux erreurs
// atteignables depuis une route publique/membre (jamais MANAGE_*/Seuil) —
// même logique de portée que le reste de ce fichier. Un message impliquant
// une valeur dynamique (type de fichier, taille max...) n'a pas de clé :
// il reste en français, choix délibéré plutôt que de fabriquer un système
// d'interpolation pour une poignée de cas limites.
export const errorMessages: Record<Locale, Record<string, string>> = {
  fr: {
    "common.courseNotFound": "Cours introuvable.",
    "common.formationNotFound": "Formation introuvable.",
    "common.cursusNotFound": "Cursus introuvable.",
    "common.formationPartNotFound": "Partie de formation introuvable.",
    "common.downloadLinkFailed":
      "Impossible de générer le lien de téléchargement pour le moment.",
    "common.uploadFailed": "Impossible de stocker le fichier pour le moment.",
    "auth.emailTaken": "Un compte existe déjà avec cet email.",
    "auth.invalidCredentials": "Email ou mot de passe incorrect.",
    "auth.accountBanned": "Ce compte a été banni.",
    "auth.accountBlocked": "Ce compte n'est pas accessible.",
    "auth.accountPendingDeletion":
      "Ce compte est en cours de suppression. Vous pouvez le restaurer.",
    "auth.notPendingDeletion": "Ce compte n'est pas en cours de suppression.",
    "auth.emailNotVerified":
      "Confirmez votre adresse email avant de vous connecter. Vérifiez votre boîte mail.",
    "auth.verificationInvalid": "Ce lien de vérification est invalide ou expiré.",
    "auth.resetInvalid": "Ce lien de réinitialisation est invalide ou expiré.",
    "account.alreadyPendingDeletion": "Ce compte est déjà en cours de suppression.",
    "enrollment.alreadyEnrolled": "Déjà inscrit à ce cursus.",
    "formations.alreadyEnrolled": "Déjà inscrit à cette formation.",
    "books.notFound": "Livre introuvable.",
    "books.noFileAvailable": "Aucun fichier disponible pour ce livre.",
    "books.purchaseRequired": "Ce livre doit être acheté.",
    "courses.noFileAvailable": "Aucun fichier disponible pour ce cours.",
    "files.notFound": "Fichier introuvable.",
    "files.forbidden": "Ce fichier ne vous appartient pas.",
    "sessions.notFound": "Séance introuvable.",
    "sessions.notAvailable": "Cette séance n'est plus disponible.",
    "appointments.notFound": "Rendez-vous introuvable.",
    "appointments.forbidden": "Ce rendez-vous ne vous appartient pas.",
    "appointments.cannotCancel": "Ce rendez-vous ne peut plus être annulé.",
    "messaging.notFound": "Conversation introuvable.",
    "messaging.forbidden": "Cette conversation ne vous appartient pas.",
    "quiz.notFound": "Quiz introuvable.",
    "quiz.alreadyPassed": "Ce quiz a déjà été validé.",
    "quiz.maxAttemptsReached":
      "Nombre de tentatives maximum atteint. Contactez le Seuil.",
    "quiz.attemptNotFound": "Tentative introuvable.",
    "quiz.alreadyCorrected": "Cette tentative est déjà corrigée.",
    "quiz.answerMismatch":
      "Une réponse référence une question qui n'appartient pas à ce quiz.",
    "quiz.evidenceRequired": "Un fichier preuve est requis pour cette question.",
    "quiz.evidenceFileInvalid":
      "Fichier preuve introuvable ou non uploadé par vous.",
    "progress.courseNotEligible": "Ce cours n'est pas encore accessible.",
    "progress.purchaseRequired": "Ce cours doit être acheté.",
    "progress.closedForDelay":
      "Ce cours a été fermé pour dépassement de délai. Une nouvelle acquisition peut être nécessaire.",
    "payments.productNotFound": "Produit introuvable.",
    "payments.alreadyOwned": "Vous avez déjà accès à ce produit.",
    "payments.initiationFailed": "Impossible d'initier le paiement pour le moment.",
    "notifications.notFound": "Notification introuvable.",
    "blog.postNotFound": "Article introuvable.",
    "blog.postNotFoundOrUnpublished": "Article introuvable ou non publié.",
    "documents.canOnlyAcceptPublished": "Seule la version publiée d'un document peut être acceptée.",
  },
  en: {
    "common.courseNotFound": "Course not found.",
    "common.formationNotFound": "Course not found.",
    "common.cursusNotFound": "Curriculum not found.",
    "common.formationPartNotFound": "Course part not found.",
    "common.downloadLinkFailed":
      "Unable to generate the download link at this time.",
    "common.uploadFailed": "Unable to store the file at this time.",
    "auth.emailTaken": "An account already exists with this email.",
    "auth.invalidCredentials": "Incorrect email or password.",
    "auth.accountBanned": "This account has been banned.",
    "auth.accountBlocked": "This account is not accessible.",
    "auth.accountPendingDeletion":
      "This account is pending deletion. You can restore it.",
    "auth.notPendingDeletion": "This account is not pending deletion.",
    "auth.emailNotVerified": "Confirm your email address before logging in. Check your inbox.",
    "auth.verificationInvalid": "This verification link is invalid or has expired.",
    "auth.resetInvalid": "This reset link is invalid or has expired.",
    "account.alreadyPendingDeletion": "This account is already pending deletion.",
    "enrollment.alreadyEnrolled": "Already enrolled in this curriculum.",
    "formations.alreadyEnrolled": "Already enrolled in this course.",
    "books.notFound": "Book not found.",
    "books.noFileAvailable": "No file available for this book.",
    "books.purchaseRequired": "This book must be purchased.",
    "courses.noFileAvailable": "No file available for this course.",
    "files.notFound": "File not found.",
    "files.forbidden": "This file does not belong to you.",
    "sessions.notFound": "Session not found.",
    "sessions.notAvailable": "This session is no longer available.",
    "appointments.notFound": "Appointment not found.",
    "appointments.forbidden": "This appointment does not belong to you.",
    "appointments.cannotCancel": "This appointment can no longer be cancelled.",
    "messaging.notFound": "Conversation not found.",
    "messaging.forbidden": "This conversation does not belong to you.",
    "quiz.notFound": "Quiz not found.",
    "quiz.alreadyPassed": "This quiz has already been passed.",
    "quiz.maxAttemptsReached":
      "Maximum number of attempts reached. Contact Le Seuil.",
    "quiz.attemptNotFound": "Attempt not found.",
    "quiz.alreadyCorrected": "This attempt has already been graded.",
    "quiz.answerMismatch":
      "An answer references a question that does not belong to this quiz.",
    "quiz.evidenceRequired": "An evidence file is required for this question.",
    "quiz.evidenceFileInvalid":
      "Evidence file not found or not uploaded by you.",
    "progress.courseNotEligible": "This course is not accessible yet.",
    "progress.purchaseRequired": "This course must be purchased.",
    "progress.closedForDelay":
      "This course was closed for exceeding the deadline. A new purchase may be required.",
    "payments.productNotFound": "Product not found.",
    "payments.alreadyOwned": "You already have access to this product.",
    "payments.initiationFailed": "Unable to initiate the payment at this time.",
    "notifications.notFound": "Notification not found.",
    "blog.postNotFound": "Article not found.",
    "blog.postNotFoundOrUnpublished": "Article not found or not published.",
    "documents.canOnlyAcceptPublished": "Only the published version of a document can be accepted.",
  },
};
