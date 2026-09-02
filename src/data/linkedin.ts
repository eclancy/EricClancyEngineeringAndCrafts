export interface Experience {
  role: string
  organization: string
  period: string
  summary: string
}

export interface Profile {
  name: string
  headline: string
  summary: string
  skills: string[]
  experience: Experience[]
  linkedinUrl: string
  githubUrl: string
}

// TODO(eric): fill in from https://www.linkedin.com/in/ericclancy/ — curated by hand,
// not scraped, since LinkedIn's ToS prohibits automated scraping. Update via the
// content-updater agent, which will prompt for the latest headline/experience/skills.
export const profile: Profile = {
  name: 'Eric Clancy',
  headline: 'AI-Assisted Full-Stack Developer',
  summary:
    'Full-stack developer focused on building with AI from the ground up — shipping ' +
    'games, tools, and web apps end-to-end, from architecture to deployment.',
  skills: [
    'AI-assisted development',
    'Full-stack web (React/TypeScript)',
    'C#',
    'Godot',
    'Unity',
  ],
  experience: [],
  linkedinUrl: 'https://www.linkedin.com/in/ericclancy/',
  githubUrl: 'https://github.com/ericclancy',
}
