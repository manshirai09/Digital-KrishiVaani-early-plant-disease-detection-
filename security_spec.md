# Digital KrishiVaani Security Specification

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created, read, or updated by the authenticated user whose `request.auth.uid == userId`.
2. **Scan Ownership Invariant**: A crop scan at `/scans/{scanId}` must have `userId == request.auth.uid`. Farmers can only read, create, update, or list scans where `resource.data.userId == request.auth.uid`. Officers and ICAR experts can read scans for biosecurity surveillance.
3. **Farm Ownership Invariant**: A farm land record at `/farms/{farmId}` must have `userId == request.auth.uid`. Only the authenticated owner can mutate the farm data.
4. **Consultation Integrity**: A consultation ticket can only be created by the requesting farmer (`userId == request.auth.uid`). Agronomy experts and officers can review and update `expertNotes` and `status`.
5. **Path ID Hardening**: All collection document IDs must satisfy `isValidId(id)` (`id.matches('^[a-zA-Z0-9_\\-]+$')` and length <= 128).
6. **Denial-of-Wallet Resistance**: All text fields are strictly bounded by size limits (`<= 500` for symptoms, `<= 100` for names).
7. **Immutable Creation Timestamps**: Fields like `createdAt` and `userId` cannot be overwritten or altered during update.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. **Payload 1 (Ghost Field Injection)**: Attempt to insert `isAdmin: true` into a `/users/{userId}` document. *Expected: Rejection via schema property validation.*
2. **Payload 2 (User Identity Spoofing)**: Authenticated user `A` tries to write to `/users/{userIdB}`. *Expected: PERMISSION_DENIED (uid mismatch).*
3. **Payload 3 (Unauthenticated Read)**: Unauthenticated visitor attempts to list `/scans`. *Expected: PERMISSION_DENIED.*
4. **Payload 4 (Cross-User Scan Tampering)**: User `A` attempts to update a scan owned by User `B`. *Expected: PERMISSION_DENIED.*
5. **Payload 5 (Oversized Payload / Denial of Wallet)**: A 5MB string injected into `symptoms` or `notes`. *Expected: Rejected by `.size() <= 500` bound.*
6. **Payload 6 (Path ID Injection / Poisoning)**: Creating a document with ID `../../secrets/config` or special chars. *Expected: Rejected by `isValidId()` regex.*
7. **Payload 7 (Missing Required Fields)**: Creating a scan with missing `cropName` or `severityLevel`. *Expected: Rejected by `isValidScan()` validation helper.*
8. **Payload 8 (Invalid Enum Value)**: Setting `severityLevel` to `"apocalyptic"` instead of `['low', 'moderate', 'high', 'critical']`. *Expected: Rejected.*
9. **Payload 9 (Terminal State Bypass)**: Attempting to reset a `"resolved"` consultation back to `"pending"` by a non-authorized client. *Expected: Rejected.*
10. **Payload 10 (Immutable Field Modification)**: Attempting to change `userId` or `createdAt` on an existing scan during update. *Expected: Rejected by immutability guard.*
11. **Payload 11 (Blanket List Query Scraping)**: Attempting to run an unbounded `getDocs(collection(db, 'scans'))` without `where('userId', '==', auth.currentUser.uid)`. *Expected: Rejected by query enforcer.*
12. **Payload 12 (Negative Confidence Score)**: Submitting a diagnostic scan with `confidence: -15` or `confidence: 150`. *Expected: Rejected by boundary checks `confidence >= 0 && confidence <= 100`.*
