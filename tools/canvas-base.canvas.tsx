import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useGrokTheme,
} from "grok/canvas";
import type { CSSProperties, ChangeEvent, PointerEvent } from "grok/canvas";

type YearLevel = "all" | "y1" | "y2" | "y3" | "y4";
type PypThemeId =
  | "who-we-are"
  | "where-we-are"
  | "express-ourselves"
  | "world-works"
  | "organize-ourselves"
  | "sharing-planet";

interface YearMeta {
  id: YearLevel;
  label: string;
  ages: string;
  desc: string;
}

const YEAR_LEVELS: YearMeta[] = [
  { id: "all", label: "All Years (Y1–Y4)", ages: "Ages 5–9", desc: "Full Primary PYP curriculum (Year 1 to Year 4)" },
  { id: "y1", label: "Year 1", ages: "Ages 5–6", desc: "Phonics A–Z, 3-letter words, numbers to 10, senses & family" },
  { id: "y2", label: "Year 2", ages: "Ages 6–7", desc: "4–5 letter words, short stories, numbers to 20, community & habitats" },
  { id: "y3", label: "Year 3", ages: "Ages 7–8", desc: "Theme vocabulary, multiplication, forces, matter & Qatar heritage" },
  { id: "y4", label: "Year 4", ages: "Ages 8–9", desc: "Inquiry vocabulary, multi-step math, ecosystems, energy & global citizenship" },
];

interface LetterItem {
  l: string;
  word: string;
  emoji: string;
  sound: string;
  cue: string;
}

const LETTERS: LetterItem[] = [
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
  { l: "X", word: "Fox", emoji: "🦊", sound: "/ks/", cue: "X is at the end of Fox" },
  { l: "Y", word: "Yak", emoji: "🐃", sound: "/y/", cue: "Y is for Yak" },
  { l: "Z", word: "Zebra", emoji: "🦓", sound: "/z/", cue: "Z is for Zebra" },
];

interface SortItem {
  label: string;
  emoji: string;
  bucket: string;
}

interface PypTheme {
  id: PypThemeId;
  number: number;
  title: string;
  emoji: string;
  centralIdea: string;
  keyConcepts: string[];
  linesOfInquiry: string[];
  interactiveTitle: string;
  interactivePrompt: string;
  buckets: [string, string];
  sortItems: SortItem[];
}

const PYP_THEMES: PypTheme[] = [
  {
    id: "who-we-are",
    number: 1,
    title: "Who We Are",
    emoji: "🧑‍🤝‍🧑",
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

interface VocabItem {
  word: string;
  emoji: string;
  year: "y1" | "y2" | "y3" | "y4";
  theme: PypThemeId;
  hint: string;
}

const VOCABULARY: VocabItem[] = [
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
  { word: "eye", emoji: "👁️", year: "y1", theme: "who-we-are", hint: "Body part we use to see" },
  { word: "map", emoji: "🗺️", year: "y1", theme: "where-we-are", hint: "Shows where places are" },
  { word: "hand", emoji: "✋", year: "y2", theme: "who-we-are", hint: "We wave, write, and hold with it" },
  { word: "smile", emoji: "😊", year: "y2", theme: "who-we-are", hint: "Shows we are happy and friendly" },
  { word: "home", emoji: "🏠", year: "y2", theme: "where-we-are", hint: "Where a family lives together" },
  { word: "dhow", emoji: "⛵", year: "y2", theme: "where-we-are", hint: "Traditional wooden boat of Qatar" },
  { word: "song", emoji: "🎵", year: "y2", theme: "express-ourselves", hint: "Words and music we sing aloud" },
  { word: "book", emoji: "📖", year: "y2", theme: "express-ourselves", hint: "Pages full of stories to read" },
  { word: "rain", emoji: "🌧️", year: "y2", theme: "world-works", hint: "Water drops falling from clouds" },
  { word: "seed", emoji: "🌱", year: "y2", theme: "world-works", hint: "Plant it in soil to grow a flower" },
  { word: "coin", emoji: "🪙", year: "y2", theme: "organize-ourselves", hint: "Round metal money we count" },
  { word: "tree", emoji: "🌳", year: "y2", theme: "sharing-planet", hint: "Tall plant with a trunk and branches" },
  { word: "heart", emoji: "❤️", year: "y3", theme: "who-we-are", hint: "Organ that pumps blood through your body" },
  { word: "brain", emoji: "🧠", year: "y3", theme: "who-we-are", hint: "Helps you think, learn, and remember" },
  { word: "camel", emoji: "🐪", year: "y3", theme: "where-we-are", hint: "Desert animal called the ship of the desert" },
  { word: "qatar", emoji: "🇶🇦", year: "y3", theme: "where-we-are", hint: "Our country on the Arabian Gulf" },
  { word: "story", emoji: "📚", year: "y3", theme: "express-ourselves", hint: "Has characters, setting, and plot" },
  { word: "roots", emoji: "🌿", year: "y3", theme: "world-works", hint: "Take in water for a plant from the soil" },
  { word: "solid", emoji: "🧊", year: "y3", theme: "world-works", hint: "Matter that keeps its own shape, like ice" },
  { word: "train", emoji: "🚆", year: "y3", theme: "organize-ourselves", hint: "Fast transport that runs on tracks" },
  { word: "oryx", emoji: "🦌", year: "y3", theme: "sharing-planet", hint: "National animal of Qatar living in the desert" },
  { word: "health", emoji: "🥗", year: "y4", theme: "who-we-are", hint: "Keeping body and mind strong and balanced" },
  { word: "compass", emoji: "🧭", year: "y4", theme: "where-we-are", hint: "Tool showing North, South, East, and West" },
  { word: "author", emoji: "✍️", year: "y4", theme: "express-ourselves", hint: "Person who writes books and stories" },
  { word: "magnet", emoji: "🧲", year: "y4", theme: "world-works", hint: "Pulls iron and steel without touching" },
  { word: "market", emoji: "🛒", year: "y4", theme: "organize-ourselves", hint: "Place where buyers and sellers trade goods" },
  { word: "planet", emoji: "🪐", year: "y4", theme: "sharing-planet", hint: "A world like Earth that orbits a star" },
];

interface StoryItem {
  id: string;
  title: string;
  emoji: string;
  year: "y1" | "y2" | "y3" | "y4";
  theme: PypThemeId;
  lines: string[];
  drills: { q: string; options: string[]; answer: string }[];
}

const STORIES: StoryItem[] = [
  {
    id: "sam",
    title: "Sam the Cat",
    emoji: "🐱🎩",
    year: "y1",
    theme: "express-ourselves",
    lines: ["Sam is a cat.", "Sam has a red hat.", "Sam sat on a mat.", "Sam is happy!"],
    drills: [
      { q: "What does Sam have?", options: ["a red hat", "a big box", "a kite"], answer: "a red hat" },
      { q: "Where did Sam sit?", options: ["on a mat", "in a van", "on a bus"], answer: "on a mat" },
    ],
  },
  {
    id: "dhow",
    title: "Noor's Dhow Boat in Qatar",
    emoji: "⛵🇶🇦",
    year: "y2",
    theme: "where-we-are",
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
    id: "oryx",
    title: "Guardians of the Desert Oryx",
    emoji: "🦌🏜️",
    year: "y4",
    theme: "sharing-planet",
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
];

interface ScienceQuestion {
  id: string;
  emoji: string;
  year: "y1" | "y2" | "y3" | "y4";
  theme: PypThemeId;
  q: string;
  options: string[];
  answer: string;
}

const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  { id: "s1", emoji: "👀🔭", year: "y1", theme: "who-we-are", q: "Which sense do our eyes give us?", options: ["Sight", "Hearing", "Taste"], answer: "Sight" },
  { id: "s2", emoji: "🌧️☁️", year: "y1", theme: "world-works", q: "What falls from rain clouds?", options: ["Rain", "Sand", "Leaves"], answer: "Rain" },
  { id: "s3", emoji: "🚒🧑‍🚒", year: "y1", theme: "organize-ourselves", q: "Who helps put out fires in our community?", options: ["Firefighter", "Teacher", "Chef"], answer: "Firefighter" },
  { id: "s4", emoji: "♻️🧴", year: "y1", theme: "sharing-planet", q: "What should we do with bottles and paper?", options: ["Recycle them", "Throw in the river", "Burn them"], answer: "Recycle them" },
  { id: "s5", emoji: "🌱🌿", year: "y2", theme: "world-works", q: "Which part of the plant takes in water from the soil?", options: ["Roots", "Leaves", "Flower"], answer: "Roots" },
  { id: "s6", emoji: "⛵🇶🇦", year: "y2", theme: "where-we-are", q: "What is a traditional wooden sailing boat in Qatar called?", options: ["A Dhow", "A Subway", "A Rocket"], answer: "A Dhow" },
  { id: "s7", emoji: "📖✍️", year: "y2", theme: "express-ourselves", q: "What do we call the person who draws the pictures in a story book?", options: ["Illustrator", "Pilot", "Dentist"], answer: "Illustrator" },
  { id: "s8", emoji: "❤️🩺", year: "y3", theme: "who-we-are", q: "Which organ pumps blood around your body?", options: ["Heart", "Brain", "Lungs"], answer: "Heart" },
  { id: "s9", emoji: "🧊☀️", year: "y3", theme: "world-works", q: "When solid ice warms up in the sun, what does it change into?", options: ["Liquid water", "Solid rock", "Metal"], answer: "Liquid water" },
  { id: "s10", emoji: "🦌🏜️", year: "y3", theme: "sharing-planet", q: "Which habitat is the natural home of the Arabian Oryx?", options: ["The desert", "Frozen tundra", "Coral reef"], answer: "The desert" },
  { id: "s11", emoji: "🍎🌍", year: "y4", theme: "world-works", q: "Which invisible force pulls a dropped ball down toward the Earth?", options: ["Gravity", "Magnetism", "Echo"], answer: "Gravity" },
  { id: "s12", emoji: "☀️🔋", year: "y4", theme: "sharing-planet", q: "Why is solar power called a clean, renewable energy source?", options: ["Sunlight won't run out and doesn't pollute the air", "It only works underground", "It burns coal"], answer: "Sunlight won't run out and doesn't pollute the air" },
];

interface MathQuestion {
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

const MATH_QUESTIONS: MathQuestion[] = [
  { id: "m1", year: "y1", kind: "count", emoji: "🍎", count: 5, prompt: "How many 🍎 apples do you see?", say: "How many apples do you see?", options: [4, 5, 6, 7], answer: 5 },
  { id: "m2", year: "y1", kind: "sum", prompt: "3 + 4 = ?", say: "3 plus 4 equals what?", options: [6, 7, 8, 9], answer: 7 },
  { id: "m3", year: "y2", kind: "sum", prompt: "8 + 6 = ?", say: "8 plus 6 equals what?", options: [12, 13, 14, 15], answer: 14 },
  { id: "m4", year: "y2", kind: "word", prompt: "Omar has 10 coins 🪙 and earns 5 more. How many coins in all?", say: "Omar has 10 coins and earns 5 more. How many coins in all?", options: [13, 14, 15, 16], answer: 15 },
  { id: "m5", year: "y3", kind: "mul", prompt: "3 × 4 = ?", say: "3 times 4 equals what?", options: [10, 12, 14, 16], answer: 12 },
  { id: "m6", year: "y3", kind: "word", prompt: "4 dhow boats each carry 5 pearl divers ⛵. How many divers in total?", say: "4 dhow boats each carry 5 pearl divers. How many divers in total?", options: [15, 20, 25, 30], answer: 20 },
  { id: "m7", year: "y4", kind: "mul", prompt: "7 × 8 = ?", say: "7 times 8 equals what?", options: [48, 54, 56, 64], answer: 56 },
  { id: "m8", year: "y4", kind: "word", prompt: "A school plants 6 rows of 6 mangrove trees 🌳. How many trees are planted?", say: "A school plants 6 rows of 6 mangrove trees. How many trees are planted?", options: [30, 32, 36, 42], answer: 36 },
];

const COLORING_SHAPES = [
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "flower", emoji: "🌸", label: "Flower" },
  { id: "dhow", emoji: "⛵", label: "Qatar Dhow" },
  { id: "oryx", emoji: "🦌", label: "Desert Oryx" },
  { id: "earth", emoji: "🌍", label: "Planet Earth" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function filterByYear<T extends { year: "y1" | "y2" | "y3" | "y4" }>(items: T[], year: YearLevel): T[] {
  if (year === "all") return items;
  const matching = items.filter((it: T) => it.year === year);
  return matching.length > 0 ? matching : items;
}

function speak(parts: string | string[]): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
  const list = Array.isArray(parts) ? parts : [parts];
  try {
    const s = window.speechSynthesis;
    s.cancel();
    list.forEach((text: string) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.85;
      s.speak(u);
    });
  } catch {
    // ignore speech restrictions
  }
}

type TabId = "pyp" | "letters" | "words" | "memory" | "coloring" | "stories" | "math" | "science";

const NAV_TABS: { id: TabId; emoji: string; label: string }[] = [
  { id: "pyp", emoji: "🌍", label: "6 PYP Themes" },
  { id: "letters", emoji: "🔤", label: "Letter Sounds" },
  { id: "words", emoji: "📖", label: "Read Words" },
  { id: "memory", emoji: "🃏", label: "Memory Match" },
  { id: "coloring", emoji: "🎨", label: "Coloring Studio" },
  { id: "stories", emoji: "📚", label: "Story Time" },
  { id: "math", emoji: "🧮", label: "Number Quest" },
  { id: "science", emoji: "🔬", label: "Science & Social" },
];

export default function App() {
  const t = useGrokTheme();
  const pal = useMemo(() => {
    const out: string[] = [];
    [...t.chart, ...t.dataviz.categorical].forEach((c: string) => {
      if (out.indexOf(c) < 0) out.push(c);
    });
    return out;
  }, [t]);

  const btn = (bg: string, fg: string, extra?: CSSProperties): CSSProperties => ({
    background: bg,
    color: fg,
    border: `2px solid ${t.border.default}`,
    borderRadius: 16,
    padding: "12px 20px",
    fontSize: 20,
    fontWeight: 700,
    minHeight: 48,
    minWidth: 48,
    cursor: "pointer",
    fontFamily: t.font.family,
    touchAction: "manipulation",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxSizing: "border-box",
    ...(extra || {}),
  });

  const [year, setYear] = useState<YearLevel>("all");
  const [tab, setTab] = useState<TabId>("pyp");
  const [stars, setStars] = useState<number>(35);
  const [coins, setCoins] = useState<number>(560);
  const [banner, setBanner] = useState<string>("");

  // PYP Themes state
  const [activeThemeId, setActiveThemeId] = useState<PypThemeId>("who-we-are");
  const [pypSub, setPypSub] = useState<"vocab" | "sort" | "quiz">("vocab");
  const [vocabIdx, setVocabIdx] = useState<number>(0);
  const [sortIdx, setSortIdx] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);

  // Letters & Tracing state
  const [letterIdx, setLetterIdx] = useState<number>(0);
  const traceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const traceDrawing = useRef<boolean>(false);

  // Words state
  const [wordIdx, setWordIdx] = useState<number>(0);
  const [slots, setSlots] = useState<{ ch: string; id: string }[]>([]);
  const [tray, setTray] = useState<{ ch: string; id: string }[]>([]);

  // Memory Match state (Fixed scoring bug: only awards points on a real match)
  const [memDeck, setMemDeck] = useState<{ id: string; key: string; face: string }[]>(() => {
    const picks = LETTERS.slice(0, 6);
    const cards: { id: string; key: string; face: string }[] = [];
    picks.forEach((p, i) => {
      cards.push({ id: `u-${i}`, key: p.l, face: p.l });
      cards.push({ id: `l-${i}`, key: p.l, face: `${p.l.toLowerCase()} ${p.emoji}` });
    });
    return shuffle(cards);
  });
  const [memFlipped, setMemFlipped] = useState<string[]>([]);
  const [memMatched, setMemMatched] = useState<string[]>([]);
  const [memMoves, setMemMoves] = useState<number>(0);
  const [memBusy, setMemBusy] = useState<boolean>(false);

  // Coloring state
  const colorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorDrawing = useRef<boolean>(false);
  const [shapeIdx, setShapeIdx] = useState<number>(0);
  const [colorIdx, setColorIdx] = useState<number>(0);
  const [brushSize, setBrushSize] = useState<number>(22);

  // Stories, Math, Science state
  const [storyIdx, setStoryIdx] = useState<number>(0);
  const [mathIdx, setMathIdx] = useState<number>(0);
  const [sciIdx, setSciIdx] = useState<number>(0);

  const award = (pts: number, st: number, text: string) => {
    setCoins((c: number) => c + pts);
    setStars((s: number) => s + st);
    setBanner(`${text} (+${pts} 🪙 +${st} ⭐)`);
  };

  const curLetter = LETTERS[letterIdx % LETTERS.length];
  useEffect(() => {
    if (tab !== "letters") return;
    const c = traceCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgb(215, 222, 232)";
    ctx.font = "bold 180px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${curLetter.l}${curLetter.l.toLowerCase()}`, c.width / 2, c.height / 2 + 8);
  }, [tab, letterIdx, curLetter.l]);

  const filteredWords = useMemo(() => filterByYear(VOCABULARY, year), [year]);
  const curWord = filteredWords[wordIdx % filteredWords.length] || VOCABULARY[0];

  const setupWord = useCallback((w: string) => {
    setSlots([]);
    setTray(shuffle(w.split("").map((ch: string, i: number) => ({ ch, id: `${ch}-${i}` }))));
  }, []);

  useEffect(() => {
    setupWord(curWord.word);
  }, [curWord.word, setupWord]);

  const curShape = COLORING_SHAPES[shapeIdx % COLORING_SHAPES.length];
  useEffect(() => {
    if (tab !== "coloring") return;
    const c = colorCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalAlpha = 0.25;
    ctx.font = "200px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgb(148, 163, 184)";
    ctx.fillText(curShape.emoji, c.width / 2, c.height / 2 + 8);
    ctx.globalAlpha = 1.0;
  }, [tab, shapeIdx, curShape.emoji]);

  const themeIdx = PYP_THEMES.findIndex((th: PypTheme) => th.id === activeThemeId);
  const theme = PYP_THEMES[themeIdx >= 0 ? themeIdx : 0];
  const themeVocab = useMemo(() => filterByYear(VOCABULARY.filter((v: VocabItem) => v.theme === theme.id), year), [theme.id, year]);
  const themeQuiz = useMemo(() => filterByYear(SCIENCE_QUESTIONS.filter((q: ScienceQuestion) => q.theme === theme.id), year), [theme.id, year]);

  const filteredStories = useMemo(() => filterByYear(STORIES, year), [year]);
  const curStory = filteredStories[storyIdx % filteredStories.length] || STORIES[0];

  const filteredMath = useMemo(() => filterByYear(MATH_QUESTIONS, year), [year]);
  const curMath = filteredMath[mathIdx % filteredMath.length] || MATH_QUESTIONS[0];

  const filteredSci = useMemo(() => filterByYear(SCIENCE_QUESTIONS, year), [year]);
  const curSci = filteredSci[sciIdx % filteredSci.length] || SCIENCE_QUESTIONS[0];

  const yearMeta = YEAR_LEVELS.find((y: YearMeta) => y.id === year) || YEAR_LEVELS[0];

  return (
    <div style={{ background: t.bg.base, color: t.text.primary, fontFamily: t.font.family, minHeight: "100vh", padding: "18px 16px 48px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderRadius: 22, background: t.bg.elevated, border: `2px solid ${t.border.default}` }}>
          <div>
            <div style={{ fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800 }}>🌍 Letter Adventure — IB PYP Edition</div>
            <div style={{ fontSize: 18, color: t.text.secondary }}>Primary Years Programme (Year 1 to Year 4) • Phonics, Vocabulary, Stories, Math & Inquiry</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 22, fontWeight: 800 }}>
            <span style={{ color: t.text.success }}>⭐ {stars}</span>
            <span style={{ color: t.text.warning }}>🪙 {coins}</span>
          </div>
        </div>

        {/* Year 1 to Year 4 Selector */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", borderRadius: 20, background: t.bg.subtle, border: `1px solid ${t.border.subtle}` }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>🎓 PYP Grade Level:</span>
            {YEAR_LEVELS.map((yl: YearMeta, idx: number) => (
              <button
                key={yl.id}
                onClick={() => setYear(yl.id)}
                style={btn(year === yl.id ? pal[idx % pal.length] : t.bg.elevated, year === yl.id ? t.text.onColor : t.text.primary, { padding: "8px 16px", fontSize: 19 })}
              >
                {yl.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: t.text.secondary }}>
            {yearMeta.ages}: {yearMeta.desc}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NAV_TABS.map((nt, idx: number) => (
            <button
              key={nt.id}
              onClick={() => { setTab(nt.id); setBanner(""); }}
              style={btn(tab === nt.id ? pal[idx % pal.length] : t.bg.elevated, tab === nt.id ? t.text.onColor : t.text.primary, { flex: "1 1 160px" })}
            >
              <span>{nt.emoji}</span>
              <span>{nt.label}</span>
            </button>
          ))}
        </div>

        {banner && (
          <div style={{ padding: "12px 18px", borderRadius: 18, border: `2px solid ${t.text.success}`, background: t.bg.elevated, fontSize: 20, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>🎉 {banner}</span>
            <button onClick={() => setBanner("")} style={btn(t.fill.secondary, t.text.primary, { padding: "6px 14px", fontSize: 16 })}>OK</button>
          </div>
        )}

        {/* 1. PYP Themes Hub */}
        {tab === "pyp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
              {PYP_THEMES.map((th: PypTheme, idx: number) => {
                const isSel = th.id === theme.id;
                const col = pal[idx % pal.length];
                return (
                  <button
                    key={th.id}
                    onClick={() => { setActiveThemeId(th.id); setVocabIdx(0); setSortIdx(0); setQuizIdx(0); }}
                    style={{
                      border: isSel ? `4px solid ${col}` : `2px solid ${t.border.default}`,
                      borderRadius: 20,
                      padding: 16,
                      background: isSel ? col : t.bg.elevated,
                      color: isSel ? t.text.onColor : t.text.primary,
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: t.font.family,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 34 }}>{th.emoji}</span>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{th.number}. {th.title}</div>
                    <div style={{ fontSize: 15, opacity: 0.9 }}>{th.keyConcepts.join(" · ")}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ border: `3px solid ${pal[themeIdx % pal.length]}`, borderRadius: 24, padding: 20, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>{theme.emoji} {theme.title}</div>
                  <div style={{ fontSize: 18, color: t.text.secondary }}>Central Idea: {theme.centralIdea}</div>
                </div>
                <button onClick={() => speak([theme.title, theme.centralIdea])} style={btn(pal[themeIdx % pal.length], t.text.onColor)}>
                  🔊 Hear Central Idea
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {theme.linesOfInquiry.map((line: string, i: number) => (
                  <div key={i} style={{ padding: 12, borderRadius: 14, background: t.bg.subtle, fontSize: 17, fontWeight: 600 }}>
                    {line}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button onClick={() => setPypSub("vocab")} style={btn(pypSub === "vocab" ? t.fill.primary : t.fill.secondary, pypSub === "vocab" ? t.text.onPrimary : t.text.primary)}>
                  🃏 Theme Vocabulary ({themeVocab.length})
                </button>
                <button onClick={() => setPypSub("sort")} style={btn(pypSub === "sort" ? t.fill.primary : t.fill.secondary, pypSub === "sort" ? t.text.onPrimary : t.text.primary)}>
                  🧩 Sorting Game ({theme.sortItems.length})
                </button>
                <button onClick={() => setPypSub("quiz")} style={btn(pypSub === "quiz" ? t.fill.primary : t.fill.secondary, pypSub === "quiz" ? t.text.onPrimary : t.text.primary)}>
                  ❓ Inquiry Quiz ({themeQuiz.length})
                </button>
              </div>

              {pypSub === "vocab" && themeVocab[vocabIdx % themeVocab.length] && (() => {
                const v = themeVocab[vocabIdx % themeVocab.length];
                return (
                  <div style={{ textAlign: "center", padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 80 }}>{v.emoji}</div>
                    <div style={{ fontSize: 40, fontWeight: 800, textTransform: "capitalize" }}>{v.word} ({v.year.toUpperCase()})</div>
                    <div style={{ fontSize: 21, color: t.text.secondary }}>{v.hint}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                      <button onClick={() => speak([v.word, v.hint])} style={btn(pal[0], t.text.onColor)}>🔊 Hear Word</button>
                      <button onClick={() => { award(10, 1, `Learned ${v.word}`); setVocabIdx((i: number) => i + 1); }} style={btn(t.text.success, t.text.onColor)}>✅ Got It (+10🪙)</button>
                    </div>
                  </div>
                );
              })()}

              {pypSub === "sort" && theme.sortItems[sortIdx % theme.sortItems.length] && (() => {
                const item = theme.sortItems[sortIdx % theme.sortItems.length];
                return (
                  <div style={{ textAlign: "center", padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{theme.interactivePrompt}</div>
                    <div style={{ fontSize: 72 }}>{item.emoji}</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{item.label}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                      {theme.buckets.map((b: string, bi: number) => (
                        <button
                          key={b}
                          onClick={() => {
                            if (b === item.bucket) {
                              speak(["Correct!", item.label]);
                              award(15, 1, `Sorted ${item.label}`);
                              setSortIdx((i: number) => i + 1);
                            } else {
                              speak("Try the other group!");
                            }
                          }}
                          style={btn(pal[(bi + 1) % pal.length], t.text.onColor, { minHeight: 60, fontSize: 22 })}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {pypSub === "quiz" && themeQuiz[quizIdx % themeQuiz.length] && (() => {
                const q = themeQuiz[quizIdx % themeQuiz.length];
                return (
                  <div style={{ textAlign: "center", padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 64 }}>{q.emoji}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 24, fontWeight: 700 }}>{q.q}</span>
                      <button onClick={() => speak(q.q)} style={btn(pal[0], t.text.onColor)}>🔊</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                      {q.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => {
                            if (opt === q.answer) {
                              speak(["Correct!", opt]);
                              award(15, 1, "Inquiry Quiz Correct");
                              setQuizIdx((i: number) => i + 1);
                            } else {
                              speak("Try again!");
                            }
                          }}
                          style={btn(t.bg.base, t.text.primary, { minHeight: 56, fontSize: 20 })}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 2. Letter Sounds & Tracing */}
        {tab === "letters" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {LETTERS.map((item: LetterItem, i: number) => (
                <button
                  key={item.l}
                  onClick={() => { setLetterIdx(i); speak([item.l, item.word]); }}
                  style={btn(i === letterIdx ? pal[i % pal.length] : t.bg.elevated, i === letterIdx ? t.text.onColor : t.text.primary, { minWidth: 52, minHeight: 52, padding: "8px 12px", fontSize: 22 })}
                >
                  {item.l}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, border: `3px solid ${pal[letterIdx % pal.length]}`, borderRadius: 24, padding: 20, background: t.bg.elevated, alignItems: "center", textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 92, fontWeight: 800, color: pal[letterIdx % pal.length] }}>{curLetter.l} {curLetter.l.toLowerCase()}</div>
                <div style={{ fontSize: 80 }}>{curLetter.emoji}</div>
                <div style={{ fontSize: 30, fontWeight: 700 }}>{curLetter.cue} ({curLetter.sound})</div>
                <button onClick={() => speak([curLetter.l, curLetter.word, curLetter.cue])} style={btn(pal[letterIdx % pal.length], t.text.onColor, { fontSize: 24 })}>
                  🔊 Hear It
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>✍️ Trace {curLetter.l}{curLetter.l.toLowerCase()}:</div>
                <canvas
                  ref={traceCanvasRef}
                  width={320}
                  height={260}
                  onPointerDown={(e: PointerEvent<HTMLCanvasElement>) => {
                    e.preventDefault();
                    traceDrawing.current = true;
                    const c = traceCanvasRef.current;
                    if (!c) return;
                    const r = c.getBoundingClientRect();
                    const ctx = c.getContext("2d");
                    if (!ctx) return;
                    ctx.beginPath();
                    ctx.moveTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height));
                  }}
                  onPointerMove={(e: PointerEvent<HTMLCanvasElement>) => {
                    if (!traceDrawing.current) return;
                    e.preventDefault();
                    const c = traceCanvasRef.current;
                    if (!c) return;
                    const r = c.getBoundingClientRect();
                    const ctx = c.getContext("2d");
                    if (!ctx) return;
                    ctx.strokeStyle = pal[letterIdx % pal.length];
                    ctx.lineWidth = 14;
                    ctx.lineCap = "round";
                    ctx.lineTo((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height));
                    ctx.stroke();
                  }}
                  onPointerUp={() => { traceDrawing.current = false; }}
                  onPointerLeave={() => { traceDrawing.current = false; }}
                  style={{ width: "100%", maxWidth: 320, borderRadius: 20, border: `3px dashed ${pal[letterIdx % pal.length]}`, touchAction: "none", userSelect: "none", cursor: "crosshair" }}
                />
                <button onClick={() => { award(10, 1, `Traced ${curLetter.l}`); setLetterIdx((i: number) => (i + 1) % LETTERS.length); }} style={btn(t.text.success, t.text.onColor)}>
                  ✅ I Traced It (+10🪙)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Read Words */}
        {tab === "words" && (
          <div style={{ border: `3px solid ${pal[wordIdx % pal.length]}`, borderRadius: 24, padding: 24, background: t.bg.elevated, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 84 }}>{curWord.emoji}</div>
            <div style={{ fontSize: 22, color: t.text.secondary }}>{curWord.hint} ({curWord.year.toUpperCase()})</div>
            <button onClick={() => speak([curWord.word, curWord.hint])} style={btn(pal[wordIdx % pal.length], t.text.onColor)}>🔊 Hear the Word</button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {curWord.word.split("").map((_: string, i: number) => (
                <div key={i} style={{ width: 60, height: 60, borderRadius: 16, border: `3px dashed ${t.border.default}`, background: t.bg.subtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, textTransform: "uppercase" }}>
                  {slots[i]?.ch || ""}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {tray.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => {
                    speak(tile.ch);
                    const ns = [...slots, tile];
                    setSlots(ns);
                    setTray(tray.filter((x) => x.id !== tile.id));
                    if (ns.length === curWord.word.length) {
                      if (ns.map((s) => s.ch).join("") === curWord.word) {
                        speak(curWord.word);
                        award(15, 1, `Spelled ${curWord.word.toUpperCase()}`);
                        setWordIdx((i: number) => i + 1);
                      } else {
                        window.setTimeout(() => setupWord(curWord.word), 500);
                      }
                    }
                  }}
                  style={btn(t.fill.accent, t.text.onColor, { minWidth: 60, minHeight: 60, fontSize: 30, textTransform: "uppercase" })}
                >
                  {tile.ch}
                </button>
              ))}
            </div>
            <button onClick={() => setupWord(curWord.word)} style={btn(t.fill.secondary, t.text.primary)}>🔀 Shuffle again</button>
          </div>
        )}

        {/* 4. Memory Match (Fixed scoring bug) */}
        {tab === "memory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                Moves: {memMoves} • Matched: {memMatched.length}/6 (Points awarded ONLY on a matching pair!)
              </div>
              <button
                onClick={() => {
                  setMemDeck(shuffle(memDeck));
                  setMemFlipped([]);
                  setMemMatched([]);
                  setMemMoves(0);
                }}
                style={btn(t.fill.secondary, t.text.primary)}
              >
                🔄 New Game
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
              {memDeck.map((c, i: number) => {
                const isMatched = memMatched.indexOf(c.key) >= 0;
                const isOpen = isMatched || memFlipped.indexOf(c.id) >= 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (memBusy || isOpen || memFlipped.length >= 2) return;
                      speak(c.key);
                      const nf = [...memFlipped, c.id];
                      setMemFlipped(nf);
                      if (nf.length === 2) {
                        setMemMoves((m: number) => m + 1);
                        const first = memDeck.find((x) => x.id === nf[0]);
                        if (first && first.key === c.key && first.id !== c.id) {
                          setMemMatched((m: string[]) => [...m, c.key]);
                          setMemFlipped([]);
                          award(15, 1, `Matched ${c.key}`);
                        } else {
                          setMemBusy(true);
                          window.setTimeout(() => {
                            setMemFlipped([]);
                            setMemBusy(false);
                          }, 700);
                        }
                      }
                    }}
                    style={btn(isOpen ? t.bg.elevated : pal[i % pal.length], isOpen ? t.text.primary : t.text.onColor, { minHeight: 110, fontSize: 28 })}
                  >
                    {isOpen ? c.face : "❓"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Coloring Studio (Fixed pointer events) */}
        {tab === "coloring" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COLORING_SHAPES.map((s, i: number) => (
                <button key={s.id} onClick={() => setShapeIdx(i)} style={btn(shapeIdx === i ? t.fill.primary : t.fill.secondary, shapeIdx === i ? t.text.onPrimary : t.text.primary)}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
              <canvas
                ref={colorCanvasRef}
                width={380}
                height={320}
                onPointerDown={(e: PointerEvent<HTMLCanvasElement>) => {
                  e.preventDefault();
                  colorDrawing.current = true;
                  const c = colorCanvasRef.current;
                  if (!c) return;
                  const r = c.getBoundingClientRect();
                  const ctx = c.getContext("2d");
                  if (!ctx) return;
                  ctx.fillStyle = pal[colorIdx % pal.length];
                  ctx.beginPath();
                  ctx.arc((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height), brushSize, 0, Math.PI * 2);
                  ctx.fill();
                }}
                onPointerMove={(e: PointerEvent<HTMLCanvasElement>) => {
                  if (!colorDrawing.current) return;
                  e.preventDefault();
                  const c = colorCanvasRef.current;
                  if (!c) return;
                  const r = c.getBoundingClientRect();
                  const ctx = c.getContext("2d");
                  if (!ctx) return;
                  ctx.fillStyle = pal[colorIdx % pal.length];
                  ctx.beginPath();
                  ctx.arc((e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height), brushSize, 0, Math.PI * 2);
                  ctx.fill();
                }}
                onPointerUp={() => { colorDrawing.current = false; }}
                onPointerLeave={() => { colorDrawing.current = false; }}
                style={{ width: "100%", maxWidth: 380, borderRadius: 24, border: `3px solid ${pal[colorIdx % pal.length]}`, touchAction: "none", userSelect: "none", cursor: "crosshair" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 20, borderRadius: 24, background: t.bg.elevated, border: `2px solid ${t.border.default}` }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>🎨 Brush Color & Size:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {pal.map((c: string, i: number) => (
                    <button key={c} onClick={() => setColorIdx(i)} style={{ width: 52, height: 52, borderRadius: 999, background: c, border: colorIdx === i ? `4px solid ${t.text.primary}` : `2px solid ${t.border.default}`, cursor: "pointer" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[12, 22, 34].map((sz: number) => (
                    <button key={sz} onClick={() => setBrushSize(sz)} style={btn(brushSize === sz ? t.fill.accent : t.fill.secondary, brushSize === sz ? t.text.onColor : t.text.primary)}>
                      {sz === 12 ? "Fine" : sz === 22 ? "Medium" : "Wide"}
                    </button>
                  ))}
                </div>
                <button onClick={() => award(20, 1, `Colored ${curShape.label}`)} style={btn(t.text.success, t.text.onColor)}>
                  ✅ Finish Art (+20🪙)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Story Time */}
        {tab === "stories" && (
          <div style={{ border: `3px solid ${pal[0]}`, borderRadius: 24, padding: 22, background: t.bg.elevated, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {filteredStories.map((st: StoryItem, i: number) => (
                <button key={st.id} onClick={() => setStoryIdx(i)} style={btn(i === storyIdx % filteredStories.length ? pal[i % pal.length] : t.fill.secondary, i === storyIdx % filteredStories.length ? t.text.onColor : t.text.primary)}>
                  {st.emoji} {st.title} ({st.year.toUpperCase()})
                </button>
              ))}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{curStory.emoji} {curStory.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {curStory.lines.map((line: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, background: t.bg.subtle }}>
                  <button onClick={() => speak(line)} style={btn(pal[i % pal.length], t.text.onColor, { minWidth: 52, minHeight: 52 })}>🔊</button>
                  <span style={{ fontSize: 22, fontWeight: 600 }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Number Quest */}
        {tab === "math" && (
          <div style={{ border: `3px solid ${pal[1]}`, borderRadius: 24, padding: 24, background: t.bg.elevated, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{curMath.prompt}</div>
            <button onClick={() => speak(curMath.say)} style={btn(pal[1], t.text.onColor)}>🔊 Hear Question</button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {curMath.options.map((opt: number) => (
                <button
                  key={opt}
                  onClick={() => {
                    if (opt === curMath.answer) {
                      speak(["Correct!", String(opt)]);
                      award(15, 1, "Solved Math Quest");
                      setMathIdx((i: number) => i + 1);
                    } else {
                      speak("Try again!");
                    }
                  }}
                  style={btn(t.bg.base, t.text.primary, { minWidth: 110, minHeight: 64, fontSize: 28 })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 8. Science & Social */}
        {tab === "science" && (
          <div style={{ border: `3px solid ${pal[2]}`, borderRadius: 24, padding: 24, background: t.bg.elevated, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 72 }}>{curSci.emoji}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 26, fontWeight: 700 }}>{curSci.q}</span>
              <button onClick={() => speak(curSci.q)} style={btn(pal[2], t.text.onColor, { minWidth: 52, minHeight: 52 })}>🔊</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {curSci.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => {
                    if (opt === curSci.answer) {
                      speak(["Correct!", opt]);
                      award(15, 1, "Science & Social Correct");
                      setSciIdx((i: number) => i + 1);
                    } else {
                      speak("Try again!");
                    }
                  }}
                  style={btn(t.bg.base, t.text.primary, { minHeight: 60, fontSize: 21 })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
