export type YearLevel = "all" | "y1" | "y2" | "y3" | "y4";

export interface YearMeta {
  id: YearLevel;
  label: string;
  short: string;
  ages: string;
  desc: string;
}

export const YEAR_LEVELS: YearMeta[] = [
  { id: "all", label: "All Years (Y1–Y4)", short: "All Y1–Y4", ages: "Ages 5–9", desc: "Full Primary PYP curriculum (Year 1 to Year 4)" },
  { id: "y1", label: "Year 1", short: "Year 1", ages: "Ages 5–6", desc: "Phonics A–Z, 3-letter words, numbers to 10, senses & family" },
  { id: "y2", label: "Year 2", short: "Year 2", ages: "Ages 6–7", desc: "4–5 letter words, short stories, numbers to 20, community & habitats" },
  { id: "y3", label: "Year 3", short: "Year 3", ages: "Ages 7–8", desc: "Theme vocabulary, multiplication, forces, matter & Qatar heritage" },
  { id: "y4", label: "Year 4", short: "Year 4", ages: "Ages 8–9", desc: "Inquiry vocabulary, multi-step math, ecosystems, energy & global citizenship" },
];

export type PypThemeId =
  | "who-we-are"
  | "where-we-are"
  | "express-ourselves"
  | "world-works"
  | "organize-ourselves"
  | "sharing-planet";

export interface VocabItem {
  word: string;
  emoji: string;
  year: "y1" | "y2" | "y3" | "y4";
  theme: PypThemeId;
  hint: string;
}

export interface SortItem {
  label: string;
  emoji: string;
  bucket: string;
}

export interface PypTheme {
  id: PypThemeId;
  number: number;
  title: string;
  emoji: string;
  color: string;
  bgLight: string;
  border: string;
  centralIdea: string;
  keyConcepts: string[];
  linesOfInquiry: string[];
  interactiveTitle: string;
  interactivePrompt: string;
  buckets: [string, string];
  sortItems: SortItem[];
}

export const LETTERS = [
  { l: "A", word: "Apple", emoji: "🍎", sound: "/a/", cue: "A is for Apple" },
  { l: "B", word: "Ball", emoji: "⚽", sound: "/b/", cue: "B is for Ball" },
  { l: "C", word: "Cat", emoji: "🐱", sound: "/k/", cue: "C is for Cat" },
  { l: "D", word: "Dog", emoji: "🐶", sound: "/d/", cue: "D is for Dog" },
  { l: "E", word: "Egg", emoji: "🥚", sound: "/e/", cue: "E is for Egg" },
  { l: "F", word: "Fish", emoji: "🐟", sound: "/f/", cue: "F is for Fish" },
  { l: "G", word: "Goat", emoji: "🐐", sound: "/g/", cue: "G is for Goat" },
  { l: "H", word: "Hat", emoji: "🎩", sound: "/h/", cue: "H is for Hat" },
  { l: "I", word: "Igloo", emoji: "🏠", sound: "/i/", cue: "I is for Igloo" },
  { l: "J", word: "Jam", emoji: "🍓", sound: "/j/", cue: "J is for Jam" },
  { l: "K", word: "Kite", emoji: "🪁", sound: "/k/", cue: "K is for Kite" },
  { l: "L", word: "Lion", emoji: "🦁", sound: "/l/", cue: "L is for Lion" },
  { l: "M", word: "Moon", emoji: "🌙", sound: "/m/", cue: "M is for Moon" },
  { l: "N", word: "Nest", emoji: "🪺", sound: "/n/", cue: "N is for Nest" },
  { l: "O", word: "Orange", emoji: "🍊", sound: "/o/", cue: "O is for Orange" },
  { l: "P", word: "Pig", emoji: "🐷", sound: "/p/", cue: "P is for Pig" },
  { l: "Q", word: "Queen", emoji: "👑", sound: "/kw/", cue: "Q is for Queen" },
  { l: "R", word: "Rain", emoji: "🌧️", sound: "/r/", cue: "R is for Rain" },
  { l: "S", word: "Sun", emoji: "☀️", sound: "/s/", cue: "S is for Sun" },
  { l: "T", word: "Tree", emoji: "🌳", sound: "/t/", cue: "T is for Tree" },
  { l: "U", word: "Umbrella", emoji: "☂️", sound: "/u/", cue: "U is for Umbrella" },
  { l: "V", word: "Van", emoji: "🚐", sound: "/v/", cue: "V is for Van" },
  { l: "W", word: "Water", emoji: "💧", sound: "/w/", cue: "W is for Water" },
  { l: "X", word: "Fox", emoji: "🦊", sound: "/ks/", cue: "X is at the end of Fox", ends: true },
  { l: "Y", word: "Yak", emoji: "🐃", sound: "/y/", cue: "Y is for Yak" },
  { l: "Z", word: "Zebra", emoji: "🦓", sound: "/z/", cue: "Z is for Zebra" },
];

export const PYP_THEMES: PypTheme[] = [
  {
    id: "who-we-are",
    number: 1,
    title: "Who We Are",
    emoji: "🧑‍🤝‍🧑",
    color: "#E11D48",
    bgLight: "#FFF1F2",
    border: "#FDA4AF",
    centralIdea: "Understanding our body, senses, feelings, and daily choices helps us grow into healthy, caring people.",
    keyConcepts: ["Identity", "Responsibility", "Wellbeing"],
    linesOfInquiry: [
      "Year 1: Our five senses, body parts, and naming our feelings",
      "Year 2: Family, friendships, and caring for our teeth and body",
      "Year 3: How organs work together and making balanced food choices",
      "Year 4: Personal identity, empathy, resilience, and human body systems",
    ],
    interactiveTitle: "Healthy Habits & Feelings Sort",
    interactivePrompt: "Sort each card into Healthy Body Habit or Understanding Feelings!",
    buckets: ["💪 Healthy Body", "💛 Feelings & Kindness"],
    sortItems: [
      { label: "Brush teeth", emoji: "🪥", bucket: "💪 Healthy Body" },
      { label: "Eat fresh fruit", emoji: "🍎", bucket: "💪 Healthy Body" },
      { label: "Sleep 9 hours", emoji: "😴", bucket: "💪 Healthy Body" },
      { label: "Drink water", emoji: "💧", bucket: "💪 Healthy Body" },
      { label: "Share with a friend", emoji: "🤝", bucket: "💛 Feelings & Kindness" },
      { label: "Take deep breaths", emoji: "🧘", bucket: "💛 Feelings & Kindness" },
      { label: "Say thank you", emoji: "😊", bucket: "💛 Feelings & Kindness" },
      { label: "Ask how someone feels", emoji: "💬", bucket: "💛 Feelings & Kindness" },
    ],
  },
  {
    id: "where-we-are",
    number: 2,
    title: "Where We Are in Place and Time",
    emoji: "🌍",
    color: "#D97706",
    bgLight: "#FFFBEB",
    border: "#FCD34D",
    centralIdea: "Homes, landmarks, and journeys connect our life in Qatar today with people in the past and around the world.",
    keyConcepts: ["Change", "Connection", "Perspective"],
    linesOfInquiry: [
      "Year 1: Types of homes and special places near us",
      "Year 2: Maps, directions, and landmarks in Qatar and the world",
      "Year 3: How transport and daily life changed from past to present",
      "Year 4: Pearl diving heritage, exploration, and how geography shapes communities",
    ],
    interactiveTitle: "Past & Present Timeline Sort (Qatar & World)",
    interactivePrompt: "Does this belong to Long Ago (Past) or Modern Life (Present)?",
    buckets: ["🏺 Long Ago (Past)", "🚀 Today (Present)"],
    sortItems: [
      { label: "Wooden pearl dhow", emoji: "⛵", bucket: "🏺 Long Ago (Past)" },
      { label: "Desert hair tent", emoji: "⛺", bucket: "🏺 Long Ago (Past)" },
      { label: "Camel caravan", emoji: "🐪", bucket: "🏺 Long Ago (Past)" },
      { label: "Oil lantern", emoji: "🪔", bucket: "🏺 Long Ago (Past)" },
      { label: "Doha Metro train", emoji: "🚆", bucket: "🚀 Today (Present)" },
      { label: "Solar glass tower", emoji: "🏙️", bucket: "🚀 Today (Present)" },
      { label: "Passenger jet", emoji: "✈️", bucket: "🚀 Today (Present)" },
      { label: "Digital tablet map", emoji: "📱", bucket: "🚀 Today (Present)" },
    ],
  },
  {
    id: "express-ourselves",
    number: 3,
    title: "How We Express Ourselves",
    emoji: "🎨",
    color: "#7C3AED",
    bgLight: "#F5F3FF",
    border: "#C4B5FD",
    centralIdea: "People use stories, art, music, rhyme, and color to share ideas, culture, and imagination.",
    keyConcepts: ["Form", "Function", "Perspective"],
    linesOfInquiry: [
      "Year 1: Colors, shapes, sounds, and acting out picture stories",
      "Year 2: Rhyming words, musical rhythms, and folktales",
      "Year 3: How authors and artists communicate mood and messages",
      "Year 4: Cultural storytelling, poetry, visual media, and creative expression",
    ],
    interactiveTitle: "Story, Visual Art & Music Sort",
    interactivePrompt: "Sort each way we express ourselves into Words & Stories or Visual Art & Music!",
    buckets: ["📖 Words & Stories", "🎶 Art & Music"],
    sortItems: [
      { label: "Rhyming poem", emoji: "📝", bucket: "📖 Words & Stories" },
      { label: "Folktale book", emoji: "📚", bucket: "📖 Words & Stories" },
      { label: "Comic speech bubble", emoji: "💭", bucket: "📖 Words & Stories" },
      { label: "Puppet dialogue", emoji: "🎭", bucket: "📖 Words & Stories" },
      { label: "Watercolor painting", emoji: "🎨", bucket: "🎶 Art & Music" },
      { label: "Rhythm drumbeat", emoji: "🥁", bucket: "🎶 Art & Music" },
      { label: "Clay sculpture", emoji: "🏺", bucket: "🎶 Art & Music" },
      { label: "Piano melody", emoji: "🎹", bucket: "🎶 Art & Music" },
    ],
  },
  {
    id: "world-works",
    number: 4,
    title: "How the World Works",
    emoji: "🔬",
    color: "#0284C7",
    bgLight: "#F0F9FF",
    border: "#7DD3FC",
    centralIdea: "Observing weather, plants, materials, and forces helps us understand the laws of the natural world.",
    keyConcepts: ["Causation", "Change", "Form"],
    linesOfInquiry: [
      "Year 1: Day and night, sunny and rainy weather, and growing seeds",
      "Year 2: Plant parts (roots, stem, leaves) and animal life cycles",
      "Year 3: States of matter (solid, liquid, gas) and push/pull forces",
      "Year 4: The water cycle, magnetism, light & shadows, and Earth in space",
    ],
    interactiveTitle: "Science Lab: States of Matter & Forces",
    interactivePrompt: "Sort each item into Solid Matter or Liquid & Weather!",
    buckets: ["🧊 Solid Object", "💧 Liquid & Weather"],
    sortItems: [
      { label: "Wooden block", emoji: "🧱", bucket: "🧊 Solid Object" },
      { label: "Iron magnet", emoji: "🧲", bucket: "🧊 Solid Object" },
      { label: "Granite rock", emoji: "🪨", bucket: "🧊 Solid Object" },
      { label: "Glass marble", emoji: "🔮", bucket: "🧊 Solid Object" },
      { label: "Raindrops falling", emoji: "🌧️", bucket: "💧 Liquid & Weather" },
      { label: "Fresh orange juice", emoji: "🧃", bucket: "💧 Liquid & Weather" },
      { label: "Ocean waves", emoji: "🌊", bucket: "💧 Liquid & Weather" },
      { label: "Morning dew", emoji: "💧", bucket: "💧 Liquid & Weather" },
    ],
  },
  {
    id: "organize-ourselves",
    number: 5,
    title: "How We Organize Ourselves",
    emoji: "🏫",
    color: "#0D9488",
    bgLight: "#F0FDFA",
    border: "#5EEAD4",
    centralIdea: "Communities create schools, jobs, rules, transport, and number systems so people can work together.",
    keyConcepts: ["Function", "Connection", "Responsibility"],
    linesOfInquiry: [
      "Year 1: Classroom rules, taking turns, and people who help at school",
      "Year 2: Community helpers (firefighter, doctor, chef) and counting coins",
      "Year 3: How food and goods travel from farms to markets",
      "Year 4: Public systems, teamwork, budgeting, and responsible citizenship",
    ],
    interactiveTitle: "Community Helpers & Systems Sort",
    interactivePrompt: "Does this belong to Health & Safety Helpers or Learning & Transport?",
    buckets: ["🚒 Safety & Health", "🚌 School & Transport"],
    sortItems: [
      { label: "Firefighter & hose", emoji: "🚒", bucket: "🚒 Safety & Health" },
      { label: "Doctor & stethoscope", emoji: "🩺", bucket: "🚒 Safety & Health" },
      { label: "Paramedic ambulance", emoji: "🚑", bucket: "🚒 Safety & Health" },
      { label: "Traffic crossing guard", emoji: "🛑", bucket: "🚒 Safety & Health" },
      { label: "School teacher", emoji: "👩‍🏫", bucket: "🚌 School & Transport" },
      { label: "Library books", emoji: "📖", bucket: "🚌 School & Transport" },
      { label: "School bus route", emoji: "🚌", bucket: "🚌 School & Transport" },
      { label: "Airport pilot", emoji: "✈️", bucket: "🚌 School & Transport" },
    ],
  },
  {
    id: "sharing-planet",
    number: 6,
    title: "Sharing the Planet",
    emoji: "🌱",
    color: "#16A34A",
    bgLight: "#F0FDF4",
    border: "#86EFAC",
    centralIdea: "Living things share finite resources and habitats, so every action we take affects Earth's future.",
    keyConcepts: ["Responsibility", "Causation", "Connection"],
    linesOfInquiry: [
      "Year 1: Caring for pets, plants, and keeping our classroom clean",
      "Year 2: Recycling paper, plastic, and saving water at home",
      "Year 3: Desert, ocean, polar, and forest habitats and food chains",
      "Year 4: Protecting endangered species (like the Arabian Oryx), clean energy, and peace",
    ],
    interactiveTitle: "Eco-Action & Habitat Guardian Sort",
    interactivePrompt: "Sort each action into Recycle & Save Resources or Protect Animal Habitats!",
    buckets: ["♻️ Recycle & Save", "🦌 Animal Habitats"],
    sortItems: [
      { label: "Recycle plastic bottles", emoji: "🧴", bucket: "♻️ Recycle & Save" },
      { label: "Turn off water tap", emoji: "🚰", bucket: "♻️ Recycle & Save" },
      { label: "Use cloth shopping bag", emoji: "🛍️", bucket: "♻️ Recycle & Save" },
      { label: "Use solar power", emoji: "☀️", bucket: "♻️ Recycle & Save" },
      { label: "Arabian Oryx in desert", emoji: "🦌", bucket: "🦌 Animal Habitats" },
      { label: "Polar bear on sea ice", emoji: "🐻‍❄️", bucket: "🦌 Animal Habitats" },
      { label: "Sea turtle in coral reef", emoji: "🐢", bucket: "🦌 Animal Habitats" },
      { label: "Plant mangrove trees", emoji: "🌳", bucket: "🦌 Animal Habitats" },
    ],
  },
];

export const VOCABULARY: VocabItem[] = [
  // Original 10 CVC words (Year 1)
  { word: "cat", emoji: "🐱", year: "y1", theme: "sharing-planet", hint: "A furry pet that says meow" },
  { word: "dog", emoji: "🐶", year: "y1", theme: "who-we-are", hint: "A friendly pet that barks" },
  { word: "sun", emoji: "☀️", year: "y1", theme: "world-works", hint: "Shines bright in the daytime sky" },
  { word: "bed", emoji: "🛏️", year: "y1", theme: "who-we-are", hint: "Where we sleep at night" },
  { word: "hat", emoji: "🎩", year: "y1", theme: "express-ourselves", hint: "We wear it on our head" },
  { word: "cup", emoji: "☕", year: "y1", theme: "where-we-are", hint: "We drink water or tea from it" },
  { word: "bus", emoji: "🚌", year: "y1", theme: "organize-ourselves", hint: "Takes children to school" },
  { word: "fan", emoji: "🪭", year: "y1", theme: "world-works", hint: "Moves air to cool us down" },
  { word: "pig", emoji: "🐷", year: "y1", theme: "sharing-planet", hint: "A pink farm animal" },
  { word: "box", emoji: "📦", year: "y1", theme: "organize-ourselves", hint: "Ends with letter x; holds toys" },

  // Year 1 additional across PYP themes
  { word: "eye", emoji: "👁️", year: "y1", theme: "who-we-are", hint: "Body part we use to see" },
  { word: "ear", emoji: "👂", year: "y1", theme: "who-we-are", hint: "Body part we use to hear" },
  { word: "map", emoji: "🗺️", year: "y1", theme: "where-we-are", hint: "Shows where places are" },
  { word: "red", emoji: "🔴", year: "y1", theme: "express-ourselves", hint: "The color of aripe strawberry" },
  { word: "bin", emoji: "🗑️", year: "y1", theme: "sharing-planet", hint: "Put litter and recycling inside" },

  // Year 2 (Ages 6–7)
  { word: "hand", emoji: "✋", year: "y2", theme: "who-we-are", hint: "We wave, write, and hold with it" },
  { word: "smile", emoji: "😊", year: "y2", theme: "who-we-are", hint: "Shows we are happy and friendly" },
  { word: "home", emoji: "🏠", year: "y2", theme: "where-we-are", hint: "Where a family lives together" },
  { word: "tent", emoji: "⛺", year: "y2", theme: "where-we-are", hint: "A shelter used in the desert" },
  { word: "dhow", emoji: "⛵", year: "y2", theme: "where-we-are", hint: "Traditional wooden boat of Qatar" },
  { word: "song", emoji: "🎵", year: "y2", theme: "express-ourselves", hint: "Words and music we sing aloud" },
  { word: "book", emoji: "📖", year: "y2", theme: "express-ourselves", hint: "Pages full of stories to read" },
  { word: "drum", emoji: "🥁", year: "y2", theme: "express-ourselves", hint: "Tap it to play a musical beat" },
  { word: "rain", emoji: "🌧️", year: "y2", theme: "world-works", hint: "Water drops falling from clouds" },
  { word: "seed", emoji: "🌱", year: "y2", theme: "world-works", hint: "Plant it in soil to grow a flower" },
  { word: "leaf", emoji: "🍃", year: "y2", theme: "world-works", hint: "Green part of a plant that catches sunlight" },
  { word: "shop", emoji: "🏪", year: "y2", theme: "organize-ourselves", hint: "A place where people buy food or clothes" },
  { word: "coin", emoji: "🪙", year: "y2", theme: "organize-ourselves", hint: "Round metal money we count" },
  { word: "chef", emoji: "👩‍🍳", year: "y2", theme: "organize-ourselves", hint: "Community helper who cooks meals" },
  { word: "tree", emoji: "🌳", year: "y2", theme: "sharing-planet", hint: "Tall plant with a trunk and branches" },
  { word: "fish", emoji: "🐟", year: "y2", theme: "sharing-planet", hint: "Swims in the sea and breathes with gills" },

  // Year 3 (Ages 7–8)
  { word: "heart", emoji: "❤️", year: "y3", theme: "who-we-are", hint: "Organ that pumps blood through your body" },
  { word: "brain", emoji: "🧠", year: "y3", theme: "who-we-are", hint: "Helps you think, learn, and remember" },
  { word: "camel", emoji: "🐪", year: "y3", theme: "where-we-are", hint: "Desert animal called the ship of the desert" },
  { word: "globe", emoji: "🌍", year: "y3", theme: "where-we-are", hint: "A round model of planet Earth" },
  { word: "qatar", emoji: "🇶🇦", year: "y3", theme: "where-we-are", hint: "Our country on the Arabian Gulf" },
  { word: "story", emoji: "📚", year: "y3", theme: "express-ourselves", hint: "Has characters, setting, and plot" },
  { word: "paint", emoji: "🎨", year: "y3", theme: "express-ourselves", hint: "Colorful liquid used with a brush" },
  { word: "cloud", emoji: "☁️", year: "y3", theme: "world-works", hint: "Floats in the sky and holds water droplets" },
  { word: "roots", emoji: "🌿", year: "y3", theme: "world-works", hint: "Take in water for a plant from the soil" },
  { word: "solid", emoji: "🧊", year: "y3", theme: "world-works", hint: "Matter that keeps its own shape, like ice" },
  { word: "nurse", emoji: "🩺", year: "y3", theme: "organize-ourselves", hint: "Cares for patients at the hospital" },
  { word: "train", emoji: "🚆", year: "y3", theme: "organize-ourselves", hint: "Fast transport that runs on tracks" },
  { word: "water", emoji: "💧", year: "y3", theme: "sharing-planet", hint: "Precious liquid every living thing needs" },
  { word: "ocean", emoji: "🌊", year: "y3", theme: "sharing-planet", hint: "Huge salt-water habitat covering Earth" },
  { word: "oryx", emoji: "🦌", year: "y3", theme: "sharing-planet", hint: "National animal of Qatar living in the desert" },

  // Year 4 (Ages 8–9)
  { word: "health", emoji: "🥗", year: "y4", theme: "who-we-are", hint: "Keeping body and mind strong and balanced" },
  { word: "senses", emoji: "👀", year: "y4", theme: "who-we-are", hint: "Sight, hearing, smell, taste, and touch" },
  { word: "museum", emoji: "🏛️", year: "y4", theme: "where-we-are", hint: "Building that preserves history and art" },
  { word: "compass", emoji: "🧭", year: "y4", theme: "where-we-are", hint: "Tool showing North, South, East, and West" },
  { word: "rhythm", emoji: "🎶", year: "y4", theme: "express-ourselves", hint: "Pattern of beats in music and poetry" },
  { word: "author", emoji: "✍️", year: "y4", theme: "express-ourselves", hint: "Person who writes books and stories" },
  { word: "magnet", emoji: "🧲", year: "y4", theme: "world-works", hint: "Pulls iron and steel without touching" },
  { word: "shadow", emoji: "🕶️", year: "y4", theme: "world-works", hint: "Dark shape made when an object blocks light" },
  { word: "market", emoji: "🛒", year: "y4", theme: "organize-ourselves", hint: "Place where buyers and sellers trade goods" },
  { word: "school", emoji: "🏫", year: "y4", theme: "organize-ourselves", hint: "Community where students and teachers learn" },
  { word: "forest", emoji: "🌲", year: "y4", theme: "sharing-planet", hint: "Woodland habitat rich with trees and wildlife" },
  { word: "planet", emoji: "🪐", year: "y4", theme: "sharing-planet", hint: "A world like Earth that orbits a star" },
];

export interface StoryItem {
  id: string;
  title: string;
  emoji: string;
  year: "y1" | "y2" | "y3" | "y4";
  theme: PypThemeId;
  bg: string;
  lines: string[];
  drills: { q: string; options: string[]; answer: string }[];
}

export const STORIES: StoryItem[] = [
  {
    id: "sam",
    title: "Sam the Cat",
    emoji: "🐱🎩",
    year: "y1",
    theme: "express-ourselves",
    bg: "#FEF3C7",
    lines: [
      "Sam is a cat.",
      "Sam has a red hat.",
      "Sam sat on a mat.",
      "Sam is happy!",
    ],
    drills: [
      { q: "What does Sam have?", options: ["a red hat", "a big box", "a kite"], answer: "a red hat" },
      { q: "Where did Sam sit?", options: ["on a mat", "in a van", "on a bus"], answer: "on a mat" },
    ],
  },
  {
    id: "sunny",
    title: "A Sunny Day",
    emoji: "☀️🐶",
    year: "y1",
    theme: "who-we-are",
    bg: "#E0F2FE",
    lines: [
      "The sun is up.",
      "A dog runs in the park.",
      "A kid plays with a ball.",
      "It is so much fun!",
    ],
    drills: [
      { q: "What is up in the sky?", options: ["the sun", "the moon", "a van"], answer: "the sun" },
      { q: "What does the kid play with?", options: ["a ball", "a hat", "an egg"], answer: "a ball" },
    ],
  },
  {
    id: "pip",
    title: "Pip the Pig",
    emoji: "🐷📦",
    year: "y2",
    theme: "sharing-planet",
    bg: "#FCE7F3",
    lines: [
      "Pip is a pig.",
      "Pip has a big box.",
      "Pip hops to the pond.",
      "Pip naps in the mud!",
    ],
    drills: [
      { q: "What does Pip have?", options: ["a big box", "a red hat", "a kite"], answer: "a big box" },
      { q: "Where does Pip nap?", options: ["in the mud", "on a mat", "in a van"], answer: "in the mud" },
    ],
  },
  {
    id: "dhow",
    title: "Noor's Dhow Boat in Qatar",
    emoji: "⛵🇶🇦",
    year: "y2",
    theme: "where-we-are",
    bg: "#FEF9C3",
    lines: [
      "Noor walks along the Doha Corniche with her grandfather.",
      "They see a wooden dhow boat sailing on the blue sea.",
      "Long ago, divers sailed on dhows to look for shiny pearls.",
      "Today, dhows remind us of Qatar's proud history!",
    ],
    drills: [
      { q: "Where does Noor walk with her grandfather?", options: ["Along the Doha Corniche", "In the cold Arctic", "Inside a cave"], answer: "Along the Doha Corniche" },
      { q: "What did divers look for long ago?", options: ["Shiny pearls", "Snowflakes", "Plastic toys"], answer: "Shiny pearls" },
    ],
  },
  {
    id: "seed",
    title: "The Little Seed's Journey",
    emoji: "🌱🌧️",
    year: "y3",
    theme: "world-works",
    bg: "#DCFCE7",
    lines: [
      "A tiny brown seed rests under the warm soil.",
      "Rain clouds bring cool water to the garden.",
      "First, the roots grow down to drink water from the earth.",
      "Next, green leaves reach up toward the bright sun!",
    ],
    drills: [
      { q: "Which part of the plant grows down first to drink water?", options: ["The roots", "The flower petals", "The clouds"], answer: "The roots" },
      { q: "What do the green leaves reach up toward?", options: ["The bright sun", "The dark cave", "A wooden box"], answer: "The bright sun" },
    ],
  },
  {
    id: "helpers",
    title: "Helpers in Our Town",
    emoji: "🚒👩‍🏫",
    year: "y3",
    theme: "organize-ourselves",
    bg: "#CCFBF1",
    lines: [
      "Every morning, people in our community work together.",
      "The bus driver brings children safely to school.",
      "Teachers help students read, count, and ask big questions.",
      "Firefighters and doctors stay ready to keep everyone safe!",
    ],
    drills: [
      { q: "Who brings children safely to school on the road?", options: ["The bus driver", "A polar bear", "A pearl diver"], answer: "The bus driver" },
      { q: "How do people in a community succeed?", options: ["By working together", "By hiding all day", "By breaking rules"], answer: "By working together" },
    ],
  },
  {
    id: "oryx",
    title: "Guardians of the Desert Oryx",
    emoji: "🦌🏜️",
    year: "y4",
    theme: "sharing-planet",
    bg: "#FFEDD5",
    lines: [
      "The Arabian Oryx has long straight horns and a white coat.",
      "Its white fur reflects the hot desert sun during the day.",
      "Once, the Oryx was endangered and almost disappeared.",
      "Because people protected its desert habitat, the Oryx thrives in Qatar today!",
    ],
    drills: [
      { q: "How does the Oryx's white coat help it in the desert?", options: ["It reflects the hot sun", "It helps it swim deep underwater", "It turns into ice"], answer: "It reflects the hot sun" },
      { q: "Why does the Arabian Oryx thrive today?", options: ["People protected its habitat", "It moved to the moon", "It stopped eating plants"], answer: "People protected its habitat" },
    ],
  },
  {
    id: "watercycle",
    title: "TheGreat Water Cycle",
    emoji: "🌊☁️",
    year: "y4",
    theme: "world-works",
    bg: "#E0E7FF",
    lines: [
      "The warm sun heats the water in oceans and rivers.",
      "Water rises into the air as invisible vapor called evaporation.",
      "High in the cool sky, vapor forms clouds through condensation.",
      "When the clouds grow heavy, rain falls back to Earth!",
    ],
    drills: [
      { q: "What heats the water in oceans and rivers?", options: ["The warm sun", "A flashlight", "The moon"], answer: "The warm sun" },
      { q: "What happens when water vapor cools high in the sky?", options: ["It forms clouds", "It turns into rocks", "It disappears forever"], answer: "It forms clouds" },
    ],
  },
];

export interface ScienceQuestion {
  id: string;
  emoji: string;
  year: "y1" | "y2" | "y3" | "y4";
  theme: PypThemeId;
  q: string;
  options: string[];
  answer: string;
}

export const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  // Original 8 Science/Social questions preserved + tagged by Year & PYP Theme
  {
    id: "roots",
    emoji: "🌱🌿",
    year: "y2",
    theme: "world-works",
    q: "Which part of the plant takes in water from the soil?",
    options: ["Roots", "Leaves", "Flower"],
    answer: "Roots",
  },
  {
    id: "polarbear",
    emoji: "🐻‍❄️🧊",
    year: "y2",
    theme: "sharing-planet",
    q: "Where does the polar bear live?",
    options: ["Cold Arctic ice", "Hot desert", "Deep ocean"],
    answer: "Cold Arctic ice",
  },
  {
    id: "raincloud",
    emoji: "🌧️☁️",
    year: "y1",
    theme: "world-works",
    q: "What falls from rain clouds?",
    options: ["Rain", "Sand", "Leaves"],
    answer: "Rain",
  },
  {
    id: "sun",
    emoji: "☀️✨",
    year: "y3",
    theme: "world-works",
    q: "The Sun in our sky is a…",
    options: ["Star", "Planet", "Moon"],
    answer: "Star",
  },
  {
    id: "heart",
    emoji: "❤️🩺",
    year: "y3",
    theme: "who-we-are",
    q: "Which organ pumps blood around your body?",
    options: ["Heart", "Brain", "Lungs"],
    answer: "Heart",
  },
  {
    id: "globe",
    emoji: "🌍🗺️",
    year: "y2",
    theme: "where-we-are",
    q: "What do we call a round model of the Earth?",
    options: ["Globe", "Clock", "Box"],
    answer: "Globe",
  },
  {
    id: "firefighter",
    emoji: "🚒🧑‍🚒",
    year: "y1",
    theme: "organize-ourselves",
    q: "Who helps put out fires in our community?",
    options: ["Firefighter", "Teacher", "Chef"],
    answer: "Firefighter",
  },
  {
    id: "recycle",
    emoji: "♻️🧴",
    year: "y1",
    theme: "sharing-planet",
    q: "What should we do with bottles and paper?",
    options: ["Recycle them", "Throw in the river", "Burn them"],
    answer: "Recycle them",
  },
  // Additional Year 1–Year 4 PYP Inquiry questions across all 6 themes
  {
    id: "senses-eyes",
    emoji: "👀🔭",
    year: "y1",
    theme: "who-we-are",
    q: "Which sense do our eyes give us?",
    options: ["Sight", "Hearing", "Taste"],
    answer: "Sight",
  },
  {
    id: "feelings-kind",
    emoji: "🤝😊",
    year: "y1",
    theme: "who-we-are",
    q: "If a classmate feels sad, what is a caring choice?",
    options: ["Ask if they want to play", "Take their pencil", "Laugh at them"],
    answer: "Ask if they want to play",
  },
  {
    id: "home-shelter",
    emoji: "🏠🌧️",
    year: "y1",
    theme: "where-we-are",
    q: "Why do people all over the world build homes?",
    options: ["For shelter and safety", "To fly in the sky", "To make rain"],
    answer: "For shelter and safety",
  },
  {
    id: "express-colors",
    emoji: "🎨🟡🔵",
    year: "y1",
    theme: "express-ourselves",
    q: "When you mix yellow paint and blue paint, which color do you make?",
    options: ["Green", "Purple", "Black"],
    answer: "Green",
  },
  {
    id: "teeth-brush",
    emoji: "🪥🦷",
    year: "y2",
    theme: "who-we-are",
    q: "How often should we brush our teeth to keep them healthy?",
    options: ["Morning and night every day", "Once a month", "Only on weekends"],
    answer: "Morning and night every day",
  },
  {
    id: "qatar-dhow",
    emoji: "⛵🇶🇦",
    year: "y2",
    theme: "where-we-are",
    q: "What is a traditional wooden sailing boat in Qatar called?",
    options: ["A Dhow", "A Subway", "A Rocket"],
    answer: "A Dhow",
  },
  {
    id: "story-author",
    emoji: "📖✍️",
    year: "y2",
    theme: "express-ourselves",
    q: "What do we call the person who draws the pictures in a story book?",
    options: ["Illustrator", "Pilot", "Dentist"],
    answer: "Illustrator",
  },
  {
    id: "community-rules",
    emoji: "🚦🏫",
    year: "y2",
    theme: "organize-ourselves",
    q: "Why do schools and roads have rules?",
    options: ["To keep everyone safe and fair", "To make people late", "So nobody can play"],
    answer: "To keep everyone safe and fair",
  },
  {
    id: "lungs-breathe",
    emoji: "🫁🌬️",
    year: "y3",
    theme: "who-we-are",
    q: "Which organs inside your chest fill with air when you breathe in?",
    options: ["Lungs", "Stomach", "Bones"],
    answer: "Lungs",
  },
  {
    id: "compass-north",
    emoji: "🧭🗺️",
    year: "y3",
    theme: "where-we-are",
    q: "Which tool helps travelers find North, South, East, and West?",
    options: ["A compass", "A thermometer", "A ruler"],
    answer: "A compass",
  },
  {
    id: "matter-ice",
    emoji: "🧊☀️",
    year: "y3",
    theme: "world-works",
    q: "When solid ice warms up in the sun, what does it change into?",
    options: ["Liquid water", "Solid rock", "Metal"],
    answer: "Liquid water",
  },
  {
    id: "oryx-habitat",
    emoji: "🦌🏜️",
    year: "y3",
    theme: "sharing-planet",
    q: "Which habitat is the natural home of the Arabian Oryx?",
    options: ["The desert", "Frozen tundra", "Coral reef"],
    answer: "The desert",
  },
  {
    id: "nutrition-balanced",
    emoji: "🥗🍎",
    year: "y4",
    theme: "who-we-are",
    q: "Why does our body need a balanced diet of vegetables, protein, and grains?",
    options: ["For energy, growth, and repair", "So we never have to sleep", "To breathe underwater"],
    answer: "For energy, growth, and repair",
  },
  {
    id: "express-folktale",
    emoji: "🎭📜",
    year: "y4",
    theme: "express-ourselves",
    q: "Why have cultures passed down folktales from grandparents to children?",
    options: ["To share wisdom, values, and heritage", "To hide history", "To count coins"],
    answer: "To share wisdom, values, and heritage",
  },
  {
    id: "forces-gravity",
    emoji: "🍎🌍",
    year: "y4",
    theme: "world-works",
    q: "Which invisible force pulls a dropped ball down toward the Earth?",
    options: ["Gravity", "Magnetism", "Echo"],
    answer: "Gravity",
  },
  {
    id: "renewable-solar",
    emoji: "☀️🔋",
    year: "y4",
    theme: "sharing-planet",
    q: "Why is solar power called a clean, renewable energy source?",
    options: ["Sunlight won't run out and doesn't pollute the air", "It only works underground", "It burns coal"],
    answer: "Sunlight won't run out and doesn't pollute the air",
  },
];

export const AVATARS = [
  { id: "bunny", emoji: "🐰", label: "Bunny" },
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "oryx", emoji: "🦌", label: "Oryx" },
  { id: "falcon", emoji: "🦅", label: "Falcon" },
];

export const COLORING_SHAPES = [
  { id: "star", emoji: "⭐", label: "Star", theme: "express-ourselves" },
  { id: "heart", emoji: "❤️", label: "Heart", theme: "who-we-are" },
  { id: "flower", emoji: "🌸", label: "Flower", theme: "world-works" },
  { id: "fish", emoji: "🐠", label: "Fish", theme: "sharing-planet" },
  { id: "earth", emoji: "🌍", label: "Earth", theme: "sharing-planet" },
  { id: "dhow", emoji: "⛵", label: "Qatar Dhow", theme: "where-we-are" },
  { id: "school", emoji: "🏫", label: "School", theme: "organize-ourselves" },
  { id: "oryx", emoji: "🦌", label: "Desert Oryx", theme: "sharing-planet" },
];

export const WORDS = VOCABULARY;

export interface MathQuestion {
  id: string;
  year: "y1" | "y2" | "y3" | "y4";
  kind: "count" | "sum" | "sub" | "mul" | "word";
  emoji?: string;
  count?: number;
  prompt: string;
  say: string;
  options: number[];
  answer: number;
}

export const MATH_QUESTIONS: MathQuestion[] = [
  // Year 1 (Ages 5–6): Counting & addition/subtraction within 10
  { id: "m-y1-1", year: "y1", kind: "count", emoji: "🍎", count: 5, prompt: "How many 🍎 apples do you see?", say: "How many apples do you see?", options: [4, 5, 6, 7], answer: 5 },
  { id: "m-y1-2", year: "y1", kind: "count", emoji: "⭐", count: 7, prompt: "Count the ⭐ stars!", say: "Count the stars!", options: [5, 6, 7, 8], answer: 7 },
  { id: "m-y1-3", year: "y1", kind: "sum", prompt: "3 + 4 = ?", say: "3 plus 4 equals what?", options: [6, 7, 8, 9], answer: 7 },
  { id: "m-y1-4", year: "y1", kind: "sum", prompt: "5 + 3 = ?", say: "5 plus 3 equals what?", options: [7, 8, 9, 10], answer: 8 },
  { id: "m-y1-5", year: "y1", kind: "sub", prompt: "6 − 2 = ?", say: "6 take away 2 equals what?", options: [3, 4, 5, 6], answer: 4 },
  // Year 2 (Ages 6–7): Numbers to 20 & community coins
  { id: "m-y2-1", year: "y2", kind: "count", emoji: "🐟", count: 9, prompt: "How many 🐟 fish are swimming?", say: "How many fish are swimming?", options: [8, 9, 10, 11], answer: 9 },
  { id: "m-y2-2", year: "y2", kind: "sum", prompt: "8 + 6 = ?", say: "8 plus 6 equals what?", options: [12, 13, 14, 15], answer: 14 },
  { id: "m-y2-3", year: "y2", kind: "sum", prompt: "11 + 7 = ?", say: "11 plus 7 equals what?", options: [16, 17, 18, 19], answer: 18 },
  { id: "m-y2-4", year: "y2", kind: "sub", prompt: "15 − 6 = ?", say: "15 minus 6 equals what?", options: [7, 8, 9, 10], answer: 9 },
  { id: "m-y2-5", year: "y2", kind: "word", prompt: "Omar has 10 coins 🪙 and earns 5 more. How many coins in all?", say: "Omar has 10 coins and earns 5 more. How many coins in all?", options: [13, 14, 15, 16], answer: 15 },
  // Year 3 (Ages 7–8): Multiplication & 2-digit numbers
  { id: "m-y3-1", year: "y3", kind: "mul", prompt: "3 × 4 = ?", say: "3 times 4 equals what?", options: [10, 12, 14, 16], answer: 12 },
  { id: "m-y3-2", year: "y3", kind: "mul", prompt: "5 × 6 = ?", say: "5 times 6 equals what?", options: [25, 30, 35, 40], answer: 30 },
  { id: "m-y3-3", year: "y3", kind: "sum", prompt: "24 + 15 = ?", say: "24 plus 15 equals what?", options: [37, 38, 39, 41], answer: 39 },
  { id: "m-y3-4", year: "y3", kind: "sub", prompt: "32 − 14 = ?", say: "32 minus 14 equals what?", options: [16, 18, 20, 22], answer: 18 },
  { id: "m-y3-5", year: "y3", kind: "word", prompt: "4 dhow boats each carry 5 pearl divers ⛵. How many divers in total?", say: "4 dhow boats each carry 5 pearl divers. How many divers in total?", options: [15, 20, 25, 30], answer: 20 },
  // Year 4 (Ages 8–9): Multi-step inquiry math, multiplication & division
  { id: "m-y4-1", year: "y4", kind: "mul", prompt: "7 × 8 = ?", say: "7 times 8 equals what?", options: [48, 54, 56, 64], answer: 56 },
  { id: "m-y4-2", year: "y4", kind: "mul", prompt: "9 × 6 = ?", say: "9 times 6 equals what?", options: [45, 52, 54, 63], answer: 54 },
  { id: "m-y4-3", year: "y4", kind: "sum", prompt: "45 + 38 = ?", say: "45 plus 38 equals what?", options: [73, 81, 83, 85], answer: 83 },
  { id: "m-y4-4", year: "y4", kind: "word", prompt: "A school plants 6 rows of 6 mangrove trees 🌳. How many trees are planted?", say: "A school plants 6 rows of 6 mangrove trees. How many trees are planted?", options: [30, 32, 36, 42], answer: 36 },
  { id: "m-y4-5", year: "y4", kind: "word", prompt: "Zaid recycles 48 bottles ♻️ into 6 equal bins. How many bottles in each bin?", say: "Zaid recycles 48 bottles into 6 equal bins. How many bottles in each bin?", options: [6, 7, 8, 9], answer: 8 },
];
