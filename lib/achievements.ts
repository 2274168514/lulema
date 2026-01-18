// 成就等级系统
// 按起飞次数划分等级

export interface AchievementLevel {
  level: number;
  title: string;
  minTakeoffs: number;
  color: string;
  bgColor: string;
}

export const ACHIEVEMENT_LEVELS: AchievementLevel[] = [
  { level: 1, title: "凡人", minTakeoffs: 0, color: "#6B7280", bgColor: "#F3F4F6" },
  { level: 2, title: "鹿王", minTakeoffs: 10, color: "#F59E0B", bgColor: "#FEF3C7" },
  { level: 3, title: "机组人员", minTakeoffs: 30, color: "#3B82F6", bgColor: "#DBEAFE" },
  { level: 4, title: "机长", minTakeoffs: 60, color: "#8B5CF6", bgColor: "#EDE9FE" },
  { level: 5, title: "传奇机长", minTakeoffs: 100, color: "#EF4444", bgColor: "#FEE2E2" },
];

export function getAchievementLevel(totalTakeoffs: number): AchievementLevel {
  // 从高到低查找匹配的等级
  for (let i = ACHIEVEMENT_LEVELS.length - 1; i >= 0; i--) {
    if (totalTakeoffs >= ACHIEVEMENT_LEVELS[i].minTakeoffs) {
      return ACHIEVEMENT_LEVELS[i];
    }
  }
  return ACHIEVEMENT_LEVELS[0];
}

export function getNextLevel(totalTakeoffs: number): AchievementLevel | null {
  const currentLevel = getAchievementLevel(totalTakeoffs);
  const nextIndex = ACHIEVEMENT_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  
  if (nextIndex >= ACHIEVEMENT_LEVELS.length) {
    return null; // 已是最高级
  }
  
  return ACHIEVEMENT_LEVELS[nextIndex];
}

export function getProgressToNextLevel(totalTakeoffs: number): number {
  const currentLevel = getAchievementLevel(totalTakeoffs);
  const nextLevel = getNextLevel(totalTakeoffs);
  
  if (!nextLevel) return 100; // 已满级
  
  const progressInLevel = totalTakeoffs - currentLevel.minTakeoffs;
  const levelRange = nextLevel.minTakeoffs - currentLevel.minTakeoffs;
  
  return Math.round((progressInLevel / levelRange) * 100);
}
