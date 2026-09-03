import type { Dict } from "./ar";

export const fr: Dict = {
  app: {
    tagline: "Le jeu du doute et de la ruse",
    menuDesc: "Discutez, trompez, déduisez et votez — qui survivra à la mafia ?",
    version: "Version 2.0 — entre amis ou contre l'IA · 6–16 joueurs",
  },

  menu: {
    continue: "▶️ Reprendre la partie sauvegardée",
    newGame: "🎮 Nouvelle partie",
    friends: "👥 Jouer entre amis",
    ai: "🤖 Jouer contre l'IA",
    more: "Plus",
    howTo: "📖 Comment jouer",
    settings: "⚙️ Paramètres",
  },

  common: {
    back: "→ Retour",
    backShort: "Retour",
    toMenu: "Retour au menu",
    menu: "✕ Menu",
    save: "💾 Enregistrer",
    saved: "Partie enregistrée ✓",
    cancel: "Annuler",
    exitSave: "Enregistrer et quitter",
    exitTitle: "Quitter vers le menu ?",
    exitDesc:
      "La partie sera enregistrée automatiquement ; vous pourrez la reprendre depuis le menu principal.",
    cantVoteSelf: "Vous ne pouvez pas voter contre vous-même",
    secretBadge: "🤫 Rôle secret — ne le montrez à aucun autre joueur",
    passTo: "Passez le téléphone à {name}",
    statusDead: "Éliminé",
    statusAlive: "Vivant",
    dayPhase: "Jour",
    nightPhase: "Nuit",
    everyone: "tout le monde",
    listSep: ", ",
    nightX: "Nuit {n}",
    dayNightX: "Jour — nuit {n}",
  },

  setup: {
    title: "Configuration de la partie",
    subtitle: "Réglez le nombre de joueurs, les rôles et les règles, puis lancez.",
    playerCount: "Nombre de joueurs",
    mafiaCount: "Nombre de mafieux",
    mafiaAuto: "Auto (recommandé)",
    mafiaInGame: "mafieux dans la partie",
    mafiaHint:
      "Rôles distribués : {mafia} mafieux et {others} autres joueurs — le maximum autorisé est {max} pour garder l'équilibre.",
    mafiaReset: "↩ Revenir au nombre automatique recommandé ({n})",
    playMode: "Mode de jeu",
    friendsTitle: "Jouer entre amis",
    friendsDesc: "Partagez un seul téléphone en le passant en secret.",
    aiTitle: "Jouer contre l'IA",
    aiDesc: "Vous êtes le seul joueur humain ; les autres sont des personnages IA aux personnalités variées.",
    hybridTitle: "Amis + IA",
    hybridDesc: "Jouez avec vos amis contre des personnages intelligents.",
    hybridSoon: "Le mode Amis + IA arrive bientôt dans la prochaine version 🤝",
    difficulty: "Niveau de difficulté",
    rolesTitle: "Rôles dans la partie",
    fixed: "Fixe",
    discussionTitle: "Durée des débats",
    minShort: "{n} min",
    advanced: "Options avancées",
    revealRoleLabel: "Révéler le rôle après élimination",
    revealRoleHint: "Quand un joueur est éliminé, son rôle est montré à tous.",
    doctorSelfLabel: "Le médecin peut se protéger",
    doctorSelfHint: "Le médecin peut choisir de se protéger lui-même.",
    abstainLabel: "Voter pour ne rien éliminer",
    abstainHint: "Un joueur peut voter pour que personne ne sorte.",
    tieRevoteLabel: "Re-vote en cas d'égalité",
    tieRevoteHint: "En cas d'égalité, un second vote oppose les candidats.",
    continueAi: "Continuer — vous contre l'IA 🤖",
    continueNames: "Continuer vers les noms des joueurs",
  },

  difficulty: {
    easy: { label: "Facile", hint: "Fait plus d'erreurs, analyse simple" },
    medium: { label: "Moyen", hint: "Analyse les votes et les débats, commet quelques erreurs" },
    hard: { label: "Difficile", hint: "Analyse les comportements et détecte les contradictions" },
  },

  names: {
    titleAi: "Qui êtes-vous ?",
    titleFriends: "Noms des joueurs",
    subtitleAi:
      "Vous êtes le seul vrai joueur — {n} personnages IA vous accompagneront. Entrez votre nom :",
    subtitleFriends: "Entrez un nom pour chaque joueur — {n} joueurs sur le même téléphone.",
    yourName: "Votre nom",
    you: "Vous",
    aiChars: "Personnages IA ({n})",
    players: "Joueurs",
    playerPlaceholder: "Joueur {n}",
    startAi: "Lancer la partie 🤖",
    startFriends: "Lancer la distribution des rôles 🎴",
    randomName: "🎲 Nom aléatoire",
    randomNames: "🎲 Noms aléatoires",
    randomYou: "Un nom aléatoire a été généré pour vous",
    randomDone: "Des noms aléatoires ont été générés",
  },

  roleIntro: {
    title: "Distribution des rôles",
    aiText:
      "Le téléphone ne montrera que votre rôle secret — les autres personnages connaissent le leur en secret et vous ne le verrez jamais.",
    friendsText:
      "Le téléphone montrera à chaque joueur son rôle secret, un par un. Passez le téléphone sans révéler votre rôle.",
    tipAi:
      "💡 Votre rôle reste secret toute la partie. Utilisez vos informations avec intelligence.",
    tipFriends:
      "💡 Chaque joueur appuie sur « Révéler mon rôle », le voit seul, puis « Masquer » et passe le téléphone.",
    begin: "Commencer la distribution 🎴",
  },

  roleReveal: {
    presenting: "Révélation — votre rôle",
    presentingXofY: "Révélation — {x} sur {y}",
    yourRoleIs: "Votre rôle est...",
    coverHint: "Votre carte est cachée — personne ne peut la voir avant que vous la révéliez.",
    passNote:
      "Appuyez sur « Révéler le rôle » pour voir votre carte seul, puis passez le téléphone.",
    youAre:
      "Vous : {name} — les rôles des autres personnages restent secrets, vous ne les verrez jamais.",
    reveal: "Révéler le rôle 🎭",
    yourRole: "Votre rôle est",
    lockNote: "🔒 Le rôle ne peut pas être changé après la révélation",
    mafiaTeammates: "Vos coéquipiers mafieux :",
    mafiaAlone: "Aucun — vous êtes le seul mafieux restant",
    detectiveHint: "Quand votre tour viendra, choisissez un joueur à inspecter ; vous seul connaîtrez le résultat.",
    doctorHint: "Quand votre tour viendra, choisissez un joueur à protéger de la mafia.",
    jesterHint: "Votre grand secret : semez le doute autour de vous jusqu'à vous faire voter — alors vous gagnez seul !",
    continueNight: "Continuer 🌙",
    continueHandoff: "Continuer et passer le téléphone",
    hideAgain: "Re-masquer la carte",
    nextPlayer: "Joueur suivant : {name}",
    nightStarts: "La nuit commencera après.",
  },

  night: {
    introTitle: "Fermez les yeux",
    introText:
      "La nuit tombe. Les rôles spéciaux se réveillent un par un pour agir — passez le téléphone en secret, sans espionner.",
    whoMoves: "Qui agira cette nuit",
    startNight: "Commencer la nuit 🌙",
    nightNumber: "Nuit n° {n}",
    mafiaHeading: "Ouvrez les yeux, mafia",
    mafiaHelp: "Mettez-vous d'accord sur un seul joueur à éliminer cette nuit.",
    mafiaHandoff: "La mafia",
    mafiaNote:
      "Passez le téléphone entre les mafieux et choisissez une seule cible. Ne choisissez jamais un mafieux.",
    mafiaCta: "Choisir la cible 🔪",
    mafiaTeammatesLine: "Vous êtes la mafia : {names}",
    doctorHeading: "Ouvrez les yeux, docteur",
    doctorHelpSelf: "Vous pouvez aussi vous protéger vous-même.",
    doctorHelpNoSelf: "Vous ne pouvez pas vous protéger cette fois.",
    doctorHandoff: "Le docteur",
    doctorNote: "Choisissez le joueur à protéger de la mafia.",
    doctorCta: "Protéger ce joueur ❤️",
    detectiveHeading: "Ouvrez les yeux, inspecteur",
    detectiveHelp: "Vous saurez s'il est mafieux ou non ; gardez le résultat secret.",
    detectiveHandoff: "L'inspecteur",
    detectiveNote: "Choisissez un joueur à inspecter — vous seul connaîtrez le résultat.",
    detectiveCta: "Inspecter ce joueur 🕵️",
    resultTitle: "Résultat de l'enquête",
    checked: "Vous avez inspecté : {name}",
    isMafia: "Ce joueur est mafieux",
    notMafia: "Ce joueur n'est pas mafieux",
    dontShare: "Ne partagez pas le résultat — utilisez-le intelligemment pendant les débats.",
    hideResult: "Masquer le résultat",
    empty: "Aucun candidat disponible.",
    titleWithRole: "Nuit {n} — {role}",
  },

  day: {
    title: "La nuit est finie",
    woke: "Tout le monde se réveille... que s'est-il passé cette nuit ?",
    eliminatedX: "{name} a été éliminé",
    andWasRole: "Son rôle : {emoji} {role}",
    staysBut: "{name} reste avec vous mais ne vote plus et n'utilise plus son pouvoir. 👻",
    noElim: "Personne n'est sorti cette nuit",
    doctorSaved: "Soit le médecin a sauvé la cible, soit la mafia n'a pas agi. Discutez prudemment.",
    playersAlive: "Joueurs ({n} vivants)",
    outOfGame: "👻 Éliminés : {names}",
    logTitle: "📜 Journal des événements",
    logTap: "Appuyer pour afficher",
    logEmpty: "Aucun événement pour l'instant.",
    startDiscussion: "Commencer le débat 🗣️",
  },

  log: {
    nightKill: "{name} a été éliminé pendant la nuit.",
    noNightKill: "Personne n'a été éliminé cette nuit.",
    dayEliminate: "{name} a été éliminé par le vote",
    dayEliminateReveal: "{name} a été éliminé par le vote. Son rôle : {role}.",
    tie: "Égalité lors du vote.",
    noDayEliminate: "Personne n'a été éliminé par le vote.",
  },

  discussion: {
    title: "Débat 🗣️",
    aiTitle: "Débat 🗣️ — Intelligence artificielle",
    heading: "Phase de débat",
    sub: "Discutez des événements et essayez de démasquer la mafia avant de voter.",
    aiSub:
      "Regardez les personnages débattre autour de vous, {name} — observez leurs accusations et défenses, puis votez.",
    aiSubSpectator: "Regardez le débat pendant que la partie continue automatiquement.",
    timeLeft: "Temps restant",
    endedTransition: "Temps de débat écoulé — passage au vote...",
    alivePlayers: "{n} joueurs vivants",
    minutes: "{n} minutes",
    pause: "⏸ Pause",
    resume: "▶️ Reprendre",
    endNow: "Terminer le débat maintenant",
    timeRemainingLabel: "Restant",
    pausedBadge: "— en pause ⏸",
    speaking: "parle...",
    chatDone:
      "Le débat est terminé — le vote commencera automatiquement à la fin du minuteur, ou appuyez sur « Terminer le débat maintenant ».",
    skip: "⏩ Passer",
  },

  vote: {
    title: "Vote — {x} sur {y}",
    yourVote: "Vote — votre voix",
    voterXofY: "Vote {revote} — votant {x} sur {y}",
    revoteRound: "— second tour",
    handoffNote: "Votez secrètement contre le joueur suspect. Personne ne verra votre choix.",
    startVoting: "Commencer le vote 🗳️",
    chooseTarget: "Choisissez qui éliminer",
    selfHint: "C'est votre vote — vous ne pouvez pas voter contre vous-même.",
    voterSelfHint: "{name} — vous ne pouvez pas voter contre vous-même.",
    empty: "Aucun candidat à ce tour.",
    abstain: "Je ne veux éliminer personne",
    confirm: "Confirmer le vote",
  },

  voteResults: {
    title: "Résultat du vote 🗳️",
    tally: "Résultat des voix",
    nobodyAbstain: "Personne (abstention)",
    tieTitle: "Égalité !",
    resultTitle: "Résultat du vote",
    tieSub: "Deux joueurs ou plus ont obtenu le même nombre de voix. L'hôte choisit :",
    eliminatedByVote: "{name} a été éliminé par le vote",
    wasRole: "Son rôle : {emoji} {role}",
    isOut: "{name} est désormais éliminé 👻",
    allAbstain: "Tout le monde a voté pour ne rien éliminer",
    noVotesTitle: "Aucun vote n'a été enregistré",
    revote: "🔁 Re-voter",
    noEliminate: "N'éliminer personne",
    nextNight: "Continuer vers la prochaine nuit 🌙",
  },

  win: {
    ended: "Partie terminée",
    jesterWon: "Le bouffon gagne !",
    mafiaWon: "La mafia gagne !",
    citizensWon: "Les citoyens gagnent !",
    jesterDesc:
      "Le bouffon a été voté et éliminé — mais il a atteint son objectif et gagne seul la partie !",
    mafiaDesc:
      "La mafia a totalement pris le contrôle — il ne reste qu'un seul joueur non mafieux.",
    citizensDesc: "Les citoyens ont démasqué la mafia et l'ont éliminée entièrement.",
    lasted: "La partie a duré {nights}",
    survived: "{n} ont survécu",
    finalResults: "Résultats finaux",
    playerCol: "Joueur",
    roleColAi: "Personnalité / Rôle",
    roleCol: "Rôle",
    resultCol: "Résultat",
    you: "Vous",
    out: "Éliminé 👻",
    aliveShort: "Vivant ✓",
    replaySame: "🔄 Nouvelle partie avec les mêmes joueurs",
    replayRandom: "🎲 Nouvelle partie, rôles aléatoires",
    toMenu: "🏠 Retour au menu principal",
  },

  spectate: {
    title: "Vous êtes éliminé",
    text:
      "{name}, vous ne pouvez plus voter ni utiliser votre pouvoir, mais la partie continue : suivez-la en spectateur jusqu'au bout.",
    note: "👁️ Vous suivrez automatiquement les nuits, débats et votes des joueurs restants.",
    continue: "Continuer à regarder 👁️",
  },

  settings: {
    title: "Paramètres",
    subtitle: "Les paramètres sont enregistrés automatiquement.",
    soundTitle: "Son",
    soundLabel: "Son",
    soundHint: "Effets sonores de la nuit, du jour, du vote et de la victoire.",
    musicLabel: "Musique",
    musicHint: "Musique d'ambiance pendant la partie.",
    gameTitle: "Partie",
    defaultDiscussion: "Durée de débat par défaut",
    showInstructionsLabel: "Afficher les instructions",
    showInstructionsHint: "Afficher l'explication des phases au début.",
    rulesTitle: "Règles (nouvelles parties)",
    detectiveRole: "Rôle d'inspecteur",
    detectiveRoleHint: "Inclure l'inspecteur dans la distribution des rôles.",
    doctorRole: "Rôle de docteur",
    doctorRoleHint: "Inclure le docteur dans la distribution des rôles.",
    interfaceTitle: "Interface",
    language: "Langue",
    darkMode: "Mode sombre",
    darkValue: "Toujours activé",
  },

  howTo: {
    title: "Comment jouer",
    subtitle:
      "Un jeu social de débat, de ruse et de déduction. Tout le monde partage un seul téléphone, passé en secret à chaque phase.",
    phasesTitle: "Phases de la partie",
    rolesTitle: "Rôles",
    rulesTitle: "Règles importantes",
    phases: [
      {
        title: "Nuit",
        text: "Fermez les yeux. Les rôles spéciaux se réveillent un par un : la mafia choisit sa cible, le médecin protège un joueur, l'inspecteur en examine un. Passez le téléphone en secret.",
      },
      {
        title: "Jour",
        text: "Tout le monde se réveille pour découvrir qui est sorti cette nuit (s'il y en a un). Seul le résultat est annoncé — les rôles ne sont révélés que si vous activez la règle.",
      },
      {
        title: "Débat",
        text: "La phase la plus importante ! Discutez des comportements, accusez, défendez-vous et trompez. La mafia essaie de diriger les soupçons vers les innocents.",
      },
      {
        title: "Vote",
        text: "Chaque joueur vote secrètement contre celui qu'il suspecte. Le joueur avec le plus de voix est éliminé.",
      },
      {
        title: "Victoire",
        text: "Les citoyens gagnent en éliminant toute la mafia. La mafia ne gagne que lorsqu'elle prend totalement le contrôle et qu'il ne reste qu'un seul joueur non mafieux. Tuer un seul joueur pendant la nuit ne termine pas la partie — elle continue tour après tour jusqu'à la vraie victoire. Et si le bouffon est éliminé par le vote, il gagne seul ! 🎭",
      },
    ],
    rules: [
      "Il est interdit de voter contre soi-même.",
      "Un joueur éliminé ne vote plus et n'utilise plus son pouvoir ; il ne fait que regarder. 👻",
      "Ne révélez jamais votre rôle — ni en paroles, ni par vos actes.",
      "Seul l'inspecteur connaît ses résultats ; seuls les mafieux connaissent leurs coéquipiers.",
      "Le bouffon ne gagne que s'il est éliminé par le vote du jour — ne révélez pas son rôle ou il atteindra son objectif.",
      "Passez le téléphone honnêtement et n'espionnez pas les rôles des autres.",
    ],
  },

  roles: {
    mafia: {
      name: "Mafia",
      short: "Éliminez les citoyens la nuit sans être démasqué",
      brief: "Vous agissez avec les autres mafieux pour éliminer les citoyens pendant la nuit.",
      description:
        "Chaque nuit, vous choisissez ensemble un seul joueur à éliminer. Personne ne doit connaître votre identité : continuez à tuer jusqu'à ce qu'il ne reste qu'un seul joueur non mafieux.",
    },
    citizen: {
      name: "Citoyen",
      short: "Découvrez la mafia et votez contre elle",
      brief: "Vous n'avez pas de pouvoir nocturne. Essayez de démasquer la mafia par le débat et le vote.",
      description:
        "Pas de pouvoir spécial, mais votre voix compte. Observez les comportements, débattez, déduisez qui est mafieux puis votez pour l'éliminer.",
    },
    detective: {
      name: "Inspecteur",
      short: "Examinez un joueur chaque nuit pour connaître la vérité",
      brief: "Vous pouvez enquêter sur un joueur pendant la nuit pour savoir s'il est mafieux.",
      description:
        "Chaque nuit, choisissez un joueur à inspecter ; le téléphone vous dira seul s'il est mafieux. Utilisez l'information intelligemment sans vous dévoiler trop vite.",
    },
    doctor: {
      name: "Docteur",
      short: "Protégez un joueur chaque nuit",
      brief: "Vous pouvez protéger un joueur pendant la nuit.",
      description:
        "Chaque nuit, choisissez un joueur à protéger de la mafia. S'il était la cible, personne ne sortira de la partie cette nuit-là.",
    },
    jester: {
      name: "Bouffon",
      short: "Faites-vous voter contre vous",
      brief: "Votre objectif : être éliminé par le vote du jour.",
      description:
        "Votre rôle est étrange : vous voulez qu'on vote contre vous le jour ! Sème le doute autour de toi avec intelligence sans que personne ne découvre ton intention. Si tu es éliminé par le vote, tu gagnes seul la partie.",
    },
  },

  personas: {
    names: {
      smart: "Adam",
      confident: "Samir",
      skeptic: "Youssef",
      quiet: "Layla",
      funny: "Karim",
      deceiver: "Mona",
      aggressive: "Omar",
      analyst: "Sarah",
    },
    traits: {
      smart: "Intelligent",
      confident: "Confiant",
      skeptic: "Sceptique",
      quiet: "Discret",
      funny: "Drôle",
      deceiver: "Trompeur",
      aggressive: "Agressif",
      analyst: "Analyste",
    },
    phrases: {
      smart: {
        accuse: [
          "J'ai remarqué que {target} change toujours de sujet quand on parle de la mafia — c'est très suspect.",
          "En analysant simplement les événements, {target} est le seul à avoir profité de tout ce qui s'est passé.",
          "Les actes de {target} ne correspondent pas à ses paroles — je crois qu'une mafia est parmi nous.",
        ],
        defend: [
          "Je comprends vos doutes, mais toutes mes décisions étaient logiques, et {accuser} cherche dans la mauvaise direction.",
          "Revoyez mes votes depuis le début : je suis toujours cohérent, rien à cacher dans mon comportement.",
        ],
        counter: [
          "L'accusation de {accuser} n'est pas réfléchie — souvenons-nous plutôt de qui a commencé à accuser tôt.",
          "Celui qui accuse vite et sans preuve cache souvent quelque chose, {accuser}.",
        ],
        analyze: [
          "Au dernier vote, {voter} a voté contre {target} puis a soudainement changé d'avis — ce schéma mérite qu'on le suive.",
          "Rappelons-nous bien des voix : qui a voté avec la majorité et qui contre ? Les preuves sont dans les chiffres.",
        ],
        reactNight: [
          "La mort de {victim} n'est pas un hasard — la mafia élimine ceux qui représentent un vrai danger pour elle.",
          "Tuer {victim} signifie qu'ils étaient très proches de démasquer la mafia. Voyons qui en profite.",
        ],
        reactNoKill: [
          "Personne n'est sorti cette nuit — soit le docteur était très concentré, soit la mafia prépare quelque chose.",
        ],
        close: [
          "Je pense que nous avons assez d'informations — il est temps de voter pour révéler la vérité.",
          "Votons maintenant : les voix révéleront plus que les mots.",
        ],
        bait: [
          "Bizarre ! Tout le monde parle de la mafia et personne ne parle de moi... peut-être parce que je cache bien les choses ?",
          "Je pourrais être la mafia... ou peut-être la seule chose logique dans cette pièce.",
        ],
      },
      confident: {
        accuse: [
          "Je le dis avec toute ma confiance : {target} est suspect, aucun doute là-dessus.",
          "J'ai un fort pressentiment sur {target}, et mon intuition me trompe rarement.",
          "J'ai bien observé tout le monde, et {target} se comporte comme quelqu'un qui cache quelque chose, point final.",
        ],
        defend: [
          "Celui qui m'accuse perd son temps — si j'étais mafieux, je serais le dernier à parler aussi franchement.",
          "Je sais que je suis innocent, et {accuser} le sait aussi, mais il veut détourner votre attention.",
        ],
        counter: [
          "Voici la vérité : {accuser} essaie d'éliminer les innocents un par un.",
          "Le vrai suspect est celui qui accuse sans hésiter — c'est exactement {accuser}.",
        ],
        analyze: [
          "Le vote de {voter} contre {target} au tour précédent n'était pas naturel — je suis sûr que quelqu'un tire les ficelles.",
          "C'est simple : suivez celui qui profite de chaque élimination, et vous trouverez la mafia.",
        ],
        reactNight: [
          "Comme prévu — {victim} est sorti cette nuit. La mafia joue fort, mais nous les démasquerons.",
          "La mort de {victim} confirme que la mafia a peur et élimine les plus intelligents en premier.",
        ],
        reactNoKill: [
          "Personne n'est sorti ? Alors le docteur est pro, ou la mafia hésite — dans les deux cas, nous avons l'avantage.",
        ],
        close: [
          "Arrêtez de parler pour rien — votons maintenant avec confiance.",
          "Il est temps de trancher. Votez.",
        ],
        bait: [
          "Je peux convaincre n'importe lequel d'entre vous de n'importe quoi... Question : me faites-vous confiance ?",
          "Si j'étais vous, je voterais contre moi, parce que j'ai l'air trop confiant... c'est suspect, non ?",
        ],
      },
      skeptic: {
        accuse: [
          "Je ne peux pas croire {target} après tout ce que j'ai vu — tout en lui inspire le doute.",
          "Je me méfie de {target}, et quand je me méfie de quelqu'un, j'ai généralement raison.",
          "Il y a trop de contradictions dans les propos de {target}, et j'observe chaque mot.",
        ],
        defend: [
          "Je me méfie de tout le monde, mais le doute de {accuser} sur moi n'est pas justifié — mes preuves sont plus claires que ses accusations.",
          "{accuser} semble vouloir détourner les soupçons vers un innocent... exactement comme le fait la mafia.",
        ],
        counter: [
          "Il est étrange que {accuser} m'accuse alors qu'il n'explique pas son propre comportement.",
          "Regardons qui ment : {accuser} n'est pas convaincant du tout aujourd'hui.",
        ],
        analyze: [
          "{voter} a voté contre {target} alors que personne ne les soupçonnait — pourquoi ? Cela demande une explication.",
          "Les changements de vote entre les tours sont inquiétants. Qui change d'avis rapidement mérite d'être surveillé.",
        ],
        reactNight: [
          "{victim} est sorti cette nuit... et je n'étais pas totalement convaincu de son innocence. La mafia est peut-être plus proche qu'on ne le croit.",
          "Tuer {victim} retire un joueur entier de l'équation — qui cela a-t-il servi ?",
        ],
        reactNoKill: [
          "Personne n'est sorti... attendez, cela signifie que quelqu'un était protégé. Qui est le docteur ? Ne vous révélez pas.",
        ],
        close: [
          "J'ai assez de doutes — il est temps de voter avant d'oublier ce que nous avons vu.",
          "Votons maintenant. Les doutes ne suffisent pas, les voix sont le juge.",
        ],
        bait: [
          "Et si je vous disais que je ne suis même pas sûr de mon rôle ?... Juste une idée pour réfléchir.",
          "Tout le monde me trouve mystérieux... peut-être parce que je cache vraiment quelque chose. Ou pas. Avez-vous changé d'avis ?",
        ],
      },
      quiet: {
        accuse: [
          "Je ne parle pas beaucoup, mais {target} a attiré mon attention. Je l'observe depuis le début.",
          "Puisqu'il faut dire quelque chose : {target} se comporte différemment des autres.",
        ],
        defend: [
          "Je suis silencieuse parce que j'écoute plus que je ne parle, et {accuser} confond calme et culpabilité.",
          "Je me défends en un mot : regardez qui parle trop, ce n'est pas moi.",
        ],
        counter: [
          "Celui qui crie beaucoup cache souvent quelque chose. {accuser} crie beaucoup.",
          "Le calme n'est pas une preuve. Concentrons-nous sur les actes, pas sur les voix.",
        ],
        analyze: [
          "J'ai remarqué que {voter} et {target} échangent des regards... enfin, des votes étranges.",
          "Les voix parlent de nous plus que nous ne parlons de nous-mêmes.",
        ],
        reactNight: [
          "{victim} est sorti... je l'observais aussi. Malheureusement, il est trop tard.",
          "Plus personne n'est en sécurité. {victim} ne s'y attendait pas.",
        ],
        reactNoKill: ["Rien cette nuit... bien. Nous avons tous passé la nuit en sécurité."],
        close: ["Je vais voter. Le temps dira si j'avais raison.", "Votons en silence."],
        bait: [
          "Hmm... rien à dire. Ou peut-être que j'ai beaucoup à dire et que je préfère le silence.",
          "Je vous observe tous. Je regarde, c'est tout.",
        ],
      },
      funny: {
        accuse: [
          "Je vous le dis en blague : {target} cache quelque chose dans sa poche... ou dans son rôle !",
          "J'ai ri avec {target} tout ce temps mais il n'a pas ri une seule fois — même la mafia a peur des bonnes blagues.",
          "Si la mafia joue aussi bien que {target}, on les démasquera avant le dîner !",
        ],
        defend: [
          "Moi ? Mafieux ? Si j'étais mafieux, toutes mes blagues parleraient de trahison !",
          "L'accusation de {accuser} est drôle... et c'est le pire, parce que cela veut dire qu'il est sérieux.",
        ],
        counter: [
          "La seule blague dans cette pièce, c'est que {accuser} m'accuse pendant que je ris de ses doutes.",
          "Je propose de voter contre ceux qui ne rient pas à mes blagues — et on commence par {accuser}.",
        ],
        analyze: [
          "Regardez le vote de {voter} contre {target}... même au cinéma, ils n'écriraient pas un tel retournement !",
          "J'analyse les votes comme j'analyse les blagues : le timing est tout.",
        ],
        reactNight: [
          "Oh non, {victim} est sorti ! Qui va apprécier mes blagues maintenant ?",
          "On a bien ri avec {victim}... et maintenant la mafia est très sérieuse. Nous devons l'être aussi.",
        ],
        reactNoKill: [
          "Personne n'est sorti ! Le docteur mérite une salve d'applaudissements... ou peut-être que la mafia prépare une surprise amusante.",
        ],
        close: [
          "Bon, bon, c'est l'heure d'être sérieux — votons et voyons qui gagne l'Oscar du rôle mafieux !",
          "Je suis prêt à voter. Et celui qui veut rire le dernier, qu'il vote intelligemment.",
        ],
        bait: [
          "Et si j'étais la mafia cette fois ? Ne vous inquiétez pas, même si c'était le cas, j'échouerais de façon amusante !",
          "Imaginez si je pouvais voter contre moi-même... ce serait la meilleure blague de la partie !",
        ],
      },
      deceiver: {
        accuse: [
          "Croyez-moi, je reconnais la mafia quand je la vois : c'est {target}, j'en suis très sûre.",
          "J'ai une source fiable qui dit que {target} n'est pas ce qu'il paraît. Faites-moi confiance.",
          "Observez {target} de près — les sourires les plus innocents cachent les rôles les plus dangereux.",
        ],
        defend: [
          "Je sais à quoi ressemble un innocent... et {accuser} paraît bien plus coupable que moi.",
          "Si j'étais la mafia, je n'aurais jamais laissé quelqu'un le découvrir. {accuser} joue un rôle évident.",
        ],
        counter: [
          "Croyons-nous un instant : {accuser} était suspect dès la première nuit.",
          "Regardez bien celui qui m'accuse — est-ce que cela vous rappelle quelque chose ?",
        ],
        analyze: [
          "Le vote de {voter} contre {target} était le plus intelligent du tour... et je sais pourquoi.",
          "Celui qui vote toujours avec la majorité cache quelque chose — cherchons-les dans les voix.",
        ],
        reactNight: [
          "Malheureusement, {victim} est sorti... mais ne vous avais-je pas dit que j'avais un pressentiment sur ce joueur ?",
          "La mort de {victim} est douloureuse, mais elle nous a révélé quelque chose d'important sur les joueurs.",
        ],
        reactNoKill: [
          "Personne n'est sorti ? Comme c'est intrigant... cela signifie que quelqu'un en sait plus qu'il n'y paraît.",
        ],
        close: [
          "Je sais qui doit sortir. Votons et vous me remercierez plus tard.",
          "Fiez-vous à mon intuition cette fois — votons intelligemment.",
        ],
        bait: [
          "Je suis une excellente actrice... mais la question est : suis-je en train de jouer maintenant ?",
          "Si j'étais vous, je me méfierais de moi. C'est ce que je ferais à votre place.",
        ],
      },
      aggressive: {
        accuse: [
          "Assez de détours : {target} est la mafia, et je suis prêt à parier là-dessus !",
          "Je le dis franchement : {target} est coupable, et celui qui le défend est son complice !",
          "Ne me faites pas perdre de temps — {target} est la seule bonne option aujourd'hui.",
        ],
        defend: [
          "Celui qui m'accuse est un idiot ou un mafieux, et {accuser} n'est pas un idiot !",
          "Je me défends avec force parce que je suis innocent, et je défie mon accusateur de prouver le contraire !",
        ],
        counter: [
          "Si vous m'accusez, je révélerai votre vérité : {accuser} est le vrai mafieux !",
          "La meilleure défense, c'est l'attaque : {accuser} est plus suspect que quiconque ici !",
        ],
        analyze: [
          "Le vote de {voter} contre {target} était une grosse erreur ! Et ceux qui ont voté ainsi sont accusés !",
          "Je n'oublie pas les votes : ceux qui ont voté contre nous rendront des comptes !",
        ],
        reactNight: [
          "{victim} est sorti ! Je suis en colère, et ma colère me rend plus précis ! Nous nous vengerons aujourd'hui !",
          "La mafia ose tout maintenant ! {victim} n'était pas seul, et nous les ferons sortir !",
        ],
        reactNoKill: [
          "Personne n'est sorti ? Bien — mais cela ne m'arrêtera pas. Je trouverai la mafia aujourd'hui, quoi qu'il en coûte !",
        ],
        close: ["Assez parlé ! Votons maintenant sans hésiter !", "Je suis prêt à voter, et j'espère que vous êtes prêts pour la vérité !"],
        bait: [
          "J'accuse tout le monde ! Même moi ! Cela prouve que je ne suis pas mafieux... n'est-ce pas ?",
          "Je jure que je ne suis pas la mafia... et vous me croyez parce que je crie !",
        ],
      },
      analyst: {
        accuse: [
          "D'après mon analyse des votes et des déclarations, {target} a la plus grande contradiction de comportement.",
          "Les statistiques sont simples : {target} a voté d'une façon contraire à son intérêt s'il était citoyen.",
          "Toutes les preuves désignent {target} — les votes, les déclarations, et même les silences.",
        ],
        defend: [
          "J'ai revu toutes les données des tours : mon comportement est cohérent à 100 % — l'accusation de {accuser} est sans fondement.",
          "Les chiffres ne mentent pas : mon accusateur n'a fourni aucune preuve concrète.",
        ],
        counter: [
          "Analytiquement, c'est {accuser} qui présente le schéma mafieux le plus clair.",
          "Comparons les paroles de {accuser} à ses actes — l'écart est énorme.",
        ],
        analyze: [
          "Au tour précédent, le vote de {voter} contre {target} a changé tout le cours du scrutin — ce n'est pas un hasard.",
          "J'ai remarqué un schéma : ceux qui ont voté ensemble lors des deux derniers tours sont ceux qui parlent ensemble maintenant.",
        ],
        reactNight: [
          "La mort de {victim} réduit les voix de {count} % des joueurs — la mafia calcule bien.",
          "Tuer {victim} montre que la mafia a visé le joueur le plus influent d'un point de vue analytique.",
        ],
        reactNoKill: [
          "Personne n'est sorti — forte probabilité d'intervention du docteur, ou la mafia a choisi d'attendre.",
        ],
        close: ["Les données suffisent pour décider — votons maintenant.", "Il est temps de voter. Les chiffres trancheront."],
        bait: [
          "Selon mes calculs, la probabilité que je sois mafieux est de 50 %... n'est-ce pas statistiquement suspect ?",
          "Les données disent que le suspect le plus évident est... celui qui lit les données !",
        ],
      },
    },
  },

  namePools: {
    pool: [
      "Lucas",
      "Hugo",
      "Léo",
      "Nathan",
      "Gabriel",
      "Louis",
      "Jules",
      "Adam",
      "Arthur",
      "Paul",
      "Emma",
      "Louise",
      "Camille",
      "Chloé",
      "Manon",
      "Jade",
      "Sarah",
      "Léa",
      "Zoé",
      "Alice",
      "Nina",
      "Maya",
      "Inès",
      "Lina",
      "Sacha",
      "Théo",
      "Enzo",
      "Eva",
      "Romy",
      "Nour",
    ],
    fallback: "Joueur {n}",
  },
};