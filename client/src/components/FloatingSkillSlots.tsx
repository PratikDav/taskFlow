<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
<<<<<<< HEAD
import { fetchAvailableSkills, getSkillById, getSkillsByCategory, getSkillCategories, type Skill } from '@/lib/skills';
=======
import { AVAILABLE_SKILLS, getSkillById, getSkillsByCategory, getSkillCategories, type Skill } from '@/lib/skills';
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f

interface SkillSlotProps {
  skill?: Skill;
  onSelect: (skill: Skill) => void;
  onRemove: () => void;
  size?: 'sm' | 'md' | 'lg';
<<<<<<< HEAD
  tooltipStyle?: React.CSSProperties;
  showRemove?: boolean;
  isLeft?: boolean;
}

const SkillSlot: React.FC<SkillSlotProps> = ({ skill, onSelect, onRemove, size = 'md', tooltipStyle, showRemove = true, isLeft = false }) => {
=======
}

const SkillSlot: React.FC<SkillSlotProps> = ({ skill, onSelect, onRemove, size = 'md' }) => {
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
      className={`relative ${sizeClasses[size]} rounded-full border-2 border-white shadow-lg transition-all duration-300 ${skill ? 'hover:scale-110 hover:shadow-xl group' : ''}`}
      style={{ backgroundColor: skill && !skill.logoUrl ? skill.color : '#f1f5f9' }}
      onMouseEnter={skill ? () => setIsHovered(true) : undefined}
      onMouseLeave={skill ? () => setIsHovered(false) : undefined}
=======
      className={`relative ${sizeClasses[size]} rounded-full border-2 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group`}
      style={{ backgroundColor: skill ? skill.color : '#f1f5f9' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
    >
      {skill ? (
        <>
          {/* Skill Icon */}
<<<<<<< HEAD
          <div className="w-full h-full rounded-full flex items-center justify-center text-white overflow-hidden">
            {skill.logoUrl ? (
              <img
                src={skill.logoUrl}
                alt={skill.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback to first letter if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">${skill.name.charAt(0)}</div>`;
                    // Also set background color since image failed
                    const grandParent = parent.parentElement?.parentElement;
                    if (grandParent) {
                      grandParent.style.backgroundColor = skill.color;
                    }
                  }
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {skill.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Remove button on hover */}
          {showRemove && (
=======
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
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
<<<<<<< HEAD
              className={`absolute -top-2 ${isLeft ? '-left-2' : '-right-2'} w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700 transition-colors shadow-lg z-30 opacity-0 group-hover:opacity-100`}
              aria-label="Remove skill"
              title="Remove skill"
            >
              <X className="h-4 w-4" />
=======
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
            </button>
          )}

          {/* Tooltip */}
<<<<<<< HEAD
          <div className="absolute px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20" style={tooltipStyle ?? {}}>
=======
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
            {skill.name}
          </div>
        </>
      ) : (
        /* Empty slot with plus icon */
        <button
          onClick={() => onSelect({} as Skill)} // This will trigger the skill selection dialog
<<<<<<< HEAD
          className="w-full h-full rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
=======
          className="w-full h-full rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await fetchAvailableSkills();
        setAvailableSkills(skills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadSkills();
    }
  }, [isOpen]);

  const categories = ['All', ...getSkillCategories(availableSkills)];
  const selectedSkillIds = selectedSkills.map(skill => skill.id);

  const filteredSkills = availableSkills.filter(skill => {
=======

  const categories = ['All', ...getSkillCategories()];
  const selectedSkillIds = selectedSkills.map(skill => skill.id);

  const filteredSkills = AVAILABLE_SKILLS.filter(skill => {
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading skills...
              </div>
            ) : (
              filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => {
                    onSelectSkill(skill);
                    onClose();
                  }}
                  className="flex flex-col items-center p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2 overflow-hidden"
                    style={{ backgroundColor: skill.logoUrl ? 'transparent' : skill.color }}
                  >
                    {skill.logoUrl ? (
                      <img
                        src={skill.logoUrl}
                        alt={skill.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback to first letter if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = skill.color;
                            parent.innerHTML = skill.name.charAt(0);
                            parent.style.display = 'flex';
                            parent.style.alignItems = 'center';
                            parent.style.justifyContent = 'center';
                          }
                        }}
                      />
                    ) : (
                      skill.name.charAt(0)
                    )}
                  </div>
                  <span className="text-xs text-center group-hover:text-primary transition-colors">
                    {skill.name}
                  </span>
                </button>
              ))
            )}
=======
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
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
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
<<<<<<< HEAD
  const visibleSlots = Math.min(maxSlots, Math.max(2, filledSlots + 1));
=======
  const visibleSlots = Math.min(
    maxSlots,
    Math.max(4, filledSlots + (filledSlots % 2 === 0 ? 2 : 0)) // Show at least 4, then add 2 more when current set is filled
  );
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f

  const leftSlots = Math.ceil(visibleSlots / 2);
  const rightSlots = visibleSlots - leftSlots;

  const handleSkillSelect = (skill: Skill) => {
<<<<<<< HEAD
    console.log('handleSkillSelect called with skill:', skill);
=======
<<<<<<< HEAD
    console.log('handleSkillSelect called with skill:', skill);
    if (skill.id) {
      // Adding a skill - let parent handle the update
      console.log('Adding skill:', skill);
      onUpdateSkills([...userSkills, skill]);
    } else {
      // Opening dialog for selection
      console.log('Opening skill dialog');
=======
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
    if (skill.id) {
      // Adding a skill - let parent handle the update
      console.log('Adding skill:', skill);
      onUpdateSkills([...userSkills, skill]);
    } else {
      // Opening dialog for selection
<<<<<<< HEAD
      console.log('Opening skill dialog');
=======
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
      setShowSkillDialog(true);
    }
  };

  const handleSkillRemove = (index: number) => {
<<<<<<< HEAD
    console.log('handleSkillRemove called with index:', index);
    const newSkills = userSkills.filter((_, i) => i !== index);
    console.log('New skills after removal:', newSkills);
=======
<<<<<<< HEAD
    console.log('handleSkillRemove called with index:', index);
    const newSkills = userSkills.filter((_, i) => i !== index);
    console.log('New skills after removal:', newSkills);
=======
    const newSkills = userSkills.filter((_, i) => i !== index);
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
>>>>>>> d71d32f177fe4c2b8ae1b91763d41c1b8c70d04b
    onUpdateSkills(newSkills);
  };

  const handleDialogSkillSelect = (skill: Skill) => {
    onUpdateSkills([...userSkills, skill]);
    setShowSkillDialog(false);
  };

  return (
<<<<<<< HEAD
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Circular slots around the center - top semicircle only to avoid extending below */}
      {Array.from({ length: visibleSlots }, (_, i) => {
        const angleRange = Math.PI; // 180 degrees for top semicircle only
        const startAngle = -Math.PI / 2 - Math.PI / 2; // Start from top-left (rotated 90 degrees left)
        const angle = startAngle + (i / Math.max(1, visibleSlots - 1)) * angleRange;
        const radius = 120; // Closer radius for better proximity to profile
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Determine tooltip position based on circle location
        const tooltipStyle: React.CSSProperties = {};
        if (Math.abs(angle + Math.PI / 2) < Math.PI / 6) { // Top circles (within 30° of vertical)
          tooltipStyle.bottom = '100%';
          tooltipStyle.left = '50%';
          tooltipStyle.transform = 'translateX(-50%)';
          tooltipStyle.marginBottom = '0.5rem';
        } else if (x < 0) { // Left side circles
          tooltipStyle.right = '100%';
          tooltipStyle.top = '50%';
          tooltipStyle.transform = 'translateY(-50%)';
          tooltipStyle.marginRight = '0.5rem';
        } else { // Right side circles
          tooltipStyle.left = '100%';
          tooltipStyle.top = '50%';
          tooltipStyle.transform = 'translateY(-50%)';
          tooltipStyle.marginLeft = '0.5rem';
        }

        const isLeft = x < 0;

        return (
          <div
            key={i < userSkills.length ? `skill-${userSkills[i].id}` : `empty-${i}`}
            className="absolute animate-fade-in"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              animationDelay: `${i * 100}ms`,
              zIndex: 5,
=======
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
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f
            }}
          >
            <SkillSlot
              skill={i < userSkills.length ? userSkills[i] : undefined}
              onSelect={handleSkillSelect}
              onRemove={() => handleSkillRemove(i)}
<<<<<<< HEAD
              tooltipStyle={tooltipStyle}
              showRemove={true}
              isLeft={isLeft}
              size="md"
            />
          </div>
        );
      })}
=======
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
>>>>>>> d883f5e3692e24fcd7e92efaea72219ca938424f

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