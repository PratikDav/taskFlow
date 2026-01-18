import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_SKILLS, getSkillById, getSkillsByCategory, getSkillCategories, type Skill } from '@/lib/skills';

interface SkillSlotProps {
  skill?: Skill;
  onSelect: (skill: Skill) => void;
  onRemove: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SkillSlot: React.FC<SkillSlotProps> = ({ skill, onSelect, onRemove, size = 'md' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-8 w-8'
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group`}
      style={{ backgroundColor: skill ? skill.color : '#f1f5f9' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {skill ? (
        <>
          {/* Skill Icon */}
          <div className="w-full h-full rounded-full flex items-center justify-center text-white">
            <div className={iconSizes[size]} style={{ color: 'white' }}>
              {/* For now, we'll use a simple circle. In a real app, you'd use actual icons */}
              <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {skill.name.charAt(0)}
              </div>
            </div>
          </div>

          {/* Remove button on hover */}
          {isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {skill.name}
          </div>
        </>
      ) : (
        /* Empty slot with plus icon */
        <button
          onClick={() => onSelect({} as Skill)} // This will trigger the skill selection dialog
          className="w-full h-full rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Plus className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

interface SkillSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill: (skill: Skill) => void;
  selectedSkills: Skill[];
}

const SkillSelectionDialog: React.FC<SkillSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
  selectedSkills
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...getSkillCategories()];
  const selectedSkillIds = selectedSkills.map(skill => skill.id);

  const filteredSkills = AVAILABLE_SKILLS.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const notSelected = !selectedSkillIds.includes(skill.id);
    return matchesSearch && matchesCategory && notSelected;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose Your Skills</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
            {filteredSkills.map(skill => (
              <button
                key={skill.id}
                onClick={() => {
                  onSelectSkill(skill);
                  onClose();
                }}
                className="flex flex-col items-center p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2"
                  style={{ backgroundColor: skill.color }}
                >
                  {skill.name.charAt(0)}
                </div>
                <span className="text-xs text-center group-hover:text-primary transition-colors">
                  {skill.name}
                </span>
              </button>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No skills found matching your criteria.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface FloatingSkillSlotsProps {
  userSkills: Skill[];
  onUpdateSkills: (skills: Skill[]) => void;
  maxSlots?: number;
}

export const FloatingSkillSlots: React.FC<FloatingSkillSlotsProps> = ({
  userSkills,
  onUpdateSkills,
  maxSlots = 8
}) => {
  const [showSkillDialog, setShowSkillDialog] = useState(false);

  // Calculate how many slots to show
  const filledSlots = userSkills.length;
  const visibleSlots = Math.min(
    maxSlots,
    Math.max(4, filledSlots + (filledSlots % 2 === 0 ? 2 : 0)) // Show at least 4, then add 2 more when current set is filled
  );

  const leftSlots = Math.ceil(visibleSlots / 2);
  const rightSlots = visibleSlots - leftSlots;

  const handleSkillSelect = (skill: Skill) => {
    if (skill.id) {
      // Adding a skill
      onUpdateSkills([...userSkills, skill]);
    } else {
      // Opening dialog for selection
      setShowSkillDialog(true);
    }
  };

  const handleSkillRemove = (index: number) => {
    const newSkills = userSkills.filter((_, i) => i !== index);
    onUpdateSkills(newSkills);
  };

  const handleDialogSkillSelect = (skill: Skill) => {
    onUpdateSkills([...userSkills, skill]);
    setShowSkillDialog(false);
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Left side slots */}
      <div className="absolute left-0 flex flex-col gap-3">
        {Array.from({ length: leftSlots }, (_, i) => (
          <div
            key={`left-${i}`}
            className="transform -translate-x-8 animate-fade-in"
            style={{
              animationDelay: `${i * 100}ms`,
              marginTop: i * 20 // Stagger vertically
            }}
          >
            <SkillSlot
              skill={i < userSkills.length ? userSkills[i] : undefined}
              onSelect={handleSkillSelect}
              onRemove={() => handleSkillRemove(i)}
              size="md"
            />
          </div>
        ))}
      </div>

      {/* Right side slots */}
      <div className="absolute right-0 flex flex-col gap-3">
        {Array.from({ length: rightSlots }, (_, i) => {
          const skillIndex = leftSlots + i;
          return (
            <div
              key={`right-${i}`}
              className="transform translate-x-8 animate-fade-in"
              style={{
                animationDelay: `${(leftSlots + i) * 100}ms`,
                marginTop: i * 20 // Stagger vertically
              }}
            >
              <SkillSlot
                skill={skillIndex < userSkills.length ? userSkills[skillIndex] : undefined}
                onSelect={handleSkillSelect}
                onRemove={() => handleSkillRemove(skillIndex)}
                size="md"
              />
            </div>
          );
        })}
      </div>

      {/* Skill Selection Dialog */}
      <SkillSelectionDialog
        isOpen={showSkillDialog}
        onClose={() => setShowSkillDialog(false)}
        onSelectSkill={handleDialogSkillSelect}
        selectedSkills={userSkills}
      />
    </div>
  );
};