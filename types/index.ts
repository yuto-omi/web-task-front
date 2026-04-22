export type TaskStatus = "未着手" | "進行中" | "レビュー待ち" | "完了"
export type ProjectStatus = "受注" | "進行中" | "納品済" | "保留"
export type TaskPriority = "high" | "mid" | "low"
export type TaskTypeTag = "コーディング" | "デザイン" | "テスト" | "その他"

export interface Member {
  id: number
  name: string
  initials: string
  avatarColor?: string
}

export interface Project {
  id: number
  name: string
  clientName: string
  status: ProjectStatus
  deadline: string
  progressPercent: number
  estimatedHours: number
  actualHours: number
  members: Member[]
}

export interface Task {
  id: number
  title: string
  typeTag: TaskTypeTag
  assignee: Member
  dueDate: string
  estimatedHours: number
  status: TaskStatus
  priority: TaskPriority
  isDone?: boolean
}

export interface ChecklistItem {
  id: number
  label: string
  isChecked: boolean
}

export interface WorkLog {
  projectName: string
  hours: number
}
