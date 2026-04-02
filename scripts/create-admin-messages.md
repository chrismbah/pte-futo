# adminMessages Firestore Collection

The `adminMessages` collection is created automatically when the first message is sent.

## Document structure:
```
adminMessages/{messageId}
  userId: string        — sender's Firebase auth UID
  name: string          — sender's full name
  email: string         — sender's email
  level: string         — sender's level (e.g. "200L")
  subject: string       — message subject
  message: string       — message body
  status: "unread" | "read" | "replied"
  reply: string | null  — admin reply text
  createdAt: Timestamp
```

## Firestore Security Rules (add to firestore.rules):
Allow authenticated users to create messages and read their own.
Allow admin to read/update all messages.
