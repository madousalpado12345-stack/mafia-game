import type { Dict } from "./ar";

export const en: Dict = {
  app: {
    tagline: "The game of suspicion and deceit",
    menuDesc: "Discuss, deceive, deduce and vote — who will survive the mafia?",
    version: "Version 2.0 — with friends or vs AI · 6–16 players",
  },

  menu: {
    continue: "▶️ Continue saved game",
    newGame: "🎮 New game",
    friends: "👥 Play with friends",
    ai: "🤖 Play against AI",
    more: "More",
    howTo: "📖 How to play",
    settings: "⚙️ Settings",
  },

  common: {
    back: "→ Back",
    backShort: "Back",
    toMenu: "Back to menu",
    menu: "✕ Menu",
    save: "💾 Save",
    saved: "Game saved ✓",
    cancel: "Cancel",
    exitSave: "Save and exit",
    exitTitle: "Exit to menu?",
    exitDesc:
      "The game will be saved automatically and you can resume it later from the main menu.",
    cantVoteSelf: "You cannot vote for yourself",
    secretBadge: "🤫 Secret role — don't show it to any other player",
    passTo: "Pass the phone to {name}",
    statusDead: "Out of game",
    statusAlive: "Alive",
    dayPhase: "Day",
    nightPhase: "Night",
    everyone: "everyone",
    listSep: ", ",
    nightX: "Night {n}",
    dayNightX: "Day — night {n}",
  },

  setup: {
    title: "Game setup",
    subtitle: "Set the player count, roles and rules, then start.",
    playerCount: "Player count",
    mafiaCount: "Mafia count",
    mafiaAuto: "Auto (recommended)",
    mafiaInGame: "mafia in game",
    mafiaHint:
      "Roles dealt: {mafia} mafia and {others} other players — the maximum allowed is {max} to keep the game balanced.",
    mafiaReset: "↩ Back to the recommended automatic count ({n})",
    playMode: "Game mode",
    friendsTitle: "Play with friends",
    friendsDesc: "Share one phone and pass it around secretly.",
    aiTitle: "Play against AI",
    aiDesc: "You are the only human; the rest are AI characters with distinct personalities.",
    hybridTitle: "Friends + AI",
    hybridDesc: "Play with your friends against smart characters.",
    hybridSoon: "Friends + AI mode is coming soon in the next version 🤝",
    difficulty: "Difficulty",
    rolesTitle: "Roles in the game",
    fixed: "Always",
    discussionTitle: "Discussion time",
    minShort: "{n}m",
    advanced: "Advanced options",
    revealRoleLabel: "Reveal role after elimination",
    revealRoleHint: "When a player is eliminated, everyone sees their role.",
    doctorSelfLabel: "Doctor can save themself",
    doctorSelfHint: "The doctor may choose themself for protection.",
    abstainLabel: "Vote to eliminate no one",
    abstainHint: "A player may vote for nobody to be eliminated.",
    tieRevoteLabel: "Re-vote on ties",
    tieRevoteHint: "If two players tie, they face each other in a re-vote.",
    continueAi: "Continue — you vs AI 🤖",
    continueNames: "Continue to player names",
  },

  difficulty: {
    easy: { label: "Easy", hint: "Makes more mistakes, simple analysis" },
    medium: { label: "Medium", hint: "Analyzes votes and discussions, makes some mistakes" },
    hard: { label: "Hard", hint: "Analyzes behavior and detects contradictions skillfully" },
  },

  names: {
    titleAi: "Who are you?",
    titleFriends: "Player names",
    subtitleAi:
      "You are the only real player — {n} AI characters will join you. Enter your name:",
    subtitleFriends: "Enter a name for each player — {n} players on one phone.",
    yourName: "Your name",
    you: "You",
    aiChars: "AI characters ({n})",
    players: "Players",
    playerPlaceholder: "Player {n}",
    startAi: "Start the game 🤖",
    startFriends: "Start role dealing 🎴",
    randomName: "🎲 Random name",
    randomNames: "🎲 Random names",
    randomYou: "A random name was generated for you",
    randomDone: "Random names were generated",
  },

  roleIntro: {
    title: "Role dealing",
    aiText:
      "The phone will show only your secret role — the other characters know theirs privately and you will never see them.",
    friendsText:
      "The phone shows each player their secret role, one by one. Pass the phone and never reveal your role.",
    tipAi:
      "💡 Your role stays secret all game. Use your information wisely.",
    tipFriends:
      "💡 Each player taps «Reveal my role», sees it alone, then hides it and passes the phone.",
    begin: "Start dealing 🎴",
  },

  roleReveal: {
    presenting: "Role reveal — your role",
    presentingXofY: "Role reveal — {x} of {y}",
    yourRoleIs: "Your role is...",
    coverHint: "Your card is hidden — no one can see it until you reveal it.",
    passNote:
      "Tap «Reveal role» to see your card alone, then pass the phone.",
    youAre:
      "You: {name} — the other characters' roles stay secret; you will never see them.",
    reveal: "Reveal role 🎭",
    yourRole: "Your role is",
    lockNote: "🔒 The role cannot be changed after reveal",
    mafiaTeammates: "Your mafia teammates:",
    mafiaAlone: "None — you are the only mafia left",
    detectiveHint: "When asked, pick a player to investigate; only you will know the result.",
    doctorHint: "When asked, pick a player to protect from the mafia.",
    jesterHint: "Your big secret: sow suspicion until you get voted out — then you win alone!",
    continueNight: "Continue 🌙",
    continueHandoff: "Continue and pass the phone",
    hideAgain: "Hide the card again",
    nextPlayer: "Next player: {name}",
    nightStarts: "The night starts after this.",
  },

  night: {
    introTitle: "Close your eyes",
    introText:
      "Night falls quietly. Special roles wake one by one to act — pass the phone secretly and don't peek.",
    whoMoves: "Who will act tonight",
    startNight: "Start the night 🌙",
    nightNumber: "Night {n}",
    mafiaHeading: "Mafia, open your eyes",
    mafiaHelp: "Agree on one player to eliminate tonight.",
    mafiaHandoff: "The mafia",
    mafiaNote:
      "Pass the phone among the mafia and agree on one target. Never pick a fellow mafia member.",
    mafiaCta: "Choose the target 🔪",
    mafiaTeammatesLine: "You are the mafia: {names}",
    doctorHeading: "Doctor, open your eyes",
    doctorHelpSelf: "You may also protect yourself.",
    doctorHelpNoSelf: "You cannot protect yourself this round.",
    doctorHandoff: "The doctor",
    doctorNote: "Choose the player to protect from the mafia.",
    doctorCta: "Protect this player ❤️",
    detectiveHeading: "Detective, open your eyes",
    detectiveHelp: "You will learn whether they are mafia; keep the result secret.",
    detectiveHandoff: "The detective",
    detectiveNote: "Pick a player to investigate — only you will see the result.",
    detectiveCta: "Investigate this player 🕵️",
    resultTitle: "Investigation result",
    checked: "You checked: {name}",
    isMafia: "This player is mafia",
    notMafia: "This player is not mafia",
    dontShare: "Don't share the result now — use it wisely in the discussion.",
    hideResult: "Hide the result",
    empty: "No candidates available.",
    titleWithRole: "Night {n} — {role}",
  },

  day: {
    title: "Night is over",
    woke: "Everyone wakes up... what happened during the night?",
    eliminatedX: "{name} has been eliminated",
    andWasRole: "Their role was: {emoji} {role}",
    staysBut: "{name} stays with you but cannot vote or use their ability. 👻",
    noElim: "No one was eliminated tonight",
    doctorSaved: "Either the doctor saved the target, or the mafia didn't move. Discuss carefully.",
    playersAlive: "Players ({n} alive)",
    outOfGame: "👻 Out: {names}",
    logTitle: "📜 Event log",
    logTap: "Tap to view",
    logEmpty: "No events yet.",
    startDiscussion: "Start discussion 🗣️",
  },

  log: {
    nightKill: "{name} was eliminated during the night.",
    noNightKill: "No one was eliminated during the night.",
    dayEliminate: "{name} was eliminated by vote",
    dayEliminateReveal: "{name} was eliminated by vote. Their role: {role}.",
    tie: "The vote ended in a tie.",
    noDayEliminate: "No one was eliminated by vote.",
  },

  discussion: {
    title: "Discussion 🗣️",
    aiTitle: "Discussion 🗣️ — Artificial intelligence",
    heading: "Discussion phase",
    sub: "Discuss the events and try to uncover the mafia before voting.",
    aiSub:
      "Watch the characters debate around you, {name} — note their accusations and defenses, then vote.",
    aiSubSpectator: "Watch the characters debate as the match continues automatically.",
    timeLeft: "Time left",
    endedTransition: "Discussion time is up — moving to voting...",
    alivePlayers: "{n} players alive",
    minutes: "{n} minutes",
    pause: "⏸ Pause",
    resume: "▶️ Resume",
    endNow: "End discussion now",
    timeRemainingLabel: "remaining",
    pausedBadge: "— paused ⏸",
    speaking: "speaking...",
    chatDone:
      "The debate is over — voting starts automatically when the timer ends, or press «End discussion now».",
    skip: "⏩ Skip",
  },

  vote: {
    title: "Voting — {x} of {y}",
    yourVote: "Voting — your vote",
    voterXofY: "Voting {revote} — voter {x} of {y}",
    revoteRound: "— re-vote round",
    handoffNote: "Vote secretly against the player you suspect. No one will see your choice.",
    startVoting: "Start voting 🗳️",
    chooseTarget: "Choose who to vote for",
    selfHint: "This is your vote — you cannot vote for yourself.",
    voterSelfHint: "{name} — you cannot vote for yourself.",
    empty: "No candidates this round.",
    abstain: "I don't want to eliminate anyone",
    confirm: "Confirm vote",
  },

  voteResults: {
    title: "Vote results 🗳️",
    tally: "Vote tally",
    nobodyAbstain: "No one (abstain)",
    tieTitle: "It's a tie!",
    resultTitle: "Vote result",
    tieSub: "Two or more players tied. The host decides what happens:",
    eliminatedByVote: "{name} was voted out",
    wasRole: "Their role was: {emoji} {role}",
    isOut: "{name} is out of the game now 👻",
    allAbstain: "Everyone voted to eliminate no one",
    noVotesTitle: "No votes were cast against anyone",
    revote: "🔁 Re-vote",
    noEliminate: "Eliminate no one",
    nextNight: "Continue to next night 🌙",
  },

  win: {
    ended: "Game over",
    jesterWon: "The jester wins!",
    mafiaWon: "The mafia wins!",
    citizensWon: "The citizens win!",
    jesterDesc:
      "The jester was voted out — but they achieved their goal and win the game alone!",
    mafiaDesc:
      "The mafia took full control — only one non-mafia player remained.",
    citizensDesc: "The citizens uncovered the mafia and eliminated them all.",
    lasted: "The game lasted {nights}",
    survived: "{n} survived",
    finalResults: "Final results",
    playerCol: "Player",
    roleColAi: "Personality / Role",
    roleCol: "Role",
    resultCol: "Result",
    you: "You",
    out: "Out 👻",
    aliveShort: "Alive ✓",
    replaySame: "🔄 New game with the same players",
    replayRandom: "🎲 New game with random roles",
    toMenu: "🏠 Back to main menu",
  },

  spectate: {
    title: "You are out of the game",
    text:
      "{name}, you can no longer vote or use your ability, but the match continues — watch as a spectator until the end.",
    note: "👁️ You'll automatically follow the nights, discussions and votes of the remaining players.",
    continue: "Continue watching 👁️",
  },

  narrator: {
    nightIntro:
      "Close your eyes... night has fallen over the village. Wake up, bearers of special roles, one by one.",
    mafia: "It is now the mafia's turn... open your eyes, mafia.",
    doctor: "It is now the doctor's turn... open your eyes, doctor.",
    detective: "It is now the detective's turn... open your eyes, detective.",
    nightEnd:
      "The night roles are done... everyone, close your eyes. We are moving on to the morning.",
    test: "Narrator test... can you hear me clearly?",
  },

  settings: {
    title: "Settings",
    subtitle: "Settings are saved automatically.",
    soundTitle: "Sound",
    soundLabel: "Sound",
    soundHint: "Sound effects for night, day, voting and winning.",
    musicLabel: "Music",
    musicHint: "Calm background music while playing.",
    gameTitle: "Game",
    defaultDiscussion: "Default discussion time",
    showInstructionsLabel: "Show instructions",
    showInstructionsHint: "Show the phase explanation when starting.",
    rulesTitle: "Game rules (new games)",
    detectiveRole: "Detective role",
    detectiveRoleHint: "Include the detective in role dealing.",
    doctorRole: "Doctor role",
    doctorRoleHint: "Include the doctor in role dealing.",
    interfaceTitle: "Interface",
    language: "Language",
    darkMode: "Dark mode",
    darkValue: "Always on",
    narratorTitle: "Voice narrator",
    narratorLabel: "Voice narrator",
    narratorHint: "Natural AI voice-over narrated automatically during the night.",
    narratorVolume: "Narrator volume",
    narratorVoice: "Narrator voice",
    narratorDefaultVoice: "Default (best for this device)",
    narratorTest: "🔊 Test voice",
  },

  howTo: {
    title: "How to play",
    subtitle:
      "A social game of discussion, deception and deduction. Everyone shares one phone, passed secretly each phase.",
    phasesTitle: "Game phases",
    rolesTitle: "Roles",
    rulesTitle: "Important rules",
    phases: [
      {
        title: "Night",
        text: "Close your eyes. Special roles wake one by one: the mafia picks its target, the doctor protects a player, the detective checks a player. Pass the phone secretly.",
      },
      {
        title: "Day",
        text: "Everyone wakes up to find out who was eliminated during the night (if anyone). Only the result is announced — roles are only revealed if you enable the rule.",
      },
      {
        title: "Discussion",
        text: "The most important phase! Discuss everyone's behavior, accuse, defend and deceive. The mafia tries to steer suspicion toward the innocent.",
      },
      {
        title: "Voting",
        text: "Each player votes secretly against the player they suspect. The player with the most votes is eliminated.",
      },
      {
        title: "Victory",
        text: "The citizens win when all mafia are eliminated. The mafia only wins when it takes full control and only one non-mafia player remains. Killing a single player at night never ends the match — it keeps going round after round until a real win. And if the jester is voted out, they win the match alone! 🎭",
      },
    ],
    rules: [
      "Voting for yourself is not allowed.",
      "An eliminated player cannot vote or use their ability — they only watch. 👻",
      "Never reveal your role — not by words, not by your actions.",
      "Only the detective knows their results; only the mafia know their teammates.",
      "The jester only wins if voted out during the day — don't reveal their role or they'll achieve their goal.",
      "Pass the phone honestly and never peek at other players' roles.",
    ],
  },

  roles: {
    mafia: {
      name: "Mafia",
      short: "Eliminate the citizens at night without being exposed",
      brief: "Work with the other mafia to eliminate citizens during the night.",
      description:
        "Each night, choose one player together to eliminate. No one must learn your identity: keep killing at night until only one non-mafia player remains.",
    },
    citizen: {
      name: "Citizen",
      short: "Discover the mafia and vote them out",
      brief: "You have no night ability. Try to uncover the mafia through discussion and voting.",
      description:
        "No special power, but your voice matters. Watch everyone's behavior, discuss, deduce who the mafia is, then vote to eliminate them.",
    },
    detective: {
      name: "Detective",
      short: "Check one player each night to learn the truth",
      brief: "You can investigate a player at night to learn whether they are mafia.",
      description:
        "Each night, pick one player to check; only the phone will tell you whether they are mafia. Use the information wisely and don't expose yourself too quickly.",
    },
    doctor: {
      name: "Doctor",
      short: "Protect one player each night",
      brief: "You can protect a player during the night.",
      description:
        "Each night, choose one player to protect from the mafia. If they were the target, no one is eliminated that night.",
    },
    jester: {
      name: "Jester",
      short: "Get everyone to vote against you",
      brief: "Your goal is to be eliminated by the daytime vote.",
      description:
        "Your role is strange: you want to be voted out during the day! Sow suspicion around yourself cleverly without anyone discovering your intention. If you are voted out, you win the game alone.",
    },
  },

  personas: {
    names: {
      smart: "Adam",
      confident: "Sam",
      skeptic: "Youssef",
      quiet: "Layla",
      funny: "Karim",
      deceiver: "Mona",
      aggressive: "Omar",
      analyst: "Sarah",
    },
    traits: {
      smart: "Smart",
      confident: "Confident",
      skeptic: "Skeptic",
      quiet: "Quiet",
      funny: "Funny",
      deceiver: "Deceiver",
      aggressive: "Aggressive",
      analyst: "Analyst",
    },
    phrases: {
      smart: {
        accuse: [
          "I noticed {target} always changes the subject when we mention the mafia — that's very suspicious.",
          "A simple analysis of the events: {target} is the only one who has benefited from everything so far.",
          "{target}'s actions don't match their words — I think we have a mafia among us.",
        ],
        defend: [
          "I understand your doubts, but all my decisions were logical, and {accuser} is looking in the wrong direction.",
          "Review my votes from the start and you'll find me always consistent — nothing is hidden in my behavior.",
        ],
        counter: [
          "{accuser}'s accusation of me is not well thought out — let's instead remember who started accusing early.",
          "Whoever accuses quickly and without proof is usually trying to hide something, {accuser}.",
        ],
        analyze: [
          "In the last vote, {voter} voted against {target} and then suddenly changed their mind — that pattern is worth following.",
          "Let's remember the votes well: who voted with the majority and who against? The evidence is in the numbers.",
        ],
        reactNight: [
          "{victim}'s death tonight is not random — the mafia gets rid of those who pose a real danger to it.",
          "Killing {victim} means they were very close to exposing the mafia — let's see who benefited.",
        ],
        reactNoKill: [
          "No one was eliminated tonight — either the doctor was focused, or the mafia is planning something.",
        ],
        close: [
          "I think we've gathered enough information — time to vote and reveal the truth.",
          "Let's vote now — votes reveal more than words.",
        ],
        bait: [
          "Strange! Everyone talks about the mafia and no one talks about me... maybe because I'm good at hiding things?",
          "I could be the mafia... or maybe the only logical thing in this room.",
        ],
      },
      confident: {
        accuse: [
          "I'll say it with full confidence: {target} is suspicious, no doubt about it.",
          "I have a strong hunch about {target}, and my hunches rarely fail.",
          "I watched everyone carefully, and {target} behaves like someone hiding something. Period.",
        ],
        defend: [
          "Whoever accuses me is wasting their time — if I were mafia, I'd be the last to speak this openly.",
          "I know I'm innocent, and {accuser} knows it too, but they want to distract you.",
        ],
        counter: [
          "Here's the truth, folks: {accuser} is trying to take out the innocent one by one.",
          "The real suspect is the one who accuses without hesitation — that's exactly {accuser}.",
        ],
        analyze: [
          "{voter}'s vote against {target} last round wasn't natural, and I'm sure someone is pulling the strings.",
          "It's simple: follow whoever benefits from every elimination, and you'll find the mafia.",
        ],
        reactNight: [
          "As I predicted — {victim} is out tonight. The mafia plays hard, but we'll expose them.",
          "{victim}'s death confirms the mafia is scared and gets rid of the smart ones first.",
        ],
        reactNoKill: [
          "No one out? Then the doctor is a pro, or the mafia is hesitant — either way, we're ahead.",
        ],
        close: [
          "Stop the extra talk — let's vote now with confidence.",
          "Time to decide. Cast your votes.",
        ],
        bait: [
          "I can convince any of you of anything... Question: do you trust me?",
          "If I were you, I'd vote for me, because I look way too confident... that's suspicious, right?",
        ],
      },
      skeptic: {
        accuse: [
          "I can't believe {target} after everything I've seen — everything about them screams suspicion.",
          "I suspect {target}, and when I suspect someone, I'm usually right.",
          "There are too many contradictions in {target}'s words, and I watch every word.",
        ],
        defend: [
          "I doubt everyone, but {accuser}'s doubt of me is unjustified — my evidence is clearer than their accusations.",
          "{accuser} seems to be steering suspicion toward an innocent person... exactly what the mafia does.",
        ],
        counter: [
          "It's strange that {accuser} accuses me while not explaining their own behavior.",
          "Let's look at who's lying: {accuser} isn't convincing at all today.",
        ],
        analyze: [
          "{voter} voted against {target} even though no one suspected them — why? That needs an explanation.",
          "Votes changing between rounds is worrying. Whoever changes their mind fast deserves watching.",
        ],
        reactNight: [
          "{victim} is out tonight... and I wasn't fully convinced of their innocence. The mafia may be closer than we think.",
          "Killing {victim} removes an entire player from the equation — who did that serve?",
        ],
        reactNoKill: [
          "No one out... wait, that means someone was protected. Who is the doctor? Don't reveal yourselves.",
        ],
        close: [
          "I have enough doubts — time to vote before we forget what we saw.",
          "Let's vote now. Doubt alone isn't enough; votes are the judge.",
        ],
        bait: [
          "What if I told you I'm not even sure about my own role?... Just something to think about.",
          "Everyone thinks I'm mysterious... maybe because I really am hiding something. Or not. Changed your minds?",
        ],
      },
      quiet: {
        accuse: [
          "I don't talk much, but {target} caught my attention. I've been watching them from the start.",
          "Since I have to say something: {target} behaves differently from the rest.",
        ],
        defend: [
          "I'm quiet because I listen more than I talk, and {accuser} confuses calmness with guilt.",
          "I defend myself in one word: watch who talks too much — it's not me.",
        ],
        counter: [
          "Whoever shouts a lot is usually hiding something. {accuser} shouts a lot.",
          "Silence isn't proof. Let's focus on actions, not voices.",
        ],
        analyze: [
          "I noticed {voter} and {target} exchanging glances... I mean, exchanging strange votes.",
          "Votes speak about us more than we speak about ourselves.",
        ],
        reactNight: [
          "{victim} is out... I was watching them too. Unfortunately, it's too late.",
          "No one is safe anymore. {victim} didn't see that coming.",
        ],
        reactNoKill: ["Nothing tonight... good. We all slept safely."],
        close: ["I'll vote. Time will tell if I was right.", "Let's vote in silence."],
        bait: [
          "Hmm... nothing to say. Or maybe I have a lot to say and I prefer silence.",
          "I'm watching all of you. Just observing.",
        ],
      },
      funny: {
        accuse: [
          "I say this jokingly: {target} is hiding something in their pocket... or in their role!",
          "I laughed with {target} all the time but they never laughed once — even the mafia fears good jokes.",
          "If the mafia acts as well as {target}, we'll expose them before dinner!",
        ],
        defend: [
          "Me? Mafia? If I were mafia, all my jokes would be about betrayal!",
          "{accuser}'s accusation is funny... which is the worst thing, because it means they're serious.",
        ],
        counter: [
          "The only joke in this room is {accuser} accusing me while I laugh at their suspicions.",
          "I suggest we vote against whoever doesn't laugh at my jokes — starting with {accuser}.",
        ],
        analyze: [
          "Look at {voter}'s vote against {target}... even the movies wouldn't write such a twist!",
          "I analyze votes like I analyze jokes: timing is everything.",
        ],
        reactNight: [
          "Oh no, {victim} is out! Who will appreciate my jokes now?",
          "We laughed a lot with {victim}... and now the mafia is very serious. We have to be too.",
        ],
        reactNoKill: [
          "No one out! The doctor deserves a round of applause... or maybe the mafia is preparing a funny surprise.",
        ],
        close: [
          "Okay okay, time to get serious — let's vote and see who wins the Oscar for best mafia role!",
          "I'm ready to vote. And whoever wants the last laugh, vote wisely.",
        ],
        bait: [
          "What if I'm the mafia this time? Don't worry, even if I were, I'd fail in a funny way!",
          "Imagine if I could vote for myself... that would be the best joke of the game!",
        ],
      },
      deceiver: {
        accuse: [
          "Trust me, I know the mafia when I see it: it's {target}, and I'm very sure of that.",
          "I have a reliable source saying {target} is not what they seem. Believe me.",
          "Watch {target} closely — the most innocent smiles carry the most dangerous roles.",
        ],
        defend: [
          "I know what an innocent looks like... and {accuser} looks far more guilty than me.",
          "If I were mafia, I would never have let anyone discover it. {accuser} is playing an obvious role.",
        ],
        counter: [
          "Let's trust each other for a moment: {accuser} has been suspicious since the first night.",
          "Look closely at who accuses me — does it remind you of anything?",
        ],
        analyze: [
          "{voter}'s vote against {target} was the smartest of the round... and I know why.",
          "Whoever always votes with the majority is hiding something — let's look for them in the votes.",
        ],
        reactNight: [
          "Unfortunately, {victim} is out... but didn't I tell you I had a feeling about that player?",
          "{victim}'s death is painful, but it revealed something important about who's playing.",
        ],
        reactNoKill: [
          "No one out? How intriguing... that means someone knows more than they show.",
        ],
        close: [
          "I know who should go. Let's vote and you'll thank me later.",
          "Trust my instinct this time — let's vote wisely.",
        ],
        bait: [
          "I'm an excellent actress... but the question is: am I acting right now?",
          "If I were you, I'd suspect me. That's what I would do in your place.",
        ],
      },
      aggressive: {
        accuse: [
          "Enough beating around the bush: {target} is the mafia, and I'm ready to bet on it!",
          "I'll say it plainly: {target} is guilty, and whoever defends them is their accomplice!",
          "Don't waste my time — {target} is the only correct choice today.",
        ],
        defend: [
          "Whoever accuses me is a fool or mafia, and {accuser} is no fool!",
          "I defend myself forcefully because I'm innocent, and I challenge my accuser to prove otherwise!",
        ],
        counter: [
          "If you accuse me, I'll expose your truth: {accuser} is the real mafia!",
          "The best defense is offense: {accuser} is more suspicious than anyone here!",
        ],
        analyze: [
          "{voter}'s vote against {target} was a huge mistake! And those who voted that way are accused!",
          "I don't forget votes: those who voted against us will be held accountable!",
        ],
        reactNight: [
          "{victim} is out! I'm angry, and anger makes me sharper! We'll get our revenge today!",
          "The mafia dares now! {victim} wasn't alone, and we'll force them out!",
        ],
        reactNoKill: [
          "No one out? Good — but that won't stop me. I'll find the mafia today no matter what it takes!",
        ],
        close: ["Enough talk! Let's vote now without hesitation!", "I'm ready to vote, and I hope you're ready for the truth!"],
        bait: [
          "I accuse everyone! Even myself! That proves I'm not mafia... right?",
          "I swear I'm not the mafia... and you believe me because I'm shouting!",
        ],
      },
      analyst: {
        accuse: [
          "According to my analysis of votes and statements, {target} has the biggest behavioral contradiction.",
          "The statistics are simple: {target} voted against their own interest if they were a citizen.",
          "All the evidence points to {target} — the votes, the statements, even the silences.",
        ],
        defend: [
          "I reviewed all the round data, and my behavior is 100% consistent — {accuser}'s accusation is baseless.",
          "Numbers don't lie: my accuser hasn't provided a single concrete piece of evidence.",
        ],
        counter: [
          "Analytically, {accuser} is the one showing the clearest mafia pattern.",
          "Let's compare {accuser}'s words to their actions — the gap is huge.",
        ],
        analyze: [
          "Last round, {voter}'s vote against {target} changed the whole course of the vote — that's not a coincidence.",
          "I noticed a pattern: those who voted together in the last two rounds are the same ones talking together now.",
        ],
        reactNight: [
          "{victim}'s death reduces the votes by {count}% of the players — the mafia is calculating well.",
          "Killing {victim} shows the mafia targeted the most analytically influential player.",
        ],
        reactNoKill: [
          "No one out — high probability of doctor intervention, or the mafia chose to wait.",
        ],
        close: ["The data is sufficient to decide — let's vote now.", "Time to vote. The numbers will decide."],
        bait: [
          "By my calculation, the probability I'm mafia is 50%... isn't that statistically suspicious?",
          "The data says the most obvious suspect is... the person reading the data!",
        ],
      },
    },
  },

  namePools: {
    pool: [
      "James",
      "Liam",
      "Noah",
      "Oliver",
      "Elijah",
      "Lucas",
      "Henry",
      "Daniel",
      "Michael",
      "Jack",
      "Emma",
      "Olivia",
      "Ava",
      "Sophia",
      "Mia",
      "Isabella",
      "Charlotte",
      "Amelia",
      "Harper",
      "Evelyn",
      "Ethan",
      "Aiden",
      "Maya",
      "Layla",
      "Nora",
      "Sam",
      "Adam",
      "Sara",
      "Lina",
      "Omar",
    ],
    fallback: "Player {n}",
  },
};