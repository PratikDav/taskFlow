// Server-side skills data (mirroring client-side for now)
export const SERVER_SKILLS = [
  // Frontend
  { id: 'react', name: 'React.js', category: 'Frontend', color: '#61DAFB' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend', color: '#4FC08D' },
  { id: 'angular', name: 'Angular', category: 'Frontend', color: '#DD0031' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', color: '#000000' },
  { id: 'typescript', name: 'TypeScript', category: 'Language', color: '#3178C6' },
  { id: 'javascript', name: 'JavaScript', category: 'Language', color: '#F7DF1E' },
  { id: 'html', name: 'HTML5', category: 'Frontend', color: '#E34F26' },
  { id: 'css', name: 'CSS3', category: 'Frontend', color: '#1572B6' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', color: '#06B6D4' },
  { id: 'sass', name: 'Sass', category: 'Frontend', color: '#CC6699' },

  // Backend
  { id: 'nodejs', name: 'Node.js', category: 'Backend', color: '#339933' },
  { id: 'python', name: 'Python', category: 'Language', color: '#3776AB' },
  { id: 'java', name: 'Java', category: 'Language', color: '#ED8B00' },
  { id: 'csharp', name: 'C#', category: 'Language', color: '#239120' },
  { id: 'php', name: 'PHP', category: 'Backend', color: '#777BB4' },
  { id: 'ruby', name: 'Ruby', category: 'Language', color: '#CC342D' },
  { id: 'go', name: 'Go', category: 'Language', color: '#00ADD8' },
  { id: 'rust', name: 'Rust', category: 'Language', color: '#000000' },

  // Database
  { id: 'mysql', name: 'MySQL', category: 'Database', color: '#4479A1' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', color: '#4169E1' },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', color: '#47A248' },
  { id: 'redis', name: 'Redis', category: 'Database', color: '#DC382D' },

  // DevOps & Tools
  { id: 'docker', name: 'Docker', category: 'DevOps', color: '#2496ED' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', color: '#326CE5' },
  { id: 'aws', name: 'AWS', category: 'Cloud', color: '#FF9900' },
  { id: 'azure', name: 'Azure', category: 'Cloud', color: '#0078D4' },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud', color: '#4285F4' },
  { id: 'git', name: 'Git', category: 'Tools', color: '#F05032' },
  { id: 'github', name: 'GitHub', category: 'Tools', color: '#181717' },
  { id: 'gitlab', name: 'GitLab', category: 'Tools', color: '#FC6D26' },

  // Mobile
  { id: 'react-native', name: 'React Native', category: 'Mobile', color: '#61DAFB' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile', color: '#02569B' },
  { id: 'ios', name: 'iOS', category: 'Mobile', color: '#000000' },
  { id: 'android', name: 'Android', category: 'Mobile', color: '#3DDC84' },
];

export const getServerSkillById = (id: string) => {
  return SERVER_SKILLS.find(skill => skill.id === id);
};