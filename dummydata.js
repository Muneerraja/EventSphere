// MongoDB Dummy Data Seed Script for EventSphere
// Run this script in MongoDB shell to populate database with test data

// First, let's clear existing data
db.users.deleteMany({});
db.expos.deleteMany({});
db.attendees.deleteMany({});
db.exhibitors.deleteMany({});
db.booths.deleteMany({});
db.sessions.deleteMany({});
db.messages.deleteMany({});
db.feedbacks.deleteMany({});
db.notifications.deleteMany({});
db.passwordresettokens.deleteMany({});

print("🔄 Clearing existing data...");

// Insert Users
const users = [
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    username: "admin",
    email: "admin@eventsphere.com",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm", // password: "password123"
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
    _id: ObjectId("507f1f77bcf86cd799439012"),
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
    _id: ObjectId("507f1f77bcf86cd799439013"),
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
    _id: ObjectId("507f1f77bcf86cd799439014"),
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
    _id: ObjectId("507f1f77bcf86cd799439015"),
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
    _id: ObjectId("507f1f77bcf86cd799439016"),
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
    _id: ObjectId("507f1f77bcf86cd799439017"),
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
    _id: ObjectId("507f1f77bcf86cd799439018"),
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

db.users.insertMany(users);
print("✅ Users inserted");

// Insert Expos
const expos = [
  {
    _id: ObjectId("507f1f77bcf86cd799439021"),
    title: "Tech Conference 2024",
    date: new Date("2024-06-15T09:00:00Z"),
    location: "San Francisco Convention Center",
    description: "Annual technology conference featuring cutting-edge innovations",
    theme: "Future of Technology",
    organizer: ObjectId("507f1f77bcf86cd799439012"), // john_org
    floorPlan: [
      { boothId: "A1", position: { x: 100, y: 100 }, size: { width: 200, height: 150 }, available: false, assignedTo: ObjectId("507f1f77bcf86cd799439031") },
      { boothId: "A2", position: { x: 320, y: 100 }, size: { width: 200, height: 150 }, available: false, assignedTo: ObjectId("507f1f77bcf86cd799439032") },
      { boothId: "B1", position: { x: 100, y: 270 }, size: { width: 200, height: 150 }, available: true },
      { boothId: "B2", position: { x: 320, y: 270 }, size: { width: 200, height: 150 }, available: true }
    ],
    createdAt: new Date("2024-03-01T00:00:00Z")
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439022"),
    title: "AI & Machine Learning Summit",
    date: new Date("2024-07-20T09:00:00Z"),
    location: "Silicon Valley Center",
    description: "Explore the latest developments in AI and ML",
    theme: "Artificial Intelligence",
    organizer: ObjectId("507f1f77bcf86cd799439017"), // lisa_org
    floorPlan: [
      { boothId: "C1", position: { x: 50, y: 50 }, size: { width: 150, height: 120 }, available: true },
      { boothId: "C2", position: { x: 220, y: 50 }, size: { width: 150, height: 120 }, available: true },
      { boothId: "C3", position: { x: 390, y: 50 }, size: { width: 150, height: 120 }, available: true }
    ],
    createdAt: new Date("2024-04-01T00:00:00Z")
  }
];

db.expos.insertMany(expos);
print("✅ Expos inserted");

// Insert Exhibitors
const exhibitors = [
  {
    _id: ObjectId("507f1f77bcf86cd799439031"),
    user: ObjectId("507f1f77bcf86cd799439013"), // sarah_exhibitor
    company: "InnovateTech Solutions",
    products: ["AI Assistants", "Cloud Computing", "Data Analytics"],
    contact: "sarah@innovatetech.com",
    description: "Leading provider of AI-powered business solutions",
    status: "approved",
    expoApplication: ObjectId("507f1f77bcf86cd799439021"),
    createdAt: new Date("2024-02-15T00:00:00Z")
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439032"),
    user: ObjectId("507f1f77bcf86cd799439015"), // emma_exhibitor
    company: "CloudSoft Technologies",
    products: ["Cloud Storage", "DevOps Tools", "Microservices"],
    contact: "emma@cloudsoft.com",
    description: "Enterprise cloud solutions and DevOps consulting",
    status: "approved",
    expoApplication: ObjectId("507f1f77bcf86cd799439021"),
    createdAt: new Date("2024-03-01T00:00:00Z")
  }
];

db.exhibitors.insertMany(exhibitors);
print("✅ Exhibitors inserted");

// Insert Booths
const booths = [
  {
    expo: ObjectId("507f1f77bcf86cd799439021"),
    exhibitor: ObjectId("507f1f77bcf86cd799439031"),
    space: "A1",
    products: ["AI Assistants", "Smart Chatbots"],
    contact: "sarah@innovatetech.com",
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    expo: ObjectId("507f1f77bcf86cd799439021"),
    exhibitor: ObjectId("507f1f77bcf86cd799439032"),
    space: "A2",
    products: ["Cloud Storage Solutions", "CI/CD Pipelines"],
    contact: "emma@cloudsoft.com",
    createdAt: new Date("2024-05-01T00:00:00Z")
  }
];

db.booths.insertMany(booths);
print("✅ Booths inserted");

// Insert Attendees
const attendees = [
  {
    user: ObjectId("507f1f77bcf86cd799439014"), // mike_attendee
    registeredExpos: [ObjectId("507f1f77bcf86cd799439021"), ObjectId("507f1f77bcf86cd799439022")],
    bookmarkedSessions: [],
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    user: ObjectId("507f1f77bcf86cd799439016"), // alex_attendee
    registeredExpos: [ObjectId("507f1f77bcf86cd799439021")],
    bookmarkedSessions: [],
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    user: ObjectId("507f1f77bcf86cd799439018"), // david_attendee
    registeredExpos: [ObjectId("507f1f77bcf86cd799439022")],
    bookmarkedSessions: [],
    createdAt: new Date("2024-05-01T00:00:00Z")
  }
];

db.attendees.insertMany(attendees);
print("✅ Attendees inserted");

// Insert Sessions
const sessions = [
  {
    _id: ObjectId("507f1f77bcf86cd799439041"),
    expo: ObjectId("507f1f77bcf86cd799439021"),
    title: "Introduction to Machine Learning",
    time: new Date("2024-06-15T10:00:00Z"),
    speaker: ObjectId("507f1f77bcf86cd799439012"), // john_org
    topic: "Machine Learning Fundamentals",
    location: "Main Hall",
    ratings: [],
    attendance: [ObjectId("507f1f77bcf86cd799439014"), ObjectId("507f1f77bcf86cd799439016")],
    materials: ["slides.pdf", "examples.zip"],
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439042"),
    expo: ObjectId("507f1f77bcf86cd799439021"),
    title: "Cloud Architecture Best Practices",
    time: new Date("2024-06-15T14:00:00Z"),
    speaker: ObjectId("507f1f77bcf86cd799439017"), // lisa_org
    topic: "Cloud Computing",
    location: "Room 202",
    ratings: [],
    attendance: [ObjectId("507f1f77bcf86cd799439014")],
    materials: ["architecture-guide.pdf"],
    createdAt: new Date("2024-05-01T00:00:00Z")
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439043"),
    expo: ObjectId("507f1f77bcf86cd799439022"),
    title: "Future of AI in Business",
    time: new Date("2024-07-20T11:00:00Z"),
    speaker: ObjectId("507f1f77bcf86cd799439013"), // sarah_exhibitor
    topic: "AI Applications",
    location: "Auditorium",
    ratings: [],
    attendance: [ObjectId("507f1f77bcf86cd799439018")],
    materials: ["ai-business-report.pdf"],
    createdAt: new Date("2024-05-01T00:00:00Z")
  }
];

db.sessions.insertMany(sessions);
print("✅ Sessions inserted");

// Insert Messages
const messages = [
  {
    sender: ObjectId("507f1f77bcf86cd799439014"), // mike_attendee
    receiver: ObjectId("507f1f77bcf86cd799439013"), // sarah_exhibitor
    conversationId: "507f1f77bcf86cd799439013-507f1f77bcf86cd799439014",
    content: "Hi Sarah, I'm interested in your AI assistants. Can we schedule a meeting?",
    type: "text",
    read: false,
    createdAt: new Date("2024-06-01T10:00:00Z")
  },
  {
    sender: ObjectId("507f1f77bcf86cd799439013"), // sarah_exhibitor
    receiver: ObjectId("507f1f77bcf86cd799439014"), // mike_attendee
    conversationId: "507f1f77bcf86cd799439013-507f1f77bcf86cd799439014",
    content: "Hi Mike! Sure, we'd love to discuss our AI solutions. Are you available tomorrow at 2 PM?",
    type: "text",
    read: false,
    createdAt: new Date("2024-06-01T10:15:00Z")
  },
  {
    sender: ObjectId("507f1f77bcf86cd799439016"), // alex_attendee
    receiver: ObjectId("507f1f77bcf86cd799439015"), // emma_exhibitor
    conversationId: "507f1f77bcf86cd799439015-507f1f77bcf86cd799439016",
    content: "Hello Emma, your CloudSoft booth was amazing! Can you provide more info about your DevOps tools?",
    type: "text",
    read: true,
    createdAt: new Date("2024-06-15T16:00:00Z")
  }
];

db.messages.insertMany(messages);
print("✅ Messages inserted");

// Insert Feedback
const feedbacks = [
  {
    user: ObjectId("507f1f77bcf86cd799439014"), // mike_attendee
    type: "suggestion",
    message: "It would be great to have more networking sessions between attendees and exhibitors",
    date: new Date("2024-06-01T15:00:00Z")
  },
  {
    user: ObjectId("507f1f77bcf86cd799439016"), // alex_attendee
    type: "issue",
    message: "The WiFi connection was unstable during the afternoon sessions",
    date: new Date("2024-06-15T18:00:00Z")
  },
  {
    user: ObjectId("507f1f77bcf86cd799439018"), // david_attendee
    type: "suggestion",
    message: "Please add a mobile app for checking schedules and getting notifications",
    date: new Date("2024-06-20T10:00:00Z")
  }
];

db.feedbacks.insertMany(feedbacks);
print("✅ Feedback inserted");

// Insert some basic Notifications
const notifications = [
  {
    user: ObjectId("507f1f77bcf86cd799439014"), // mike_attendee
    type: "expo_registration",
    message: "You have successfully registered for Tech Conference 2024",
    read: false,
    createdAt: new Date("2024-05-01T09:00:00Z")
  },
  {
    user: ObjectId("507f1f77bcf86cd799439013"), // sarah_exhibitor
    type: "booth_approved",
    message: "Your booth application for Tech Conference 2024 has been approved",
    read: true,
    createdAt: new Date("2024-04-15T14:00:00Z")
  },
  {
    user: ObjectId("507f1f77bcf86cd799439016"), // alex_attendee
    type: "session_starting",
    message: "Your session 'Introduction to Machine Learning' starts in 30 minutes",
    read: false,
    createdAt: new Date("2024-06-15T09:30:00Z")
  }
];

db.notifications.insertMany(notifications);
print("✅ Notifications inserted");

// Update Attendees with bookmarked sessions
db.attendees.updateOne(
  { user: ObjectId("507f1f77bcf86cd799439014") }, // mike_attendee
  { $set: { bookmarkedSessions: [ObjectId("507f1f77bcf86cd799439041")] } }
);

db.attendees.updateOne(
  { user: ObjectId("507f1f77bcf86cd799439016") }, // alex_attendee
  { $set: { bookmarkedSessions: [ObjectId("507f1f77bcf86cd799439042")] } }
);

print("✅ Bookmarked sessions updated");

// Add some sample ratings to sessions
db.sessions.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439041") },
  { $push: { ratings: { user: ObjectId("507f1f77bcf86cd799439014"), score: 5, comment: "Excellent introduction!" } } }
);

db.sessions.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439042") },
  { $push: { ratings: { user: ObjectId("507f1f77bcf86cd799439016"), score: 4, comment: "Good content, but could be more detailed" } } }
);

print("✅ Session ratings added");

// Final confirmation
print("\n🎉 Database seeding completed successfully!");
print("\n📊 Summary:");
print("- 8 Users (admin, organizers, exhibitors, attendees)");
print("- 2 Expos with floor plans");
print("- 2 Exhibitors with approved booths");
print("- 2 Booths assigned");
print("- 3 Attendees registered for expos");
print("- 3 Sessions with attendance and materials");
print("- 3 Messages between users");
print("- 3 Feedback entries");
print("- 3 Notifications");
print("\n🔑 Default password for all users: 'password123'");
print("📧 Admin account: admin@eventsphere.com");
print("🏢 Ready to test EventSphere!");
