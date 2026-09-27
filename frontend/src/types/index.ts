export type UserRole = 'SUPER_ADMIN' | 'LMO' | 'GATC' | 'BUSINESS_USER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  organizationName?: string | null;
  phone: string;
  address?: string | null;
  state?: string | null;
  district?: string | null;
  role: UserRole;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  createdAt?: string;
  _count?: {
    instruments?: number;
    applications?: number;
    assignedApplications?: number;
  };
}

export interface InstrumentType {
  id: string;
  name: string;
  category: string;
  standardValidityDays: number;
  description?: string | null;
  isActive: boolean;
}

export interface Instrument {
  id: string;
  instrumentId: string;
  type: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: string;
  accuracyClass: string;
  unitOfMeasurement: string;
  dateOfManufacture?: string | null;
  installationDate?: string | null;
  location: string;
  district: string;
  state: string;
  previousVerificationNumber?: string | null;
  previousVerificationDate?: string | null;
  previousValidityDate?: string | null;
  photographUrl?: string | null;
  supportingDocsUrl?: string | null;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'EXPIRED' | 'DECOMMISSIONED';
  createdAt: string;
  ownerId: string;
  owner?: User;
  certificates?: Certificate[];
  applications?: Application[];
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'INSPECTION_IN_PROGRESS'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CERTIFICATE_ISSUED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface Application {
  id: string;
  applicationId: string;
  type: 'NEW_VERIFICATION' | 'RE_VERIFICATION';
  status: ApplicationStatus;
  remarks?: string | null;
  verificationType: 'ON_SITE' | 'LABORATORY';
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  scheduledLocation?: string | null;
  rejectionReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  assignedAt?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  instrumentId: string;
  instrument: Instrument;
  userId: string;
  user: User;
  assignedOfficerId?: string | null;
  assignedOfficer?: User | null;
  assignedGatcId?: string | null;
  assignedGatc?: User | null;
  certificate?: Certificate | null;
  inspections?: VerificationInspection[];
}

export interface InspectionChecklistItem {
  id?: string;
  itemKey: string;
  title: string;
  result: 'PASS' | 'FAIL' | 'NOT_APPLICABLE';
  remarks?: string | null;
}

export interface VerificationMeasurement {
  id?: string;
  testName: string;
  standardValue: number;
  observedValue: number;
  error: number;
  permissibleError: number;
  unit: string;
  result: 'PASS' | 'FAIL';
}

export interface VerificationInspection {
  id: string;
  inspectionId: string;
  verificationDate: string;
  verificationType: string;
  location: string;
  gpsLatitude?: number | null;
  gpsLongitude?: number | null;
  observations: string;
  remarks?: string | null;
  result: 'PASS' | 'FAIL';
  failureReason?: string | null;
  photographs?: string | null;
  evidenceDocuments?: string | null;
  createdAt: string;
  applicationId: string;
  instrumentId: string;
  officerId: string;
  officer?: User;
  instrument?: Instrument;
  application?: Application;
  certificate?: Certificate | null;
  checklistItems?: InspectionChecklistItem[];
  measurements?: VerificationMeasurement[];
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  qrCodeToken: string;
  verificationDate: string;
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';
  sealNumber?: string | null;
  pdfUrl?: string | null;
  qrCodeDataUrl?: string | null;
  revocationReason?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  instrument: Instrument;
  application?: Application;
  inspection?: VerificationInspection;
  issuedTo: User;
  issuedBy: User;
}

export interface ChecklistConfig {
  id: string;
  itemKey: string;
  title: string;
  description?: string | null;
  isMandatory: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION' | 'VERIFICATION' | 'CERTIFICATE' | 'EXPIRY' | 'SYSTEM';
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}
