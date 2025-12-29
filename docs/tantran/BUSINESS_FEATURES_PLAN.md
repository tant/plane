# Plan: Implement Business Plan Features in CE (Community Edition)

## Overview
Unlock Plane Business plan features by implementing actual functionality in CE stub components. Backend already supports most features - main work is frontend implementation.

---

## Phase 1: Foundation Features (Priority: HIGH)

### 1.1 Epics
**Complexity:** Low | **Backend Ready:** Yes

**Files to Modify:**
- `apps/web/ce/components/epics/epic-modal/modal.tsx` - Currently returns `<></>`
- `apps/web/ce/store/issue/epic/issue.store.ts` - Store stub
- `apps/web/ce/store/issue/epic/filter.store.ts` - Filter stub

**Implementation:**
```typescript
// apps/web/ce/components/epics/epic-modal/modal.tsx
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";

export function CreateUpdateEpicModal(props: EpicModalProps) {
  return (
    <CreateUpdateIssueModal
      {...props}
      data={{ ...props.data, is_epic: true }}
      modalTitle="Epic"
    />
  );
}
```

**Additional Tasks:**
- Add epic navigation item to sidebar (`apps/web/ce/components/navigations/use-navigation-items.ts`)
- Create epic list view using existing issue list patterns
- Add epic filter to issue layouts

---

### 1.2 Project Templates
**Complexity:** Low | **Backend Ready:** Partial

**Files to Modify:**
- `apps/web/ce/components/projects/create/template-select.tsx` - Returns `<></>`
- `apps/web/ce/components/issues/issue-modal/template-select.tsx`

**Implementation:**
- Create template dropdown using existing project data
- Store template as project with `is_template: true` flag
- Clone project settings when creating from template

---

## Phase 2: Core Features (Priority: MEDIUM-HIGH)

### 2.1 Workspace Activity Logs
**Complexity:** Low | **Backend Ready:** Yes

**Backend Endpoints Available:**
- `GET /workspaces/<slug>/user-activity/<user_id>/` - User activity
- `GET /workspaces/<slug>/user-activity/<user_id>/export/` - Export

**Files to Modify:**
- `apps/web/ce/components/workspace/members/members-activity-button.tsx`
- Create new: `apps/web/ce/components/workspace/activity-logs/`

**Implementation:**
- Aggregate user activities across workspace
- Add filtering by action type, user, date range
- Reuse existing activity component patterns

---

### 2.2 Intake Forms
**Complexity:** Medium | **Backend Ready:** Yes

**Backend Endpoints:**
- `GET/POST /workspaces/<slug>/projects/<project_id>/intake/`
- Serializer: `apps/api/plane/app/serializers/intake.py`

**Files to Modify:**
- `apps/web/ce/components/projects/settings/intake/header.tsx`
- Create form builder components

**Implementation:**
- Create form field builder UI (text, select, multi-select)
- Generate public form URL for external submissions
- Map form submissions to intake issues

---

## Phase 3: Advanced Features (Priority: MEDIUM)

### 3.1 Teamspace Cycles
**Complexity:** Medium | **Backend Ready:** Partial

**Files to Modify:**
- `apps/web/ce/components/projects/teamspaces/teamspace-list.tsx` - Returns `null`

**Implementation:**
- Define teamspace as virtual grouping of projects
- Aggregate cycles across selected projects
- Create teamspace selector in sidebar

**Backend Changes Needed:**
- Add teamspace model or use tags/labels for grouping
- Endpoint for cross-project cycle aggregation

---

### 3.2 RBAC (Role-Based Access Control)
**Complexity:** High | **Backend Ready:** Basic roles only

**Current State:**
- Only 3 roles: Admin (20), Member (15), Guest (5)
- Defined in: `apps/api/plane/db/models/workspace.py`

**Implementation:**
- Create custom role model with permission matrix
- UI for role management in workspace settings
- Permission checking middleware updates

**Backend Changes Needed:**
- New `CustomRole` model with permissions JSON field
- Migration for role-permission mapping
- Update permission decorators

---

## Phase 4: Configuration Features (Priority: LOW)

### 4.1 Custom SLAs
**Complexity:** Medium | **Backend Ready:** No

**Implementation:**
- Create SLA model (priority × response time matrix)
- SLA configuration UI in workspace settings
- Breach detection background task
- SLA status indicators on issues

**Backend Changes Needed:**
- SLA model with priority/state mappings
- Celery task for SLA monitoring
- Webhook/notification on breach

---

### 4.2 Admin Interface Enhancement
**Complexity:** Low | **Backend Ready:** Yes (separate app)

**Existing Infrastructure:**
- `apps/admin/` - Separate admin application
- `apps/api/plane/license/api/views/admin.py` - Admin APIs

**Implementation:**
- Extend admin dashboard for workspace management
- Add user/member management screens
- System health monitoring

---

## File Reference Summary

### CE Stubs to Implement

| Feature | File | Current Return |
|---------|------|----------------|
| Epic Modal | `ce/components/epics/epic-modal/modal.tsx` | `<></>` |
| Template Select | `ce/components/projects/create/template-select.tsx` | `<></>` |
| Teamspace List | `ce/components/projects/teamspaces/teamspace-list.tsx` | `null` |
| Activity Button | `ce/components/workspace/members/members-activity-button.tsx` | `<></>` |
| Upgrade Modal | `ce/components/license/modal/upgrade-modal.tsx` | Upgrade UI |

### Backend API Routes

| Feature | Endpoint | Status |
|---------|----------|--------|
| Epics | `/projects/<id>/issues/?is_epic=true` | Ready |
| Activity | `/workspaces/<slug>/user-activity/` | Ready |
| Intake | `/projects/<id>/intake/` | Ready |
| Cycles | `/workspaces/<slug>/cycles/` | Ready |
| RBAC | `/workspaces/<slug>/members/` | Basic only |

### Plan Constants to Update

**File:** `apps/web/core/constants/plans.tsx`

```typescript
// Change from:
{ title: "Epics", cloud: { free: false, one: false, pro: true, ... }}

// To:
{ title: "Epics", cloud: { free: true, one: true, pro: true, ... }}
```

---

## Implementation Order

```
Week 1-2: Epics + Project Templates (Quick wins, high value)
    ↓
Week 3-4: Activity Logs + Intake Forms (Uses existing patterns)
    ↓
Week 5-6: Teamspace Cycles + RBAC (More complex)
    ↓
Week 7-8: Custom SLAs + Admin Interface (Polish)
```

---

## Quick Start: Epic Implementation

**Step 1:** Modify epic modal
```bash
# File: apps/web/ce/components/epics/epic-modal/modal.tsx
```

**Step 2:** Add navigation
```bash
# File: apps/web/ce/components/navigations/use-navigation-items.ts
# Add epic item to navigation array
```

**Step 3:** Update plan constants (cosmetic)
```bash
# File: apps/web/core/constants/plans.tsx
# Set free: true, one: true for Epics
```

**Step 4:** Test
```bash
pnpm dev
# Navigate to project → Should see Epic option
```

---

## Architecture: How CE/EE Gating Works

### Path Alias System
```
tsconfig.json:
  "@/plane-web/*": ["./ce/*"]  ← Currently points to CE

When code imports:
  import { X } from "@/plane-web/components/feature"

It resolves to:
  ./ce/components/feature  ← CE stub (empty/null)
```

### Directory Structure
```
apps/web/
├── core/     ← Shared code (always included)
├── ce/       ← Community Edition (stubs, returns null/<></>)
└── ee/       ← Enterprise Edition (just re-exports CE in this repo)
```

### Key Insight
- **EE folder is a placeholder** - Only re-exports from CE
- **Real EE code is not in public repo** - Kept private by Plane
- **Backend has NO subscription checks** - All APIs work
- **Gating is frontend-only** - Implement CE = features work

---

## Notes

- **No backend subscription validation** - All features work once frontend is implemented
- **EE folder is placeholder** - Just re-exports CE, no real implementation
- **Backend APIs ready** - Most features only need frontend work
- **Patterns exist** - Copy from similar features (cycles → teamspace cycles, issues → epics)

---

## Telemetry Warning

Default telemetry sends data to Plane servers:
- OpenTelemetry → `telemetry.plane.so`
- PostHog (if configured)
- Sentry (if configured)

To disable:
1. Set `is_telemetry_enabled = false` in God Mode
2. Remove env vars: `OTLP_ENDPOINT`, `POSTHOG_API_KEY`, `VITE_SENTRY_DSN`
