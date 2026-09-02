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

// Curated by hand from Eric's own LinkedIn content (pasted directly, never
// scraped — LinkedIn's ToS prohibits automated scraping). Update via the
// content-updater agent when role/skills change.
export const profile: Profile = {
  name: 'Eric Clancy',
  headline: 'Full Stack Developer, Production DBA, & AI Specialist',
  summary:
    'I specialize in guiding cross-functional teams to deliver critical healthcare ' +
    'solutions for our nation\u2019s veterans, combining deep technical expertise with a ' +
    'strategic focus on engagement oversight. I bridge the gap between complex ' +
    'engineering requirements and senior client leadership\u2019s vision, and I\u2019m a ' +
    'passionate advocate for mentoring developers and spearheading the responsible ' +
    'adoption of AI across the organization.',
  skills: [
    'JavaScript, TypeScript & SQL',
    '.NET, C# & Angular / AngularJS',
    'AI adoption strategy & developer training',
    'Agile facilitation & team leadership',
    'Accessibility-focused, mission-critical delivery',
    'React, Vite, Tailwind CSS',
    'Game development: Godot 4 / C#, Unity',
    'DevOps: Docker, Nginx, GitHub Actions CI/CD, DigitalOcean',
  ],
  experience: [
    {
      role: 'Software Engineer & AI Specialist',
      organization: 'Booz Allen Hamilton',
      period: 'Jul 2021 \u2013 Present',
      summary:
        'Technical liaison to senior client leadership and SMEs on large-scale ' +
        'healthcare platform modernization serving tens of thousands of providers, ' +
        'with a focus on congressional accessibility guidelines. Owns the delivery ' +
        'pipeline end-to-end, mentors developers, and drives responsible AI adoption ' +
        'across the organization.',
    },
    {
      role: '.NET Developer',
      organization: 'EVO Payments, Inc.',
      period: 'Apr 2019 \u2013 Jul 2021',
      summary:
        'Built Underwriting and Money Management tools and an internal dashboard; ' +
        'migrated a legacy AngularJS app to modern Angular while extending it with ' +
        'new functionality.',
    },
    {
      role: 'Full Stack Developer & Agile Leader',
      organization: 'Tyler Technologies',
      period: 'Jan 2018 \u2013 Apr 2019',
      summary:
        'Ran Agile ceremonies for the bugfix and enhancements teams; designed ' +
        'large-scale desktop and mobile tools for government organizations using ' +
        'AngularJS, C#, Less, and SQL on .NET.',
    },
    {
      role: 'Front End Developer',
      organization: 'Foresight Imaging',
      period: 'Jun 2017 \u2013 Oct 2017',
      summary:
        'Built a medical livestreaming web tool with AngularJS and SignalR for ' +
        'real-time video, chat, and drawn annotations across collaborating clients.',
    },
    {
      role: 'UX Lead & Front End Developer',
      organization: 'IBM',
      period: '2015 \u2013 May 2017',
      summary:
        'Led user testing and design for DevOps cloud engineering tools, built with ' +
        'AngularJS, and drove user-centric decisions through interviews and Design ' +
        'Thinking methodologies.',
    },
  ],
  linkedinUrl: 'https://www.linkedin.com/in/ericclancy/',
  githubUrl: 'https://github.com/eclancy',
}

