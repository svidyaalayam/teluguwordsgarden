export interface WordVisual {
  emoji: string
  bgGradient: string
  accentColor: string
  badgeColor: string
  lightBg: string
  categoryTag?: string
  fallbackImageUrl?: string
}

// Category palette themes for high-contrast, playful child-friendly presentation
const CATEGORY_THEMES: Record<string, { gradient: string; accent: string; badge: string; lightBg: string; defaultEmoji: string }> = {
  animals: {
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    accent: '#b45309',
    badge: '#fef08a',
    lightBg: '#fffbeb',
    defaultEmoji: '🐾',
  },
  nature: {
    gradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    accent: '#15803d',
    badge: '#86efac',
    lightBg: '#f0fdf4',
    defaultEmoji: '🌿',
  },
  food: {
    gradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    accent: '#c2410c',
    badge: '#fdba74',
    lightBg: '#fff7ed',
    defaultEmoji: '🍎',
  },
  space: {
    gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    accent: '#4338ca',
    badge: '#a5b4fc',
    lightBg: '#eef2ff',
    defaultEmoji: '🚀',
  },
  school: {
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    accent: '#0369a1',
    badge: '#7dd3fc',
    lightBg: '#f0f9ff',
    defaultEmoji: '📚',
  },
  vehicles: {
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    accent: '#be185d',
    badge: '#f9a8d4',
    lightBg: '#fdf2f8',
    defaultEmoji: '🚗',
  },
  actions: {
    gradient: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
    accent: '#0f766e',
    badge: '#5eead4',
    lightBg: '#f0fdfa',
    defaultEmoji: '⭐',
  },
  colors: {
    gradient: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)',
    accent: '#a21caf',
    badge: '#f0abfc',
    lightBg: '#fdf4ff',
    defaultEmoji: '🎨',
  },
  family: {
    gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    accent: '#b91c1c',
    badge: '#fca5a5',
    lightBg: '#fef2f2',
    defaultEmoji: '💛',
  },
  music: {
    gradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
    accent: '#6d28d9',
    badge: '#c4b5fd',
    lightBg: '#f5f3ff',
    defaultEmoji: '🎵',
  },
  weather: {
    gradient: 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)',
    accent: '#0e7490',
    badge: '#67e8f9',
    lightBg: '#ecfeff',
    defaultEmoji: '☀️',
  },
  default: {
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    accent: '#334155',
    badge: '#cbd5e1',
    lightBg: '#f8fafc',
    defaultEmoji: '✨',
  },
}

// Dictionary mapping term (lowercase) to emoji and theme key
// Dictionary mapping Telugu term, English term, or transliteration to child-friendly emoji and theme
const WORD_MAP: Record<string, { emoji: string; theme: string; category?: string; sampleImage?: string }> = {
  // Telugu Animals & Pets
  'పిల్లి': { emoji: '🐱', theme: 'animals', category: 'జంతువులు (Animals)' },
  'pilli': { emoji: '🐱', theme: 'animals', category: 'జంతువులు (Animals)' },
  'కుక్క': { emoji: '🐶', theme: 'animals', category: 'జంతువులు (Animals)' },
  'kukka': { emoji: '🐶', theme: 'animals', category: 'జంతువులు (Animals)' },
  'ఆవు': { emoji: '🐮', theme: 'animals', category: 'జంతువులు (Animals)' },
  'aavu': { emoji: '🐮', theme: 'animals', category: 'జంతువులు (Animals)' },
  'గుర్రం': { emoji: '🐴', theme: 'animals', category: 'జంతువులు (Animals)' },
  'gurram': { emoji: '🐴', theme: 'animals', category: 'జంతువులు (Animals)' },
  'చేప': { emoji: '🐟', theme: 'animals', category: 'జంతువులు (Animals)' },
  'chepa': { emoji: '🐟', theme: 'animals', category: 'జంతువులు (Animals)' },
  'కుందేలు': { emoji: '🐰', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'kundelu': { emoji: '🐰', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'పిల్లిపిల్ల': { emoji: '🐈', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'pillipilla': { emoji: '🐈', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'కుక్కపిల్ల': { emoji: '🐕', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'kukkapilla': { emoji: '🐕', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'తాబేలు': { emoji: '🐢', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'thaabelu': { emoji: '🐢', theme: 'animals', category: 'పెంపుడు జంతువులు (Pets)' },
  'సింహం': { emoji: '🦁', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'simham': { emoji: '🦁', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'పులి': { emoji: '🐯', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'puli': { emoji: '🐯', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'ఏనుగు': { emoji: '🐘', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'eenugu': { emoji: '🐘', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'కోతి': { emoji: '🐒', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'kothi': { emoji: '🐒', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'జింక': { emoji: '🦌', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'jinka': { emoji: '🦌', theme: 'animals', category: 'అడవి జంతువులు (Wild Animals)' },
  'గేదె': { emoji: '🐃', theme: 'animals', category: 'వ్యవసాయ జంతువులు (Farm Animals)' },
  'మేక': { emoji: '🐐', theme: 'animals', category: 'వ్యవసాయ జంతువులు (Farm Animals)' },
  'గొర్రె': { emoji: '🐑', theme: 'animals', category: 'వ్యవసాయ జంతువులు (Farm Animals)' },
  'ఎద్దు': { emoji: '🐂', theme: 'animals', category: 'వ్యవసాయ జంతువులు (Farm Animals)' },
  'కోడి': { emoji: '🐔', theme: 'animals', category: 'వ్యవసాయ జంతువులు (Farm Animals)' },
  'తిమింగలం': { emoji: '🐋', theme: 'animals', category: 'సముద్ర జీవులు (Sea Animals)' },
  'సొరచేప': { emoji: '🦈', theme: 'animals', category: 'సముద్ర జీవులు (Sea Animals)' },
  'పీత': { emoji: '🦀', theme: 'animals', category: 'సముద్ర జీవులు (Sea Animals)' },
  'డాల్ఫిన్': { emoji: '🐬', theme: 'animals', category: 'సముద్ర జీవులు (Sea Animals)' },

  // Telugu Birds
  'నెమలి': { emoji: '🦚', theme: 'animals', category: 'పక్షులు (Birds)' },
  'nemali': { emoji: '🦚', theme: 'animals', category: 'పక్షులు (Birds)' },
  'చిలుక': { emoji: '🦜', theme: 'animals', category: 'పక్షులు (Birds)' },
  'chiluka': { emoji: '🦜', theme: 'animals', category: 'పక్షులు (Birds)' },
  'కాకి': { emoji: '🐦‍⬛', theme: 'animals', category: 'పక్షులు (Birds)' },
  'kaaki': { emoji: '🐦‍⬛', theme: 'animals', category: 'పక్షులు (Birds)' },
  'పావురం': { emoji: '🕊️', theme: 'animals', category: 'పక్షులు (Birds)' },
  'paavuram': { emoji: '🕊️', theme: 'animals', category: 'పక్షులు (Birds)' },
  'కోయిల': { emoji: '🐦', theme: 'animals', category: 'పక్షులు (Birds)' },
  'koyila': { emoji: '🐦', theme: 'animals', category: 'పక్షులు (Birds)' },
  'హంస': { emoji: '🦢', theme: 'animals', category: 'పక్షులు (Birds)' },

  // Telugu Fruits & Veggies
  'మామిడిపండు': { emoji: '🥭', theme: 'food', category: 'పండ్లు (Fruits)' },
  'maamidipandu': { emoji: '🥭', theme: 'food', category: 'పండ్లు (Fruits)' },
  'అరటిపండు': { emoji: '🍌', theme: 'food', category: 'పండ్లు (Fruits)' },
  'aratipandu': { emoji: '🍌', theme: 'food', category: 'పండ్లు (Fruits)' },
  'ఆపిల్': { emoji: '🍎', theme: 'food', category: 'పండ్లు (Fruits)' },
  'aapil': { emoji: '🍎', theme: 'food', category: 'పండ్లు (Fruits)' },
  'ద్రాక్ష': { emoji: '🍇', theme: 'food', category: 'పండ్లు (Fruits)' },
  'draaksha': { emoji: '🍇', theme: 'food', category: 'పండ్లు (Fruits)' },
  'జామపండు': { emoji: '🍈', theme: 'food', category: 'పండ్లు (Fruits)' },
  'jaamapandu': { emoji: '🍈', theme: 'food', category: 'పండ్లు (Fruits)' },
  'వంకాయ': { emoji: '🍆', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'vankaaya': { emoji: '🍆', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'టమాట': { emoji: '🍅', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'tamaata': { emoji: '🍅', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'క్యారెట్': { emoji: '🥕', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'kyarat': { emoji: '🥕', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'బంగాళాదుంప': { emoji: '🥔', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'bangaalaadumpa': { emoji: '🥔', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'బెండకాయ': { emoji: '🥒', theme: 'food', category: 'కూరగాయలు (Vegetables)' },
  'bendakaaya': { emoji: '🥒', theme: 'food', category: 'కూరగాయలు (Vegetables)' },

  // Telugu Food & Drink
  'అన్నం': { emoji: '🍚', theme: 'food', category: 'ఆహారం (Food)' },
  'annam': { emoji: '🍚', theme: 'food', category: 'ఆహారం (Food)' },
  'రోటీ': { emoji: '🫓', theme: 'food', category: 'ఆహారం (Food)' },
  'ఇడ్లీ': { emoji: '⚪', theme: 'food', category: 'ఆహారం (Food)' },
  'దోశ': { emoji: '🥞', theme: 'food', category: 'ఆహారం (Food)' },
  'లడ్డూ': { emoji: '🟡', theme: 'food', category: 'ఆహారం (Food)' },
  'నీరు': { emoji: '💧', theme: 'food', category: 'పానీయాలు (Drinks)' },
  'neeru': { emoji: '💧', theme: 'food', category: 'పానీయాలు (Drinks)' },
  'పాలు': { emoji: '🥛', theme: 'food', category: 'పానీయాలు (Drinks)' },
  'paalu': { emoji: '🥛', theme: 'food', category: 'పానీయాలు (Drinks)' },
  'తేనీరు': { emoji: '🍵', theme: 'food', category: 'పానీయాలు (Drinks)' },

  // Telugu Colors
  'ఎరుపు': { emoji: '🔴', theme: 'colors', category: 'రంగులు (Colors)' },
  'erupu': { emoji: '🔴', theme: 'colors', category: 'రంగులు (Colors)' },
  'నీలం': { emoji: '🔵', theme: 'colors', category: 'రంగులు (Colors)' },
  'neelam': { emoji: '🔵', theme: 'colors', category: 'రంగులు (Colors)' },
  'ఆకుపచ్చ': { emoji: '🟢', theme: 'colors', category: 'రంగులు (Colors)' },
  'aakupachha': { emoji: '🟢', theme: 'colors', category: 'రంగులు (Colors)' },
  'పసుపు': { emoji: '🟡', theme: 'colors', category: 'రంగులు (Colors)' },
  'pasupu': { emoji: '🟡', theme: 'colors', category: 'రంగులు (Colors)' },
  'తెలుపు': { emoji: '⚪', theme: 'colors', category: 'రంగులు (Colors)' },
  'telupu': { emoji: '⚪', theme: 'colors', category: 'రంగులు (Colors)' },

  // Telugu Numbers
  'ఒకటి': { emoji: '1️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'okkati': { emoji: '1️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'okati': { emoji: '1️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'రెండు': { emoji: '2️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'rendu': { emoji: '2️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'మూడు': { emoji: '3️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'moodu': { emoji: '3️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'నాలుగు': { emoji: '4️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'naalugu': { emoji: '4️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'ఐదు': { emoji: '5️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },
  'aidu': { emoji: '5️⃣', theme: 'school', category: 'అంకెలు (Numbers)' },

  // Telugu Family
  'అమ్మ': { emoji: '👩', theme: 'family', category: 'కుటుంబం (Family)' },
  'amma': { emoji: '👩', theme: 'family', category: 'కుటుంబం (Family)' },
  'నాన్న': { emoji: '👨', theme: 'family', category: 'కుటుంబం (Family)' },
  'naanna': { emoji: '👨', theme: 'family', category: 'కుటుంబం (Family)' },
  'తాతయ్య': { emoji: '👴', theme: 'family', category: 'కుటుంబం (Family)' },
  'thaathayya': { emoji: '👴', theme: 'family', category: 'కుటుంబం (Family)' },
  'అమ్మమ్మ': { emoji: '👵', theme: 'family', category: 'కుటుంబం (Family)' },
  'ammamma': { emoji: '👵', theme: 'family', category: 'కుటుంబం (Family)' },
  'అన్నయ్య': { emoji: '👦', theme: 'family', category: 'కుటుంబం (Family)' },
  'annayya': { emoji: '👦', theme: 'family', category: 'కుటుంబం (Family)' },

  // Telugu Body Parts
  'కన్ను': { emoji: '👁️', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'kannu': { emoji: '👁️', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'ముక్కు': { emoji: '👃', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'mukku': { emoji: '👃', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'నోరు': { emoji: '👄', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'noru': { emoji: '👄', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'చెవి': { emoji: '👂', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'chevi': { emoji: '👂', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'చేయి': { emoji: '✋', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },
  'cheyi': { emoji: '✋', theme: 'actions', category: 'శరీర భాగాలు (Body Parts)' },

  // Telugu School & Study
  'బడి': { emoji: '🏫', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'badi': { emoji: '🏫', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'పుస్తకం': { emoji: '📖', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'pusthakam': { emoji: '📖', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'కలం': { emoji: '🖊️', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'kalam': { emoji: '🖊️', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'పలక': { emoji: '📋', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'palaka': { emoji: '📋', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'సంచి': { emoji: '🎒', theme: 'school', category: 'బడి / పాఠశాల (School)' },
  'sanchi': { emoji: '🎒', theme: 'school', category: 'బడి / పాఠశాల (School)' },

  // Telugu Nature & Flowers
  'సూర్యుడు': { emoji: '☀️', theme: 'weather', category: 'ప్రకృతి (Nature)' },
  'sooryudu': { emoji: '☀️', theme: 'weather', category: 'ప్రకృతి (Nature)' },
  'చంద్రుడు': { emoji: '🌙', theme: 'space', category: 'ప్రకృతి (Nature)' },
  'chandrudu': { emoji: '🌙', theme: 'space', category: 'ప్రకృతి (Nature)' },
  'వర్షం': { emoji: '🌧️', theme: 'weather', category: 'ప్రకృతి (Nature)' },
  'varsham': { emoji: '🌧️', theme: 'weather', category: 'ప్రకృతి (Nature)' },
  'నది': { emoji: '🌊', theme: 'nature', category: 'ప్రకృతి (Nature)' },
  'nadi': { emoji: '🌊', theme: 'nature', category: 'ప్రకృతి (Nature)' },
  'కొండ': { emoji: '⛰️', theme: 'nature', category: 'ప్రకృతి (Nature)' },
  'konda': { emoji: '⛰️', theme: 'nature', category: 'ప్రకృతి (Nature)' },
  'తామరపువ్వు': { emoji: '🪷', theme: 'nature', category: 'మొక్కలు & పూలు (Plants & Flowers)' },
  'thaamarapuvvu': { emoji: '🪷', theme: 'nature', category: 'మొక్కలు & పూలు (Plants & Flowers)' },
  'గులాబీ': { emoji: '🌹', theme: 'nature', category: 'మొక్కలు & పూలు (Plants & Flowers)' },
  'gulaabi': { emoji: '🌹', theme: 'nature', category: 'మొక్కలు & పూలు (Plants & Flowers)' },
  'మల్లెపువ్వు': { emoji: '🤍', theme: 'nature', category: 'మొక్కలు & పూలు (Plants & Flowers)' },
  'చెట్టు': { emoji: '🌳', theme: 'nature', category: 'చెట్లు & అడవులు (Trees & Forests)' },
  'chettu': { emoji: '🌳', theme: 'nature', category: 'చెట్లు & అడవులు (Trees & Forests)' },

  // Telugu Vehicles
  'కారు': { emoji: '🚗', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'kaaru': { emoji: '🚗', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'బస్సు': { emoji: '🚌', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'bassu': { emoji: '🚌', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'రైలు': { emoji: '🚆', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'railu': { emoji: '🚆', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'విమానం': { emoji: '✈️', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'vimaanam': { emoji: '✈️', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'సైకిల్': { emoji: '🚲', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },
  'saikil': { emoji: '🚲', theme: 'vehicles', category: 'వాహనాలు (Vehicles)' },

  // Telugu Actions
  'చదువు': { emoji: '📖', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'chaduvu': { emoji: '📖', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'రాయి': { emoji: '✍️', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'raayi': { emoji: '✍️', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'వినండి': { emoji: '👂', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'vinandi': { emoji: '👂', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'మాట్లాడు': { emoji: '🗣️', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'aatlaadu': { emoji: '🗣️', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'ఆడు': { emoji: '⚽', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },
  'aadu': { emoji: '⚽', theme: 'actions', category: 'నిత్య పనులు (Everyday Actions)' },

  // Alphabet & Numbers
  letter: { emoji: '✉️', theme: 'school', category: 'Alphabet' },
  alphabet: { emoji: '🔤', theme: 'school', category: 'Alphabet' },
  vowel: { emoji: '🅰️', theme: 'school', category: 'Alphabet' },
  consonant: { emoji: '🔡', theme: 'school', category: 'Alphabet' },
  sound: { emoji: '🔊', theme: 'school', category: 'Alphabet' },
  zero: { emoji: '0️⃣', theme: 'school', category: 'Numbers' },
  one: { emoji: '1️⃣', theme: 'school', category: 'Numbers' },
  two: { emoji: '2️⃣', theme: 'school', category: 'Numbers' },
  three: { emoji: '3️⃣', theme: 'school', category: 'Numbers' },
  four: { emoji: '4️⃣', theme: 'school', category: 'Numbers' },

  // Colors
  red: { emoji: '🔴', theme: 'colors', category: 'Colors' },
  blue: { emoji: '🔵', theme: 'colors', category: 'Colors' },
  green: { emoji: '🟢', theme: 'colors', category: 'Colors' },
  yellow: { emoji: '🟡', theme: 'colors', category: 'Colors' },
  purple: { emoji: '🟣', theme: 'colors', category: 'Colors' },

  // Shapes & Sizes
  circle: { emoji: '⭕', theme: 'school', category: 'Shapes' },
  square: { emoji: '⏹️', theme: 'school', category: 'Shapes' },
  triangle: { emoji: '🔺', theme: 'school', category: 'Shapes' },
  rectangle: { emoji: '▯', theme: 'school', category: 'Shapes' },
  oval: { emoji: '🥚', theme: 'school', category: 'Shapes' },
  big: { emoji: '🐘', theme: 'actions', category: 'Sizes' },
  small: { emoji: '🐜', theme: 'actions', category: 'Sizes' },
  tall: { emoji: '🦒', theme: 'actions', category: 'Sizes' },
  short: { emoji: '🦔', theme: 'actions', category: 'Sizes' },
  wide: { emoji: '↔️', theme: 'actions', category: 'Sizes' },

  // Opposites & Positions
  hot: { emoji: '🔥', theme: 'weather', category: 'Opposites' },
  cold: { emoji: '❄️', theme: 'weather', category: 'Opposites' },
  up: { emoji: '⬆️', theme: 'actions', category: 'Opposites' },
  down: { emoji: '⬇️', theme: 'actions', category: 'Opposites' },
  fast: { emoji: '⚡', theme: 'actions', category: 'Opposites' },
  left: { emoji: '⬅️', theme: 'school', category: 'Position' },
  right: { emoji: '➡️', theme: 'school', category: 'Position' },
  above: { emoji: '☁️', theme: 'school', category: 'Position' },
  below: { emoji: '🌱', theme: 'school', category: 'Position' },
  between: { emoji: '🥪', theme: 'school', category: 'Position' },

  // Time & Weather
  spring: { emoji: '🌸', theme: 'nature', category: 'Seasons' },
  summer: { emoji: '☀️', theme: 'weather', category: 'Seasons' },
  autumn: { emoji: '🍂', theme: 'nature', category: 'Seasons' },
  winter: { emoji: '☃️', theme: 'weather', category: 'Seasons' },
  season: { emoji: '🌤️', theme: 'weather', category: 'Seasons' },
  sunny: { emoji: '☀️', theme: 'weather', category: 'Weather' },
  rainy: { emoji: '🌧️', theme: 'weather', category: 'Weather' },
  windy: { emoji: '💨', theme: 'weather', category: 'Weather' },
  cloudy: { emoji: '☁️', theme: 'weather', category: 'Weather' },
  storm: { emoji: '⛈️', theme: 'weather', category: 'Weather' },
  morning: { emoji: '🌅', theme: 'weather', category: 'Time of day' },
  afternoon: { emoji: '☀️', theme: 'weather', category: 'Time of day' },
  evening: { emoji: '🌇', theme: 'weather', category: 'Time of day' },
  night: { emoji: '🌙', theme: 'space', category: 'Time of day' },
  midnight: { emoji: '🌌', theme: 'space', category: 'Time of day' },
  clock: { emoji: '⏰', theme: 'school', category: 'Clock' },
  hour: { emoji: '⏳', theme: 'school', category: 'Clock' },
  minute: { emoji: '⏱️', theme: 'school', category: 'Clock' },
  second: { emoji: '⚡', theme: 'school', category: 'Clock' },
  "o'clock": { emoji: '🕒', theme: 'school', category: 'Clock' },

  // Animals & Pets
  cat: {
    emoji: '🐱',
    theme: 'animals',
    category: 'Animals',
    sampleImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  },
  dog: {
    emoji: '🐶',
    theme: 'animals',
    category: 'Animals',
    sampleImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  },
  bird: {
    emoji: '🐦',
    theme: 'animals',
    category: 'Animals',
    sampleImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=600&q=80',
  },
  fish: {
    emoji: '🐟',
    theme: 'animals',
    category: 'Animals',
    sampleImage: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80',
  },
  rabbit: {
    emoji: '🐰',
    theme: 'animals',
    category: 'Animals',
    sampleImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
  },
  puppy: { emoji: '🐕', theme: 'animals', category: 'Pets' },
  kitten: { emoji: '🐈', theme: 'animals', category: 'Pets' },
  hamster: { emoji: '🐹', theme: 'animals', category: 'Pets' },
  turtle: { emoji: '🐢', theme: 'animals', category: 'Pets' },
  'guinea pig': { emoji: '🐹', theme: 'animals', category: 'Pets' },
  cow: { emoji: '🐮', theme: 'animals', category: 'Farm animals' },
  horse: { emoji: '🐴', theme: 'animals', category: 'Farm animals' },
  sheep: { emoji: '🐑', theme: 'animals', category: 'Farm animals' },
  pig: { emoji: '🐷', theme: 'animals', category: 'Farm animals' },
  goat: { emoji: '🐐', theme: 'animals', category: 'Farm animals' },
  lion: { emoji: '🦁', theme: 'animals', category: 'Wild animals' },
  tiger: { emoji: '🐯', theme: 'animals', category: 'Wild animals' },
  elephant: { emoji: '🐘', theme: 'animals', category: 'Wild animals' },
  giraffe: { emoji: '🦒', theme: 'animals', category: 'Wild animals' },
  monkey: { emoji: '🐒', theme: 'animals', category: 'Wild animals' },
  shark: { emoji: '🦈', theme: 'animals', category: 'Sea animals' },
  whale: { emoji: '🐋', theme: 'animals', category: 'Sea animals' },
  dolphin: { emoji: '🐬', theme: 'animals', category: 'Sea animals' },
  octopus: { emoji: '🐙', theme: 'animals', category: 'Sea animals' },
  crab: { emoji: '🦀', theme: 'animals', category: 'Sea animals' },
  eagle: { emoji: '🦅', theme: 'animals', category: 'Birds' },
  owl: { emoji: '🦉', theme: 'animals', category: 'Birds' },
  duck: { emoji: '🦆', theme: 'animals', category: 'Birds' },
  parrot: { emoji: '🦜', theme: 'animals', category: 'Birds' },
  penguin: { emoji: '🐧', theme: 'animals', category: 'Birds' },
  ant: { emoji: '🐜', theme: 'animals', category: 'Insects' },
  bee: { emoji: '🐝', theme: 'animals', category: 'Insects' },
  butterfly: { emoji: '🦋', theme: 'animals', category: 'Insects' },
  beetle: { emoji: '🪲', theme: 'animals', category: 'Insects' },
  ladybird: { emoji: '🐞', theme: 'animals', category: 'Insects' },

  // Nature, Plants, Trees
  flower: { emoji: '🌸', theme: 'nature', category: 'Plants', sampleImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80' },
  seed: { emoji: '🌱', theme: 'nature', category: 'Plants' },
  root: { emoji: '🥕', theme: 'nature', category: 'Plants' },
  stem: { emoji: '🌿', theme: 'nature', category: 'Plants' },
  petal: { emoji: '🌺', theme: 'nature', category: 'Plants' },
  tree: { emoji: '🌳', theme: 'nature', category: 'Trees', sampleImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80' },
  branch: { emoji: '🪵', theme: 'nature', category: 'Trees' },
  trunk: { emoji: '🪵', theme: 'nature', category: 'Trees' },
  leaf: { emoji: '🍃', theme: 'nature', category: 'Trees' },
  forest: { emoji: '🌲', theme: 'nature', category: 'Trees' },
  rain: { emoji: '🌧️', theme: 'weather', category: 'Nature', sampleImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80' },
  sun: { emoji: '☀️', theme: 'weather', category: 'Nature', sampleImage: 'https://images.unsplash.com/photo-1579003593419-98f949b9398f?auto=format&fit=crop&w=600&q=80' },
  cloud: { emoji: '☁️', theme: 'weather', category: 'Nature' },
  river: { emoji: '🌊', theme: 'nature', category: 'Nature' },
  mountain: { emoji: '⛰️', theme: 'nature', category: 'Nature' },

  // Space & Planets
  space: { emoji: '🚀', theme: 'space', category: 'Space' },
  planet: { emoji: '🪐', theme: 'space', category: 'Space' },
  earth: { emoji: '🌍', theme: 'space', category: 'Space' },
  moon: { emoji: '🌙', theme: 'space', category: 'Space' },
  star: { emoji: '⭐', theme: 'space', category: 'Space' },

  // Food & Fruits & Veggies
  bread: { emoji: '🍞', theme: 'food', category: 'Food' },
  rice: { emoji: '🍚', theme: 'food', category: 'Food' },
  cheese: { emoji: '🧀', theme: 'food', category: 'Food' },
  egg: { emoji: '🥚', theme: 'food', category: 'Food' },
  sandwich: { emoji: '🥪', theme: 'food', category: 'Food' },
  apple: { emoji: '🍎', theme: 'food', category: 'Fruits', sampleImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
  banana: { emoji: '🍌', theme: 'food', category: 'Fruits' },
  orange: { emoji: '🍊', theme: 'food', category: 'Fruits' },
  grape: { emoji: '🍇', theme: 'food', category: 'Fruits' },
  pear: { emoji: '🍐', theme: 'food', category: 'Fruits' },
  carrot: { emoji: '🥕', theme: 'food', category: 'Vegetables' },
  potato: { emoji: '🥔', theme: 'food', category: 'Vegetables' },
  broccoli: { emoji: '🥦', theme: 'food', category: 'Vegetables' },
  cabbage: { emoji: '🥬', theme: 'food', category: 'Vegetables' },
  pea: { emoji: '🫛', theme: 'food', category: 'Vegetables' },
  water: { emoji: '💧', theme: 'food', category: 'Drinks' },
  milk: { emoji: '🥛', theme: 'food', category: 'Drinks' },
  juice: { emoji: '🧃', theme: 'food', category: 'Drinks' },
  tea: { emoji: '🍵', theme: 'food', category: 'Drinks' },
  smoothie: { emoji: '🥤', theme: 'food', category: 'Drinks' },

  // Vehicles & Transport
  car: { emoji: '🚗', theme: 'vehicles', category: 'Vehicles', sampleImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80' },
  bus: { emoji: '🚌', theme: 'vehicles', category: 'Vehicles' },
  bicycle: { emoji: '🚲', theme: 'vehicles', category: 'Vehicles' },
  train: { emoji: '🚆', theme: 'vehicles', category: 'Vehicles' },
  airplane: { emoji: '✈️', theme: 'vehicles', category: 'Vehicles' },

  // School & Learning
  classroom: { emoji: '🏫', theme: 'school', category: 'School' },
  lesson: { emoji: '📖', theme: 'school', category: 'School' },
  teacher: { emoji: '👩‍🏫', theme: 'school', category: 'School' },
  pupil: { emoji: '🎒', theme: 'school', category: 'School' },
  homework: { emoji: '📝', theme: 'school', category: 'School' },
  pencil: { emoji: '✏️', theme: 'school', category: 'Classroom' },
  ruler: { emoji: '📏', theme: 'school', category: 'Classroom' },
  eraser: { emoji: '🧼', theme: 'school', category: 'Classroom' },
  notebook: { emoji: '📓', theme: 'school', category: 'Classroom' },
  backpack: { emoji: '🎒', theme: 'school', category: 'Classroom' },
  read: { emoji: '📖', theme: 'school', category: 'Learning' },
  write: { emoji: '✍️', theme: 'school', category: 'Learning' },
  learn: { emoji: '💡', theme: 'school', category: 'Learning' },
  practise: { emoji: '🎯', theme: 'school', category: 'Learning' },
  remember: { emoji: '🧠', theme: 'school', category: 'Learning' },

  // Actions & Feelings
  jump: { emoji: '🦘', theme: 'actions', category: 'Everyday actions' },
  listen: { emoji: '👂', theme: 'actions', category: 'Everyday actions' },
  share: { emoji: '🤝', theme: 'actions', category: 'Everyday actions' },
  build: { emoji: '🧱', theme: 'actions', category: 'Everyday actions' },
  help: { emoji: '🤲', theme: 'actions', category: 'Everyday actions' },
  run: { emoji: '🏃', theme: 'actions', category: 'Movement' },
  walk: { emoji: '🚶', theme: 'actions', category: 'Movement' },
  throw: { emoji: '🥎', theme: 'actions', category: 'Movement' },
  catch: { emoji: '🧤', theme: 'actions', category: 'Movement' },
  kick: { emoji: '⚽', theme: 'actions', category: 'Movement' },
  happy: { emoji: '😊', theme: 'actions', category: 'Feelings' },
  sad: { emoji: '😢', theme: 'actions', category: 'Feelings' },
  angry: { emoji: '😠', theme: 'actions', category: 'Feelings' },
  excited: { emoji: '🤩', theme: 'actions', category: 'Feelings' },
  calm: { emoji: '😌', theme: 'actions', category: 'Feelings' },
  brave: { emoji: '🦁', theme: 'actions', category: 'Traits' },
  kind: { emoji: '💖', theme: 'actions', category: 'Traits' },
  curious: { emoji: '🔍', theme: 'actions', category: 'Traits' },
  patient: { emoji: '⏳', theme: 'actions', category: 'Traits' },
  helpful: { emoji: '🌟', theme: 'actions', category: 'Traits' },

  // Toys & Music
  doll: { emoji: '🪆', theme: 'colors', category: 'Toys' },
  teddy: { emoji: '🧸', theme: 'animals', category: 'Toys' },
  blocks: { emoji: '🧱', theme: 'colors', category: 'Toys' },
  kite: { emoji: '🪁', theme: 'weather', category: 'Toys' },
  puzzle: { emoji: '🧩', theme: 'colors', category: 'Toys' },
  song: { emoji: '🎶', theme: 'music', category: 'Music' },
  drum: { emoji: '🥁', theme: 'music', category: 'Music' },
  piano: { emoji: '🎹', theme: 'music', category: 'Music' },
  guitar: { emoji: '🎸', theme: 'music', category: 'Music' },
  flute: { emoji: '🪈', theme: 'music', category: 'Music' },

  // Technology & Books
  computer: { emoji: '💻', theme: 'space', category: 'Technology' },
  tablet: { emoji: '📱', theme: 'space', category: 'Technology' },
  keyboard: { emoji: '⌨️', theme: 'space', category: 'Technology' },
  screen: { emoji: '🖥️', theme: 'space', category: 'Technology' },
  robot: { emoji: '🤖', theme: 'space', category: 'Technology' },
  book: { emoji: '📚', theme: 'school', category: 'Books', sampleImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
  story: { emoji: '📖', theme: 'school', category: 'Books' },
  character: { emoji: '🦸', theme: 'school', category: 'Books' },
  chapter: { emoji: '📑', theme: 'school', category: 'Books' },
  ending: { emoji: '🎬', theme: 'school', category: 'Books' },

  // Body Parts & Hygiene
  head: { emoji: '🗣️', theme: 'family', category: 'Body parts' },
  hand: { emoji: '✋', theme: 'family', category: 'Body parts' },
  foot: { emoji: '🦶', theme: 'family', category: 'Body parts' },
  knee: { emoji: '🦵', theme: 'family', category: 'Body parts' },
  shoulder: { emoji: '💪', theme: 'family', category: 'Body parts' },
  soap: { emoji: '🧼', theme: 'actions', category: 'Hygiene' },
  toothbrush: { emoji: '🪥', theme: 'actions', category: 'Hygiene' },
  healthy: { emoji: '🥗', theme: 'food', category: 'Hygiene' },
  clean: { emoji: '✨', theme: 'actions', category: 'Hygiene' },
  medicine: { emoji: '💊', theme: 'actions', category: 'Hygiene' },

  // Household & Clothing
  shirt: { emoji: '👕', theme: 'colors', category: 'Clothing' },
  trousers: { emoji: '👖', theme: 'colors', category: 'Clothing' },
  socks: { emoji: '🧦', theme: 'colors', category: 'Clothing' },
  coat: { emoji: '🧥', theme: 'weather', category: 'Clothing' },
  hat: { emoji: '🧢', theme: 'colors', category: 'Clothing' },
  house: { emoji: '🏡', theme: 'family', category: 'Homes' },
  bedroom: { emoji: '🛏️', theme: 'family', category: 'Homes' },
  kitchen: { emoji: '🍳', theme: 'food', category: 'Homes' },
  table: { emoji: '🪵', theme: 'school', category: 'Furniture' },
  sofa: { emoji: '🛋️', theme: 'family', category: 'Furniture' },
  key: { emoji: '🔑', theme: 'school', category: 'Objects' },
  lamp: { emoji: '💡', theme: 'school', category: 'Objects' },
  mirror: { emoji: '🪞', theme: 'school', category: 'Objects' },
  basket: { emoji: '🧺', theme: 'food', category: 'Objects' },
}

/**
 * Returns complete visual representation parameters for any word.
 * Prioritizes the word's own image_url if provided, and falls back to
 * carefully styled child-friendly vector illustrations and emoji themes.
 */
export function getWordVisual(
  term: string,
  rawImageUrl?: string,
  categoryName?: string,
): WordVisual {
  const normalized = term.trim().toLowerCase()
  const mapping = WORD_MAP[normalized]

  // Detect theme from mapping or category name
  let themeKey = mapping?.theme || 'default'
  if (!mapping && categoryName) {
    const catLower = categoryName.toLowerCase()
    if (catLower.includes('animal') || catLower.includes('pet') || catLower.includes('bird') || catLower.includes('bug')) themeKey = 'animals'
    else if (catLower.includes('food') || catLower.includes('fruit') || catLower.includes('vegetable') || catLower.includes('drink')) themeKey = 'food'
    else if (catLower.includes('nature') || catLower.includes('plant') || catLower.includes('tree')) themeKey = 'nature'
    else if (catLower.includes('space') || catLower.includes('tech')) themeKey = 'space'
    else if (catLower.includes('school') || catLower.includes('learn') || catLower.includes('book')) themeKey = 'school'
    else if (catLower.includes('vehicle') || catLower.includes('transport') || catLower.includes('road')) themeKey = 'vehicles'
    else if (catLower.includes('music')) themeKey = 'music'
    else if (catLower.includes('weather') || catLower.includes('season')) themeKey = 'weather'
    else if (catLower.includes('action') || catLower.includes('sport')) themeKey = 'actions'
    else if (catLower.includes('color')) themeKey = 'colors'
  }

  const theme = CATEGORY_THEMES[themeKey] || CATEGORY_THEMES.default
  const emoji = mapping?.emoji || theme.defaultEmoji
  const fallbackImageUrl = rawImageUrl || mapping?.sampleImage

  return {
    emoji,
    bgGradient: theme.gradient,
    accentColor: theme.accent,
    badgeColor: theme.badge,
    lightBg: theme.lightBg,
    categoryTag: mapping?.category || categoryName,
    fallbackImageUrl,
  }
}

// Common dictionary for mapping English categories to bilingual formats
const CATEGORY_TRANSLATIONS: Record<string, { telugu: string; english: string }> = {
  animals: { telugu: 'జంతువులు', english: 'Animals' },
  pets: { telugu: 'పెంపుడు జంతువులు', english: 'Pets' },
  'wild animals': { telugu: 'అడవి జంతువులు', english: 'Wild Animals' },
  'farm animals': { telugu: 'వ్యవసాయ జంతువులు', english: 'Farm Animals' },
  'sea animals': { telugu: 'సముద్ర జీవులు', english: 'Sea Animals' },
  birds: { telugu: 'పక్షులు', english: 'Birds' },
  'insects and bugs': { telugu: 'కీటకాలు', english: 'Insects & Bugs' },
  fruits: { telugu: 'పండ్లు', english: 'Fruits' },
  vegetables: { telugu: 'కూరగాయలు', english: 'Vegetables' },
  food: { telugu: 'ఆహారం', english: 'Food' },
  drinks: { telugu: 'పానీయాలు', english: 'Drinks' },
  colors: { telugu: 'రంగులు', english: 'Colors' },
  numbers: { telugu: 'అంకెలు', english: 'Numbers' },
  shapes: { telugu: 'ఆకారాలు', english: 'Shapes' },
  'body parts': { telugu: 'శరీర భాగాలు', english: 'Body Parts' },
  'five senses': { telugu: 'పంచేంద్రియాలు', english: 'Five Senses' },
  family: { telugu: 'కుటుంబం', english: 'Family' },
  'clothing and accessories': { telugu: 'బట్టలు & దుస్తులు', english: 'Clothing' },
  vehicles: { telugu: 'వాహనాలు', english: 'Vehicles' },
  transport: { telugu: 'రవాణా', english: 'Transport' },
  school: { telugu: 'బడి / పాఠశాల', english: 'School' },
  'classroom objects': { telugu: 'తరగతి గది వస్తువులు', english: 'Classroom Objects' },
  'household objects': { telugu: 'ఇంటి వస్తువులు', english: 'Household Objects' },
  'kitchen items': { telugu: 'వంటగది వస్తువులు', english: 'Kitchen Items' },
  nature: { telugu: 'ప్రకృతి', english: 'Nature' },
  'plants and flowers': { telugu: 'మొక్కలు & పూలు', english: 'Plants & Flowers' },
  'trees and forests': { telugu: 'చెట్లు & అడవులు', english: 'Trees & Forests' },
  weather: { telugu: 'వాతావరణం', english: 'Weather' },
  seasons: { telugu: 'ఋతువులు', english: 'Seasons' },
  'days of the week': { telugu: 'వారంలోని రోజులు', english: 'Days of the Week' },
  'time of day': { telugu: 'సమయం', english: 'Time of Day' },
  'toys and games': { telugu: 'ఆటలు & బొమ్మలు', english: 'Toys & Games' },
  toys: { telugu: 'బొమ్మలు', english: 'Toys' },
  'games and sports': { telugu: 'ఆటలు', english: 'Games & Sports' },
  'music and instruments': { telugu: 'సంగీతం & వాయిద్యాలు', english: 'Music & Instruments' },
  'everyday actions': { telugu: 'నిత్య పనులు', english: 'Everyday Actions' },
  feelings: { telugu: 'భావాలు & అనుభూతులు', english: 'Feelings' },
  'social skills and manners': { telugu: 'మర్యాదలు & మంచి అలవాట్లు', english: 'Manners & Etiquette' },
  'alphabet and letters': { telugu: 'అక్షరాలు & వర్ణమాల', english: 'Alphabet & Letters' },
}

/**
 * Format any category name to display BOTH Telugu and English languages
 * Examples:
 *   "జంతువులు (Animals)" -> { telugu: "జంతువులు", english: "Animals", combined: "జంతువులు (Animals)" }
 *   "Animals"            -> { telugu: "జంతువులు", english: "Animals", combined: "జంతువులు (Animals)" }
 */
export function formatBilingualCategory(categoryName: string): {
  telugu: string
  english: string
  combined: string
} {
  if (!categoryName) return { telugu: '', english: '', combined: '' }

  const trimmed = categoryName.trim()

  // Case 1: Already contains parenthesized English: e.g. "జంతువులు (Animals)"
  const matchParen = trimmed.match(/^([^(]+)\s*\(([^)]+)\)$/)
  if (matchParen) {
    const part1 = matchParen[1].trim()
    const part2 = matchParen[2].trim()
    // Determine which is Telugu and which is English
    const part1HasTelugu = /[\u0C00-\u0C7F]/.test(part1)
    const telugu = part1HasTelugu ? part1 : part2
    const english = part1HasTelugu ? part2 : part1
    return {
      telugu,
      english,
      combined: `${telugu} (${english})`,
    }
  }

  // Case 2: Contains bullet separator: "జంతువులు • Animals"
  if (trimmed.includes('•')) {
    const parts = trimmed.split('•').map((p) => p.trim())
    const part1HasTelugu = /[\u0C00-\u0C7F]/.test(parts[0])
    const telugu = part1HasTelugu ? parts[0] : parts[1] || parts[0]
    const english = part1HasTelugu ? parts[1] || parts[0] : parts[0]
    return {
      telugu,
      english,
      combined: `${telugu} (${english})`,
    }
  }

  // Case 3: English or Telugu name lookup in dictionary
  const lower = trimmed.toLowerCase()
  const lookup = CATEGORY_TRANSLATIONS[lower]
  if (lookup) {
    return {
      telugu: lookup.telugu,
      english: lookup.english,
      combined: `${lookup.telugu} (${lookup.english})`,
    }
  }

  // Case 4: Pure Telugu name or Pure English without match
  if (/[\u0C00-\u0C7F]/.test(trimmed)) {
    return {
      telugu: trimmed,
      english: trimmed,
      combined: trimmed,
    }
  }

  return {
    telugu: trimmed,
    english: trimmed,
    combined: trimmed,
  }
}
