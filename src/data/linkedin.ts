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

// TODO(eric): the headline/summary/experience below are placeholders pending your
// review — LinkedIn's ToS prohibits automated scraping, so this was never pulled
// from https://www.linkedin.com/in/ericclancy/. Paste your real headline, a short
// summary, and work history (role/org/dates/summary) and I'll transcribe it here.
// The skills list below IS grounded in fact: it reflects the actual stacks used
// across wizard-survivors, Wizard Wars, Eric's Miniatures, and this site itself.
export const profile: Profile = {
  name: 'Eric Clancy',
  headline: 'AI-Assisted Full-Stack Developer',
  summary:
    'Full-stack developer who builds end-to-end with AI as a core part of the ' +
    'workflow — from game engines to web apps to the infrastructure that deploys ' +
    'them. Comfortable owning a project from architecture through production.',
  skills: [
    'AI-assisted development (design → code → deploy)',
    'Full-stack web: React, TypeScript, Vite, Tailwind CSS',
    'Game development: Godot 4 / C#, Unity',
    'DevOps: Docker, Nginx, GitHub Actions CI/CD, DigitalOcean',
  ],
  experience: [],
  linkedinUrl: 'https://www.linkedin.com/in/ericclancy/',
  githubUrl: 'https://github.com/eclancy',
}

