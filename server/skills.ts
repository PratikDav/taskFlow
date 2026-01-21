// Server-side skills data (mirroring client-side for now)
export interface ServerSkill {
  id: string;
  name: string;
  category: string;
  color: string;
  logoUrl: string | undefined;
}

export const SERVER_SKILLS: ServerSkill[] = [
  // Frontend
  { id: 'react', name: 'React.js', category: 'Frontend', color: '#61DAFB', logoUrl: undefined },
  { id: 'vue', name: 'Vue.js', category: 'Frontend', color: '#4FC08D', logoUrl: undefined },
  { id: 'angular', name: 'Angular', category: 'Frontend', color: '#DD0031', logoUrl: undefined },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', color: '#000000', logoUrl: undefined },
  { id: 'typescript', name: 'TypeScript', category: 'Language', color: '#3178C6', logoUrl: undefined },
  { id: 'javascript', name: 'JavaScript', category: 'Language', color: '#F7DF1E', logoUrl: undefined },
  { id: 'html', name: 'HTML5', category: 'Frontend', color: '#E34F26', logoUrl: undefined },
  { id: 'css', name: 'CSS3', category: 'Frontend', color: '#1572B6', logoUrl: undefined },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', color: '#06B6D4', logoUrl: undefined },
  { id: 'sass', name: 'Sass', category: 'Frontend', color: '#CC6699', logoUrl: undefined },

  // Backend
  { id: 'nodejs', name: 'Node.js', category: 'Backend', color: '#339933', logoUrl: undefined },
  { id: 'python', name: 'Python', category: 'Language', color: '#3776AB', logoUrl: undefined },
  { id: 'java', name: 'Java', category: 'Language', color: '#ED8B00', logoUrl: undefined },
  { id: 'csharp', name: 'C#', category: 'Language', color: '#239120', logoUrl: undefined },
  { id: 'php', name: 'PHP', category: 'Backend', color: '#777BB4', logoUrl: undefined },
  { id: 'ruby', name: 'Ruby', category: 'Language', color: '#CC342D', logoUrl: undefined },
  { id: 'go', name: 'Go', category: 'Language', color: '#00ADD8', logoUrl: undefined },
  { id: 'rust', name: 'Rust', category: 'Language', color: '#000000', logoUrl: undefined },

  // Database
  { id: 'mysql', name: 'MySQL', category: 'Database', color: '#4479A1', logoUrl: undefined },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', color: '#4169E1', logoUrl: undefined },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', color: '#47A248', logoUrl: undefined },
  { id: 'redis', name: 'Redis', category: 'Database', color: '#DC382D', logoUrl: undefined },

  // DevOps & Tools
  { id: 'docker', name: 'Docker', category: 'DevOps', color: '#2496ED', logoUrl: undefined },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', color: '#326CE5', logoUrl: undefined },
  { id: 'aws', name: 'AWS', category: 'Cloud', color: '#FF9900', logoUrl: undefined },
  { id: 'azure', name: 'Azure', category: 'Cloud', color: '#0078D4', logoUrl: undefined },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud', color: '#4285F4', logoUrl: undefined },
  { id: 'git', name: 'Git', category: 'Tools', color: '#F05032', logoUrl: undefined },
  { id: 'github', name: 'GitHub', category: 'Tools', color: '#181717', logoUrl: undefined },
  { id: 'gitlab', name: 'GitLab', category: 'Tools', color: '#FC6D26', logoUrl: undefined },

  // Mobile
  { id: 'react-native', name: 'React Native', category: 'Mobile', color: '#61DAFB', logoUrl: undefined },
  { id: 'flutter', name: 'Flutter', category: 'Mobile', color: '#02569B', logoUrl: undefined },
  { id: 'ios', name: 'iOS', category: 'Mobile', color: '#000000', logoUrl: undefined },
  { id: 'android', name: 'Android', category: 'Mobile', color: '#3DDC84', logoUrl: undefined },
];

export const getServerSkillById = (id: string) => {
  return SERVER_SKILLS.find(skill => skill.id === id);
};