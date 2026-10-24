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



type WbThemeId =
| "who-we-are"
| "where-we-are"
| "express-ourselves"
| "world-works"
| "organize-ourselves"
| "sharing-planet";

type WbStageId = "overview" | "tuning" | "finding" | "sorting" | "action" | "reflection" | "exit";

interface WbWord {
word: string;
emoji: string;
sentence: string;
}

interface WbCheck {
q: string;
emoji: string;
options: string[];
answer: string;
}

interface WbTrueFalse {
text: string;
emoji: string;
answer: boolean;
}

interface WbSortItem {
label: string;
emoji: string;
bucket: number;
}

interface WbSequence {
title: string;
steps: { text: string; emoji: string }[];
}

interface WbCount {
emoji: string;
n: number;
q: string;
}

interface WbOrganiser {
title: string;
prompt: string;
columns: { label: string; emoji: string }[];
items: { label: string; emoji: string; col: number }[];
}

interface WbUnit {
id: WbThemeId;
number: number;
theme: string;
emoji: string;
unitTitle: string;
centralIdea: string;
kidIdea: string;
lines: string[];
keyConcepts: string[];
relatedConcepts: string[];
learnerProfile: string[];
atl: string[];
provocation: { scene: string; title: string; description: string; teacherPrompt: string };
seeThinkWonder: { scene: string; see: string; think: string; wonder: string };
wonderQuestions: string[];
words: WbWord[];
sort: { prompt: string; buckets: [string, string]; items: WbSortItem[] };
trueFalse: WbTrueFalse[];
sequences: WbSequence[];
counts: WbCount[];
drawLabel: { prompt: string; labels: string[] };
organiser: WbOrganiser;
action: { title: string; ideas: { text: string; emoji: string }[]; homeLink: string };
usedToThink: string;
checks: WbCheck[];
teacherNotes: string[];
thinkPrompts?: string[];
}

type WbYearId = "y1" | "y2" | "y3" | "y4";

interface WbYear {
id: WbYearId;
label: string;
ages: string;
focus: string;
units: WbUnit[];
}

const WB_STAGES: { id: WbStageId; label: string; emoji: string; kid: string }[] = [
{ id: "overview", label: "Unit Overview", emoji: "🗺️", kid: "Our big idea" },
{ id: "tuning", label: "Tuning In", emoji: "👀", kid: "Look and wonder" },
{ id: "finding", label: "Finding Out", emoji: "🔍", kid: "Find out" },
{ id: "sorting", label: "Sorting Out", emoji: "🧩", kid: "Sort our ideas" },
{ id: "action", label: "Taking Action", emoji: "🤝", kid: "Help and act" },
{ id: "reflection", label: "Reflection", emoji: "🪞", kid: "Think back" },
{ id: "exit", label: "Exit Card", emoji: "🎟️", kid: "Show what I know" },
];

const WB_WONDER_STARTERS: string[] = [
"I wonder why…",
"I wonder how…",
"I wonder what…",
"I wonder who…",
"What if…?",
"How do we know…?",
"I want to find out…",
];

const WB_FEELINGS: { emoji: string; label: string }[] = [
{ emoji: "😀", label: "Happy" },
{ emoji: "🤩", label: "Excited" },
{ emoji: "😮", label: "Surprised" },
{ emoji: "🤔", label: "Curious" },
{ emoji: "😐", label: "Okay" },
{ emoji: "😟", label: "Worried" },
];

const WB_HELPERS: { emoji: string; label: string }[] = [
{ emoji: "🖼️", label: "Pictures" },
{ emoji: "🧑‍🤝‍🧑", label: "My friends" },
{ emoji: "👩‍🏫", label: "My teacher" },
{ emoji: "📚", label: "Books" },
{ emoji: "🙋", label: "Asking questions" },
{ emoji: "✋", label: "Trying it myself" },
{ emoji: "🎵", label: "Songs" },
{ emoji: "🔊", label: "Listening" },
];

const WB_CONFIDENCE: { emoji: string; label: string; value: number }[] = [
{ emoji: "😟", label: "I need help", value: 1 },
{ emoji: "🙂", label: "I am getting there", value: 2 },
{ emoji: "😀", label: "I know it", value: 3 },
{ emoji: "🤩", label: "I can teach a friend", value: 4 },
];

const WB_LEARNER_PROFILE: Record<string, { emoji: string; kid: string }> = {
Inquirers: { emoji: "🔍", kid: "I ask questions and find out." },
Knowledgeable: { emoji: "🧠", kid: "I know new things." },
Thinkers: { emoji: "💭", kid: "I think hard to solve problems." },
Communicators: { emoji: "🗣️", kid: "I share my ideas." },
Principled: { emoji: "⚖️", kid: "I am fair and honest." },
"Open-minded": { emoji: "👐", kid: "I listen to other ideas." },
Caring: { emoji: "💛", kid: "I help and care for others." },
"Risk-takers": { emoji: "🦁", kid: "I try new things." },
Balanced: { emoji: "🧘", kid: "I rest, play and learn." },
Reflective: { emoji: "🪞", kid: "I think about my learning." },
};
const WBD_Y1 = `
T:who-we-are|1|Who We Are|🧒|All About Me: My Body, My Senses, My Feelings
C:Knowing our bodies, senses and feelings helps us take care of ourselves and others.
K:I learn about my body and my feelings. Then I can take care of me and my friends.
L:How our senses help us learn about the world (function)|How we show and name our feelings (perspective)|How healthy choices help our bodies grow (responsibility)
KC:Function|Perspective|Responsibility
RC:Identity|Wellbeing|Growth
LP:Caring|Balanced|Communicators
ATL:Self-management|Social
P:The Mystery Bag|🪞🧒👀👂👃👅✋|A closed bag sits on the mat. Inside are an orange, a bell, a soft toy and a date. Children feel, smell and listen. They cannot look!|Ask: Which body part helped you guess?
S:👶 ➡️ 🧒 ➡️ 👩|What do you see in the pictures?|What do you think is changing?|What do you wonder about growing up?
Q:Why do we have two eyes?|How does my nose smell food?|Why do I feel sad sometimes?|How do my bones grow?|Why do I need to sleep?|How does my heart beat?
W:👀 eyes=I see with my eyes.|👂 ears=I hear with my ears.|👃 nose=I smell with my nose.|👅 tongue=I taste with my tongue.|✋ hands=I touch with my hands.|😀 happy=I feel happy when I play.
SO:Is it healthy or a treat for sometimes?|🥦 Healthy every day|🍭 Treat for sometimes
SI:🍎 apple=0|💧 water=0|🥕 carrot=0|🍬 candy=1|🎂 cake=1|🥤 soda=1
TF:👂 I hear with my ears.=1|💧 Water is good for my body.=1|🦶 I smell with my feet.=0|👀 I taste with my eyes.=0
SQ:Wash your hands|💧 Wet hands|🧼 Add soap|👐 Rub and scrub|🧻 Dry hands
CN:👀=2=How many eyes?|✋=5=How many hands?
DL:Draw yourself. Tap a word. Write it next to the body part.|head,eyes,ears,nose,mouth,arms
OG:My Five Senses Chart|Which sense do you use? Tap a thing. Then tap the sense.|👀 See,👂 Hear,👃 Smell,👅 Taste,✋ Touch|🌙 the moon=0|📖 a picture book=0|🥁 a drum=1|🕌 the adhan call=1|🌸 a flower=2|🪔 perfume (oud)=2
A:Be a Healthy Helper|Talk with your family: What makes each of us special?|💧 Drink water at break time.|🍎 Bring a fruit snack.|🤗 Help a sad friend feel better.
U:I used to think… my body just works. Now I think… I can take care of it.
CK:🔊 What do I use to hear?=👂 ears;👃 nose;🦶 feet=0|🌙 What do I use to see?=👅 tongue;👀 eyes;✋ hands=1|🍽️ Which food is healthy?=🍬 candy;🍎 apple;🥤 soda=1|💭 Which face is sad?=😀;😢;😴=1
#
T:where-we-are|2|Where We Are in Place and Time|🏠|Homes and Families: Then and Now
C:Homes and family life change over time and are different in different places.
K:Homes change over time. Homes are different in different places.
L:Different kinds of homes around the world (form)|How homes and family life were long ago (change)|Why people build homes in different ways (causation)
KC:Form|Change|Causation
RC:Past and present|Place|Family
LP:Inquirers|Knowledgeable|Open-minded
ATL:Research|Thinking
P:Grandma's Old Box|⛺ 🏚️ 🏠 🏢|Show an old box with a toy, a black-and-white photo, a lantern and a shell. Long ago, people in Qatar lived in tents and stone houses with wind towers.|Ask: Who do you think owned these things?
S:⛺🐪🌴  ➡️  🏢🚗🌳|What do you see in the two pictures?|What do you think changed?|What do you wonder about homes long ago?
Q:What did homes look like long ago?|Why do some homes have wind towers?|How did people stay cool without air conditioning?|Where did my grandparents live as children?|Why are some homes very tall?|What toys did children play with long ago?
W:🏠 home=My home is a safe place.|👨‍👩‍👧 family=I live with my family.|⛺ tent=Long ago, some people lived in tents.|🏢 tower=Some people live in a tall tower.|🕰️ past=The past is long ago.|⏱️ now=Now is today.
SO:Is it from long ago or from now?|🕰️ Long ago|📱 Now
SI:🪔 oil lamp=0|🐪 camel ride=0|⛵ wooden boat=0|📱 tablet=1|🚗 car=1|💡 light bulb=1
TF:📱 Long ago, there were no tablets.=1|🏢 Some people live in tall towers.=1|🏠 All homes look the same.=0|🚗 Long ago, people drove fast cars.=0
SQ:Build a home|📝 Make a plan|🧱 Build the walls|🏠 Add a roof|📦 Move in
CN:🏠=4=How many houses?|⛺=3=How many tents?
DL:Draw your home. Tap a word. Label your drawing.|roof,door,window,wall,garden,stairs
OG:Then and Now T-Chart|Tap a picture. Then tap Then or Now.|🕰️ Then (long ago),📱 Now (today)|✉️ write a letter=0|📹 video call=1|🔥 cook on fire=0|🍽️ microwave=1|🐪 travel by camel=0|✈️ travel by plane=1
A:Be a Family Historian|Ask your family: Where did you live when you were small?|👵 Ask a grandparent about their home long ago.|🖼️ Bring an old family photo to share.|🏰 Visit a museum or old fort with family.
U:I used to think… homes were always like mine. Now I think… homes change over time.
CK:🕰️ Which is from long ago?=🪔 oil lamp;📱 tablet;🚗 car=0|📅 Which is from now?=🐪 camel ride;🚇 metro train;⛺ tent home=1|📍 What shows places?=🗺️ map;🥄 spoon;🧦 sock=0|👶 Who was a child long ago?=👵 grandma;🐣 a chick;🍼 a baby=0
#
T:express-ourselves|3|How We Express Ourselves|🎨|Stories, Art and Celebrations
C:People share feelings, ideas and culture through stories, art, music and celebrations.
K:We share our feelings and ideas with stories, art, music and celebrations.
L:Ways people tell stories (form)|How art and music show feelings (connection)|How families and communities celebrate (perspective)
KC:Form|Connection|Perspective
RC:Culture|Creativity|Tradition
LP:Communicators|Risk-takers|Open-minded
ATL:Communication|Social
P:The Silent Music Box|🎶 🥁 🎨 📖 🎭 🏮|Play two pieces of music: one calm, one fast. Children move and paint how the music makes them feel. Show photos of Eid, Qatar National Day and Garangao.|Ask: How did the music make your body move?
S:🎉🇶🇦🎆 🌙🍬👘|What do you see at this celebration?|What do you think people are feeling?|What do you wonder about how people celebrate?
Q:Why do people dance at parties?|How do drums make sound?|Why do stories have a beginning and an end?|How does my family celebrate Eid?|Why do we sing songs?|How can a painting show a feeling?
W:📖 story=I like to read a story.|🎵 song=We sing a song together.|💃 dance=I dance to the music.|🥁 drum=Boom! I play the drum.|🎨 paint=I paint a picture.|🧸 puppet=My puppet tells a story.
SO:Do we use our eyes or our ears for this art?|👀 We look at it|👂 We listen to it
SI:🖼️ painting=0|✏️ drawing=0|🗿 sculpture=0|🎤 song=1|🥁 drum beat=1|🎸 guitar=1
TF:📖 A story has a beginning, middle and end.=1|🎵 Music can make us feel happy.=1|🖼️ We hear a painting with our ears.=0|🎉 Everyone celebrates in the same way.=0
SQ:Tell a story|🐱 Beginning: meet the cat|😿 Middle: the cat is lost|🏠 End: the cat is home
CN:🥁=3=How many drums?|🎈=6=How many balloons?
DL:Draw your favourite celebration. Tap a word. Label your drawing.|family,food,gift,flag,lights,clothes
OG:Story Map|Tap a story card. Put it in Beginning, Middle or End.|1️⃣ Beginning,2️⃣ Middle,3️⃣ End|👧 A girl finds a seed=0|🌱 She plants the seed=1|💧 She waters it every day=1|🌻 A big flower grows=2|📖 Once upon a time…=0|😀 The end! Everyone is happy=2
A:Share My Voice|Ask your family: What is our favourite celebration? Why?|📖 Tell a story to my family.|💌 Make a card for someone I love.|🎵 Teach a friend a song from my culture.
U:I used to think… art is only drawing. Now I think… art is music, dance, stories and more.
CK:🗣️ What do we use to tell a story?=📖 words and pictures;🧦 socks;🥄 spoons=0|🎵 Which one makes music?=🥁 drum;🪑 chair;🍞 bread=0|📖 What comes first in a story?=Beginning;End;Middle=0|🇶🇦 When is Qatar National Day?=December;June;Never=0
#
T:world-works|4|How the World Works|☀️|Weather Watchers
C:Weather changes, and these changes affect how living things live.
K:The weather changes. It changes what we wear and what we do.
L:Different kinds of weather (form)|How weather changes over a day and a year (change)|How weather affects people, animals and plants (causation)
KC:Change|Causation|Form
RC:Patterns|Seasons|Observation
LP:Inquirers|Thinkers|Knowledgeable
ATL:Research|Thinking
P:The Weather Suitcase|☀️ 🌬️ 🌧️ ⛈️ 🌫️|Open a suitcase with sunglasses, an umbrella, a scarf, a hat and a sweater. Who packed this? Where are they going? Show a video of a dusty shamal wind in Doha.|Ask: Which item would you use today?
S:☁️ ➡️ 🌧️ ➡️ ☀️|What do you see in the sky?|What do you think will happen next?|What do you wonder about the weather?
Q:Where does rain come from?|Why is it so hot in summer in Qatar?|What makes the wind blow?|Why are clouds white or grey?|Where does the sun go at night?|Why does thunder make a loud sound?
W:☀️ sunny=It is sunny and hot today.|🌧️ rainy=It is rainy. I need an umbrella.|🌬️ windy=It is windy. My kite flies high.|☁️ cloudy=It is cloudy. I cannot see the sun.|⛈️ stormy=It is stormy. I stay inside.|❄️ snowy=It is snowy in cold places.
SO:Do we use it on a hot day or a cold day?|🥵 Hot day|🥶 Cold day
SI:👒 sun hat=0|🕶️ sunglasses=0|🩳 shorts=0|🧣 scarf=1|🧤 gloves=1|🧥 coat=1
TF:🌧️ Rain falls from clouds.=1|☂️ An umbrella keeps us dry.=1|🥶 Summer in Qatar is cold.=0|📅 The weather is the same every day.=0
SQ:A rainy day|☁️ Clouds come|🌧️ Rain falls|💦 Puddles form|☀️ Sun dries them
CN:☁️=5=How many clouds?|☀️=1=How many suns?
DL:Draw today's weather. Tap a word. Label your drawing.|sun,cloud,rain,wind,sky,tree
OG:Weather and What I Wear|Tap a thing. Then tap the weather where we use it.|☀️ Sunny,🌧️ Rainy,🌬️ Windy / Dusty,❄️ Cold|🧴 sun cream=0|🧢 cap=0|☂️ umbrella=1|🥾 rain boots=1|😷 face mask=2|🪁 kite=2
A:Weather Wise|Look at the sky with your family. What is the weather today?|📺 Be the class weather reporter for one week.|💧 Remind my family to drink water on hot days.|📊 Make a weather chart at home.
U:I used to think… the weather is always the same. Now I think… the weather changes and we change too.
CK:🌧️ What do I use on a rainy day?=☂️ umbrella;🕶️ sunglasses;🩴 sandals=0|🇶🇦 What is the weather like in a Qatar summer?=🥵 very hot;❄️ snowy;🥶 freezing=0|💧 Where does rain come from?=☁️ clouds;🌳 trees;🪨 rocks=0|🪁 Which weather moves a kite?=🌬️ windy;☀️ still and sunny;🌫️ foggy=0
#
T:organize-ourselves|5|How We Organize Ourselves|🏫|Our School Community and Helpers
C:Communities work well when people have roles, follow agreements and help each other.
K:In a community, people have jobs and rules. We help each other.
L:Who works in our school and community (function)|Why we make rules and agreements (responsibility)|How people work together to help us (connection)
KC:Function|Responsibility|Connection
RC:Roles|Rules|Cooperation
LP:Principled|Caring|Communicators
ATL:Social|Self-management
P:Who Left These Clues?|👩‍🏫 👮 👩‍⚕️ 🧑‍🚒 🧑‍🍳 🚌|Hide clues around the classroom: a stethoscope, a chef hat, a bus ticket, a whistle and a library book. Each clue belongs to a helper in our school or city.|Ask: Who uses this?
S:🏫 🚸 🧑‍🤝‍🧑 📚 🍎|What do you see at this school?|What do you think each person's job is?|What do you wonder about how a school works?
Q:Who cleans our school?|Why do we have class rules?|What does the principal do all day?|How does the bus driver know the way?|Who cooks the food in the canteen?|What happens if nobody follows rules?
W:👩‍🏫 teacher=My teacher helps me learn.|👩‍⚕️ doctor=A doctor helps sick people.|👮 police=The police keep us safe.|🧑‍🚒 firefighter=A firefighter puts out fires.|🧑‍🍳 chef=A chef cooks food.|🚌 driver=The bus driver takes us to school.
SO:Is this a good choice or not a good choice at school?|👍 Good choice|👎 Not a good choice
SI:🧸 share toys=0|⏳ wait my turn=0|🙏 say please and thank you=0|💢 push in line=1|📢 shout in class=1|🏃 run in the hall=1
TF:📋 Rules help keep us safe.=1|🛝 We take turns on the slide.=1|🧑‍🍳 A chef puts out fires.=0|🏫 Only teachers work at school.=0
SQ:Morning at school|🏫 Arrive at school|⭕ Morning circle|📚 Learning time|🍎 Snack and play
CN:🚌=3=How many buses?|📚=5=How many books?
DL:Draw a helper at work. Tap a word. Label your drawing.|helper,tools,uniform,building,people,vehicle
OG:Helpers and Their Tools|Tap a tool. Then tap the helper who uses it.|👩‍⚕️ Doctor,🧑‍🍳 Chef,🧑‍🚒 Firefighter,👩‍🏫 Teacher|🩺 stethoscope=0|💊 medicine=0|🍳 pan=1|🥄 spoon=1|🚒 hose=2|⛑️ helmet=2
A:Be a Community Helper|Ask your family: What job do you do? How does it help people?|💌 Make a thank-you card for a school helper.|📋 Help make our class agreement.|🧺 Do one job at home every day.
U:I used to think… rules are boring. Now I think… rules help us work together.
CK:🤒 Who helps sick people?=👩‍⚕️ doctor;🧑‍🍳 chef;🚌 driver=0|🔥 Who puts out fires?=🧑‍🚒 firefighter;👩‍🏫 teacher;🧑‍🍳 chef=0|📋 Why do we have rules?=To keep us safe;To be sad;No reason=0|👍 Which is a good choice?=Wait my turn;Push in line;Shout in class=0
#
T:sharing-planet|6|Sharing the Planet|🌱|Living Things Need Care
C:Living things have needs, and people can help take care of them.
K:Plants and animals need food, water and a home. I can help take care of them.
L:What living things need to live (function)|How plants and animals grow and change (change)|How we can care for living things and their homes (responsibility)
KC:Function|Change|Responsibility
RC:Living things|Habitats|Care
LP:Caring|Inquirers|Principled
ATL:Research|Thinking
P:The Thirsty Plant|🌱 🐢 🐪 🦌 🐠 🌳|Show two plants. One got water and sun. One did not. Show a photo of the Arabian oryx and the mangroves at Al Thakhira in Qatar.|Ask: What happened to the plants?
S:🌰 ➡️ 🌱 ➡️ 🌻|What do you see happening?|What do you think the plant needs?|What do you wonder about how living things grow?
Q:How do plants drink water?|Why do animals need homes?|How does a seed know how to grow?|What do sea turtles eat?|How do camels live in the hot desert?|Why do leaves fall off trees?
W:🌱 plant=A plant needs water and sun.|🌰 seed=A seed grows into a plant.|💧 water=All living things need water.|☀️ sun=Plants need the sun to grow.|🐾 animal=An animal needs food and a home.|🐢 turtle=Sea turtles lay eggs on Qatar's beaches.
SO:Is it living or non-living?|🌱 Living|🪨 Non-living
SI:🐕 dog=0|🌳 tree=0|🐟 fish=0|🪨 rock=1|🪑 chair=1|🚗 car=1
TF:🌱 Plants need water to grow.=1|🐾 Animals need food.=1|🪨 A rock is a living thing.=0|🐟 Fish live in trees.=0
SQ:A plant grows|🌰 Seed|🌱 Sprout|🪴 Young plant|🌻 Flower
CN:🐢=3=How many turtles?|🌸=6=How many flowers?
DL:Draw a plant. Tap a word. Label the parts.|flower,leaf,stem,roots,soil,sun
OG:What Do Living Things Need?|Tap a picture. Then tap the need it shows.|🍎 Food,💧 Water,☀️ Air and Sun,🏡 Home (shelter)|🌾 grass for a camel=0|🌻 seeds for a bird=0|🚿 watering can=1|🦆 pond=1|🌞 sunlight=2|🌬️ fresh air=2
A:Planet Protector|Find a living thing at home or outside. What does it need?|🪴 Water our class plant every day.|🗑️ Pick up litter in the playground.|♻️ Recycle bottles at home.
U:I used to think… only people need care. Now I think… all living things need care.
CK:🌱 What does a plant need?=💧 water and sun;🍬 candy;📺 TV=0|❓ Which one is living?=🐕 dog;🪨 rock;🪑 chair=0|❓ Which one is non-living?=⚽ ball;🐟 fish;🌳 tree=0|🇶🇦 What is Qatar's national animal?=🦌 Arabian oryx;🐧 penguin;🐘 elephant=0
`;
const WBD_Y2 = `
T:who-we-are|1|Who We Are|💪|Healthy Me: Food, Exercise and Friendship
C:The choices we make about food, exercise, rest and friendship affect our wellbeing.
K:My choices about food, exercise, sleep and friends help me feel well.
L:What a balanced diet looks like (form)|How exercise and rest change our bodies (causation)|How good friendships help us feel well (responsibility)
KC:Form|Causation|Responsibility
RC:Wellbeing|Balance|Relationships
LP:Balanced|Caring|Reflective
ATL:Self-management|Social
P:Two Lunchboxes|🍱 🏃 😴 🤝 📱|Show two lunchboxes. One has water, bread, cheese, fruit and carrots. One has chips, sweets and soda. Then children run on the spot for one minute and feel their heartbeat.|Ask: Which lunchbox gives more energy for the whole day?
S:🥗🏊‍♀️😴  vs  🍟📺🌙|What do you see each child doing?|Which child will feel better tomorrow? Why?|What do you wonder about staying healthy?
Q:Why does my heart beat faster when I run?|What happens to food inside my body?|Why do I need to drink water?|How much sleep does a child need?|Why do some foods give us more energy?|How can exercise make me happy?
W:⚡ energy=Healthy food gives me energy to play.|🏃 exercise=I exercise for one hour every day.|💪 muscle=Exercise makes my muscles strong.|🥦 vegetable=I eat a vegetable at every meal.|🥚 protein=Eggs, fish and beans have protein.|⚖️ balanced=A balanced meal has different food groups.
SO:Does this give my body energy that lasts, or a quick sugar rush?|🔋 Lasting energy|⚡ Quick sugar rush
SI:🍞 brown bread=0|🍚 rice=0|🫘 beans=0|🍭 lollipop=1|🥤 fizzy drink=1|🍫 chocolate bar=1
TF:💪 Exercise makes my heart and muscles stronger.=1|😴 Children need about ten hours of sleep.=1|🍬 Sweets give energy that lasts all day.=0|🙅 A good friend leaves you out of games.=0
SQ:Make a healthy wrap|🧼 Wash hands|🫓 Lay out the bread|🥗 Add chicken and salad|🌯 Roll and eat
CN:🥕=9=How many carrots?|🍎=12=How many apples?
DL:Draw a healthy lunchbox. Label each food group.|fruit,vegetables,grains,protein,dairy,water
OG:Food Groups Plate|Tap a food. Then tap its food group.|🥦 Fruit & Veg,🍞 Grains,🍗 Protein,🥛 Dairy|🍊 orange=0|🥒 cucumber=0|🍚 rice=1|🍝 pasta=1|🍗 chicken=2|🫘 lentils=2
A:My Healthy Habit Challenge|Plan one balanced family meal together. Which food groups are on the plate?|🍱 Bring a balanced lunchbox for five days.|🚴 Do 20 minutes of active play after school.|💧 Swap one fizzy drink for water each day.
U:I used to think… healthy means only eating vegetables. Now I think… healthy means balance: food, exercise, sleep and friends.
CK:🍽️ Which meal is balanced?=Rice, fish and salad;Chips and soda;Only cake=0|💓 What happens to my heart when I run?=It beats faster;It stops;It beats slower=0|🍗 Which food has protein?=🥚 eggs;🍭 lollipop;🥤 soda=0|🧼 Why do we wash our hands?=To remove germs;To make them cold;To change colour=0
TH:Why is water better than a fizzy drink? Give one reason.|What makes a good friend? Name two things.
#
T:where-we-are|2|Where We Are in Place and Time|🗺️|My Community: Places and Maps
C:Communities have places that meet people's needs, and maps help us find our way.
K:My community has places that help people. Maps help me find them.
L:Places in our community and what they are for (function)|How maps and symbols show where things are (form)|How our community has changed over time (change)
KC:Function|Form|Change
RC:Location|Community|Navigation
LP:Inquirers|Thinkers|Communicators
ATL:Thinking|Research
P:The Lost Visitor|🏥 🏫 🕌 🛒 🏞️ 🚏|A toy visitor arrives with a note: I am lost! I need a doctor, a park and a supermarket. Show a simple map of a neighbourhood with symbols.|Ask: How can we help the visitor?
S:🗺️ 📍 ➡️ 🏥|What do you see on the map?|What do you think the symbols mean?|What do you wonder about maps and places?
Q:Why do maps use symbols?|How did people find their way before phones?|Why are hospitals in different places?|What would my community need if it grew bigger?|Why do some streets have names and numbers?|How do sailors use the stars?
W:🗺️ map=A map is a drawing of a place from above.|📍 symbol=A symbol is a small picture on a map.|🔑 key=The key tells us what each symbol means.|🏥 hospital=We go to the hospital when we are very sick.|🕌 mosque=People pray at the mosque.|🛒 supermarket=We buy food at the supermarket.
SO:Is this place mostly for needs or for fun and free time?|🏥 Meets needs|🎡 Fun and free time
SI:🏥 hospital=0|🛒 supermarket=0|🚒 fire station=0|🎡 theme park=1|🎬 cinema=1|🛝 playground=1
TF:🗺️ A map shows a place from above.=1|🔑 The map key explains the symbols.=1|🏘️ Every community looks exactly the same.=0|🏙️ Doha has not changed in 50 years.=0
SQ:Walk to the park|🏠 Leave home|🕌 Turn left at the mosque|🚸 Cross at the crossing|🏞️ Arrive at the park
CN:🏠=12=How many houses are on the street?|🌳=9=How many trees are in the park?
DL:Draw a map of your way to school. Add symbols and a key.|home,school,road,mosque,park,shop
OG:Community Places Chart|Tap a person's need. Then tap the place that helps.|🏥 Health,🛒 Food,🏫 Learning,🚓 Safety|🤒 I have a fever=0|💊 I need medicine=0|🍞 We need bread=1|🍇 We need fruit=1|📚 I want to read=2|➕ I want to learn maths=2
A:Community Map Makers|Walk around your area with your family. Find three places that help people.|🗺️ Make a map of our school for new students.|➡️ Give a friend directions using left and right.|🚶 Walk around my area with family and draw a map.
U:I used to think… a map is just a picture. Now I think… a map uses symbols and a key to help people find places.
CK:🗺️ What tells us what map symbols mean?=The key;The road;The title=0|🤒 Where do we go when we are very sick?=🏥 hospital;🎬 cinema;🏖️ beach=0|🧭 What does a compass show?=Directions;The time;The weather=0|⬇️ A map shows a place from…=above;inside;underground=0
TH:Which place in your community is most important? Why?|How would you explain the way from class to the library?
#
T:express-ourselves|3|How We Express Ourselves|📚|Folktales and Fables from Around the World
C:Folktales and fables from different cultures share lessons and values.
K:Stories from many cultures teach us lessons about how to live.
L:The parts of a story: characters, setting and problem (form)|Lessons and values in fables and folktales (connection)|How stories from different cultures are alike and different (perspective)
KC:Form|Connection|Perspective
RC:Values|Culture|Storytelling
LP:Communicators|Open-minded|Principled
ATL:Communication|Thinking
P:The Storyteller's Chair|🐢 🐇 🦊 🍇 🫏 👳|A special chair holds a scarf, a toy tortoise, a toy hare and a donkey. Tell the fable of the Tortoise and the Hare, and a Juha (Goha) story from the Arab world.|Ask: What did the characters learn?
S:🐢 🏁 🐇💤|What do you see in this race?|What do you think will happen? Why?|What do you wonder about this story?
Q:Why do so many fables have talking animals?|Who wrote the first stories?|Why do stories have a problem?|What stories did my grandparents tell me?|Why is Juha so funny?|How do stories teach us to be good?
W:🦊 character=The fox is a tricky character.|🌲 setting=The setting is where the story happens.|❗ problem=Every story has a problem to solve.|💡 solution=The solution fixes the problem.|🐢 fable=A fable is a short story with a lesson.|📜 folktale=A folktale is an old story from a culture.
SO:Is this a character or a setting?|🧑 Character (who)|🏝️ Setting (where)
SI:🐢 a tortoise=0|👸 a princess=0|🦊 a fox=0|🌲 a forest=1|🏰 a castle=1|🏜️ the desert=1
TF:🎓 A fable often has a lesson at the end.=1|🐢 In the fable, the tortoise wins the race.=1|🌲 The setting is who is in the story.=0|🌍 Folktales are only from one country.=0
SQ:The Tortoise and the Hare|🐇 The hare laughs at the slow tortoise|🏁 They start a race|💤 The hare stops to sleep|🐢 The tortoise wins
CN:🍇=12=How many grapes are on the vine?|🐑=9=How many sheep?
DL:Draw your favourite story character in its setting. Label it.|character,setting,problem,hero,home,friend
OG:Story Mountain|Tap a story part. Then tap where it goes on the story mountain.|🌅 Beginning,⛰️ Problem,💡 Solution,🏁 Ending|🏖️ A boy lives by the sea=0|📖 Once upon a time…=0|⛈️ A storm breaks his boat=1|😨 He is lost and scared=1|🐬 A dolphin shows him the way=2|🔨 He fixes the boat=2
A:Story Sharers|Ask someone at home: What story did you love as a child? What was the lesson?|👵 Ask my family for a story from our culture and retell it.|🎭 Act out a fable with friends.|📖 Read a story to a younger child.
U:I used to think… stories are just for fun. Now I think… stories teach lessons and share culture.
CK:🧑 Who are the people or animals in a story?=Characters;Setting;Title=0|🏰 Where a story happens is the…=setting;character;lesson=0|🏁 Who wins the race in the fable?=🐢 tortoise;🐇 hare;🦊 fox=0|📜 What is a fable?=A short story with a lesson;A shopping list;A song=0
TH:What lesson did the hare learn? Why?|Who is your favourite character? Why?
#
T:world-works|4|How the World Works|🧪|Materials All Around Us
C:Materials have properties that make them useful for different jobs.
K:Things are made of materials. Each material is good for different jobs.
L:Common materials and where they come from (form)|Properties of materials: hard, soft, waterproof, see-through (function)|How materials can change when we heat, cool or bend them (change)
KC:Form|Function|Change
RC:Properties|Investigation|Design
LP:Inquirers|Thinkers|Risk-takers
ATL:Research|Thinking
P:The Leaky Umbrella|🧱 🪵 🥄 🪟 🧸 🧻|A teddy needs an umbrella. Children test paper, foil, plastic and fabric with a spray bottle of water. Which one keeps teddy dry?|Ask: What do you predict?
S:🧊 ➡️ 💧    🍫 ➡️ 🫠|What do you see happening?|What do you think made it change?|What do you wonder about materials?
Q:Why is glass see-through?|How is paper made from trees?|Why do boats float but stones sink?|What happens to chocolate in the sun?|Why are windows not made of wood?|Which material is the strongest?
W:🪵 wood=Wood comes from trees.|🥄 metal=This spoon is made of metal.|🧴 plastic=The bottle is made of plastic.|🪟 glass=Glass is hard and see-through.|🧵 fabric=My clothes are made of fabric.|📄 paper=Paper tears easily.
SO:Will it float or sink in water?|🛟 Floats|⚓ Sinks
SI:🍾 cork=0|🪵 wooden block=0|🍃 leaf=0|🪨 stone=1|🔑 metal key=1|🪙 coin=1
TF:🪟 Glass is transparent.=1|🌳 Wood comes from trees.=1|📄 Paper is waterproof.=0|🔑 A metal key floats on water.=0
SQ:From tree to paper|🌳 Cut the tree|🪵 Make wood chips|🥣 Mash into pulp|📄 Press and dry paper
CN:🧱=12=How many bricks?|🥄=8=How many metal spoons?
DL:Draw a house. Label the material of each part.|glass,wood,metal,brick,fabric,plastic
OG:Material Detectives|Tap an object. Then tap the material it is made of.|🪵 Wood,🔩 Metal,🪟 Glass,🧵 Fabric|🪑 chair=0|✏️ pencil=0|🔑 key=1|🍳 pan=1|🪟 window=2|🫙 jar=2
A:Material Makers|Go on a material hunt at home. Find something wood, metal, glass and fabric.|🎩 Design a waterproof hat for a toy.|♻️ Sort the class recycling by material.|📦 Make a toy from old boxes and bottles.
U:I used to think… things are just things. Now I think… we choose materials because of their properties.
CK:🔍 Which material is transparent?=🪟 glass;🪵 wood;🧱 brick=0|🌧️ Which is best for a raincoat?=Plastic;Paper;Cotton wool=0|🧊 What happens to ice in the sun?=It melts;It gets harder;It turns to wood=0|🪵 Where does wood come from?=🌳 trees;🪨 rocks;🌊 the sea=0
TH:Why is a cup not made of paper? Give a reason.|Which material would you use for a boat? Why?
#
T:organize-ourselves|5|How We Organize Ourselves|🚜|From Farm to Table
C:Food travels through a system of people and jobs before it reaches our table.
K:Many people work together to bring food from the farm to my plate.
L:Where our food comes from (connection)|The jobs and steps that move food from farm to table (function)|How we can make responsible food choices (responsibility)
KC:Connection|Function|Responsibility
RC:Systems|Production|Interdependence
LP:Knowledgeable|Caring|Thinkers
ATL:Research|Social
P:The Journey of a Loaf|🌾 🚜 🏭 🚚 🛒 🍞|Put a loaf of bread, a bag of flour and some wheat on the table. Show photos of a farm in Qatar, a dairy farm (Baladna) and a supermarket.|Ask: How did this bread get here?
S:🐄 ➡️ 🥛 ➡️ 🧀|What do you see in these pictures?|What do you think happens between each picture?|What do you wonder about where food comes from?
Q:How does milk get from a cow to a carton?|Where do bananas grow?|How do farmers grow food in the desert?|Why do some foods come on planes?|Who decides the price of food?|How do dates grow on palm trees?
W:🧑‍🌾 farmer=The farmer grows crops.|🌾 crop=Wheat is a crop.|🧺 harvest=We harvest dates in summer.|🏭 factory=The factory makes flour into bread.|🚚 truck=A truck takes food to the shops.|🛒 market=We buy vegetables at the market.
SO:Does this food come from a plant or an animal?|🌱 From a plant|🐄 From an animal
SI:🍚 rice=0|🌴 dates=0|🍅 tomato=0|🥛 milk=1|🥚 egg=1|🧀 cheese=1
TF:🍞 Bread is made from wheat.=1|🧑‍🤝‍🧑 Many people help bring food to the shop.=1|🥛 Milk comes from trees.=0|🛒 All our food comes from the supermarket only.=0
SQ:Wheat to bread|🌾 Farmer grows wheat|🏭 Mill makes flour|🧑‍🍳 Baker bakes bread|🍞 We buy and eat it
CN:🌾=12=How many bundles of wheat?|🐄=8=How many cows?
DL:Draw the journey of one food from farm to table. Label each step.|farm,farmer,factory,truck,shop,table
OG:Food Journey Flow Chart|Tap a job. Then tap the step of the food journey.|🌱 Grow,🏭 Make,🚚 Move,🛒 Sell|🧑‍🌾 farmer=0|🎣 fisherman=0|🧑‍🍳 baker=1|🏭 factory worker=1|🚚 truck driver=2|🚢 ship captain=2
A:Food Heroes|Look at food labels at home. Which countries does your food come from?|🍱 Finish my lunch or save it for later.|🏷️ Read three food labels at home and find the country.|🌿 Grow herbs or beans in a pot.
U:I used to think… food comes from the shop. Now I think… food comes from farms and many people help it reach us.
CK:🍞 Bread is made from…=🌾 wheat;🥛 milk;🍯 honey=0|🌱 Who grows crops?=Farmer;Pilot;Doctor=0|🐄 Which food comes from an animal?=🧀 cheese;🍚 rice;🍅 tomato=0|🚚 Who moves food to the shops?=Truck driver;Baker;Teacher=0
TH:Name three people who helped make your lunch.|What would happen if truck drivers stopped working?
#
T:sharing-planet|6|Sharing the Planet|🐫|Animal Habitats
C:Animals live in habitats that give them what they need, and their bodies are suited to where they live.
K:Animals live in habitats. Their bodies help them live there.
L:Different habitats around the world (form)|How animals' bodies help them survive in their habitat (function)|How people can protect habitats (responsibility)
KC:Form|Function|Responsibility
RC:Habitat|Adaptation|Survival
LP:Inquirers|Caring|Knowledgeable
ATL:Research|Thinking
P:Animals in the Wrong Home|🏜️ 🌊 🧊 🌳 🐪 🐠 🐧 🐒|Show a picture of a penguin in the desert and a camel on the ice. Something is wrong! Display four habitat mats: desert, ocean, polar and rainforest.|Ask: What is wrong with these pictures?
S:🐪 🏜️ ☀️ 🌵|What do you see about the camel and its home?|What do you think helps the camel live there?|What do you wonder about animals and their homes?
Q:How long can a camel go without water?|Why do polar bears have white fur?|How do fish breathe underwater?|Why do some animals sleep in the day?|Where do sea turtles go after they hatch?|How does a monkey's tail help it?
W:🏞️ habitat=A habitat is where an animal lives.|🏜️ desert=The desert is hot and dry.|🌊 ocean=Whales live in the ocean.|🧊 polar=Polar places are very cold.|🌳 rainforest=The rainforest is hot and wet.|🐪 camel=A camel stores fat in its hump.
SO:Does this animal live on land or in water?|🏜️ Mostly on land|🌊 Mostly in water
SI:🐪 camel=0|🦌 oryx=0|🦁 lion=0|🦈 whale shark=1|🐬 dolphin=1|🐙 octopus=1
TF:🏞️ A habitat gives animals food, water and shelter.=1|🐪 Camels can go many days without drinking.=1|🐧 Penguins live in hot deserts.=0|🐟 Fish breathe with lungs like us.=0
SQ:A sea turtle's life|🥚 Eggs on the beach|🐣 Babies hatch|🌊 Race to the sea|🐢 Grow into adults
CN:🐠=12=How many fish on the reef?|🐧=9=How many penguins?
DL:Draw an animal in its habitat. Label how its body helps it.|fur,fins,gills,hump,big ears,claws
OG:Habitat Sorting Mat|Tap an animal. Then tap its habitat.|🏜️ Desert,🌊 Ocean,🧊 Polar,🌳 Rainforest|🐪 camel=0|🦂 scorpion=0|🐋 whale=1|🦀 crab=1|🐻‍❄️ polar bear=2|🐧 penguin=2
A:Habitat Helpers|Find an animal near your home (a bird, a cat, an insect). What is its habitat?|🏖️ Join a beach clean-up with my family.|🐦 Make a bird bath for our school garden.|🐢 Make a poster: Keep turtle beaches clean.
U:I used to think… animals can live anywhere. Now I think… animals' bodies are suited to their own habitat.
CK:🏞️ What is a habitat?=Where an animal lives;What an animal eats;An animal's name=0|🏜️ Which animal lives in the desert?=🐪 camel;🐧 penguin;🐋 whale=0|🐟 How do fish breathe?=With gills;With lungs;With ears=0|🐻‍❄️ Why does a polar bear have thick fur?=To stay warm;To swim fast;To look big=0
TH:How does a camel's body help it live in the desert?|Compare the desert and the ocean. How are they different?
`;
const WBD_Y3 = `
T:who-we-are|1|Who We Are|🫀|Amazing Body Systems
C:The human body is made of systems that work together to keep us alive and healthy.
K:My body has systems, like a team. They work together to keep me alive and healthy.
L:The main body systems and their organs (form)|How body systems work together (connection)|How our habits affect our body systems (causation)
KC:Form|Connection|Causation
RC:Systems|Interdependence|Health
LP:Knowledgeable|Inquirers|Balanced
ATL:Research|Thinking
P:The Body Orchestra|🫀 🫁 🧠 🦴 💪 🍽️|Play a short piece of orchestra music, then mute the drums. Something is missing! Show a life-size outline of a child on the floor and a model skeleton.|Ask: How is your body like an orchestra?
S:🏃‍♀️ ➡️ 💓📈 🫁💨|What do you notice happens to the runner's body?|Which systems do you think are working hardest? Why?|What do you wonder about how the body works?
Q:How does the heart pump blood all around the body?|Why do we breathe faster when we exercise?|How does the brain send messages so quickly?|What happens to food after we swallow it?|How many bones are in the human body?|Why do broken bones heal?
W:💀 skeleton=The skeleton supports and protects the body.|🫀 organ=The heart is an organ that pumps blood.|🫁 lungs=Our lungs take in oxygen when we breathe.|🧠 brain=The brain controls the whole body.|💪 muscles=Muscles pull on bones to make them move.|🍽️ digestion=Digestion breaks food into nutrients.
SO:Is this organ part of the circulatory/respiratory team or the digestive team?|🫀 Heart and lungs team|🍽️ Digestive team
SI:🫀 heart=0|🫁 lungs=0|🩸 blood=0|🥣 stomach=1|🦷 teeth=1|🌀 small intestine=1
TF:💀 The skeleton protects organs like the brain and heart.=1|💓 Your pulse rate rises during exercise.=1|💪 Muscles push bones; they never pull.=0|🫁 The lungs pump blood around the body.=0
SQ:The journey of food|🦷 Mouth: teeth chew|⬇️ Food pipe: food slides down|🥣 Stomach: food is mixed|🌀 Intestines: nutrients absorbed
CN:🦴=18=Count the bones in this pile.|💓=15=How many heartbeats in 10 seconds?
DL:Draw the outline of a body. Draw and label four organs in the right places.|brain,heart,lungs,stomach,intestines,skeleton
OG:Body Systems Table|Tap an organ or part. Then tap the system it belongs to.|🦴 Skeletal,🫀 Circulatory,🫁 Respiratory,🧠 Nervous|💀 skull=0|🦴 ribs=0|🫀 heart=1|🩸 blood vessels=1|🫁 lungs=2|🌬️ windpipe=2
A:Body Systems Champions|Measure your family's pulse at rest and after climbing stairs. Compare the results.|⏱️ Measure my pulse before and after 2 minutes of skipping.|🖼️ Create a fact poster about one body system.|🥗 Plan a week of meals that help digestion (fibre and water).
U:I used to think… my organs work alone. Now I think… body systems work together like a team.
CK:💀 What is the main job of the skeleton?=Support and protect the body;Digest food;Pump blood=0|🩸 Which organ pumps blood?=Heart;Lungs;Stomach=0|🏃 Why does your pulse rise when you run?=Muscles need more oxygen;The heart gets tired;Blood gets cold=0|🍽️ Where does digestion begin?=Mouth;Brain;Feet=0
TH:Explain how the heart and lungs work together when you play football.|Compare the skeletal system and the muscular system. How do they help each other?
#
T:where-we-are|2|Where We Are in Place and Time|⛵|Qatar Then and Now: Pearls to Progress
C:Discoveries and new technology change how people live, while heritage connects us to the past.
K:New discoveries changed life in Qatar. Our heritage connects us to the past.
L:How people in Qatar lived in the pearl-diving era (form)|How the discovery of oil and gas changed life (change and causation)|Why people preserve heritage and traditions today (perspective)
KC:Change|Causation|Perspective
RC:Heritage|Chronology|Evidence
LP:Inquirers|Knowledgeable|Open-minded
ATL:Research|Thinking
P:The Pearl Diver's Box|🦪 ⛵ 🏚️  ➡️  🛢️ 🏙️ 🚇|Pass around a diver's nose clip (fitaam), a weight stone, a basket and a pearl. Play a short recording of a traditional sea song (fijiri).|Ask: What could these objects tell us about life long ago?
S:🏚️🐪🌴  /  🏙️🚗🏟️|What do you notice in the two photos of Doha?|What do you think caused these changes?|What do you wonder about Qatar's past and future?
Q:How long could pearl divers hold their breath?|Why did the pearl trade end?|When was oil discovered in Qatar?|How did people get fresh water before desalination?|What was school like for my grandparents?|Why do we still have dhow races?
W:🏛️ heritage=Heritage is the history and traditions we pass on.|🦪 pearl diving=Pearl diving was the main job in Qatar long ago.|⛵ dhow=A dhow is a traditional wooden boat.|⛺ Bedouin=Bedouin families moved across the desert with their animals.|🛢️ oil=Oil was discovered in Qatar in 1939.|🏺 artefact=An artefact is an object made by people long ago.
SO:Was this part of life before oil, or after oil?|🦪 Before oil|🛢️ After oil
SI:🦪 pearl diving=0|🐪 travel by camel caravan=0|🪣 water from wells=0|🚰 desalination plants=1|🚇 Doha Metro=1|❄️ air conditioning=1
TF:🦪 Pearl diving was once the main job in Qatar.=1|🛢️ Oil was discovered in Qatar in 1939.=1|🚇 Long ago, Qatar had a metro system.=0|🌬️ Wind towers used electricity to cool houses.=0
SQ:Qatar's timeline|🦪 Pearl diving era|🛢️ Oil discovered (1939)|🇶🇦 Independence (1971)|🏟️ FIFA World Cup (2022)
CN:🦪=17=The diver found these oysters. How many?|⛵=13=How many dhows are in the harbour?
DL:Draw a Qatari house from long ago and a modern home. Label the differences.|wind tower,coral stone,courtyard,air conditioner,glass,tower
OG:Then and Now Comparison Chart|Tap a fact. Then tap the part of life it belongs to.|💼 Jobs,🏠 Homes,🚗 Travel,💧 Water|🦪 pearl diver=0|👷 engineer=0|🏚️ coral-stone house=1|🏢 apartment tower=1|🐪 camel caravan=2|🚇 metro train=2
A:Heritage Keepers|Find one old object or photo at home. What does it tell you about the past?|🎙️ Interview a grandparent about life before modern Doha and record it.|🏺 Create a class museum of family artefacts with labels.|📘 Make a then-and-now booklet for younger students.
U:I used to think… the past is just old stories. Now I think… evidence helps us understand how and why life changed.
CK:💼 What was Qatar's main job before oil?=Pearl diving;Car making;Space travel=0|🛢️ When was oil discovered in Qatar?=1939;2022;1800=0|🏺 What is an artefact?=An object made by people long ago;A modern phone;A type of food=0|🌬️ How did wind towers help?=They cooled houses naturally;They made electricity;They held water=0
TH:Explain how the discovery of oil changed homes in Qatar.|Compare a pearl diver's day with an engineer's day today.
#
T:express-ourselves|3|How We Express Ourselves|🎤|Poetry, Rhythm and Performance
C:People use rhythm, words and performance to communicate ideas, feelings and culture.
K:Poems, songs and performances help people share ideas and feelings.
L:Features of poems: rhythm, rhyme and imagery (form)|How performers use voice and body to express meaning (function)|How poetry and music reflect different cultures (perspective)
KC:Form|Function|Perspective
RC:Rhythm|Expression|Audience
LP:Communicators|Risk-takers|Reflective
ATL:Communication|Thinking
P:The Beat of Words|🥁 📝 🎭 🎵 🪘|Children clap the rhythm of their names. Then listen to a short poem read flat and then read with expression. Show a clip of a Nabati poem being recited.|Ask: Which reading did you prefer?
S:🎙️🧒 + 👏👏👏|What do you notice the performer is doing?|How do you think the audience feels? Why?|What do you wonder about poems and performing?
Q:Why do some poems rhyme and others do not?|How do poets choose their words?|What is Nabati poetry?|Why do songs get stuck in our heads?|How can my voice show feelings?|Why do poems have rhythm?
W:🔔 rhyme=Cat and hat rhyme because they end with the same sound.|🥁 rhythm=Rhythm is the beat in a poem or song.|📜 verse=A verse is a group of lines in a poem.|🐆 simile=As fast as a cheetah is a simile.|👏 syllable=Clap each syllable: pa-per has two.|👥 audience=The audience watched the show.
SO:Do these two words rhyme?|🔔 Rhyme|❌ Do not rhyme
SI:🌙 moon / spoon=0|🏖️ sand / hand=0|⛵ boat / coat=0|⭐ star / sun=1|🐟 fish / bird=1|🏜️ desert / camel=1
TF:🌸 A haiku has three lines.=1|🥁 Rhythm is the beat of a poem.=1|📜 All poems must rhyme.=0|😐 Performers should always speak in one flat voice.=0
SQ:Prepare a performance|📜 Choose a poem|🎭 Practise with expression|🎤 Perform for an audience|💬 Reflect on feedback
CN:👏=12=Count the claps in this rhythm.|🥁=16=How many drum beats?
DL:Draw a picture for a poem about the desert or the sea. Label the images in the poem.|sun,dunes,waves,dhow,palm tree,moon
OG:Performance Toolkit|Tap a performance tip. Then tap the tool it uses.|🗣️ Voice,😮 Face,🙌 Body|🔊 speak louder for excitement=0|⏸️ pause before a surprise=0|🤫 whisper a secret line=0|😀 smile on happy lines=1|👀 look at the audience=1|😲 raise eyebrows in surprise=1
A:Poetry in Action|Ask your family for a poem, song or saying from your culture. What does it mean?|🎤 Perform a poem at assembly.|💌 Write a poem for someone who helps me.|🎙️ Record a family member reciting a poem in our home language.
U:I used to think… a poem is just words that rhyme. Now I think… poems use rhythm, images and performance to share meaning.
CK:🔔 Which pair rhymes?=night / light;sun / moon;fish / bird=0|🌸 How many lines does a haiku have?=Three;Ten;One=0|🐭 'As quiet as a mouse' is a…=simile;rhyme;title=0|🐪 How many syllables in 'camel'?=Two;One;Four=0
TH:Explain why reading with expression changes how a poem feels.|Compare a rhyming poem and a haiku. How are they different?
#
T:world-works|4|How the World Works|🧲|Forces and Motion: Push, Pull and Go!
C:Forces act on objects to make them start, stop, speed up, slow down or change direction.
K:Forces are pushes and pulls. They make things move, stop and turn.
L:Types of forces: push, pull, gravity, friction and magnetism (form)|How forces change the way objects move (causation)|How people use forces in machines, sport and daily life (function)
KC:Causation|Function|Form
RC:Energy|Motion|Investigation
LP:Thinkers|Inquirers|Risk-takers
ATL:Research|Thinking
P:The Great Car Race|🚗 🛝 🧲 ⚽ 🪁|Set up a ramp. Roll a toy car down on carpet, then on tiles, then on sand. Which surface lets it go furthest? Show a magnet picking up paper clips through paper.|Ask: What made the car stop?
S:⚽ ➡️ 🥅   🍎 ⬇️|What do you notice about how the ball and the apple move?|What force do you think is acting on each one?|What do you wonder about forces?
Q:Why do things fall down and not up?|Why is it hard to walk on ice?|How do magnets work?|Why do cars have brakes?|How does a parachute slow someone down?|Why do heavy ships float?
W:💥 force=A force is a push or a pull.|🫸 push=I push the door to open it.|🫷 pull=I pull the rope in tug of war.|🍎 gravity=Gravity pulls objects towards the Earth.|🛑 friction=Friction slows moving things down.|🧲 magnet=A magnet attracts iron and steel.
SO:Is this action mainly a push or a pull?|🫸 Push|🫷 Pull
SI:⚽ kick a ball=0|🔘 press a button=0|🛒 push a trolley=0|🗃️ open a drawer=1|🪢 tug of war=1|🛷 pull a wagon=1
TF:💥 A force is a push or a pull.=1|🟫 Friction is greater on rough surfaces.=1|🍎 Gravity pulls objects up into the sky.=0|🥫 Magnets attract all metals, including aluminium cans.=0
SQ:Plan a fair test|❓ Ask: which surface has most friction?|📐 Keep the car and ramp the same|🟫 Change only the surface|📏 Measure distance and compare
CN:📎=17=How many paper clips did the magnet pick up?|🚗=12=The car rolled this many tiles. How many?
DL:Draw a playground. Use arrows to show forces. Label each force.|push,pull,gravity,friction,air resistance,magnet
OG:Force Finder Chart|Tap an example. Then tap the force that matters most.|🌍 Gravity,🛑 Friction,🧲 Magnetism,🪂 Air resistance|🍎 an apple falls=0|🌧️ rain falls down=0|🚲 bike brakes=1|👟 shoes grip the floor=1|🧲 fridge magnet sticks=2|🧭 compass points north=2
A:Force Engineers|Find five pushes and five pulls at home. Which one needed the most force?|🥚 Design a parachute that falls slowly for an egg.|🎢 Build a marble run and explain the forces.|🛝 Suggest safer playground surfaces using friction.
U:I used to think… things just move by themselves. Now I think… a force always causes a change in motion.
CK:💥 What is a force?=A push or a pull;A colour;A sound=0|🌍 Which force pulls things to the Earth?=Gravity;Friction;Magnetism=0|🟫 Which surface has the most friction?=Sand;Ice;Glass=0|🧲 What do magnets attract?=Iron and steel;Plastic;Wood=0
TH:Explain why the car went further on tiles than on carpet.|Compare gravity and magnetism. How are they alike?
#
T:organize-ourselves|5|How We Organize Ourselves|🪙|Markets, Money and Trade
C:People exchange goods and services to meet their needs and wants.
K:People buy, sell and trade things to get what they need and want.
L:The difference between needs and wants, goods and services (form)|How trade and money have changed from bartering to cards (change)|How we make responsible choices with money (responsibility)
KC:Form|Change|Responsibility
RC:Exchange|Value|Choice
LP:Thinkers|Principled|Communicators
ATL:Thinking|Social
P:The Souq Swap|🛍️ 🪙 🧺 🌶️ 💳 🐪|Give each group a bag of items (pencils, stickers, dates, erasers) and no money. Groups must trade to get what they need. Show photos of Souq Waqif old and new.|Ask: Was trading easy or hard?
S:🐚 ➡️ 🪙 ➡️ 💵 ➡️ 💳 ➡️ 📱|What do you notice about how people paid over time?|Why do you think money kept changing?|What do you wonder about money and trade?
Q:Why did people stop bartering?|Who decides how much things cost?|Why is gold valuable?|How does a bank keep money safe?|What did traders sell in old Doha souqs?|Why are some things more expensive in summer?
W:📦 goods=Goods are things we can buy, like shoes.|✂️ services=A haircut is a service someone does for us.|💧 need=Water is a need; we cannot live without it.|🎮 want=A video game is a want, not a need.|🔄 barter=To barter means to swap goods without money.|💵 riyal=Qatar's money is the riyal.
SO:Is this a need or a want?|💧 Need|🎮 Want
SI:💧 water=0|🥗 healthy food=0|🏠 a home=0|🎮 video game=1|🚗 new toy car=1|🍬 sweets=1
TF:🔄 Bartering means swapping goods without money.=1|✂️ A haircut is a service.=1|🎮 A want is something we cannot live without.=0|🏷️ Prices never change.=0
SQ:History of money|🔄 Bartering|🪙 Shells and coins|💵 Paper notes|📱 Cards and phones
CN:🪙=18=How many riyal coins are in the jar?|💵=12=How many notes?
DL:Design a stall for a class market. Label your goods and prices.|goods,price,sign,seller,customer,money
OG:Goods or Services?|Tap an example. Then tap goods or services.|📦 Goods (things),🛠️ Services (jobs done for us)|⚽ a football=0|🍞 a loaf of bread=0|📕 a book=0|👟 a pair of shoes=0|🚕 a taxi ride=1|🦷 a dentist check-up=1
A:Smart Spenders|With your family, sort this week's shopping into needs and wants.|❤️ Run a class market and give profits to charity.|🐷 Make a savings plan for something I want.|⚖️ Compare prices of one item in two shops.
U:I used to think… money is just for buying toys. Now I think… money is a tool for exchange and we should use it wisely.
CK:💧 Which is a need?=Clean water;A video game;Sweets=0|🔄 What is bartering?=Swapping goods without money;Saving in a bank;Paying by card=0|🛠️ Which is a service?=A haircut;A pencil;An apple=0|💵 What is Qatar's money called?=Riyal;Dollar;Yen=0
TH:Explain the difference between a need and a want with two examples.|Why was bartering difficult? Give a reason.
#
T:sharing-planet|6|Sharing the Planet|💧|Water: Every Drop Counts
C:Water is a limited resource that all living things share and must protect.
K:All living things share water. There is not much fresh water, so we must protect it.
L:How the water cycle moves water around the Earth (change)|Where our water comes from in a desert country like Qatar (connection)|How we can use water responsibly (responsibility)
KC:Change|Connection|Responsibility
RC:Resources|Cycles|Conservation
LP:Caring|Thinkers|Principled
ATL:Research|Thinking
P:The Last Drop|🌍 💧 🧊 🌊 🚰|Fill a big jug with water: all the water on Earth. Take out one small spoon: the fresh water we can use. Show a photo of a desalination plant in Qatar.|Ask: Why is so little water usable?
S:☀️ ➡️ 🌊 ➡️ ☁️ ➡️ 🌧️|What do you notice in this picture of the water cycle?|What do you think makes the water go up into the clouds?|What do you wonder about water?
Q:Why is sea water salty?|How does desalination turn salt water into fresh water?|Where does rain come from?|How much water do I use in one day?|Why does Qatar have so little rain?|How do plants in the desert survive?
W:♨️ evaporation=Evaporation is when the sun warms water and it turns into vapour.|☁️ condensation=Condensation is when vapour cools and forms clouds.|🌧️ precipitation=Precipitation is rain, snow or hail falling from clouds.|🌊 collection=Water collects in seas, lakes and under the ground.|🚰 fresh water=Fresh water is not salty; we can drink it.|🏭 desalination=Desalination removes salt from sea water.
SO:Does this action save water or waste water?|✅ Saves water|❌ Wastes water
SI:🪥 turn off the tap while brushing=0|🚿 take a short shower=0|🔧 fix a dripping tap=0|🧯 leave the hose running=1|🚗 wash the car every day=1|🫗 pour leftover water away=1
TF:🌊 Most of the water on Earth is salty.=1|♨️ Evaporation happens when water is heated.=1|🏞️ Qatar gets most of its drinking water from rivers.=0|🧂 Desalination adds salt to water.=0
SQ:The water cycle|♨️ Evaporation|☁️ Condensation|🌧️ Precipitation|🌊 Collection
CN:💧=20=How many drops fell from the leaking tap?|🪣=12=How many buckets of water for the garden?
DL:Draw the water cycle over Qatar. Use arrows and label each stage.|sun,sea,evaporation,condensation,clouds,precipitation
OG:Water Cycle Diagram|Tap a description. Then tap the stage of the water cycle.|♨️ Evaporation,☁️ Condensation,🌧️ Precipitation,🌊 Collection|☀️ sun heats the sea=0|💨 puddle dries up=0|☁️ vapour cools into clouds=1|🥛 drops on a cold glass=1|🌧️ rain falls=2|🧊 hail falls=2
A:Water Guardians|Count how many times your family uses water in one evening. Where could you save?|📊 Do a home water audit and cut our use.|🖼️ Make posters for school taps: Turn me off!|🪴 Collect AC condensation water for plants.
U:I used to think… water never runs out. Now I think… fresh water is limited and we must conserve it.
CK:♨️ What is evaporation?=Water turning into vapour;Rain falling;Water freezing=0|☁️ Clouds form during…=condensation;collection;irrigation=0|🇶🇦 Where does most of Qatar's water come from?=Desalinated sea water;Big rivers;Melting snow=0|🌍 Most of Earth's water is…=salty;fresh;frozen juice=0
TH:Explain the water cycle in four steps.|Why does a desert country like Qatar need desalination?
`;
const WBD_Y4 = `
T:who-we-are|1|Who We Are|⚖️|Rights, Responsibilities and Respect
C:All children have rights, and with these rights come responsibilities towards others.
K:Every child has rights. Our rights come with responsibilities to respect others.
L:What children's rights are and why they matter (perspective)|How rights and responsibilities are connected (connection)|How our actions can protect the rights of others (responsibility)
KC:Perspective|Connection|Responsibility
RC:Rights|Justice|Equality
LP:Principled|Caring|Open-minded
ATL:Thinking|Research
P:The Unfair Snack|🧒🏽 🧒🏻 🧒🏿 📚 🏥 🏠 🗣️|Without warning, give only half the class a snack. Then show photos of children around the world: at school, working, and fetching water.|Ask: How did it feel to be left out?
S:🧒📚🏫  /  🧒🧱🏗️|What do you notice about these two children's days?|What rights do you think each child has, or is missing?|What questions does this raise for you?
Q:Who decided what children's rights are?|Why do some children not go to school?|Is a right the same as a want?|What happens when someone's rights are not respected?|Do adults and children have the same rights?|How are rights protected in Qatar?
W:✅ right=Every child has the right to education.|🤝 responsibility=With the right to learn comes the responsibility to let others learn.|🙏 respect=We show respect by listening to different opinions.|⚖️ equality=Equality means everyone is treated with the same fairness.|🏛️ justice=Justice means fixing what is unfair.|📜 convention=The UN Convention on the Rights of the Child lists 54 articles.
SO:Is this a right or a responsibility?|✅ Right|🤝 Responsibility
SI:🏫 to go to school=0|🛡️ to be safe from harm=0|🏥 to have healthcare=0|🤫 to let others learn=1|👂 to listen to others' opinions=1|🧑‍🤝‍🧑 to include everyone in games=1
TF:🌍 Every child in the world has the same rights under the UN Convention.=1|🤝 Rights come with responsibilities.=1|🎮 Rights are the same as wants.=0|💭 Children have no right to share their opinion.=0
SQ:Resolve a conflict fairly|🛑 Stop and calm down|🗣️ Each person explains their view|💡 Brainstorm fair solutions|🤝 Agree and check later
CN:📜=18=A group studied this many articles. How many?|🧒=20=How many children voted in the class survey?
DL:Design a poster about one child's right. Label the right and the matching responsibility.|right,responsibility,respect,slogan,equality,action
OG:Rights and Responsibilities Matching Chart|Tap a responsibility. Then tap the right it protects.|📚 Right to learn,🛡️ Right to be safe,🗣️ Right to be heard,⚽ Right to play|🤫 keep quiet when others work=0|📖 share books and resources=0|🦺 follow safety rules=1|🚨 report bullying=1|👂 listen without interrupting=2|💭 respect different opinions=2
A:Rights Advocates|Discuss with your family: Which right is most important to you, and what responsibility goes with it?|📜 Create a class charter of rights and responsibilities.|📚 Organise a book drive for children without books.|🛑 Lead an anti-bullying awareness day.
U:I used to think… rights are things I am allowed to have. Now I think… rights belong to everyone and I must protect others' rights too.
CK:✅ What is a right?=Something every child should have;A toy I want;A school rule=0|🤝 Which is a responsibility?=Listening to others;Going to school;Having healthcare=0|📜 When was the UN Convention on the Rights of the Child signed?=1989;1939;2022=0|🚫 Discrimination means…=treating someone unfairly;helping everyone;voting=0
TH:What is the effect when a child is denied the right to education? Explain two effects.|Choose a right. Describe it from a child's and a parent's perspective.
#
T:where-we-are|2|Where We Are in Place and Time|🧭|Explorers, Journeys and Migration
C:People explore and migrate for different reasons, and their journeys change places, cultures and themselves.
K:People travel and move for many reasons. Their journeys change places and cultures.
L:Reasons why people explore and migrate: push and pull factors (causation)|How famous journeys, like Ibn Battuta's, changed understanding of the world (change)|How migration shapes communities like Qatar's today (perspective)
KC:Causation|Change|Perspective
RC:Migration|Exploration|Identity
LP:Risk-takers|Open-minded|Inquirers
ATL:Research|Thinking
P:The Mystery Suitcase|🧳 🗺️ ⛵ ✈️ 🐪 🌍|Open a suitcase with a passport, a family photo, a map, a compass, a spice jar and a letter in another language. Mark on a world map where each student's family comes from.|Ask: Who might own this suitcase?
S:🗺️📍📍📍➡️🇶🇦|What do you notice about where our families come from?|Why do you think so many people have come to Qatar?|What questions do you have about journeys and migration?
Q:Why did Ibn Battuta travel for nearly 30 years?|What pushes people to leave their homes?|What pulls people to a new country?|How did explorers navigate before GPS?|How does moving change a person's identity?|Why do birds migrate?
W:🧳 migration=Migration is moving from one place to live in another.|🧭 explorer=Ibn Battuta was an explorer from Morocco.|⬅️ push factor=War or drought can be a push factor.|➡️ pull factor=Jobs and safety can be pull factors.|⭐ navigation=Arab sailors used stars for navigation.|🛤️ trade route=The Silk Road was a famous trade route.
SO:Is this a push factor or a pull factor?|⬅️ Push (reasons to leave)|➡️ Pull (reasons to come)
SI:💥 war or conflict=0|🏜️ drought=0|🚫 no jobs=0|💼 job opportunities=1|🎓 good schools=1|🛡️ safety=1
TF:🧭 Ibn Battuta travelled more than 100,000 km in the 1300s.=1|🌍 Most of Qatar's population was born in other countries.=1|⬅️ Push factors are reasons that attract people to a place.=0|🗺️ Explorers always described places accurately and fairly.=0
SQ:Ibn Battuta's journey (simplified)|🇲🇦 Leaves Tangier, Morocco (1325)|🕋 Pilgrimage to Makkah|🐉 Travels to India and China|📖 Returns and writes the Rihla
CN:📍=19=Our class map shows this many home countries. How many?|🧳=14=How many suitcases at the airport?
DL:Draw a map of a famous journey or your family's journey. Label start, stops and reasons.|start,route,stop,destination,push factor,pull factor
OG:Journey Cause-and-Effect Chart|Tap an event. Then tap whether it is a cause, the journey, or an effect.|❓ Cause (why),🧭 Journey (how),🔁 Effect (what changed)|🏜️ drought ruins farms=0|💼 new jobs in Qatar=0|⛵ sail by dhow using stars=1|✈️ fly across continents=1|🐪 cross the desert by caravan=1|🍛 new foods in local markets=2
A:Journey Storytellers|Ask your family: Where have our family members lived, and why did they move?|🎙️ Interview a family member about their migration story and present it.|📘 Create a welcome guide for new students arriving in Qatar.|🍲 Organise an international food and culture day.
U:I used to think… people move only for holidays. Now I think… people migrate for many reasons, and it changes them and the places they go.
CK:🧳 What is migration?=Moving to live in another place;A short holiday;A school trip=0|⬅️ Which is a push factor?=War;Good schools;Job offers=0|➡️ Which is a pull factor?=Safety;Drought;Conflict=0|🧭 Ibn Battuta came from…=Morocco;Japan;Brazil=0
TH:Explain two push factors and two pull factors for someone moving to Qatar.|How might a migrant child feel in their first week at a new school? Describe two perspectives.
#
T:express-ourselves|3|How We Express Ourselves|📺|Media Messages and Persuasion
C:Media messages are created to inform, entertain or persuade, and we can think critically about them.
K:Adverts and media try to inform, entertain or persuade us. We can think carefully about them.
L:Different types of media and their purposes (function)|Techniques advertisers use to persuade (form)|How to evaluate media messages from different perspectives (perspective)
KC:Function|Form|Perspective
RC:Persuasion|Bias|Audience
LP:Thinkers|Communicators|Reflective
ATL:Thinking|Communication
P:The Too-Good-to-Be-True Advert|📺 📱 📰 📢 🛍️ 🎧|Show a made-up advert: 'SuperJuice makes you run faster and get top marks! 9 out of 10 kids agree!' Then show the ingredients label: mostly sugar.|Ask: What is the advert trying to make you do?
S:📱 ❗ 'BREAKING NEWS' ❗|What do you notice about how this headline is designed?|Why do you think it uses big letters and exclamation marks?|What questions would you ask before believing it?
Q:Why do adverts use famous people?|How can I tell if a news story is true?|Who pays for adverts?|Why do adverts for toys appear during cartoons?|What is the difference between a fact and an opinion?|How do apps keep us watching?
W:📺 media=TV, websites and newspapers are types of media.|📢 advertisement=An advertisement tries to sell a product.|🗣️ persuade=To persuade means to try to change someone's mind.|👥 audience=The target audience is the group a message is aimed at.|💬 slogan=A slogan is a short, catchy phrase.|✅ fact=A fact can be proven true.
SO:Is this sentence a fact or an opinion?|✅ Fact|💭 Opinion
SI:🇶🇦 Doha is the capital of Qatar.=0|♨️ Water boils at 100°C.=0|🏟️ The 2022 World Cup was held in Qatar.=0|🎮 This is the best game ever!=1|⚽ Football is more fun than tennis.=1|🥣 Everyone will love this cereal.=1
TF:📢 Adverts are designed to persuade an audience.=1|🔗 Checking several sources helps find the truth.=1|🌐 All information online is true.=0|💭 An opinion can be proven true for everyone.=0
SQ:Check a news story|📰 Read the headline carefully|🔗 Check who the source is|⚖️ Compare with other sources|✅ Decide if it is reliable
CN:📢=17=How many adverts did we see in 30 minutes of TV?|🌟=12=How many used a celebrity?
DL:Design an honest advert for a healthy snack. Label your persuasive techniques.|slogan,target audience,image,fact,opinion,call to action
OG:Persuasive Techniques Detective|Tap an advert example. Then tap the technique it uses.|🌟 Celebrity,👥 Bandwagon (everyone has it),💛 Emotion,📊 Statistics|⚽ A football star wears these boots=0|🎤 A famous singer loves this drink=0|📈 Join millions of happy users!=1|🏫 Everyone in your class has one=1|🐶 A sad puppy needs your help=2|👨‍👩‍👧 Make your family proud=2
A:Media Smart Citizens|Watch an advert with your family. Discuss: Who is it for? What technique does it use? Is it fair?|🔎 Create a fact-checking guide for our school.|📢 Make an honest advert for a school event.|👩‍🏫 Teach younger students to spot persuasive tricks.
U:I used to think… adverts just tell us about products. Now I think… media messages are designed to persuade, so I ask questions.
CK:📢 What is the main purpose of an advert?=To persuade;To tell bedtime stories;To give homework=0|✅ Which is a fact?=Doha is in Qatar.;Pizza is the best food.;Red is the coolest colour.=0|⚖️ Bias means…=showing only one side;being fair to all;telling a joke=0|👥 'Everyone has one!' is which technique?=Bandwagon;Statistics;Celebrity=0
TH:Explain how one advert tries to persuade you. Which technique does it use?|Compare how two sources report the same event. What is different and why?
#
T:world-works|4|How the World Works|⚡|Energy: Sources, Uses and Choices
C:Energy comes from different sources, and the choices we make about energy affect the planet.
K:Energy comes from many sources. Our energy choices affect the planet.
L:Forms of energy and how energy changes from one form to another (change)|Renewable and non-renewable energy sources (form)|The effects of energy use on people and the environment (causation and responsibility)
KC:Change|Causation|Responsibility
RC:Transformation|Sustainability|Innovation
LP:Knowledgeable|Thinkers|Principled
ATL:Research|Thinking
P:The Blackout Challenge|☀️ 💨 🛢️ 🔥 🔋 💡|Turn off all lights, fans and screens for ten minutes. Then show a photo of the Al Kharsaah solar power plant in Qatar and a gas platform at sea.|Ask: What could you not do without electricity?
S:🍌 ➡️ 🏃 ➡️ 🔥   ☀️ ➡️ 🔋 ➡️ 💡|What do you notice about how energy moves in these chains?|What do you think happens to energy at each step?|What research questions do you have about energy?
Q:How does a solar panel turn sunlight into electricity?|Why is natural gas so important to Qatar's economy?|What happens to energy when we use it?|Why will fossil fuels run out one day?|How do wind turbines work?|Why does burning fuels affect the climate?
W:⚡ energy=Energy is the ability to do work or cause change.|♻️ renewable=Solar and wind are renewable; they will not run out.|🛢️ non-renewable=Oil and gas are non-renewable; they will run out.|🦕 fossil fuel=Fossil fuels formed from ancient plants and animals.|☀️ solar panel=A solar panel changes sunlight into electricity.|💨 turbine=Wind turns the blades of a turbine.
SO:Is this energy source renewable or non-renewable?|♻️ Renewable|🛢️ Non-renewable
SI:☀️ solar=0|💨 wind=0|🌊 hydro (water)=0|🛢️ oil=1|🔥 natural gas=1|🪨 coal=1
TF:☀️ Solar energy is renewable.=1|🇶🇦 Qatar has one of the largest natural gas reserves in the world.=1|🔥 Natural gas will never run out.=0|💡 A circuit with a gap still lights the bulb.=0
SQ:Sunlight to light bulb|☀️ Sunlight hits a solar panel|⚡ Panel makes electricity|🔌 Electricity travels through wires|💡 Bulb gives light
CN:☀️=18=How many solar panels are on the roof?|💡=14=How many lights were left on after school?
DL:Draw an energy-efficient home for Qatar. Label the energy-saving features.|solar panels,shade,LED bulbs,insulation,battery,smart thermostat
OG:Energy Sources Pros and Cons|Tap a statement. Then tap the energy source it describes.|☀️ Solar,🔥 Natural gas,💨 Wind|🇶🇦 works well in sunny Qatar=0|🌙 no power at night without batteries=0|⏳ reliable day and night but will run out=1|🏭 releases emissions when burned=1|🚢 Qatar's biggest export=1|🌬️ needs steady wind=2
A:Energy Savers|List every device that uses electricity at home. Which ones could be switched off more often?|💡 Lead a 'switch off' team for classroom lights and screens.|🏠 Do a home energy audit and suggest three changes.|☀️ Build a solar oven and test it in the playground.
U:I used to think… electricity just comes from the wall. Now I think… energy comes from sources, and our choices affect the planet.
CK:♻️ Which source is renewable?=Solar;Oil;Coal=0|☀️ What does a solar panel do?=Turns sunlight into electricity;Stores water;Burns gas=0|🦕 Why are fossil fuels non-renewable?=They take millions of years to form;They are too hot;They are invisible=0|🏭 What is the main effect of burning fossil fuels on air?=Releases carbon dioxide;Makes air cleaner;Nothing happens=0
TH:Explain the cause and effect of burning fossil fuels on the climate.|Compare solar and natural gas: give one advantage and one disadvantage of each.
#
T:organize-ourselves|5|How We Organize Ourselves|🏛️|Rules, Laws and Leadership
C:Communities create systems of leadership, rules and laws to make decisions and live together fairly.
K:Groups need leaders, rules and laws to make fair decisions and live together.
L:Why communities need rules and laws (function)|How different groups make decisions: voting, consultation and leadership (form)|How citizens, including children, can take part in decisions (responsibility)
KC:Function|Form|Responsibility
RC:Governance|Citizenship|Fairness
LP:Principled|Communicators|Thinkers
ATL:Social|Thinking
P:Island Survival|🏝️ 🧑‍🤝‍🧑 📜 🗳️ ⚖️|The class is stranded on an imaginary island. There is limited food, one shelter and one boat. Groups must decide: Who leads? What rules do we need? What happens if someone breaks a rule?|Ask: How did your group decide?
S:🗳️ 🧒🧒🧒 ✋✋✋|What do you notice is happening in this class vote?|Why do you think voting is used to make some decisions?|What questions do you have about how decisions are made?
Q:What is the difference between a rule and a law?|Who makes laws in Qatar?|What does the Shura Council do?|Why do some countries vote for leaders?|What makes a good leader?|What happens if a law is unfair?
W:📋 rule=A rule guides behaviour in a group, like a school.|⚖️ law=A law is an official rule for a whole country.|🏛️ government=The government runs the country and provides services.|🧑 citizen=A citizen is a member of a country or community.|🗳️ vote=We vote to choose our class representative.|👥 council=A council is a group that meets to make decisions.
SO:Is this a school rule or a national law?|🏫 School rule|⚖️ National law
SI:✋ raise your hand to speak=0|👕 wear the school uniform=0|🚶 walk in the corridors=0|🚗 wear a seatbelt in a car=1|🚦 stop at red traffic lights=1|🚯 do not litter in public=1
TF:⚖️ Laws apply to everyone in a country.=1|🗳️ Voting is one way to make group decisions.=1|📋 Rules and laws are exactly the same thing.=0|🙉 A good leader never listens to others.=0
SQ:Make a class decision|❓ Identify the problem|🗣️ Share and listen to ideas|🗳️ Vote or agree together|🔁 Review if it worked
CN:🗳️=19=How many votes did the winner get?|✋=16=How many hands are raised for the new rule?
DL:Design a new rule for your school. Draw a poster and label the rule, reason and consequence.|rule,reason,consequence,fairness,vote,leader
OG:Rule Evaluation Chart|Tap a statement about a 'no running inside' rule. Then tap the right box.|🎯 Purpose (why),👥 Who it affects,➡️ Consequence|🩹 to prevent injuries=0|😌 to keep corridors calm=0|🧒 all students=1|👩‍🏫 teachers and visitors=1|🩺 the school nurse=1|🚶 a reminder to walk=2
A:Active Citizens|Ask your family: What rules do we have at home? Who made them and why? Would you change one?|💡 Propose a new idea to the student council.|🗳️ Run a fair class election with secret ballots.|📊 Survey students about a school issue and present results.
U:I used to think… rules are there to stop fun. Now I think… rules and laws help communities live fairly, and citizens can help shape them.
CK:⚖️ What is a law?=An official rule for a whole country;A game;A school timetable=0|🚦 Which is a national law?=Stop at red lights;Raise your hand;Line up after break=0|🗣️ Consultation means…=asking for views before deciding;deciding alone;ignoring others=0|🏘️ Why do communities need laws?=To live together safely and fairly;To make people sad;For no reason=0
TH:Explain the difference between a rule and a law with examples.|What would be the effects of having no traffic laws? List three.
#
T:sharing-planet|6|Sharing the Planet|🌿|Ecosystems in Balance
C:Living things in an ecosystem depend on each other, and human actions can upset or restore the balance.
K:In an ecosystem, living things depend on each other. People can harm or help the balance.
L:How energy flows through food chains and food webs (connection)|How changes to one part of an ecosystem affect the others (causation)|How people can protect and restore ecosystems such as Qatar's mangroves and reefs (responsibility)
KC:Connection|Causation|Responsibility
RC:Interdependence|Biodiversity|Sustainability
LP:Caring|Inquirers|Thinkers
ATL:Research|Thinking
P:The Web of Life|🌿 🦀 🐟 🦩 🌊 🛢️|Each child holds a card (sun, seagrass, dugong, shrimp, fish, heron, mangrove). Pass a ball of string to connect who eats whom. Then cut one string: the seagrass is lost to pollution.|Ask: What happened to the web when one part was removed?
S:🌳🦀🐟 (mangrove)  ➡️  🏗️🚧 (construction)|What do you notice changing in these two pictures?|What do you think will happen to the animals that lived there?|What questions would you research about this change?
Q:Why are mangroves important for fish and birds?|What would happen if all the predators disappeared?|How do coral reefs survive in the hot Gulf?|What is the role of decomposers?|How does plastic enter the food chain?|Why is biodiversity important?
W:🌿 ecosystem=An ecosystem is living and non-living things interacting in one place.|🌱 producer=Plants are producers; they make food using sunlight.|🐟 consumer=Animals are consumers; they eat other living things.|🍄 decomposer=Decomposers break down dead things into nutrients.|🦅 predator=A falcon is a predator that hunts other animals.|🐭 prey=Prey animals are hunted by predators.
SO:Is this a producer or a consumer?|🌱 Producer|🐟 Consumer
SI:🌿 seagrass=0|🌳 mangrove tree=0|🟢 algae=0|🦭 dugong=1|🦅 falcon=1|🦀 crab=1
TF:☀️ Energy in a food chain starts with the sun.=1|🕸️ Removing one species can affect a whole food web.=1|🌱 Producers eat other animals.=0|🍄 Decomposers are not important.=0
SQ:A Gulf food chain|☀️ Sun|🌿 Seagrass (producer)|🦐 Shrimp (consumer)|🐟 Fish|🪿 Heron (top predator)
CN:🦩=19=How many flamingos were counted at the lagoon?|🦀=17=How many crabs in the mangrove survey?
DL:Draw a food web for Qatar's mangroves or desert. Use arrows to show energy flow and label each role.|sun,producer,consumer,predator,prey,decomposer
OG:Food Web Roles Chart|Tap an organism. Then tap its main role in the ecosystem.|🌱 Producer,🦭 Herbivore,🦅 Predator,🍄 Decomposer|🌿 seagrass=0|🌳 mangrove=0|🦭 dugong=1|🐢 green turtle=1|🦅 falcon=2|🐟 barracuda=2
A:Ecosystem Protectors|With your family, find one way to reduce plastic waste this week and track it.|🏖️ Join or organise a mangrove or beach clean-up.|🌱 Plant native plants in the school garden to support insects.|🧴 Start a single-use plastic reduction campaign.
U:I used to think… each animal lives on its own. Now I think… everything in an ecosystem is connected, and our actions matter.
CK:☀️ Where does the energy in a food chain start?=The sun;The predator;The soil=0|🌱 A producer…=makes its own food with sunlight;hunts animals;breaks down waste=0|🦭 If seagrass disappears, which animal is affected first?=Dugong;Falcon;Camel=0|🍄 What do decomposers do?=Break down dead matter;Make sunlight;Hunt fish=0
TH:Explain what would happen to a food web if all the predators were removed.|Compare a mangrove ecosystem and a desert ecosystem. What connects them?
`;
function wbSplitEmoji(s: string): { emoji: string; label: string } {
const i = s.indexOf(" ");
return i < 0 ? { emoji: "", label: s } : { emoji: s.slice(0, i), label: s.slice(i + 1) };
}
function wbParseUnit(block: string): WbUnit {
const m: Record<string, string> = {};
block.trim().split("\n").forEach((ln: string) => {
const k = ln.indexOf(":");
m[ln.slice(0, k)] = ln.slice(k + 1);
});
const P = (k: string): string[] => (m[k] || "").split("|").filter((x: string) => x);
const [id, num, theme, emoji, unitTitle] = P("T");
const [pt, ps, pd, pp] = P("P");
const [ss, s1, s2, s3] = P("S");
const so = P("SO");
const sq = P("SQ");
const dl = P("DL");
const og = P("OG");
const ac = P("A");
return {
id: id as WbThemeId, number: Number(num), theme, emoji, unitTitle,
centralIdea: m.C, kidIdea: m.K, lines: P("L"), keyConcepts: P("KC"), relatedConcepts: P("RC"), learnerProfile: P("LP"), atl: P("ATL"),
provocation: { title: pt, scene: ps, description: pd, teacherPrompt: pp },
seeThinkWonder: { scene: ss, see: s1, think: s2, wonder: s3 },
wonderQuestions: P("Q"),
words: P("W").map((w: string) => { const [a, b] = w.split("="); const e = wbSplitEmoji(a); return { word: e.label, emoji: e.emoji, sentence: b || "" }; }),
sort: { prompt: so[0], buckets: [so[1], so[2]], items: P("SI").map((x: string) => { const [a, b] = x.split("="); const e = wbSplitEmoji(a); return { label: e.label, emoji: e.emoji, bucket: Number(b) }; }) },
trueFalse: P("TF").map((x: string) => { const [a, b] = x.split("="); const e = wbSplitEmoji(a); return { text: e.label, emoji: e.emoji, answer: b === "1" }; }),
sequences: [{ title: sq[0], steps: sq.slice(1).map((x: string) => { const e = wbSplitEmoji(x); return { text: e.label, emoji: e.emoji }; }) }],
counts: P("CN").map((x: string) => { const [e, n, q] = x.split("="); return { emoji: e, n: Number(n), q }; }),
drawLabel: { prompt: dl[0], labels: (dl[1] || "").split(",") },
organiser: {
title: og[0], prompt: og[1],
columns: (og[2] || "").split(",").map((x: string) => { const e = wbSplitEmoji(x); return { label: e.label, emoji: e.emoji }; }),
items: og.slice(3).map((x: string) => { const [a, b] = x.split("="); const e = wbSplitEmoji(a); return { label: e.label, emoji: e.emoji, col: Number(b) }; }),
},
action: { title: ac[0], homeLink: ac[1], ideas: ac.slice(2).map((x: string) => { const e = wbSplitEmoji(x); return { text: e.label, emoji: e.emoji }; }) },
usedToThink: m.U,
checks: P("CK").map((x: string) => { const [a, o, ans] = x.split("="); const e = wbSplitEmoji(a); const op = o.split(";"); return { q: e.label, emoji: e.emoji, options: op, answer: op[Number(ans)] }; }),
teacherNotes: [],
thinkPrompts: P("TH"),
};
}
const wbUnits = (txt: string): WbUnit[] => txt.split("\n#\n").map(wbParseUnit);
const WB_DISCLAIMER = "Aligned with the IB PYP framework. Independent teacher resource, not official IB material.";
const WB_YEARS: WbYear[] = [
{ id: "y1", label: "Year 1", ages: "Ages 5–6", focus: "Picture words, very short sentences, tap and draw", units: wbUnits(WBD_Y1) },
{ id: "y2", label: "Year 2", ages: "Ages 6–7", focus: "Short sentences and simple reasons", units: wbUnits(WBD_Y2) },
{ id: "y3", label: "Year 3", ages: "Ages 7–8", focus: "Explaining, comparing and short written answers", units: wbUnits(WBD_Y3) },
{ id: "y4", label: "Year 4", ages: "Ages 8–9", focus: "Research questions, cause and effect, and perspectives", units: wbUnits(WBD_Y4) },
];
function wbYear(id: WbYearId): WbYear {
return WB_YEARS.find((y: WbYear) => y.id === id) || WB_YEARS[0];
}

function wbSpeak(text: string | string[]): void {
speak(text);
}
const wbSfx = { tap: (): void => undefined, good: (): void => undefined, oops: (): void => undefined, win: (): void => undefined };
function useWbTheme() {
return useGrokTheme();
}
type WbStyle = CSSProperties;


function wbRng(seed: number): () => number {
let a = seed >>> 0;
return () => {
a = (a + 0x6d2b79f5) >>> 0;
let x = a;
x = Math.imul(x ^ (x >>> 15), x | 1);
x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
}

function wbShuffle<T>(arr: T[], seed: number, salt: number): T[] {
const r = wbRng(seed * 7919 + salt * 104729 + 13);
const a = arr.slice();
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(r() * (i + 1));
const tmp = a[i];
a[i] = a[j];
a[j] = tmp;
}
return a;
}

function wbPick<T>(arr: T[], n: number, seed: number, salt: number): T[] {
return wbShuffle(arr, seed, salt).slice(0, n);
}

function useWbPal(): string[] {
const t = useWbTheme();
const out: string[] = [];
[...t.chart, ...t.dataviz.categorical].forEach((c: string) => {
if (out.indexOf(c) < 0) out.push(c);
});
return out;
}

function useWbBtn() {
const t = useWbTheme();
return (bg: string, fg: string, extra?: WbStyle): WbStyle => ({
background: bg,
color: fg,
border: `2px solid ${t.border.default}`,
borderRadius: 16,
padding: "12px 18px",
fontSize: 22,
fontWeight: 700,
minHeight: 56,
minWidth: 56,
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
}

function useWbCard() {
const t = useWbTheme();
return (extra?: WbStyle): WbStyle => ({
background: t.bg.elevated,
border: `2px solid ${t.border.default}`,
borderRadius: 20,
padding: 18,
display: "flex",
flexDirection: "column",
gap: 14,
fontSize: 22,
...(extra || {}),
});
}

interface WbExitResult {
date: string;
words: string[];
interesting: string[];
question: string;
confidence: number;
score: number;
total: number;
}

interface WbThemeRecord {
responses: Record<string, string>;
exits: WbExitResult[];
}

type WbDb = Record<string, Record<string, WbThemeRecord>>;
const WB_KEY = "la-pyp-y1-workbook-v1";
let wbMemory: WbDb | null = null;

function wbLoadDb(): WbDb {
if (wbMemory) return wbMemory;
let db: WbDb = {};
try {
const raw = window.localStorage.getItem(WB_KEY);
if (raw) db = JSON.parse(raw) as WbDb;
} catch {
db = {};
}
wbMemory = db;
return db;
}

function wbPersist(db: WbDb): void {
wbMemory = db;
try {
window.localStorage.setItem(WB_KEY, JSON.stringify(db));
} catch {
}
}

function wbGetRecord(profileId: string, themeId: string): WbThemeRecord {
const db = wbLoadDb();
const rec = db[profileId]?.[themeId];
return rec ? rec : { responses: {}, exits: [] };
}

function wbSaveRecord(profileId: string, themeId: string, rec: WbThemeRecord): void {
const db = { ...wbLoadDb() };
db[profileId] = { ...(db[profileId] || {}), [themeId]: rec };
wbPersist(db);
}


interface WbStageProps {
unit: WbUnit;
seed: number;
resp: Record<string, string>;
setResp: (key: string, value: string) => void;
}

function WbSpeak({ text, testId }: { text: string | string[]; testId?: string }) {
const t = useWbTheme();
const btn = useWbBtn();
return (
<button
className="wb-noprint"
data-testid={testId || "wb-speak"}
aria-label="Read aloud"
onClick={() => wbSpeak(text)}
style={btn(t.fill.secondary, t.text.primary, { padding: 6, fontSize: 26, flex: "0 0 auto" })}
>
🔊
</button>
);
}

function WbPrompt({ text, emoji, big }: { text: string; emoji?: string; big?: boolean }) {
return (
<div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
<WbSpeak text={text} />
{emoji && <span style={{ fontSize: big ? 44 : 32 }}>{emoji}</span>}
<span style={{ fontSize: big ? 28 : 23, fontWeight: 700, flex: "1 1 200px" }}>{text}</span>
</div>
);
}

function WbHeading({ emoji, text }: { emoji: string; text: string }) {
return (
<div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
<WbSpeak text={text} />
<span style={{ fontSize: 30, fontWeight: 800 }}>
{emoji} {text}
</span>
</div>
);
}

function WbChoices({
options,
selected,
onPick,
correct,
testPrefix,
}: {
options: string[];
selected: string[];
onPick: (o: string) => void;
correct?: string;
testPrefix?: string;
}) {
const t = useWbTheme();
const btn = useWbBtn();
return (
<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
{options.map((o: string, i: number) => {
const on = selected.indexOf(o) >= 0;
const good = correct !== undefined && on && o === correct;
const bad = correct !== undefined && on && o !== correct;
const bg = good ? t.text.success : bad ? t.text.warning : on ? t.fill.accent : t.bg.base;
return (
<button
key={o}
data-testid={testPrefix ? `${testPrefix}-${i}` : undefined}
onClick={() => {
wbSfx.tap();
onPick(o);
}}
style={btn(bg, on ? t.text.onColor : t.text.primary, { flex: "1 1 180px" })}
>
{good ? "✅ " : bad ? "🔁 " : ""}
{o}
</button>
);
})}
</div>
);
}

function WbAnswer({
id,
resp,
setResp,
placeholder,
}: {
id: string;
resp: Record<string, string>;
setResp: (key: string, value: string) => void;
placeholder?: string;
}) {
const t = useWbTheme();
const btn = useWbBtn();
const [rec, setRec] = useState<boolean>(false);
const mr = useRef<MediaRecorder | null>(null);
const canRec = typeof window !== "undefined" && typeof (window as unknown as { MediaRecorder?: unknown }).MediaRecorder !== "undefined";
const audio = resp[`${id}:audio`];

const start = async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const m = new MediaRecorder(stream);
const chunks: Blob[] = [];
m.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
m.onstop = () => {
stream.getTracks().forEach((tr: MediaStreamTrack) => tr.stop());
const reader = new FileReader();
reader.onload = () => setResp(`${id}:audio`, String(reader.result || ""));
reader.readAsDataURL(new Blob(chunks, { type: m.mimeType || "audio/webm" }));
setRec(false);
};
mr.current = m;
m.start();
setRec(true);
window.setTimeout(() => {
if (m.state === "recording") m.stop();
}, 15000);
} catch {
setRec(false);
}
};

return (
<div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
<input
data-testid={`wb-answer-${id}`}
value={resp[id] || ""}
placeholder={placeholder || "Type or say your idea…"}
onChange={(e: ChangeEvent<HTMLInputElement>) => setResp(id, e.target.value)}
style={{
flex: "1 1 240px",
minHeight: 56,
fontSize: 22,
padding: "10px 14px",
borderRadius: 14,
border: `2px dashed ${t.border.default}`,
background: t.bg.base,
color: t.text.primary,
fontFamily: t.font.family,
}}
/>
{canRec && !rec && (
<button className="wb-noprint" onClick={start} style={btn(t.fill.secondary, t.text.primary, { fontSize: 20 })}>
🎤 Record
</button>
)}
{rec && (
<button className="wb-noprint" onClick={() => mr.current?.stop()} style={btn(t.text.warning, t.text.onColor, { fontSize: 20 })}>
⏹️ Stop
</button>
)}
{audio && (
<button className="wb-noprint" onClick={() => new Audio(audio).play().catch(() => undefined)} style={btn(t.fill.secondary, t.text.primary, { fontSize: 20 })}>
▶️ Play
</button>
)}
</div>
);
}

const WB_INKS = ["rgb(30, 41, 59)", "rgb(37, 99, 235)", "rgb(220, 38, 38)", "rgb(22, 163, 74)", "rgb(234, 88, 12)", "rgb(124, 58, 237)"];

function WbDrawPad({ id, resp, setResp, label }: { id: string; resp: Record<string, string>; setResp: (k: string, v: string) => void; label?: string }) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const ref = useRef<HTMLCanvasElement | null>(null);
const drawing = useRef<boolean>(false);
const [ink, setInk] = useState<string>(WB_INKS[0]);

useEffect(() => {
const c = ref.current;
const ctx = c ? c.getContext("2d") : null;
if (!c || !ctx) return;
ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, c.width, c.height);
const saved = resp[id];
if (saved) {
const img = new Image();
img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
img.src = saved;
}
}, [id]);

const pos = (e: PointerEvent<HTMLCanvasElement>) => {
const c = ref.current as HTMLCanvasElement;
const r = c.getBoundingClientRect();
return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
};
const down = (e: PointerEvent<HTMLCanvasElement>) => {
const ctx = ref.current?.getContext("2d");
if (!ctx) return;
drawing.current = true;
const p = pos(e);
ctx.strokeStyle = ink;
ctx.lineWidth = 8;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.beginPath();
ctx.moveTo(p.x, p.y);
};
const move = (e: PointerEvent<HTMLCanvasElement>) => {
if (!drawing.current) return;
const ctx = ref.current?.getContext("2d");
if (!ctx) return;
const p = pos(e);
ctx.lineTo(p.x, p.y);
ctx.stroke();
};
const up = () => {
if (!drawing.current) return;
drawing.current = false;
const c = ref.current;
if (c) setResp(id, c.toDataURL("image/jpeg", 0.6));
};
const clear = () => {
const c = ref.current;
const ctx = c ? c.getContext("2d") : null;
if (!c || !ctx) return;
ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, c.width, c.height);
setResp(id, "");
};

return (
<div style={card({ padding: 12 })}>
{label && <WbPrompt text={label} emoji="✏️" />}
<canvas
data-testid={`wb-draw-${id}`}
ref={ref}
width={640}
height={360}
onPointerDown={down}
onPointerMove={move}
onPointerUp={up}
onPointerLeave={up}
style={{ width: "100%", maxWidth: 640, aspectRatio: "16 / 9", touchAction: "none", borderRadius: 14, border: `2px dashed ${t.border.default}`, background: t.bg.elevated, cursor: "crosshair" }}
/>
<div className="wb-noprint" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
{WB_INKS.map((c: string) => (
<button key={c} aria-label="ink colour" onClick={() => setInk(c)} style={btn(c, t.text.onColor, { width: 56, border: ink === c ? `4px solid ${t.text.primary}` : `2px solid ${t.border.default}` })}>
{ink === c ? "✓" : ""}
</button>
))}
<button onClick={clear} style={btn(t.fill.secondary, t.text.primary)}>🧽 Clear</button>
</div>
</div>
);
}


function WbDone({ text }: { text: string }) {
const t = useWbTheme();
return (
<div data-testid="wb-activity-done" style={{ padding: 14, borderRadius: 16, border: `3px solid ${t.text.success}`, fontSize: 24, fontWeight: 800, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
<WbSpeak text={text} />
🎉 {text}
</div>
);
}

function WbPictureWords({ unit, seed }: WbStageProps) {
const t = useWbTheme();
const words = wbPick(unit.words, 8, seed, 11);
return (
<div data-testid="wb-act-words" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<WbPrompt text="Tap a picture. Listen and say the word." emoji="🖼️" />
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
{words.map((w: WbWord) => (
<button
key={w.word}
onClick={() => {
wbSfx.tap();
wbSpeak([w.word, w.sentence]);
}}
style={{ minHeight: 150, borderRadius: 18, border: `2px solid ${t.border.default}`, background: t.bg.base, color: t.text.primary, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: t.font.family, touchAction: "manipulation" }}
>
<span style={{ fontSize: 56 }}>{w.emoji}</span>
<span style={{ fontSize: 26, fontWeight: 800 }}>{w.word}</span>
<span style={{ fontSize: 17, color: t.text.secondary }}>{w.sentence}</span>
</button>
))}
</div>
</div>
);
}

function WbListenChoose({ unit, seed, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const rounds = wbPick(unit.words, 6, seed, 12);
const [i, setI] = useState<number>(0);
const [score, setScore] = useState<number>(0);
const [wrong, setWrong] = useState<string>("");
if (i >= rounds.length) return <WbDone text={`Great listening! ${score} out of ${rounds.length}.`} />;
const target = rounds[i];
const others = wbPick(unit.words.filter((w: WbWord) => w.word !== target.word), 2, seed + i, 13);
const opts = wbShuffle([target, ...others], seed + i, 14);
return (
<div data-testid="wb-act-listen" style={card()}>
<div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
<button data-testid="wb-listen-play" onClick={() => wbSpeak(["Find", target.word])} style={btn(t.fill.accent, t.text.onColor, { fontSize: 24 })}>
🔊 Listen
</button>
<span style={{ fontSize: 23, fontWeight: 700 }}>Listen. Tap the right picture. ({i + 1}/{rounds.length})</span>
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
{opts.map((w: WbWord) => (
<button
key={w.word}
onClick={() => {
if (w.word === target.word) {
wbSfx.good();
const ns = wrong ? score : score + 1;
setScore(ns);
setWrong("");
setI(i + 1);
setResp("find:listen", `${ns}/${rounds.length}`);
} else {
wbSfx.oops();
setWrong(w.word);
wbSpeak("Try again!");
}
}}
style={btn(wrong === w.word ? t.text.warning : t.bg.base, wrong === w.word ? t.text.onColor : t.text.primary, { flex: "1 1 160px", minHeight: 120, fontSize: 64 })}
>
{w.emoji}
</button>
))}
</div>
</div>
);
}

function WbSort({ unit, seed, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const items = wbPick(unit.sort.items, 8, seed, 15);
const [i, setI] = useState<number>(0);
const [placed, setPlaced] = useState<WbSortItem[][]>([[], []]);
const [oops, setOops] = useState<boolean>(false);
const cur = items[i];
const pick = (b: number) => {
if (!cur) return;
if (cur.bucket === b) {
wbSfx.good();
const next = placed.map((col: WbSortItem[], k: number) => (k === b ? [...col, cur] : col));
setPlaced(next);
setI(i + 1);
setOops(false);
setResp("find:sort", `${i + 1}/${items.length}`);
} else {
wbSfx.oops();
setOops(true);
wbSpeak("Think again!");
}
};
return (
<div data-testid="wb-act-sort" style={card()}>
<WbPrompt text={unit.sort.prompt} emoji="🧺" />
{cur ? (
<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontSize: 30, fontWeight: 800, padding: 12, borderRadius: 16, background: t.bg.subtle }}>
<WbSpeak text={cur.label} />
<span style={{ fontSize: 64 }}>{cur.emoji}</span> {cur.label}
{oops && <span style={{ color: t.text.warning, fontSize: 22 }}>🔁 Try the other side</span>}
</div>
) : (
<WbDone text="You sorted them all!" />
)}
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
{unit.sort.buckets.map((b: string, k: number) => (
<div key={b} style={{ border: `3px dashed ${t.border.default}`, borderRadius: 18, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
<button data-testid={`wb-sort-bucket-${k}`} onClick={() => pick(k)} style={btn(t.fill.primary, t.text.onPrimary, { fontSize: 24 })}>
{b}
</button>
<div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 36, minHeight: 48 }}>
{placed[k].map((p: WbSortItem) => (
<span key={p.label} title={p.label}>{p.emoji}</span>
))}
</div>
</div>
))}
</div>
</div>
);
}


function WbTrueFalseAct({ unit, seed, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const items = wbPick(unit.trueFalse, 6, seed, 21);
const [i, setI] = useState<number>(0);
const [score, setScore] = useState<number>(0);
const [msg, setMsg] = useState<string>("");
if (i >= items.length) return <WbDone text={`True or false: ${score} out of ${items.length}!`} />;
const cur: WbTrueFalse = items[i];
const choose = (v: boolean) => {
const ok = v === cur.answer;
if (ok) wbSfx.good();
else wbSfx.oops();
const ns = ok ? score + 1 : score;
setScore(ns);
setMsg(ok ? "✅ Yes! Well done." : `💡 It is ${cur.answer ? "true" : "false"}.`);
wbSpeak(ok ? "Well done!" : `It is ${cur.answer ? "true" : "false"}.`);
setResp("find:tf", `${ns}/${items.length}`);
window.setTimeout(() => {
setMsg("");
setI(i + 1);
}, 900);
};
return (
<div data-testid="wb-act-tf" style={card()}>
<div style={{ fontSize: 20, color: t.text.secondary }}>Statement {i + 1} of {items.length}</div>
<WbPrompt text={cur.text} emoji={cur.emoji} big />
<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
<button data-testid="wb-tf-true" disabled={!!msg} onClick={() => choose(true)} style={btn(t.text.success, t.text.onColor, { flex: "1 1 160px", fontSize: 26 })}>
👍 True
</button>
<button data-testid="wb-tf-false" disabled={!!msg} onClick={() => choose(false)} style={btn(t.text.warning, t.text.onColor, { flex: "1 1 160px", fontSize: 26 })}>
👎 False
</button>
</div>
{msg && <div style={{ fontSize: 24, fontWeight: 800 }}>{msg}</div>}
</div>
);
}

function WbSequenceAct({ unit, seed, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const seq = unit.sequences[seed % unit.sequences.length];
const cards = wbShuffle(seq.steps, seed, 22);
const [order, setOrder] = useState<string[]>([]);
const [oops, setOops] = useState<string>("");
const done = order.length === seq.steps.length;
const tap = (text: string) => {
if (order.indexOf(text) >= 0) return;
if (seq.steps[order.length].text === text) {
wbSfx.good();
const next = [...order, text];
setOrder(next);
setOops("");
if (next.length === seq.steps.length) setResp("find:seq", `${seq.title}: done`);
} else {
wbSfx.oops();
setOops(text);
wbSpeak("What comes first?");
}
};
return (
<div data-testid="wb-act-seq" style={card()}>
<WbPrompt text={`Put in order: ${seq.title}. What comes first?`} emoji="🔢" />
<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
{cards.map((s: { text: string; emoji: string }) => {
const pos = order.indexOf(s.text);
return (
<button
key={s.text}
onClick={() => tap(s.text)}
style={btn(pos >= 0 ? t.text.success : oops === s.text ? t.text.warning : t.bg.base, pos >= 0 || oops === s.text ? t.text.onColor : t.text.primary, { flex: "1 1 150px", flexDirection: "column", minHeight: 120 })}
>
<span style={{ fontSize: 48 }}>{s.emoji}</span>
<span>{pos >= 0 ? `${pos + 1}. ` : ""}{s.text}</span>
</button>
);
})}
</div>
{done && <WbDone text="Perfect order!" />}
</div>
);
}

function WbCountAct({ unit, seed, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const items = wbPick(unit.counts, 4, seed, 23);
const [i, setI] = useState<number>(0);
const [score, setScore] = useState<number>(0);
const [wrong, setWrong] = useState<number>(-1);
if (i >= items.length) return <WbDone text={`Super counting! ${score} out of ${items.length}.`} />;
const c = items[i];
const opts = wbShuffle([c.n, c.n + 1, Math.max(1, c.n - 1) === c.n ? c.n + 2 : c.n - 1], seed + i, 24);
return (
<div data-testid="wb-act-count" style={card()}>
<WbPrompt text={c.q} emoji="🔎" big />
<div style={{ fontSize: 52, letterSpacing: 8, textAlign: "center", padding: 10, borderRadius: 16, background: t.bg.subtle }}>
{Array.from({ length: c.n }).map((_: unknown, k: number) => (
<span key={k}>{c.emoji}</span>
))}
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
{opts.map((n: number) => (
<button
key={n}
onClick={() => {
if (n === c.n) {
wbSfx.good();
wbSpeak(`${n}! Yes!`);
const ns = wrong >= 0 ? score : score + 1;
setScore(ns);
setResp("find:count", `${ns}/${items.length}`);
setWrong(-1);
setI(i + 1);
} else {
wbSfx.oops();
setWrong(n);
wbSpeak("Count again, slowly.");
}
}}
style={btn(wrong === n ? t.text.warning : t.bg.base, wrong === n ? t.text.onColor : t.text.primary, { flex: "1 1 120px", fontSize: 40, minHeight: 90 })}
>
{n}
</button>
))}
</div>
</div>
);
}

function WbDrawLabelAct({ unit, resp, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const chosen = (resp["find:labels"] || "").split("|").filter((s: string) => s);
const toggle = (w: string) => {
const next = chosen.indexOf(w) >= 0 ? chosen.filter((x: string) => x !== w) : [...chosen, w];
setResp("find:labels", next.join("|"));
wbSpeak(w);
};
return (
<div data-testid="wb-act-draw" style={card()}>
<WbPrompt text={unit.drawLabel.prompt} emoji="🖍️" />
<WbDrawPad id="find:draw" resp={resp} setResp={setResp} />
<div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
<WbSpeak text={unit.drawLabel.labels.join(", ")} />
{unit.drawLabel.labels.map((w: string) => (
<button key={w} onClick={() => toggle(w)} style={btn(chosen.indexOf(w) >= 0 ? t.fill.accent : t.bg.base, chosen.indexOf(w) >= 0 ? t.text.onColor : t.text.primary)}>
{chosen.indexOf(w) >= 0 ? "🏷️ " : ""}{w}
</button>
))}
</div>
{chosen.length > 0 && <div style={{ fontSize: 22 }}>My labels: <b>{chosen.join(", ")}</b></div>}
</div>
);
}

function WbThinkAct({ unit, seed, resp, setResp }: WbStageProps) {
const card = useWbCard();
const prompts = wbPick(unit.thinkPrompts || [], 3, seed, 25);
return (
<div data-testid="wb-act-think" style={card()}>
<WbPrompt text="Think and write. Explain your ideas in full sentences." emoji="✍️" />
{prompts.map((p: string, i: number) => (
<div key={p} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
<WbPrompt text={`${i + 1}. ${p}`} emoji="💭" />
<WbAnswer id={`find:think:${p.slice(0, 24)}`} resp={resp} setResp={setResp} placeholder="I think… because…" />
</div>
))}
</div>
);
}


function Chips({ items, color }: { items: string[]; color: string }) {
const t = useWbTheme();
return (
<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
{items.map((s: string) => (
<span key={s} style={{ padding: "8px 14px", borderRadius: 999, border: `2px solid ${color}`, fontSize: 20, fontWeight: 700, color: t.text.primary }}>
{s}
</span>
))}
</div>
);
}

function WbOverview({ unit }: WbStageProps) {
const t = useWbTheme();
const card = useWbCard();
const pal = useWbPal();
return (
<div data-testid="wb-stage-overview" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div style={card()}>
<div style={{ fontSize: 20, color: t.text.secondary, fontWeight: 700 }}>
Theme {unit.number}: {unit.theme}
</div>
<WbHeading emoji={unit.emoji} text={unit.unitTitle} />
<WbPrompt text={unit.kidIdea} emoji="💡" big />
<div style={{ fontSize: 20, color: t.text.secondary }}>
<b>Central idea (teacher):</b> {unit.centralIdea}
</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
<div style={card()}>
<WbHeading emoji="🧭" text="Lines of inquiry" />
{unit.lines.map((l: string, i: number) => (
<div key={l} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 21 }}>
<WbSpeak text={l} />
<span>
{i + 1}. {l}
</span>
</div>
))}
</div>
<div style={card()}>
<div style={{ fontSize: 22, fontWeight: 800 }}>🔑 Key concepts</div>
<Chips items={unit.keyConcepts} color={pal[0]} />
<div style={{ fontSize: 22, fontWeight: 800 }}>🔗 Related concepts</div>
<Chips items={unit.relatedConcepts} color={pal[1 % pal.length]} />
<div style={{ fontSize: 22, fontWeight: 800 }}>🌟 Learner profile</div>
<Chips items={unit.learnerProfile} color={pal[2 % pal.length]} />
<div style={{ fontSize: 22, fontWeight: 800 }}>🛠️ Approaches to learning</div>
<Chips items={unit.atl} color={pal[3 % pal.length]} />
</div>
</div>
</div>
);
}

function WbTuningIn({ unit, seed, resp, setResp }: WbStageProps) {
const t = useWbTheme();
const card = useWbCard();
const btn = useWbBtn();
const pv = unit.provocation;
const stw = unit.seeThinkWonder;
const questions = wbPick(unit.wonderQuestions, 7, seed, 1);
const starters = wbPick(WB_WONDER_STARTERS, 4, seed, 2);
const liked = (resp["tune:liked"] || "").split("|").filter((s: string) => s);

const toggle = (q: string) => {
const next = liked.indexOf(q) >= 0 ? liked.filter((x: string) => x !== q) : [...liked, q];
setResp("tune:liked", next.join("|"));
};

return (
<div data-testid="wb-stage-tuning" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div style={card()}>
<WbHeading emoji="🎬" text={`Provocation: ${pv.title}`} />
<div style={{ fontSize: 64, textAlign: "center", letterSpacing: 6 }}>{pv.scene}</div>
<WbPrompt text={pv.description} />
<div style={{ padding: 12, borderRadius: 14, background: t.bg.subtle, fontSize: 20 }}>
👩‍🏫 <b>Teacher prompt:</b> {pv.teacherPrompt}
</div>
</div>

<div style={card()}>
<WbHeading emoji="👀" text="See – Think – Wonder" />
<div style={{ fontSize: 56, textAlign: "center" }}>{stw.scene}</div>
<WbPrompt text={stw.see} emoji="👀" />
<WbAnswer id="tune:see" resp={resp} setResp={setResp} placeholder="I see…" />
<WbPrompt text={stw.think} emoji="💭" />
<WbAnswer id="tune:think" resp={resp} setResp={setResp} placeholder="I think…" />
<WbPrompt text={stw.wonder} emoji="🤔" />
<WbAnswer id="tune:wonder" resp={resp} setResp={setResp} placeholder="I wonder…" />
</div>

<div style={card()}>
<WbHeading emoji="❓" text="Curiosity questions" />
<div style={{ fontSize: 20, color: t.text.secondary }}>Tap ⭐ if you wonder this too.</div>
{questions.map((q: string, i: number) => {
const on = liked.indexOf(q) >= 0;
return (
<div key={q} data-testid={`wb-wonder-q-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
<WbSpeak text={q} />
<span style={{ flex: "1 1 220px", fontSize: 23, fontWeight: 600 }}>{q}</span>
<button
onClick={() => {
wbSfx.tap();
toggle(q);
}}
style={btn(on ? t.text.warning : t.bg.base, on ? t.text.onColor : t.text.primary)}
>
{on ? "⭐ Me too!" : "☆"}
</button>
</div>
);
})}
</div>

<div style={card()}>
<WbHeading emoji="💬" text="My own I wonder question" />
<div style={{ fontSize: 20, color: t.text.secondary }}>Pick a starter. Then finish it.</div>
<WbChoices options={starters} selected={resp["tune:starter"] ? [resp["tune:starter"]] : []} onPick={(o: string) => setResp("tune:starter", o)} />
<WbAnswer id="tune:myq" resp={resp} setResp={setResp} placeholder={resp["tune:starter"] || "I wonder…"} />
</div>
</div>
);
}


const WB_ACTS: { id: string; label: string; emoji: string }[] = [
{ id: "words", label: "Picture Words", emoji: "🖼️" },
{ id: "listen", label: "Listen & Choose", emoji: "👂" },
{ id: "sort", label: "Sort It", emoji: "🧺" },
{ id: "tf", label: "True or False", emoji: "👍" },
{ id: "seq", label: "Put in Order", emoji: "🔢" },
{ id: "count", label: "Count & Observe", emoji: "🔎" },
{ id: "draw", label: "Draw & Label", emoji: "🖍️" },
{ id: "think", label: "Think & Write", emoji: "✍️" },
];

function WbFindingOut(props: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const [act, setAct] = useState<string>("words");
const k = `${props.unit.id}-${props.seed}-${act}`;
return (
<div data-testid="wb-stage-finding" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<WbHeading emoji="🔍" text="Finding Out: try every activity!" />
<div className="wb-noprint" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
{WB_ACTS.filter((a: { id: string }) => a.id !== "think" || (props.unit.thinkPrompts || []).length > 0).map((a: { id: string; label: string; emoji: string }) => {
const score = props.resp[`find:${a.id}`];
return (
<button
key={a.id}
data-testid={`wb-act-tab-${a.id}`}
onClick={() => {
wbSfx.tap();
setAct(a.id);
wbSpeak(a.label);
}}
style={btn(act === a.id ? t.fill.primary : t.bg.elevated, act === a.id ? t.text.onPrimary : t.text.primary, { flex: "1 1 170px", fontSize: 20 })}
>
{a.emoji} {a.label} {score ? "✅" : ""}
</button>
);
})}
</div>
<div key={k}>
{act === "words" && <WbPictureWords {...props} />}
{act === "listen" && <WbListenChoose {...props} />}
{act === "sort" && <WbSort {...props} />}
{act === "tf" && <WbTrueFalseAct {...props} />}
{act === "seq" && <WbSequenceAct {...props} />}
{act === "count" && <WbCountAct {...props} />}
{act === "draw" && <WbDrawLabelAct {...props} />}
{act === "think" && <WbThinkAct {...props} />}
</div>
</div>
);
}

function WbSortingOut({ unit, seed, resp, setResp }: WbStageProps) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const org = unit.organiser;
const items = wbShuffle(org.items, seed, 31);
const [sel, setSel] = useState<number>(-1);
const [placed, setPlaced] = useState<number[]>([]);
const [oops, setOops] = useState<boolean>(false);
const place = (col: number) => {
if (sel < 0) {
wbSpeak("First tap a picture.");
return;
}
const it = items[sel];
if (it.col === col) {
wbSfx.good();
const next = [...placed, sel];
setPlaced(next);
setResp("sort:organiser", `${next.length}/${items.length}`);
setSel(-1);
setOops(false);
} else {
wbSfx.oops();
setOops(true);
wbSpeak("Hmm, try another box.");
}
};
return (
<div data-testid="wb-stage-sorting" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div style={card()}>
<WbHeading emoji="🧩" text={org.title} />
<WbPrompt text={org.prompt} />
<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
{items.map((it: { label: string; emoji: string; col: number }, i: number) =>
placed.indexOf(i) >= 0 ? null : (
<button
key={it.label}
data-testid={`wb-org-item-${i}`}
onClick={() => {
setSel(i);
wbSpeak(it.label);
}}
style={btn(sel === i ? t.fill.accent : t.bg.base, sel === i ? t.text.onColor : t.text.primary, { flex: "1 1 160px" })}
>
<span style={{ fontSize: 34 }}>{it.emoji}</span> {it.label}
</button>
)
)}
</div>
{oops && <div style={{ color: t.text.warning, fontSize: 22, fontWeight: 700 }}>🔁 Not that box. Try again!</div>}
{placed.length === items.length && <WbDone text="Your chart is complete!" />}
<div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(170px, 1fr))`, gap: 10 }}>
{org.columns.map((c: { label: string; emoji: string }, ci: number) => (
<div key={c.label} style={{ border: `3px solid ${t.border.default}`, borderRadius: 16, padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 160 }}>
<button data-testid={`wb-org-col-${ci}`} onClick={() => place(ci)} style={btn(t.fill.primary, t.text.onPrimary)}>
{c.emoji} {c.label}
</button>
{placed
.filter((p: number) => items[p].col === ci)
.map((p: number) => (
<div key={p} style={{ fontSize: 20, fontWeight: 600 }}>
{items[p].emoji} {items[p].label}
</div>
))}
</div>
))}
</div>
</div>
<div style={card()}>
<WbPrompt text="What is the big idea? Say it in your own words." emoji="💡" />
<WbAnswer id="sort:bigidea" resp={resp} setResp={setResp} placeholder="I learned that…" />
</div>
</div>
);
}

function WbAction({ unit, resp, setResp }: WbStageProps) {
const t = useWbTheme();
const card = useWbCard();
const btn = useWbBtn();
const ideas = unit.action.ideas.map((i: { text: string; emoji: string }) => `${i.emoji} ${i.text}`);
const done = resp["act:done"] === "yes";
return (
<div data-testid="wb-stage-action" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div style={card()}>
<WbHeading emoji="🤝" text={`Taking Action: ${unit.action.title}`} />
<WbPrompt text="Choose one thing you will do." />
<WbChoices options={ideas} selected={resp["act:choice"] ? [resp["act:choice"]] : []} onPick={(o: string) => { setResp("act:choice", o); wbSpeak(o); }} testPrefix="wb-action-idea" />
<WbPrompt text="Where will you do it?" emoji="📍" />
<WbChoices options={["🏠 At home", "🏫 At school", "🌳 In my community"]} selected={resp["act:where"] ? [resp["act:where"]] : []} onPick={(o: string) => setResp("act:where", o)} />
<WbPrompt text="My plan: I will…" emoji="📝" />
<WbAnswer id="act:plan" resp={resp} setResp={setResp} placeholder="I will…" />
</div>
<WbDrawPad id="act:draw" resp={resp} setResp={setResp} label="Draw yourself taking action." />
<div style={card()}>
<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 22 }}>
<WbSpeak text={unit.action.homeLink} />
🏠 <b>Home link:</b> {unit.action.homeLink}
</div>
<button
data-testid="wb-action-done"
onClick={() => {
wbSfx.win();
setResp("act:done", done ? "" : "yes");
}}
style={btn(done ? t.text.success : t.bg.base, done ? t.text.onColor : t.text.primary, { alignSelf: "flex-start" })}
>
{done ? "✅ I did it!" : "☐ I did my action"}
</button>
</div>
</div>
);
}


const split = (s: string | undefined): string[] => (s || "").split("|").filter((x: string) => x);

function WbReflection({ unit, resp, setResp }: WbStageProps) {
const t = useWbTheme();
const card = useWbCard();
const btn = useWbBtn();
const helpers = split(resp["ref:helped"]);
return (
<div data-testid="wb-stage-reflection" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div style={card()}>
<WbHeading emoji="🔄" text="I used to think… Now I think…" />
<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", fontSize: 20, color: t.text.secondary }}>
<WbSpeak text={unit.usedToThink} /> Example: {unit.usedToThink}
</div>
<WbPrompt text="I used to think…" emoji="⬅️" />
<WbAnswer id="ref:used" resp={resp} setResp={setResp} placeholder="I used to think…" />
<WbPrompt text="Now I think…" emoji="➡️" />
<WbAnswer id="ref:now" resp={resp} setResp={setResp} placeholder="Now I think…" />
</div>
<div style={card()}>
<WbPrompt text="How do you feel about this unit?" emoji="💛" />
<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
{WB_FEELINGS.map((f: { emoji: string; label: string }) => {
const on = resp["ref:feeling"] === f.label;
return (
<button key={f.label} data-testid={`wb-feeling-${f.label}`} onClick={() => { setResp("ref:feeling", f.label); wbSpeak(f.label); }} style={btn(on ? t.fill.accent : t.bg.base, on ? t.text.onColor : t.text.primary, { flexDirection: "column", flex: "1 1 110px", minHeight: 110 })}>
<span style={{ fontSize: 48 }}>{f.emoji}</span>
<span>{f.label}</span>
</button>
);
})}
</div>
</div>
<div style={card()}>
<WbPrompt text="What helped me learn? Tap all that helped." emoji="🧰" />
<WbChoices
options={WB_HELPERS.map((h: { emoji: string; label: string }) => `${h.emoji} ${h.label}`)}
selected={helpers}
onPick={(o: string) => setResp("ref:helped", (helpers.indexOf(o) >= 0 ? helpers.filter((x: string) => x !== o) : [...helpers, o]).join("|"))}
/>
</div>
<div style={card()}>
<WbHeading emoji="🌟" text="Learner profile check" />
{unit.learnerProfile.map((lp: string) => {
const info = WB_LEARNER_PROFILE[lp] || { emoji: "⭐", kid: lp };
const key = `ref:lp:${lp}`;
return (
<div key={lp} style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8, borderBottom: `1px solid ${t.border.subtle}` }}>
<WbPrompt text={`${lp}: ${info.kid}`} emoji={info.emoji} />
<WbChoices options={["🌱 Not yet", "🌿 Sometimes", "🌳 Yes, I did!"]} selected={resp[key] ? [resp[key]] : []} onPick={(o: string) => setResp(key, o)} />
</div>
);
})}
</div>
</div>
);
}

function WbExitCard({ unit, seed, resp, setResp, exits, onSaveExit }: WbStageProps & { exits: WbExitResult[]; onSaveExit: (r: WbExitResult) => void }) {
const t = useWbTheme();
const card = useWbCard();
const btn = useWbBtn();
const [saved, setSaved] = useState<WbExitResult | null>(null);
const wordOpts = wbPick(unit.words, 8, seed, 41).map((w: WbWord) => `${w.emoji} ${w.word}`);
const facts = wbPick(
[...unit.trueFalse.filter((f: WbTrueFalse) => f.answer).map((f: WbTrueFalse) => `${f.emoji} ${f.text}`), ...unit.words.map((w: WbWord) => `${w.emoji} ${w.sentence}`)],
6,
seed,
42
);
const qOpts = wbPick(unit.wonderQuestions, 4, seed, 43);
const checks = wbPick(unit.checks, 3, seed, 44);
const words = split(resp["exit:words"]);
const interesting = split(resp["exit:interesting"]);
const limitPick = (key: string, cur: string[], o: string, max: number) => {
const next = cur.indexOf(o) >= 0 ? cur.filter((x: string) => x !== o) : [...cur, o].slice(-max);
setResp(key, next.join("|"));
wbSpeak(o.replace(/^\S+\s/, ""));
};
const save = () => {
const conf = Number(resp["exit:conf"] || 0);
const answered = checks.filter((_: WbCheck, i: number) => !!resp[`exit:c${i}`]).length;
if (!conf || answered < checks.length) {
wbSfx.oops();
wbSpeak("Answer the questions and pick a face first.");
return;
}
const score = checks.filter((c: WbCheck, i: number) => resp[`exit:c${i}`] === c.answer).length;
const r: WbExitResult = { date: new Date().toISOString(), words, interesting, question: resp["exit:q"] || "", confidence: conf, score, total: checks.length };
onSaveExit(r);
setSaved(r);
wbSfx.win();
wbSpeak(`Exit card saved! You got ${score} out of ${checks.length}.`);
};
return (
<div data-testid="wb-stage-exit" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<div style={card({ border: `3px dashed ${t.text.primary}` })}>
<WbHeading emoji="🎟️" text={`Exit Card: ${unit.theme}`} />
<WbPrompt text="3 new words I learned. Tap 3." emoji="3️⃣" />
<WbChoices options={wordOpts} selected={words} onPick={(o: string) => limitPick("exit:words", words, o, 3)} testPrefix="wb-exit-word" />
<WbPrompt text="2 things I found interesting. Tap 2." emoji="2️⃣" />
<WbChoices options={facts} selected={interesting} onPick={(o: string) => limitPick("exit:interesting", interesting, o, 2)} testPrefix="wb-exit-fact" />
<WbPrompt text="1 question I still have." emoji="1️⃣" />
<WbChoices options={qOpts} selected={resp["exit:q"] ? [resp["exit:q"]] : []} onPick={(o: string) => setResp("exit:q", o)} />
<WbAnswer id="exit:q" resp={resp} setResp={setResp} placeholder="Or type my own question…" />
</div>
<div style={card()}>
<WbHeading emoji="✅" text="Check my understanding" />
{checks.map((c: WbCheck, i: number) => {
const key = `exit:c${i}`;
const options = wbShuffle(c.options, seed + i, 45);
return (
<div key={c.q} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
<WbPrompt text={`${i + 1}. ${c.q}`} emoji={c.emoji} />
<WbChoices options={options} selected={resp[key] ? [resp[key]] : []} onPick={(o: string) => setResp(key, o)} correct={saved ? c.answer : undefined} testPrefix={`wb-exit-check-${i}`} />
</div>
);
})}
</div>
<div style={card()}>
<WbPrompt text="How sure do I feel?" emoji="📊" />
<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
{WB_CONFIDENCE.map((c: { emoji: string; label: string; value: number }) => {
const on = resp["exit:conf"] === String(c.value);
return (
<button key={c.value} data-testid={`wb-exit-conf-${c.value}`} onClick={() => { setResp("exit:conf", String(c.value)); wbSpeak(c.label); }} style={btn(on ? t.fill.accent : t.bg.base, on ? t.text.onColor : t.text.primary, { flexDirection: "column", flex: "1 1 130px", minHeight: 120 })}>
<span style={{ fontSize: 52 }}>{c.emoji}</span>
<span style={{ fontSize: 19 }}>{c.label}</span>
</button>
);
})}
</div>
<button data-testid="wb-exit-save" className="wb-noprint" onClick={save} style={btn(t.text.success, t.text.onColor, { fontSize: 26 })}>
💾 Save my exit card
</button>
{saved && (
<div data-testid="wb-exit-saved" style={{ fontSize: 24, fontWeight: 800, color: t.text.success }}>
🎉 Saved! {saved.score} / {saved.total} correct. {WB_CONFIDENCE[saved.confidence - 1]?.emoji}
</div>
)}
{exits.length > 0 && (
<div style={{ fontSize: 19, color: t.text.secondary }}>
Saved exit cards for this theme: {exits.length}. Last: {exits[exits.length - 1].score}/{exits[exits.length - 1].total}
</div>
)}
</div>
</div>
);
}


function WbTeacherPanel({ students, initialYear }: { students: { id: string; name: string }[]; initialYear?: WbYearId }) {
const t = useWbTheme();
const btn = useWbBtn();
const [yearId, setYearId] = useState<WbYearId>(initialYear || "y1");
const units = wbYear(yearId).units;
const cell = { padding: "10px 8px", borderBottom: `1px solid ${t.border.subtle}`, fontSize: 18, textAlign: "center" as const };
return (
<div data-testid="wb-teacher-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
<div style={{ fontSize: 22, fontWeight: 800 }}>📒 PYP Workbook: Exit-Card Results</div>
<div style={{ fontSize: 17, color: t.text.secondary }}>
Latest score, confidence face and number of exit cards saved for each theme.
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
{WB_YEARS.map((y: WbYear) => (
<button key={y.id} data-testid={`wb-teacher-year-${y.id}`} onClick={() => setYearId(y.id)} style={btn(yearId === y.id ? t.fill.primary : t.bg.elevated, yearId === y.id ? t.text.onPrimary : t.text.primary, { fontSize: 18 })}>
{y.label}
</button>
))}
</div>
<div style={{ overflowX: "auto" }}>
<table style={{ borderCollapse: "collapse", width: "100%", minWidth: 720 }}>
<thead>
<tr>
<th style={{ ...cell, textAlign: "left" }}>Student</th>
{units.map((u: WbUnit) => (
<th key={u.id} style={cell} title={u.theme}>
{u.emoji} {u.theme.split(" ").slice(0, 3).join(" ")}
</th>
))}
</tr>
</thead>
<tbody>
{students.map((s: { id: string; name: string }) => (
<tr key={s.id} data-testid={`wb-teacher-row-${s.id}`}>
<td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>{s.name}</td>
{units.map((u: WbUnit) => {
const exits = wbGetRecord(s.id, `${yearId}:${u.id}`).exits;
const last = exits[exits.length - 1];
return (
<td key={u.id} style={cell}>
{last ? (
<span>
{WB_CONFIDENCE[last.confidence - 1]?.emoji} {last.score}/{last.total}
<br />
<span style={{ fontSize: 14, color: t.text.secondary }}>
{exits.length} card{exits.length > 1 ? "s" : ""} · {last.date.slice(0, 10)}
</span>
</span>
) : (
<span style={{ color: t.text.secondary }}>–</span>
)}
</td>
);
})}
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}


const WB_PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .wb-print-area, .wb-print-area * { visibility: visible !important; }
  .wb-print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .wb-noprint { display: none !important; }
  .wb-print-area input { border: 2px solid currentColor !important; }
}`;

type WbStudent = { id: string; name: string; year?: string };

function toYearId(y: string | undefined): WbYearId {
return y === "y2" || y === "y3" || y === "y4" ? y : "y1";
}

function PypWorkbookView({
students,
activeId,
onAward,
}: {
students: WbStudent[];
activeId: string;
onAward?: (points: number, stars: number) => void;
}) {
const t = useWbTheme();
const btn = useWbBtn();
const card = useWbCard();
const pal = useWbPal();
const activeStudent = students.find((s: WbStudent) => s.id === activeId);
const [yearId, setYearId] = useState<WbYearId>(() => toYearId(activeStudent ? activeStudent.year : undefined));
const [themeId, setThemeId] = useState<WbThemeId | null>(null);
const [stage, setStage] = useState<number>(0);
const [seed, setSeed] = useState<number>(() => 1 + Math.floor(Math.random() * 100000));
const [rec, setRec] = useState<WbThemeRecord>({ responses: {}, exits: [] });
const [showTeacher, setShowTeacher] = useState<boolean>(false);
const year: WbYear = wbYear(yearId);
const unit: WbUnit | undefined = year.units.find((u: WbUnit) => u.id === themeId);
const student = activeStudent || students[0];
const recKey = (id: string): string => `${yearId}:${id}`;

useEffect(() => {
setYearId(toYearId(activeStudent ? activeStudent.year : undefined));
setThemeId(null);
}, [activeId]);

useEffect(() => {
if (themeId) setRec(wbGetRecord(activeId, recKey(themeId)));
}, [activeId, themeId, yearId]);

const setResp = (key: string, value: string) => {
if (!themeId) return;
setRec((prev: WbThemeRecord) => {
const next = { ...prev, responses: { ...prev.responses, [key]: value } };
wbSaveRecord(activeId, recKey(themeId), next);
return next;
});
};
const saveExit = (r: WbExitResult) => {
if (!themeId) return;
setRec((prev: WbThemeRecord) => {
const next = { ...prev, exits: [...prev.exits, r] };
wbSaveRecord(activeId, recKey(themeId), next);
return next;
});
if (onAward) onAward(20 + r.score * 5, 1 + r.score);
};
const openUnit = (id: WbThemeId) => {
wbSfx.tap();
setThemeId(id);
setStage(0);
setSeed(1 + Math.floor(Math.random() * 100000));
};

if (!unit) {
return (
<div data-testid="wb-view" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
<style>{WB_PRINT_CSS}</style>
<div style={card()}>
<div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
<WbSpeak text={`PYP Workbook. ${year.label}. Choose a theme.`} />
<span style={{ fontSize: 32, fontWeight: 800 }}>📒 PYP Workbook: {year.label}</span>
</div>
<div data-testid="wb-year-picker" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
{WB_YEARS.map((y: WbYear, i: number) => (
<button key={y.id} data-testid={`wb-year-${y.id}`} onClick={() => { wbSfx.tap(); setYearId(y.id); wbSpeak(y.label); }} style={btn(yearId === y.id ? pal[i % pal.length] : t.bg.elevated, yearId === y.id ? t.text.onColor : t.text.primary, { flex: "1 1 150px", flexDirection: "column" })}>
<span>🎓 {y.label}</span>
<span style={{ fontSize: 16, fontWeight: 600 }}>{y.ages}</span>
</button>
))}
</div>
<div data-testid="wb-year-focus" style={{ fontSize: 20 }}>{year.ages}: {year.focus}. Six inquiry units, each with Tuning In, Finding Out, Sorting Out, Taking Action, Reflection and an Exit Card.</div>
<div style={{ fontSize: 18, color: t.text.secondary }}>Student: <b>{student ? student.name : ""}</b> · {WB_DISCLAIMER}</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
{year.units.map((u: WbUnit, i: number) => {
const n = wbGetRecord(activeId, recKey(u.id)).exits.length;
return (
<button key={u.id} data-testid={`wb-theme-${u.id}`} onClick={() => openUnit(u.id)} style={{ ...card({ border: `4px solid ${pal[i % pal.length]}`, cursor: "pointer", textAlign: "left", fontFamily: t.font.family, color: t.text.primary, minHeight: 200 }) }}>
<span style={{ fontSize: 56 }}>{u.emoji}</span>
<span style={{ fontSize: 18, fontWeight: 700, color: t.text.secondary }}>Theme {u.number}</span>
<span style={{ fontSize: 25, fontWeight: 800 }}>{u.theme}</span>
<span style={{ fontSize: 20 }}>{u.unitTitle}</span>
{n > 0 && <span style={{ fontSize: 18, color: t.text.success, fontWeight: 700 }}>🎟️ {n} exit card{n > 1 ? "s" : ""} saved</span>}
</button>
);
})}
</div>
<button data-testid="wb-teacher-toggle" onClick={() => setShowTeacher(!showTeacher)} style={btn(t.fill.secondary, t.text.primary, { alignSelf: "flex-start" })}>
👩‍🏫 {showTeacher ? "Hide" : "Show"} teacher results
</button>
{showTeacher && <div style={card()}><WbTeacherPanel students={students} initialYear={yearId} /></div>}
</div>
);
}

const st = WB_STAGES[stage];
const props = { unit, seed, resp: rec.responses, setResp };
const pct = Math.round(((stage + 1) / WB_STAGES.length) * 100);
return (
<div data-testid="wb-view" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<style>{WB_PRINT_CSS}</style>
<div className="wb-noprint" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
<button data-testid="wb-back-themes" onClick={() => setThemeId(null)} style={btn(t.fill.secondary, t.text.primary)}>⬅️ Themes</button>
<span style={{ fontSize: 24, fontWeight: 800, flex: "1 1 240px" }}>{unit.emoji} {year.label} · {unit.theme}</span>
<button data-testid="wb-shuffle" onClick={() => { wbSfx.tap(); setSeed(seed + 1 + Math.floor(Math.random() * 997)); wbSpeak("New questions!"); }} style={btn(t.fill.accent, t.text.onColor)}>🔀 New questions</button>
<button data-testid="wb-print" onClick={() => window.print()} style={btn(t.fill.secondary, t.text.primary)}>🖨️ Print workbook page</button>
</div>
<div className="wb-noprint" data-testid="wb-progress" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
<div style={{ height: 18, borderRadius: 999, background: t.bg.subtle, border: `1px solid ${t.border.default}`, overflow: "hidden" }}>
<div data-testid="wb-progress-fill" style={{ width: `${pct}%`, height: "100%", background: t.fill.accent, transition: "width 0.3s" }} />
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
{WB_STAGES.map((s: { id: string; label: string; emoji: string }, i: number) => (
<button key={s.id} data-testid={`wb-stage-btn-${s.id}`} onClick={() => { wbSfx.tap(); setStage(i); wbSpeak(s.label); }} style={btn(i === stage ? t.fill.primary : i < stage ? t.bg.subtle : t.bg.elevated, i === stage ? t.text.onPrimary : t.text.primary, { flex: "1 1 130px", fontSize: 18, padding: "8px 10px" })}>
{i < stage ? "✅" : s.emoji} {s.label}
</button>
))}
</div>
</div>
<div className="wb-print-area" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<div style={{ fontSize: 18, color: t.text.secondary }}>
{student ? student.name : ""} · {year.label} · {unit.theme} · Step {stage + 1} of {WB_STAGES.length}: {st.label}
</div>
<div key={`${yearId}-${unit.id}-${seed}-${st.id}`}>
{st.id === "overview" && <WbOverview {...props} />}
{st.id === "tuning" && <WbTuningIn {...props} />}
{st.id === "finding" && <WbFindingOut {...props} />}
{st.id === "sorting" && <WbSortingOut {...props} />}
{st.id === "action" && <WbAction {...props} />}
{st.id === "reflection" && <WbReflection {...props} />}
{st.id === "exit" && <WbExitCard {...props} exits={rec.exits} onSaveExit={saveExit} />}
</div>
</div>
<div className="wb-noprint" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
<button data-testid="wb-prev" disabled={stage === 0} onClick={() => setStage(Math.max(0, stage - 1))} style={btn(t.fill.secondary, t.text.primary, { opacity: stage === 0 ? 0.5 : 1 })}>⬅️ Back</button>
{stage < WB_STAGES.length - 1 ? (
<button data-testid="wb-next" onClick={() => { wbSfx.tap(); setStage(stage + 1); wbSpeak(WB_STAGES[stage + 1].label); }} style={btn(t.fill.primary, t.text.onPrimary)}>Next: {WB_STAGES[stage + 1].emoji} {WB_STAGES[stage + 1].label} ➡️</button>
) : (
<button onClick={() => setThemeId(null)} style={btn(t.fill.primary, t.text.onPrimary)}>🏁 Choose another theme</button>
)}
</div>
</div>
);
}

type TabId = "workbook" | "pyp" | "letters" | "words" | "memory" | "coloring" | "stories" | "math" | "science";

const NAV_TABS: { id: TabId; emoji: string; label: string }[] = [
  { id: "workbook", emoji: "📒", label: "PYP Workbook" },
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
        {tab === "workbook" && (
          <PypWorkbookView
            students={[{ id: "class", name: "My Class", year: year === "all" ? "y1" : year }]}
            activeId="class"
            onAward={(pts: number, st: number) => award(pts, st, "Exit card saved")}
          />
        )}
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
