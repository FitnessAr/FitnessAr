export type WeekDay = {
  date: Date;
  label: string;
  isToday: boolean;
  hasWorkout: boolean;
};

export type TodayWorkout = {
  routineName: string;
  dayLabel: string;
  title: string;
  exerciseCount: number;
  durationMinutes: number;
  difficulty: string;
} | null;

export type WeeklySummary = {
  sessionsCompleted: number;
  sessionsTotal: number;
  minutes: number;
  streakDays: number;
};

export type AlumnoHomeData = {
  studentName: string;
  week: WeekDay[];
  todayWorkout: TodayWorkout;
  weeklySummary: WeeklySummary;
};
