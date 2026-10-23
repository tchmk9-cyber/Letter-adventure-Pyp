export const LETTERS = [
  { l: "A", word: "Apple", emoji: "🍎" },
  { l: "B", word: "Ball", emoji: "⚽" },
  { l: "C", word: "Cat", emoji: "🐱" },
  { l: "D", word: "Dog", emoji: "🐶" },
  { l: "E", word: "Egg", emoji: "🥚" },
  { l: "F", word: "Fish", emoji: "🐟" },
  { l: "G", word: "Goat", emoji: "🐐" },
  { l: "H", word: "Hat", emoji: "🎩" },
  { l: "I", word: "Igloo", emoji: "🏠" },
  { l: "J", word: "Jam", emoji: "🍓" },
  { l: "K", word: "Kite", emoji: "🪁" },
  { l: "L", word: "Lion", emoji: "🦁" },
  { l: "M", word: "Moon", emoji: "🌙" },
  { l: "N", word: "Nest", emoji: "🪺" },
  { l: "O", word: "Orange", emoji: "🍊" },
  { l: "P", word: "Pig", emoji: "🐷" },
  { l: "Q", word: "Queen", emoji: "👑" },
  { l: "R", word: "Rain", emoji: "🌧️" },
  { l: "S", word: "Sun", emoji: "☀️" },
  { l: "T", word: "Tree", emoji: "🌳" },
  { l: "U", word: "Umbrella", emoji: "☂️" },
  { l: "V", word: "Van", emoji: "🚐" },
  { l: "W", word: "Water", emoji: "💧" },
  { l: "X", word: "Fox", emoji: "🦊" },
  { l: "Y", word: "Yak", emoji: "🐃" },
  { l: "Z", word: "Zebra", emoji: "🦓" },
];

export const WORDS = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "sun", emoji: "☀️" },
  { word: "bed", emoji: "🛏️" },
  { word: "hat", emoji: "🎩" },
  { word: "cup", emoji: "☕" },
  { word: "bus", emoji: "🚌" },
  { word: "fan", emoji: "🪭" },
  { word: "pig", emoji: "🐷" },
  { word: "box", emoji: "📦" },
];

export const AVATARS = [
  { id: "fox", emoji: "🦊" },
  { id: "bear", emoji: "🐻" },
  { id: "panda", emoji: "🐼" },
  { id: "bunny", emoji: "🐰" },
  { id: "lion", emoji: "🦁" },
  { id: "frog", emoji: "🐸" },
];

export const LEVEL2_STARS = 8;
export const LEVEL3_STARS = 16;
export const LEVEL4_STARS = 24;

export const DIFFICULTIES = [
  { id: "easy", label: "Easy", sub: "Year 1–2" },
  { id: "medium", label: "Medium", sub: "Year 2–3" },
  { id: "hard", label: "Hard", sub: "Year 3–4" },
];

const SCI = "https://static.prod-images.emergentagent.com/jobs/49d6fcb1-54dd-4405-8b45-561360ee0805/images/";
export const SCIENCE = [
  { id: "roots", image: SCI + "c26cf217e47dea910042c4214e321b6703d8ea027fd81ddcd16160f119d62b5e.jpeg",
    q: "Which part of the plant takes in water from the soil?", options: ["Roots", "Leaves", "Flower"], answer: "Roots" },
  { id: "polarbear", image: SCI + "39ef27cefccc79c8d1ecb342fd16fedb5e3bd0b76bf2a706484cdcd69e0da727.jpeg",
    q: "Where does the polar bear live?", options: ["Cold Arctic ice", "Hot desert", "Deep ocean"], answer: "Cold Arctic ice" },
  { id: "raincloud", image: SCI + "697d71d4b71a75dd32a9fcc3d9267ded920155a0c625e1b1cd38b2b139e5a626.jpeg",
    q: "What falls from rain clouds?", options: ["Rain", "Sand", "Leaves"], answer: "Rain" },
  { id: "sun", image: SCI + "d7f69081520c3810575ce2895541fcc5e066fbc6fbc51ff945328e9386d5733e.jpeg",
    q: "The Sun in our sky is a…", options: ["Star", "Planet", "Moon"], answer: "Star" },
  { id: "heart", image: SCI + "a081ff47503e1963842780af288a3350733bb1a915f1e883de63a3fb42cd0bc9.jpeg",
    q: "Which organ pumps blood around your body?", options: ["Heart", "Brain", "Lungs"], answer: "Heart" },
  { id: "globe", image: SCI + "e2ee8863a116067be6fbcb4d581b66716d7db64ff19cb31c02199a92282314dc.jpeg",
    q: "What do we call a round model of the Earth?", options: ["Globe", "Clock", "Box"], answer: "Globe" },
  { id: "firefighter", image: SCI + "e10a173a2656be0cc3a6e2dbfb79b8f5adfe791bb316cd172f96323251014fc2.jpeg",
    q: "Who helps put out fires in our community?", options: ["Firefighter", "Teacher", "Chef"], answer: "Firefighter" },
  { id: "recycle", image: SCI + "4988c141cc0ca7275baef51772a71094e73cdd67f29b32eeb7bec78b986fa7b0.jpeg",
    q: "What should we do with bottles and paper?", options: ["Recycle them", "Throw in the river", "Burn them"], answer: "Recycle them" },
];

export const STORIES = [
  {
    id: "sam",
    title: "Sam the Cat",
    image: "https://static.prod-images.emergentagent.com/jobs/49d6fcb1-54dd-4405-8b45-561360ee0805/images/9b1fec17184eea8f4d203d3d5d14549d0cba0218acaa07fc25236986b8a308de.jpeg",
    lines: ["Sam is a cat.", "Sam has a red hat.", "Sam sat on a mat.", "Sam is happy!"],
    drills: [
      { q: "What does Sam have?", options: ["a red hat", "a big box", "a kite"], answer: "a red hat" },
      { q: "Where did Sam sit?", options: ["on a mat", "in a van", "on a bus"], answer: "on a mat" },
    ],
  },
  {
    id: "sunny",
    title: "A Sunny Day",
    image: "https://static.prod-images.emergentagent.com/jobs/49d6fcb1-54dd-4405-8b45-561360ee0805/images/8ea1f994efc3790d3f77adc02a888959fc6c94bc37b3d6dfbb040e338a128538.jpeg",
    lines: ["The sun is up.", "A dog runs in the park.", "A kid plays with a ball.", "It is so much fun!"],
    drills: [
      { q: "What is up in the sky?", options: ["the sun", "the moon", "a van"], answer: "the sun" },
      { q: "What does the kid play with?", options: ["a ball", "a hat", "an egg"], answer: "a ball" },
    ],
  },
  {
    id: "pip",
    title: "Pip the Pig",
    image: "https://static.prod-images.emergentagent.com/jobs/49d6fcb1-54dd-4405-8b45-561360ee0805/images/9e6157547f7c09455f7820f14936fb1ee7bd7a03fbda005b74fc7f22dbe30bc5.jpeg",
    lines: ["Pip is a pig.", "Pip has a big box.", "Pip hops to the pond.", "Pip naps in the mud!"],
    drills: [
      { q: "What does Pip have?", options: ["a big box", "a red hat", "a kite"], answer: "a big box" },
      { q: "Where does Pip nap?", options: ["in the mud", "on a mat", "in a van"], answer: "in the mud" },
    ],
  },
];
