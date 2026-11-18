/**
 * DYNAMIC AUTONOMOUS AI AGENT - TYPE DEFINITIONS
 * Human Approval – Conversational Revision – Live Execution – Unified CRM & Community
 */

export type TaskStatus =
  | 'WAITING_FOR_APPROVAL'
  | 'REVISION_REQUESTED'
  | 'ANALYZING_REVISION'
  | 'UPDATING_PLAN'
  | 'PLAN_UPDATED'
  | 'APPROVED'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIALLY_COMPLETED'
  | 'PAUSED'
  | 'CANCELLED'
  | 'WAITING_FOR_USER_INPUT'
  | 'WAITING_FOR_EXTERNAL_CONFIRMATION';

export type StepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'WAITING_FOR_EXTERNAL_CONFIRMATION';

export type ToolCategory =
  | 'crm'
  | 'event'
  | 'training'
  | 'document'
  | 'email'
  | 'zalo'
  | 'marketplace'
  | 'community'
  | 'finance'
  | 'research';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskStep {
  stepId: string;
  name: string;
  description: string;
  toolName: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
  retryCount: number;
}

export interface PlanChecks {
  validCount: number;
  missingCount: number;
  duplicateCount: number;
  conditionsMet: boolean;
  risks: string[];
  warnings?: string[];
}

export interface PreviewContent {
  type: 'email' | 'zalo' | 'excel' | 'marketplace' | 'matching' | 'event' | 'training' | 'finance' | 'research' | 'generic';
  title: string;
  summary?: string;
  data: Record<string, any>;
}

export interface RevisionDiff {
  fromVersion: number;
  toVersion: number;
  summary: string;
  added: string[];
  modified: string[];
  removed: string[];
  timestamp: string;
}

export interface TaskPlan {
  taskId: string;
  revisionVersion: number;
  title: string;
  goal: string;
  description: string;
  scope: string[];
  affectedModules: string[];
  dataSources: string[];
  affectedRecords: number;
  steps: TaskStep[];
  previewContent?: PreviewContent;
  checks: PlanChecks;
  requiredRole: string;
  conditions: string[];
  expectedResult: string;
  payloadHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRecord {
  approverId: string;
  approverName?: string;
  approverRole: string;
  approvedAt: string;
  taskId: string;
  revisionVersion: number;
  payloadHash: string;
  permissionScope: string;
  expiresAt?: string;
}

export interface LiveWorkspaceData {
  type: 'excel' | 'email' | 'marketplace' | 'matching' | 'event' | 'training' | 'finance' | 'research';
  title: string;
  columns?: Array<{ key: string; label: string; type?: string }>;
  rows?: Array<Record<string, any>>;
  emailPreview?: {
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    bodyHtml: string;
    attachments?: Array<{ name: string; size: string; url?: string }>;
  };
  zaloPreview?: {
    oaName: string;
    recipientsCount: number;
    templateName: string;
    messageText: string;
  };
  marketplaceDraft?: {
    name: string;
    category: string;
    price: number;
    description: string;
    images: string[];
    supplier: string;
  };
  matchingResults?: Array<{
    partnerName: string;
    company: string;
    industry: string;
    matchScore: number;
    reason: string;
    status: 'proposed' | 'invited' | 'connected';
  }>;
  researchSources?: Array<{
    title: string;
    url: string;
    snippet: string;
    domain: string;
    verified: boolean;
  }>;
  financeSummary?: {
    type: 'income' | 'expense' | 'budget';
    amountTotal: number;
    accountCode: string;
    recordsCount: number;
    standards: string;
  };
}

export interface ExecutionProgressState {
  taskId: string;
  status: TaskStatus;
  currentStepId?: string;
  currentStepIndex: number;
  totalSteps: number;
  percent: number;
  startedAt?: string;
  completedAt?: string;
  elapsedSeconds: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  steps: TaskStep[];
  errorMessage?: string;
  canRollback?: boolean;
}

export interface VerificationCardResult {
  actionId: string;
  actionType: string;
  title: string;
  status: 'success' | 'warning' | 'failed';
  tableName?: string;
  recordId?: string;
  timestamp: string;
  details: Array<{ label: string; value: string; highlight?: boolean }>;
  integrityCheck: {
    passed: boolean;
    dbValidated?: boolean;
    noDuplicate?: boolean;
    rbacPermitted?: boolean;
    message: string;
  };
  actions?: Array<{
    label: string;
    route?: string;
    action?: string;
    variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  }>;
}

export interface ToolExecutionContext {
  userId: string;
  userRole: string;
  platform: 'crm' | 'member';
  taskId: string;
  stepId: string;
  revisionVersion: number;
}

export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  requiredRoles: string[];
  idempotencyPolicy: 'REPLACE_BY_KEY' | 'SKIP_IF_EXISTS' | 'ALLOW_MULTIPLE' | 'READ_ONLY';
  timeoutMs: number;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  execute: (context: ToolExecutionContext, input: any) => Promise<any>;
}
