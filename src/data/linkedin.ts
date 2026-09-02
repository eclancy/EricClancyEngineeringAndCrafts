export interface Profile {
  name: string
  headline: string
  summary: string
  skills: string[]
  experienceBlurb: string
  linkedinUrl: string
  githubUrl: string
}

// Curated by hand from Eric's own LinkedIn content (pasted directly, never
// scraped — LinkedIn's ToS prohibits automated scraping). Update via the
// content-updater agent when role/skills change.
export const profile: Profile = {
  name: 'Eric Clancy',
  headline: 'Full Stack Developer, Production DBA, & AI Specialist',
  summary:
    'Full-stack developer who builds end-to-end with AI as a core part of the ' +
    'workflow \u2014 from game engines to web apps to the infrastructure that deploys ' +
    'them. Comfortable owning a project from architecture through production.',
  skills: [
    'JavaScript & TypeScript',
    'SQL & Production DBA',
    '.NET, C# & Angular',
    'React, Vite & Tailwind CSS',
    'AI-assisted development',
    'Agile facilitation & mentorship',
    'DevOps: Docker, Nginx, CI/CD, DigitalOcean',
  ],
  experienceBlurb:
    '11+ years shipping software across healthcare, fintech, and enterprise ' +
    'platforms \u2014 from Booz Allen Hamilton to IBM. Full history on LinkedIn.',
  linkedinUrl: 'https://www.linkedin.com/in/ericclancy/',
  githubUrl: 'https://github.com/eclancy',
}
