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
    'workflow, from game engines to web apps to the infrastructure that deploys ' +
    'them. Comfortable owning a project from architecture through production.',
  skills: [
    {
      title: 'JavaScript & TypeScript',
      mantra: 'Clean, typed code today saves everyone a headache tomorrow.',
    },
    {
      title: '.NET, C# & Angular',
      mantra: 'Reliable, battle-tested tools for the systems people actually depend on.',
    },
    {
      title: 'React, Vite & Tailwind CSS',
      mantra: "A fast, polished interface makes everyone's day a little easier.",
    },
    {
      title: 'AI-assisted development',
      mantra:
        'Let AI handle the busywork so people can focus on what users actually need.',
    },
    {
      title: 'Agile ceremony facilitation',
      mantra: 'Good meetings are short, useful, and end with everyone smiling.',
    },
    {
      title: 'Team leadership & mentorship',
      mantra:
        'Growing other developers scales further than any one contribution I could make alone.',
    },
    {
      title: 'Cross-functional stakeholder comms',
      mantra:
        'Turning engineer-speak into plain English keeps everyone on the same page.',
    },
    {
      title: 'Accessibility-focused delivery',
      mantra: "If it doesn't work for everyone, it isn't actually done.",
    },
    {
      title: 'DevOps: Docker, Nginx, CI/CD, DigitalOcean',
      mantra: 'Automate the boring stuff so people can focus on the fun stuff.',
    },
  ],
  experienceBlurb:
    '11+ years shipping software across healthcare, fintech, and enterprise ' +
    'platforms, from Booz Allen Hamilton to IBM. Full history on LinkedIn.',
  linkedinUrl: 'https://www.linkedin.com/in/ericclancy/',
  githubUrl: 'https://github.com/eclancy',
}
