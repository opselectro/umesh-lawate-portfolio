
import {
  config,
  experience,
  journey,
  projects,
  roles,
  skills,
  summary,
} from "../src/data/portfolio-content";

export { config };

export const profile = {
  name: config.name,
  location: config.location,
  availability: config.availableText,

  professionalSummary: summary,

  professionalRoles: roles,

  educationAndCareerJourney: journey,

  skills: Object.fromEntries(
    Object.entries(skills).map(([category, group]) => [
      category,
      group.items.map(([name]) => name),
    ])
  ),

  experience: experience.map((item) => ({
    company: item.company,
    role: item.role,
    location: item.location,
    period: item.period,
    responsibilities: item.points,
    technologies: item.tech,
  })),

  projects: projects.map((project) => ({
    title: project.title,
    description: project.description,
    technologies: project.stack,
    url: project.url,
  })),

  contact: {
    email: config.email,
    phone: config.phone,
    linkedin: config.linkedin,
    github: config.github,
  },
};
