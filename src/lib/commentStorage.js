const CLASS_COMMENTS_KEY = "qcu_lms_class_comments"
const PRIVATE_COMMENTS_KEY = "qcu_lms_private_comments"

function readAll(key) {
  const saved = localStorage.getItem(key)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`Failed to load ${key}:`, error)

    return []
  }
}

function writeAll(key, items) {
  localStorage.setItem(key, JSON.stringify(items))
}

// ---------- Class comments (public, one thread per classwork item) ----------

export function getClassComments(classworkId) {
  return readAll(CLASS_COMMENTS_KEY)
    .filter((comment) => comment.classworkId === classworkId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function saveClassComment({
  classworkId,
  authorId,
  authorName,
  authorRole,
  text,
}) {
  const comments = readAll(CLASS_COMMENTS_KEY)

  const newComment = {
    id: `CCOMMENT-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    classworkId,
    authorId,
    authorName,
    authorRole,
    text,
    createdAt: new Date().toISOString(),
  }

  writeAll(CLASS_COMMENTS_KEY, [...comments, newComment])

  return newComment
}

// ---------- Private comments (one thread per classwork + student) ----------

export function getPrivateComments(classworkId, studentId) {
  return readAll(PRIVATE_COMMENTS_KEY)
    .filter(
      (comment) =>
        comment.classworkId === classworkId &&
        comment.studentId === studentId
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function savePrivateComment({
  classworkId,
  studentId,
  authorId,
  authorName,
  authorRole,
  text,
}) {
  const comments = readAll(PRIVATE_COMMENTS_KEY)

  const newComment = {
    id: `PCOMMENT-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    classworkId,
    studentId,
    authorId,
    authorName,
    authorRole,
    text,
    createdAt: new Date().toISOString(),
  }

  writeAll(PRIVATE_COMMENTS_KEY, [...comments, newComment])

  return newComment
}
