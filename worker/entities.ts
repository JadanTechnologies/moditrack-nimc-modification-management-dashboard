import { IndexedEntity } from "./core-utils";
import type { User, ModificationRequest, ActivityLog, Notification } from "@shared/types";
import { MOCK_USERS, MOCK_REQUESTS } from "@shared/mock-data";
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "", role: 'Staff', status: 'Active' };
  static seedData = MOCK_USERS.map(u => ({ ...u, status: 'Active' as const }));
}
// MODIFICATION REQUEST ENTITY
export class ModificationRequestEntity extends IndexedEntity<ModificationRequest> {
  static readonly entityName = "request";
  static readonly indexName = "requests";
  static readonly initialState: ModificationRequest = {
    id: "",
    nin: "",
    fullName: "",
    requestType: "Name",
    status: "Pending",
    assignedToId: null,
    submittedAt: new Date().toISOString(),
    history: [],
    details: {
      oldValue: "",
      newValue: "",
      reason: "",
      documents: [],
    },
  };
  static seedData = MOCK_REQUESTS;
}
// ACTIVITY LOG ENTITY
export class ActivityLogEntity extends IndexedEntity<ActivityLog> {
  static readonly entityName = "log";
  static readonly indexName = "logs";
  static readonly initialState: ActivityLog = {
    id: "",
    userId: "",
    userName: "",
    action: "",
    targetId: "",
    timestamp: new Date().toISOString(),
  };
}
// NOTIFICATION ENTITY
export class NotificationEntity extends IndexedEntity<Notification> {
  static readonly entityName = "notification";
  static readonly indexName = "notifications";
  static readonly initialState: Notification = {
    id: "",
    userId: "",
    message: "",
    requestId: null,
    isRead: false,
    timestamp: new Date().toISOString(),
  };
}