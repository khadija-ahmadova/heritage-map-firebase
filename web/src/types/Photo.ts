import type { Timestamp } from "firebase/firestore"

export type PhotoStatus = "pending" | "approved" | "rejected"

export interface Photo {
  id: string
  uploader_uid: string
  image_url: string        // Firebase Storage download URL
  uploaded_at: Timestamp
  status: PhotoStatus
  monument_id?: string     // denormalized for collectionGroup queries
}
