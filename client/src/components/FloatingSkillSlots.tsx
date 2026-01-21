import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchAvailableSkills, getSkillById, getSkillsByCategory, getSkillCategories, type Skill } from '@/lib/skills';

interface SkillSlotProps {
  skill?: Skill;
  onSelect: (skill: Skill) => void;
  onRemove: () => void;
  size?: 'sm' | 'md' | 'lg';
  tooltipStyle?: React.CSSProperties;
  showRemove?: boolean;
  isLeft?: boolean;
}

const SkillSlot: React.FC<SkillSlotProps> = ({ skill, onSelect, onRemove, size = 'md', tooltipStyle, showRemove = true, isLeft = false }) => {
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
      className={`relative ${sizeClasses[size]} rounded-full border-2 border-white shadow-lg transition-all duration-300 ${skill ? 'hover:scale-110 hover:shadow-xl group' : ''}`}
      style={{ backgroundColor: skill && !skill.logoUrl ? skill.color : '#f1f5f9' }}
      onMouseEnter={skill ? () => setIsHovered(true) : undefined}
      onMouseLeave={skill ? () => setIsHovered(false) : undefined}
    >
      {skill ? (
        <>
          {/* Skill Icon */}
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className={`absolute -top-2 ${isLeft ? '-left-2' : '-right-2'} w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-700 transition-colors shadow-lg z-30 opacity-0 group-hover:opacity-100`}
              aria-label="Remove skill"
              title="Remove skill"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Tooltip */}
          <div className="absolute px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20" style={tooltipStyle ?? {}}>
            {skill.name}
          </div>
        </>
      ) : (
        /* Empty slot with plus icon */
        <button
          onClick={() => onSelect({} as Skill)} // This will trigger the skill selection dialog
          className="w-full h-full rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
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
  const visibleSlots = Math.min(maxSlots, Math.max(2, filledSlots + 1));

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
            key={`slot-${i}`}
            className="absolute animate-fade-in"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              animationDelay: `${i * 100}ms`,
              zIndex: 5,
            }}
          >
            <SkillSlot
              skill={i < userSkills.length ? userSkills[i] : undefined}
              onSelect={handleSkillSelect}
              onRemove={() => handleSkillRemove(i)}
              tooltipStyle={tooltipStyle}
              showRemove={true}
              isLeft={isLeft}
              size="md"
            />
          </div>
        );
      })}

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