import type { Timestamp } from "firebase/firestore"

export interface Photo {
  id: string
  uploader_uid: string
  image_url: string        // Firebase Storage download URL
  uploaded_at: Timestamp
}
