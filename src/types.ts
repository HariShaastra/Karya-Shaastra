export type InitiativeType = 'profit' | 'non-profit' | 'community';
export type InitiativeStage = 'idea' | 'pilot' | 'active' | 'growing';
export type ActionCategory = 'outreach' | 'operations' | 'finance' | 'content' | 'other';
export type TeamRole = 'founder' | 'volunteer' | 'partner';
export type ResourceType = 'in' | 'out';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
}

export interface Initiative {
  id: string;
  ownerId: string;
  name: string;
  type: InitiativeType;
  problemStatement: string;
  targetGroup: string;
  proposedSolution: string;
  why: string;
  expectedOutcome: string;
  stage: InitiativeStage;
  createdAt: any; // Firestore Timestamp
}

export interface Action {
  id: string;
  initiativeId: string;
  userId: string;
  userName: string;
  description: string;
  category: ActionCategory;
  timeSpent: number; // minutes
  notes: string;
  timestamp: any; // Firestore Timestamp
  proofText?: string;
  proofUrl?: string; // Manual URL if applicable
}

export interface EditLog {
  id: string;
  initiativeId: string;
  userId: string;
  userName: string;
  action: string; // e.g., 'Updated Initiative Details', 'Added Resource'
  changes?: string; // JSON string of changes
  timestamp: any;
}

export interface TeamMember {
  id: string;
  initiativeId: string;
  userId: string;
  displayName: string;
  email: string;
  role: TeamRole;
  invitedAt: any;
  joinedAt?: any;
}

export interface Resource {
  id: string;
  initiativeId: string;
  type: ResourceType;
  amount: number;
  description: string;
  timestamp: any;
  addedBy: string;
}

export interface Milestone {
  id: string;
  initiativeId: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: any;
}
