export const config = {
  available: true,
  availableText: "Open to new opportunities",
  name: "Umesh Subhash Lawate",
  location: "Pune, Maharashtra, India",
  email: "umeshlawate757@gmail.com",
  phone: "+91 7744097525",
  linkedin: "https://www.linkedin.com/in/umesh-lawate/",
  github: "https://github.com/opselectro",
  resume: "/resume/Umesh-Lawate-Resume.pdf",
};

export const roles = [
  "Software Development Engineer",
  "Full Stack Developer",
  "React.js Developer",
];

export const summary =
  "Software Development Engineer with 1.3 years of experience building secure, transaction-intensive fintech web applications for B2B and B2C platforms. Hands-on with wallet and ledger systems, fund transfers, transaction reconciliation, authentication, authorization, OTP-based transaction controls and KYC verification workflows.";

export const journey = [
  {
    t: "Mechanical Engineering",
    d: "B.E., Savitribai Phule Pune University (JSPM College of Engineering), graduated July 2024. An engineering foundation in systems thinking and problem solving.",
  },
  {
    t: "Switch to software",
    d: "Java Full Stack Development: Certification from Java by Kiran, covering Java, front-end and Backend technologies.",
  },
  {
    t: "Software Development Engineer",
    d: "Joined Indifly Ventures (Sec2Pay) in June 2025, building wallet, ledger and verification workflows where accuracy and security come first.",
  },
];

export const skills: Record<string, { icon: string; items: [string, string][] }> = {
  Frontend: {
    icon: "PanelsTopLeft",
    items: [
      ["React.js", ""],
      ["JavaScript ES6+", ""],
      ["HTML5", ""],
      ["CSS3", ""],
      ["Responsive web design", ""],
      ["Component architecture", ""],
    ],
  },
  Backend: {
    icon: "Server",
    items: [
      ["Laravel", ""],
      ["PHP", ""],
      ["Node.js", ""],
      ["Express.js", ""],
      ["RESTful APIs", ""],
      ["API integration", ""],
    ],
  },
  Database: {
    icon: "Database",
    items: [
      ["MySQL", ""],
      ["SQL", ""],
      ["MongoDB", ""],
      ["PostgreSQL", ""],
      ["Redis", ""],

    ],
  },
  "APIs & Security": {
    icon: "ShieldCheck",
    items: [
      ["JWT", ""],
      ["Authentication", ""],
      ["Authorization", ""],
    ],
  },
  Tools: {
    icon: "Wrench",
    items: [
      ["Git", ""],
      ["GitHub", ""],
      ["Postman", ""],
      ["JIRA", ""],
      ["Vercel", ""],
      ["Browser DevTools", ""],
      ["Agile / Scrum", ""],
      ["Root cause analysis", ""],
    ],
  },
};

export const experience = [
  {
    company: "Indifly Ventures Pvt Ltd (Sec2Pay E-Services Pvt Ltd)",
    role: "Software Development Engineer",
    location: "Pune, India",
    period: "June 2025 – September 2026",
    points: [
      "Built responsive React.js interfaces for fund transfers, wallet management, ledger management, entity updates and transaction reconciliation.",
      "Integrated REST APIs; implemented authentication, authorization and OTP-based controls for secure debit and recovery operations.",
      "Kept ledger data accurate across fund transfers, debit/credit entries and wallet balances, reconciled with transaction histories.",
      "Enhanced entity upgrade workflows so users can update personal, CIN, DIN and company details after verification.",
      "Automated monthly transaction processing through Excel exports, reducing manual, error-prone work.",
      "Worked in Agile sprints with JIRA; root cause analysis and debugging across frontend, API and database layers.",
    ],
    tech: ["React.js", "Node.js", "Express.js", "Java", "JavaScript", "Laravel", "PHP", "MySQL", "REST APIs", "JIRA"],
  },
];

export type Project = {
  id: string;
  title: string;
  description: string;
  url: string;
  stack: string[];
};

// Add project names, descriptions, links and technologies when they are ready.
export const projects: Project[] = [
  { id: "project-01", title: "Travel Booking Platform", description: "A travel package booking platform with real-time booking management and an admin dashboard to track bookings and payments, manage trips and update images", url: "https://www.daycation360.in/", stack: ["HTML", "CSS", "JavaScript", "Razorpay api", "Email Notifiaction Resend"] },
  { id: "project-02", title: "Real Estate Website", description: "A responsive property listing website with detailed property pages and expert guidance sections.", url: "https://www.simbarealty.in/", stack: ["HTML", "CSS", "JavaScript"] },
  { id: "project-03", title: "Car Care Service Website", description: "A service website that lets customers browse car care services and book appointments.", url: "https://www.onestopcarcare.in/", stack: ["HTML", "CSS", "JavaScript"] },
  { id: "project-04", title: "Marketing Agency Website", description: "A modern agency website showcasing services and portfolio work.", url: "https://www.addevmedia.com/", stack: ["HTML", "CSS", "JavaScript"] },
];