// Available skills/logos for user selection
export interface Skill {
  id: string;
  name: string;
  icon: string; // Lucide icon name or custom icon
  category: string;
  color: string;
  logoUrl?: string; // Optional custom logo URL
}

// Cache for skills data
let skillsCache: Skill[] | null = null;

// Fetch skills from server
export const fetchAvailableSkills = async (): Promise<Skill[]> => {
  if (skillsCache) {
    return skillsCache;
  }

  try {
    const response = await fetch('/api/skills');
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    skillsCache = await response.json();
    return skillsCache || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    // Fallback to hardcoded skills if server is unavailable
    return AVAILABLE_SKILLS;
  }
};

// Clear skills cache (useful for logout)
export const clearSkillsCache = () => {
  skillsCache = null;
};

// Predefined skill collection (fallback)
export const AVAILABLE_SKILLS: Skill[] = [
  // Frontend
  { id: 'react', name: 'React.js', icon: 'React', category: 'Frontend', color: '#61DAFB' },
  { id: 'vue', name: 'Vue.js', icon: 'Vue', category: 'Frontend', color: '#4FC08D' },
  { id: 'angular', name: 'Angular', icon: 'Angular', category: 'Frontend', color: '#DD0031' },
  { id: 'nextjs', name: 'Next.js', icon: 'Nextjs', category: 'Frontend', color: '#000000' },
  { id: 'typescript', name: 'TypeScript', icon: 'TypeScript', category: 'Language', color: '#3178C6' },
  { id: 'javascript', name: 'JavaScript', icon: 'JavaScript', category: 'Language', color: '#F7DF1E' },
  { id: 'html', name: 'HTML5', icon: 'Html5', category: 'Frontend', color: '#E34F26' },
  { id: 'css', name: 'CSS3', icon: 'Css3', category: 'Frontend', color: '#1572B6' },
  { id: 'tailwind', name: 'Tailwind CSS', icon: 'Tailwind', category: 'Frontend', color: '#06B6D4' },
  { id: 'sass', name: 'Sass', icon: 'Sass', category: 'Frontend', color: '#CC6699' },

  // Backend
  { id: 'nodejs', name: 'Node.js', icon: 'Nodejs', category: 'Backend', color: '#339933' },
  { id: 'python', name: 'Python', icon: 'Python', category: 'Language', color: '#3776AB' },
  { id: 'java', name: 'Java', icon: 'Java', category: 'Language', color: '#ED8B00' },
  { id: 'csharp', name: 'C#', icon: 'Csharp', category: 'Language', color: '#239120' },
  { id: 'php', name: 'PHP', icon: 'Php', category: 'Backend', color: '#777BB4' },
  { id: 'ruby', name: 'Ruby', icon: 'Ruby', category: 'Language', color: '#CC342D' },
  { id: 'go', name: 'Go', icon: 'Go', category: 'Language', color: '#00ADD8' },
  { id: 'rust', name: 'Rust', icon: 'Rust', category: 'Language', color: '#000000' },

  // Database
  { id: 'mysql', name: 'MySQL', icon: 'Database', category: 'Database', color: '#4479A1' },
  { id: 'postgresql', name: 'PostgreSQL', icon: 'Database', category: 'Database', color: '#4169E1' },
  { id: 'mongodb', name: 'MongoDB', icon: 'Database', category: 'Database', color: '#47A248' },
  { id: 'redis', name: 'Redis', icon: 'Database', category: 'Database', color: '#DC382D' },

  // DevOps & Tools
  { id: 'docker', name: 'Docker', icon: 'Docker', category: 'DevOps', color: '#2496ED' },
  { id: 'kubernetes', name: 'Kubernetes', icon: 'Kubernetes', category: 'DevOps', color: '#326CE5' },
  { id: 'aws', name: 'AWS', icon: 'Cloud', category: 'Cloud', color: '#FF9900' },
  { id: 'azure', name: 'Azure', icon: 'Cloud', category: 'Cloud', color: '#0078D4' },
  { id: 'gcp', name: 'Google Cloud', icon: 'Cloud', category: 'Cloud', color: '#4285F4' },
  { id: 'git', name: 'Git', icon: 'Git', category: 'Tools', color: '#F05032' },
  { id: 'github', name: 'GitHub', icon: 'Github', category: 'Tools', color: '#181717' },
  { id: 'gitlab', name: 'GitLab', icon: 'Gitlab', category: 'Tools', color: '#FC6D26' },

  // Mobile
  { id: 'react-native', name: 'React Native', icon: 'Smartphone', category: 'Mobile', color: '#61DAFB' },
  { id: 'flutter', name: 'Flutter', icon: 'Smartphone', category: 'Mobile', color: '#02569B' },
  { id: 'ios', name: 'iOS', icon: 'Apple', category: 'Mobile', color: '#000000' },
  { id: 'android', name: 'Android', icon: 'Android', category: 'Mobile', color: '#3DDC84' },
];

// Get skill by ID
export const getSkillById = (id: string, skills?: Skill[]): Skill | undefined => {
  const skillList = skills || skillsCache || AVAILABLE_SKILLS;
  return skillList.find(skill => skill.id === id);
};

// Get skills by category
export const getSkillsByCategory = (category: string, skills?: Skill[]): Skill[] => {
  const skillList = skills || skillsCache || AVAILABLE_SKILLS;
  return skillList.filter(skill => skill.category === category);
};

// Get all categories
export const getSkillCategories = (skills?: Skill[]): string[] => {
  const skillList = skills || skillsCache || AVAILABLE_SKILLS;
  return Array.from(new Set(skillList.map(skill => skill.category)));
};