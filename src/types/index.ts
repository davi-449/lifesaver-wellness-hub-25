
export type Priority = "high" | "medium" | "low";
export type Category = "work" | "study" | "fitness" | "personal";
export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: Task[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // in minutes
  notes?: string;
}

export interface Workout {
  id: string;
  title: string;
  date: Date;
  category: string; // e.g., "Strength", "Cardio", "Flexibility"
  duration: number; // in minutes
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: Date;
  weight?: number; // in kg
  bodyFat?: number; // percentage
  chest?: number; // in cm
  waist?: number; // in cm
  hips?: number; // in cm
  arms?: number; // in cm
  thighs?: number; // in cm
  notes?: string;
}

export interface WaterIntake {
  id: string;
  date: Date;
  amount: number; // in ml
  target: number; // daily target in ml
}

export interface UserProfile {
  displayName: string;
  height?: number; // in cm
  weightGoal?: number; // in kg
  bodyFatGoal?: number; // percentage
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  fitnessGoals: string[]; // e.g., ["Lose weight", "Build muscle", "Improve endurance"]
  waterIntakeGoal: number; // daily target in ml
}
