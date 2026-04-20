"use client";

interface UserStatsProps {
  xp?: number;
  level?: number;
  streak?: number;
  achievements?: string[];
}

export function UserStats({ xp = 1250, level = 12, streak = 7, achievements = ['First Interview', 'Voice Master', 'Streak Champion'] }: UserStatsProps) {

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{xp}</div>
          <div className="text-sm text-gray-400">XP Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">Level {level}</div>
          <div className="text-sm text-gray-400">Current Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{streak}</div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{achievements.length}</div>
          <div className="text-sm text-gray-400">Achievements</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement, index) => (
            <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
              🏆 {achievement}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}