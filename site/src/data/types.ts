export interface Week {
  number: number;
  dates: string;
  month: string;
  days: number;
  note: string;
}

export interface Subject {
  name: string;
  weeklyHours: number;
  annualHours: number;
  focus: string;
  yearResult: string;
  topics: Record<string, string>;
  monthly: Record<string, string>;
}

export interface ControlPoint {
  week: number;
  dates: string;
  month: string;
  subject: string;
  form: string;
}

export interface Vacation {
  name: string;
  dates: string;
  length: string;
}

export interface ScheduleDay {
  day: string;
  lessons: string[];
}

export interface PlanData {
  schoolYear: {
    title: string;
    start: string;
    end: string;
    weeks: number;
    study_days: number;
    weekly_hours: number;
  };
  months: string[];
  weeks: Week[];
  subjects: Subject[];
  controls: ControlPoint[];
  vacations: Vacation[];
  schedule: ScheduleDay[];
}

export type ViewId =
  | 'overview'
  | 'months'
  | 'weeks'
  | 'controls'
  | 'subjects'
  | 'document';
