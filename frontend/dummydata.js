// Dummy Data for EventSphere Frontend
// JavaScript module for fallback data when API is unavailable

// Generate string IDs instead of ObjectId
const ObjectId = (id) => id;

// Users
const users = [
  {
    _id: "507f1f77bcf86cd799439011",
    username: "admin",
    email: "admin@eventsphere.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "admin",
    isVerified: true,
    profile: {
      firstName: "System",
      lastName: "Administrator",
      company: "EventSphere"
    },
    createdAt: new Date("2024-01-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439012",
    username: "john_org",
    email: "john@techcorp.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "organizer",
    isVerified: true,
    profile: {
      firstName: "John",
      lastName: "Smith",
      company: "TechCorp Events"
    },
    createdAt: new Date("2024-01-15T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439013",
    username: "sarah_exhibitor",
    email: "sarah@innovatetech.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "exhibitor",
    isVerified: true,
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      company: "InnovateTech Solutions"
    },
    createdAt: new Date("2024-02-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439014",
    username: "mike_attendee",
    email: "mike@developer.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "attendee",
    isVerified: true,
    profile: {
      firstName: "Mike",
      lastName: "Wilson",
      company: "Indie Developer"
    },
    createdAt: new Date("2024-02-15T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439015",
    username: "emma_exhibitor",
    email: "emma@cloudsoft.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "exhibitor",
    isVerified: true,
    profile: {
      firstName: "Emma",
      lastName: "Davis",
      company: "CloudSoft Technologies"
    },
    createdAt: new Date("2024-03-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439016",
    username: "alex_attendee",
    email: "alex@startup.io",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "attendee",
    isVerified: true,
    profile: {
      firstName: "Alex",
      lastName: "Brown",
      company: "Tech Startup"
    },
    createdAt: new Date("2024-03-15T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439017",
    username: "lisa_org",
    email: "lisa@conferencepro.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "organizer",
    isVerified: true,
    profile: {
      firstName: "Lisa",
      lastName: "Garcia",
      company: "Conference Pro"
    },
    createdAt: new Date("2024-04-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439018",
    username: "david_attendee",
    email: "david@designer.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "attendee",
    isVerified: true,
    profile: {
      firstName: "David",
      lastName: "Martinez",
      company: "Creative Design Studio"
    },
    createdAt: new Date("2024-04-15T00:00:00Z")
  }
];

// Expos
const expos = [
  {
    _id: "507f1f77bcf86cd799439021",
    title: "Tech Conference 2024",
    date: new Date("2024-06-15T09:00:00Z"),
    location: "San Francisco Convention Center",
    description: "Annual technology conference featuring cutting-edge innovations",
    theme: "Future of Technology",
    organizer: "507f1f77bcf86cd799439012",
    floorPlan: [
      { boothId: "A1", position: { x: 100, y: 100 }, size: { width: 200, height: 150 }, available: false, assignedTo: "507f1f77bcf86cd799439031" },
      { boothId: "A2", position: { x: 320, y: 100 }, size: { width: 200, height: 150 }, available: false, assignedTo: "507f1f77bcf86cd799439032" },
      { boothId: "B1", position: { x: 100, y: 270 }, size: { width: 200, height: 150 }, available: true },
      { boothId: "B2", position: { x: 320, y: 270 }, size: { width: 200, height: 150 }, available: true }
    ],
    createdAt: new Date("2024-03-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439022",
    title: "AI & Machine Learning Summit",
    date: new Date("2024-07-20T09:00:00Z"),
    location: "Silicon Valley Center",
    description: "Explore the latest developments in AI and ML",
    theme: "Artificial Intelligence",
    organizer: "507f1f77bcf86cd799439017",
    floorPlan: [
      { boothId: "C1", position: { x: 50, y: 50 }, size: { width: 150, height: 120 }, available: true },
      { boothId: "C2", position: { x: 220, y: 50 }, size: { width: 150, height: 120 }, available: true },
      { boothId: "C3", position: { x: 390, y: 50 }, size: { width: 150, height: 120 }, available: true }
    ],
    createdAt: new Date("2024-04-01T00:00:00Z")
  }
];

// Exhibitors
const exhibitors = [
  {
    _id: "507f1f77bcf86cd799439031",
    user: "507f1f77bcf86cd799439013",
    company: "InnovateTech Solutions",
    products: ["AI Assistants", "Cloud Computing", "Data Analytics"],
    contact: "sarah@innovatetech.com",
    description: "Leading provider of AI-powered business solutions",
    status: "approved",
    expoApplication: "507f1f77bcf86cd799439021",
    createdAt: new Date("2024-02-15T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439032",
    user: "507f1f77bcf86cd799439015",
    company: "CloudSoft Technologies",
    products: ["Cloud Storage", "DevOps Tools", "Microservices"],
    contact: "emma@cloudsoft.com",
    description: "Enterprise cloud solutions and DevOps consulting",
    status: "approved",
    expoApplication: "507f1f77bcf86cd799439021",
    createdAt: new Date("2024-03-01T00:00:00Z")
  }
];

// Booths
const booths = [
  {
    expo: "507f1f77bcf86cd799439021",
    exhibitor: "507f1f77bcf86cd799439031",
    space: "A1",
    products: ["AI Assistants", "Smart Chatbots"],
    contact: "sarah@innovatetech.com",
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    expo: "507f1f77bcf86cd799439021",
    exhibitor: "507f1f77bcf86cd799439032",
    space: "A2",
    products: ["Cloud Storage Solutions", "CI/CD Pipelines"],
    contact: "emma@cloudsoft.com",
    createdAt: new Date("2024-05-01T00:00:00Z")
  }
];

// Attendees (with bookmarked sessions added as per MongoDB script)
const attendees = [
  {
    user: "507f1f77bcf86cd799439014",
    registeredExpos: ["507f1f77bcf86cd799439021", "507f1f77bcf86cd799439022"],
    bookmarkedSessions: ["507f1f77bcf86cd799439041"], // Added from MongoDB script
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    user: "507f1f77bcf86cd799439016",
    registeredExpos: ["507f1f77bcf86cd799439021"],
    bookmarkedSessions: ["507f1f77bcf86cd799439042"], // Added from MongoDB script
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    user: "507f1f77bcf86cd799439018",
    registeredExpos: ["507f1f77bcf86cd799439022"],
    bookmarkedSessions: [],
    createdAt: new Date("2024-05-01T00:00:00Z")
  }
];

// Sessions (with ratings added as per MongoDB script)
const sessions = [
  {
    _id: "507f1f77bcf86cd799439041",
    expo: "507f1f77bcf86cd799439021",
    title: "Introduction to Machine Learning",
    time: new Date("2024-06-15T10:00:00Z"),
    speaker: "507f1f77bcf86cd799439012",
    topic: "Machine Learning Fundamentals",
    location: "Main Hall",
    ratings: [{ // Added from MongoDB script
      user: "507f1f77bcf86cd799439014",
      score: 5,
      comment: "Excellent introduction!"
    }],
    attendance: ["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439016"],
    materials: ["slides.pdf", "examples.zip"],
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439042",
    expo: "507f1f77bcf86cd799439021",
    title: "Cloud Architecture Best Practices",
    time: new Date("2024-06-15T14:00:00Z"),
    speaker: "507f1f77bcf86cd799439017",
    topic: "Cloud Computing",
    location: "Room 202",
    ratings: [{ // Added from MongoDB script
      user: "507f1f77bcf86cd799439016",
      score: 4,
      comment: "Good content, but could be more detailed"
    }],
    attendance: ["507f1f77bcf86cd799439014"],
    materials: ["architecture-guide.pdf"],
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    _id: "507f1f77bcf86cd799439043",
    expo: "507f1f77bcf86cd799439022",
    title: "Future of AI in Business",
    time: new Date("2024-07-20T11:00:00Z"),
    speaker: "507f1f77bcf86cd799439013",
    topic: "AI Applications",
    location: "Auditorium",
    ratings: [],
    attendance: ["507f1f77bcf86cd799439018"],
    materials: ["ai-business-report.pdf"],
    createdAt: new Date("2024-05-01T00:00:00Z")
  }
];

// Messages
const messages = [
  {
    sender: "507f1f77bcf86cd799439014",
    receiver: "507f1f77bcf86cd799439013",
    conversationId: "507f1f77bcf86cd799439013-507f1f77bcf86cd799439014",
    content: "Hi Sarah, I'm interested in your AI assistants. Can we schedule a meeting?",
    type: "text",
    read: false,
    createdAt: new Date("2024-06-01T10:00:00Z")
  },
  {
    sender: "507f1f77bcf86cd799439013",
    receiver: "507f1f77bcf86cd799439014",
    conversationId: "507f1f77bcf86cd799439013-507f1f77bcf86cd799439014",
    content: "Hi Mike! Sure, we'd love to discuss our AI solutions. Are you available tomorrow at 2 PM?",
    type: "text",
    read: false,
    createdAt: new Date("2024-06-01T10:15:00Z")
  },
  {
    sender: "507f1f77bcf86cd799439016",
    receiver: "507f1f77bcf86cd799439015",
    conversationId: "507f1f77bcf86cd799439015-507f1f77bcf86cd799439016",
    content: "Hello Emma, your CloudSoft booth was amazing! Can you provide more info about your DevOps tools?",
    type: "text",
    read: true,
    createdAt: new Date("2024-06-15T16:00:00Z")
  }
];

// Feedback
const feedbacks = [
  {
    user: "507f1f77bcf86cd799439014",
    type: "suggestion",
    message: "It would be great to have more networking sessions between attendees and exhibitors",
    date: new Date("2024-06-01T15:00:00Z")
  },
  {
    user: "507f1f77bcf86cd799439016",
    type: "issue",
    message: "The WiFi connection was unstable during the afternoon sessions",
    date: new Date("2024-06-15T18:00:00Z")
  },
  {
    user: "507f1f77bcf86cd799439018",
    type: "suggestion",
    message: "Please add a mobile app for checking schedules and getting notifications",
    date: new Date("2024-06-20T10:00:00Z")
  }
];

// Notifications
const notifications = [
  {
    user: "507f1f77bcf86cd799439014",
    type: "expo_registration",
    message: "You have successfully registered for Tech Conference 2024",
    read: false,
    createdAt: new Date("2024-05-01T09:00:00Z")
  },
  {
    user: "507f1f77bcf86cd799439013",
    type: "booth_approved",
    message: "Your booth application for Tech Conference 2024 has been approved",
    read: true,
    createdAt: new Date("2024-04-15T14:00:00Z")
  },
  {
    user: "507f1f77bcf86cd799439016",
    type: "session_starting",
    message: "Your session 'Introduction to Machine Learning' starts in 30 minutes",
    read: false,
    createdAt: new Date("2024-06-15T09:30:00Z")
  }
];

// Export as ES6 module
const dummyData = {
  users,
  expos,
  exhibitors,
  booths,
  attendees,
  sessions,
  messages,
  feedbacks,
  notifications
};

export default dummyData;
