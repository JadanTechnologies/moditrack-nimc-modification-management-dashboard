export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type RequestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
export type RequestType = 'Name' | 'DOB' | 'Address' | 'Phone' | 'Photo' | 'LGA';
export type UserRole = 'Admin' | 'Staff';
export type UserStatus = 'Active' | 'Suspended';
export interface User {
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}
export interface RequestHistory {
  status: RequestStatus;
  updatedAt: string;
  updatedBy: string; // User's name
  notes?: string;
}
export interface ModificationRequest {
  id: string;
  nin: string;
  fullName: string;
  requestType: RequestType;
  status: RequestStatus;
  assignedToId: string | null;
  submittedAt: string;
  history: RequestHistory[];
  details: {
    oldValue: string;
    newValue: string;
    reason: string;
    documents: { name: string; url: string }[];
  };
}
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetId: string; // e.g., Request ID or User ID
  timestamp: string;
  details?: string;
}
export interface Notification {
  id: string;
  userId: string;
  message: string;
  requestId: string | null;
  isRead: boolean;
  timestamp: string;
}