import type { Timestamp } from "firebase/firestore"

export type ContributionStatus = "pending" | "approved" | "rejected"

export interface Contribution {
  id: string
  monument_id: string      // denormalized — required for collectionGroup queries
  author_uid: string
  information: string
  submitted_at: Timestamp
  status: ContributionStatus
}
