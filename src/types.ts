export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
  completed: boolean;
}

export interface FinanceItem {
  id: number;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface Skill {
  id: number;
  name: string;
  timeSpent: number;
  streak: number;
  completed: boolean;
  lastUpdated: string;
}

export interface Video {
  id: number;
  title: string;
  link: string;
  category: string;
  watched: boolean;
}
