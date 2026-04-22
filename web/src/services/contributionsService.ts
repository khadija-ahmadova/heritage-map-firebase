import {
  collection,
  collectionGroup,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  GeoPoint,
} from "firebase/firestore"
import { db } from "../lib/firebase"
import { uploadToCloudinary } from "../lib/cloudinary"
import type { Contribution, ContributionStatus } from "../types/Contribution"
import type { Photo, PhotoStatus } from "../types/Photo"
import type { Monuments } from "../types/Monuments"

export async function submitContribution(
  monumentId: string,
  authorUid: string,
  information: string
): Promise<void> {
  const colRef = collection(db, "monuments", monumentId, "contributions")
  await addDoc(colRef, {
    monument_id: monumentId, // denormalized for collectionGroup queries
    author_uid: authorUid,
    information,
    submitted_at: serverTimestamp(),
    status: "pending",
  })
}

export async function uploadMonumentPhoto(
  monumentId: string,
  uploaderUid: string,
  file: File
): Promise<string> {
  const imageUrl = await uploadToCloudinary(file)
  const colRef = collection(db, "monuments", monumentId, "photos")
  await addDoc(colRef, {
    monument_id: monumentId,
    uploader_uid: uploaderUid,
    image_url: imageUrl,
    uploaded_at: serverTimestamp(),
    status: "pending",
  })
  return imageUrl
}

export async function submitNewMonument(
  data: {
    name: string
    architect: string
    location: string
    period: string
    style: string
    description: string
    lat?: number
    lng?: number
  },
  authorUid: string,
  imageFiles?: File[]
): Promise<string> {
  const { lat, lng, ...fields } = data
  const coordinates =
    lat !== undefined && lng !== undefined ? new GeoPoint(lat, lng) : undefined

  const docRef = await addDoc(collection(db, "monuments"), {
    ...fields,
    ...(coordinates ? { coordinates } : {}),
    author_uid: authorUid,
    published: false,
    submission_status: "pending",
    submitted_at: serverTimestamp(),
  })

  if (imageFiles && imageFiles.length > 0) {
    await Promise.all(
      imageFiles.map(async (file) => {
        const imageUrl = await uploadToCloudinary(file)
        await addDoc(collection(db, "monuments", docRef.id, "photos"), {
          monument_id: docRef.id,
          uploader_uid: authorUid,
          image_url: imageUrl,
          uploaded_at: serverTimestamp(),
          status: "pending",
        })
      })
    )
  }

  return docRef.id
}

// NOTE: Requires a Firestore Collection Group index.
// Fields: status ASC + submitted_at DESC, scope: Collection group.
// Firestore surfaces a direct Console link on first run without the index.
export async function getPendingContributions(): Promise<Contribution[]> {
  const q = query(
    collectionGroup(db, "contributions"),
    where("status", "==", "pending"),
    orderBy("submitted_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Contribution, "id">),
  }))
}

export async function updateContributionStatus(
  monumentId: string,
  contributionId: string,
  status: ContributionStatus
): Promise<void> {
  const docRef = doc(db, "monuments", monumentId, "contributions", contributionId)
  await updateDoc(docRef, { status })
}

export async function getApprovedContributions(
  monumentId: string
): Promise<Contribution[]> {
  const q = query(
    collection(db, "monuments", monumentId, "contributions"),
    where("status", "==", "approved"),
    orderBy("submitted_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Contribution, "id">),
  }))
}

export async function getMonumentPhotos(monumentId: string): Promise<Photo[]> {
  const q = query(
    collection(db, "monuments", monumentId, "photos"),
    where("status", "==", "approved"),
    orderBy("uploaded_at", "asc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Photo, "id">),
  }))
}

// NOTE: Requires a Firestore Collection Group index.
// Fields: status ASC + uploaded_at DESC, scope: Collection group.
export async function getPendingPhotos(): Promise<Photo[]> {
  const q = query(
    collectionGroup(db, "photos"),
    where("status", "==", "pending"),
    orderBy("uploaded_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Photo, "id">),
  }))
}

export async function updatePhotoStatus(
  monumentId: string,
  photoId: string,
  status: PhotoStatus
): Promise<void> {
  const docRef = doc(db, "monuments", monumentId, "photos", photoId)
  await updateDoc(docRef, { status })
}

// NOTE: Requires composite index on monuments: author_uid ASC + submitted_at DESC.
export async function getMyMonumentSubmissions(authorUid: string): Promise<Monuments[]> {
  const q = query(
    collection(db, "monuments"),
    where("author_uid", "==", authorUid),
    orderBy("submitted_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Monuments, "id">),
  }))
}

// NOTE: Requires Collection Group index on photos: uploader_uid ASC + uploaded_at DESC.
export async function getMyPhotoContributions(uploaderUid: string): Promise<Photo[]> {
  const q = query(
    collectionGroup(db, "photos"),
    where("uploader_uid", "==", uploaderUid),
    orderBy("uploaded_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Photo, "id">),
  }))
}

// NOTE: Requires Collection Group index on contributions: author_uid ASC + submitted_at DESC.
export async function getMyTextContributions(authorUid: string): Promise<Contribution[]> {
  const q = query(
    collectionGroup(db, "contributions"),
    where("author_uid", "==", authorUid),
    orderBy("submitted_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Contribution, "id">),
  }))
}

// NOTE: Requires composite index on monuments: submission_status ASC + submitted_at DESC.
export async function getPendingMonumentSubmissions(): Promise<Monuments[]> {
  const q = query(
    collection(db, "monuments"),
    where("submission_status", "==", "pending"),
    orderBy("submitted_at", "desc")
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Monuments, "id">),
  }))
}

export async function updateMonumentSubmissionStatus(
  monumentId: string,
  status: "approved" | "rejected"
): Promise<void> {
  await updateDoc(doc(db, "monuments", monumentId), {
    submission_status: status,
    published: status === "approved",
  })
}
