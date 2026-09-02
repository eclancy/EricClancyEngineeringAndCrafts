export interface Skill {
  title: string
  mantra: string
}

export interface Profile {
  name: string
  headline: string
  summary: string
  skills: Skill[]
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
    {
      title: 'JavaScript & TypeScript',
      mantra: "Type-safety isn't bureaucracy \u2014 it's a note to your future self.",
    },
    {
      title: '.NET, C# & Angular',
      mantra: 'Legacy code deserves the same care and attention as anything new.',
    },
    {
      title: 'React, Vite & Tailwind CSS',
      mantra: 'Fast feedback loops keep momentum \u2014 and morale \u2014 high.',
    },
    {
      title: 'AI-assisted development',
      mantra:
        'AI is a force multiplier, not a replacement for understanding the problem.',
    },
    {
      title: 'Agile ceremony facilitation',
      mantra: 'Good ceremonies create space for the team to actually talk to each other.',
    },
    {
      title: 'Team leadership & mentorship',
      mantra:
        'Growing other developers scales further than any one contribution I could make alone.',
    },
    {
      title: 'Cross-functional stakeholder comms',
      mantra:
        'Translating between engineers and stakeholders is half the job \u2014 and I love it.',
    },
    {
      title: 'Accessibility-focused delivery',
      mantra: "If it doesn't work for everyone, it doesn't really work.",
    },
    {
      title: 'DevOps: Docker, Nginx, CI/CD, DigitalOcean',
      mantra: 'Automate the boring stuff so people can focus on the interesting stuff.',
    },
  ],
  experienceBlurb:
    '11+ years shipping software across healthcare, fintech, and enterprise ' +
    'platforms \u2014 from Booz Allen Hamilton to IBM. Full history on LinkedIn.',
  linkedinUrl: 'https://www.linkedin.com/in/ericclancy/',
  githubUrl: 'https://github.com/eclancy',
}
