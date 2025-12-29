# Các Chức Năng Bị Gate/Chặn Trong Plane Community Edition (CE)

Tài liệu này liệt kê tất cả các chức năng bị giới hạn hoặc vô hiệu hóa trong bản Community Edition của Plane.

---

## Tổng Quan Cơ Chế Gate

Plane sử dụng chiến lược gating đa tầng:

1. **Thay thế Component**: Thư mục `ce/` và `ee/` với các exports có điều kiện
2. **Empty Components**: Các tính năng bị gate trả về `<></>` hoặc `null` trong CE
3. **UI Badges**: Badge "Pro"/"Enterprise" hiển thị cho các tính năng bị hạn chế
4. **Backend Edition Tracking**: Model `Instance` lưu trữ loại edition
5. **Feature Flags**: Cấu hình lưu trong database để kiểm soát runtime

---

## Danh Sách Chi Tiết Các Tính Năng Bị Gate

### 1. Active Cycles (Chu Kỳ Đang Hoạt Động) - PRO+

**Mô tả**: Xem tất cả các cycle đang chạy trên tất cả dự án

**Files**:
- [header.tsx](apps/web/app/(all)/[workspaceSlug]/(projects)/active-cycles/header.tsx)
- [extended-sidebar-item.tsx:196-200](apps/web/ce/components/workspace/sidebar/extended-sidebar-item.tsx#L196-L200)

**Trạng thái CE**: Hiển thị badge "Pro" upgrade, chức năng bị giới hạn

---

### 2. Time Tracking & Worklogs (Theo Dõi Thời Gian) - ONE+ (cơ bản) / PRO+ (đầy đủ)

**Mô tả**: Theo dõi thời gian làm việc, timesheets lịch sử, phê duyệt

**Files**:
- [time-input.tsx](apps/web/ce/components/estimates/inputs/time-input.tsx) - Trả về `<></>`

**Trạng thái CE**: Hoàn toàn bị vô hiệu hóa

---

### 3. Estimates - Advanced (Ước Lượng Nâng Cao) - PRO+

**Mô tả**: Quản lý estimate nâng cao (chỉnh sửa, xóa)

**Files**:
- [update/modal.tsx](apps/web/ce/components/estimates/update/modal.tsx) - Trả về `<></>`
- [points/delete.tsx](apps/web/ce/components/estimates/points/delete.tsx) - Trả về `<></>`
- [estimate-list-item-buttons.tsx](apps/web/ce/components/estimates/estimate-list-item-buttons.tsx)

**Trạng thái CE**: Chỉ có estimate cơ bản, không thể chỉnh sửa/xóa

---

### 4. Teamspaces (Không Gian Nhóm) - BUSINESS+

**Mô tả**: Quản lý teamspace và teamspace cycles

**Files**:
- [teamspace-list.tsx](apps/web/ce/components/projects/teamspaces/teamspace-list.tsx) - Trả về `null`
- [teams-sidebar-list.tsx](apps/web/ce/components/workspace/sidebar/teams-sidebar-list.tsx) - Trả về `null`

**Trạng thái CE**: Hoàn toàn bị xóa khỏi UI

---

### 5. Project Templates (Mẫu Dự Án) - BUSINESS+

**Mô tả**: Lưu cài đặt dự án, workflows, automation thành templates

**Files**:
- [template-select.tsx](apps/web/ce/components/projects/create/template-select.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có tính năng template

---

### 6. Inbox/Intake Advanced Features - BUSINESS+

**Mô tả**: Tính năng intake nâng cao (email for intake, intake forms)

**Files**:
- [source-pill.tsx](apps/web/ce/components/inbox/source-pill.tsx) - Trả về `<></>`

**Trạng thái CE**: Chỉ có intake cơ bản

---

### 7. Cycle End Modal Features - PRO+

**Mô tả**: Tính năng kết thúc cycle nâng cao (auto-transfer incomplete items)

**Files**:
- [modal.tsx](apps/web/ce/components/cycles/end-cycle/modal.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có auto-transfer

---

### 8. Cycle Additional Actions - PRO+

**Mô tả**: Automation và các hành động nâng cao cho cycle

**Files**:
- [additional-actions.tsx](apps/web/ce/components/cycles/additional-actions.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có các hành động bổ sung

---

### 9. Cycle Analytics Sidebar - PRO+

**Mô tả**: Phân tích cycle với biểu đồ phân phối estimate và completion

**Files**:
- [base.tsx](apps/web/ce/components/cycles/analytics-sidebar/base.tsx)

**Trạng thái CE**: Chỉ có biểu đồ cơ bản (issue count vs points)

---

### 10. Workspace App Switcher - ENTERPRISE

**Mô tả**: Chuyển đổi giữa các ứng dụng workspace

**Files**:
- [app-switcher.tsx](apps/web/ce/components/sidebar/app-switcher.tsx) - Trả về `null`
- [app-switcher.tsx](apps/web/ce/components/workspace/app-switcher.tsx) - Trả về `<></>`

**Trạng thái CE**: Hoàn toàn bị vô hiệu hóa

---

### 11. Home Page Header Features

**Mô tả**: Các tính năng header trang chủ nâng cao

**Files**:
- [header.tsx](apps/web/ce/components/home/header.tsx) - Trả về `<></>`

**Trạng thái CE**: Bị vô hiệu hóa

---

## Các Tính Năng Bị Gate Trong Project Settings

### 1. Custom Automations (Automation Tùy Chỉnh) - PRO+

**Mô tả**: Tạo các workflow automation tùy chỉnh cho project

**Files**:
- [automations/root.tsx](apps/web/ce/components/automations/root.tsx) - Trả về `<></>`
- [automations/list/wrapper.tsx](apps/web/ce/components/automations/list/wrapper.tsx)

**Trạng thái CE**: Chỉ có Auto-Archive và Auto-Close cơ bản. Không có custom automations.

**Ghi chú**: Trong trang Project Settings > Automations:
- ✅ Auto-Archive Automation - CÓ trong CE
- ✅ Auto-Close Automation - CÓ trong CE
- ❌ Custom Automations - KHÔNG CÓ trong CE

---

### 2. Estimates - Time System (Hệ Thống Ước Lượng Thời Gian) - PRO+

**Mô tả**: Hệ thống estimate dựa trên thời gian (giờ)

**Files**:
- [estimates/helper.tsx](apps/web/ce/components/estimates/helper.tsx)
- [packages/constants/src/estimates.ts](packages/constants/src/estimates.ts) - `time.is_ee: true`

**Trạng thái CE**:
- ✅ Points System - CÓ trong CE
- ✅ Categories System - CÓ trong CE
- ❌ Time System - KHÔNG CÓ trong CE (đánh dấu `is_ee: true`)

---

### 3. Update/Edit Estimates - PRO+

**Mô tả**: Chỉnh sửa estimate đã tạo

**Files**:
- [estimates/update/modal.tsx](apps/web/ce/components/estimates/update/modal.tsx) - Trả về `<></>`

**Trạng thái CE**: Không thể chỉnh sửa estimate sau khi tạo

---

### 4. Delete Estimate Points - PRO+

**Mô tả**: Xóa các điểm estimate riêng lẻ

**Files**:
- [estimates/points/delete.tsx](apps/web/ce/components/estimates/points/delete.tsx) - Trả về `<></>`

**Trạng thái CE**: Không thể xóa estimate points

---

### 5. Project Templates - BUSINESS+

**Mô tả**: Chọn template khi tạo project mới

**Files**:
- [projects/create/template-select.tsx](apps/web/ce/components/projects/create/template-select.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có tính năng chọn template

---

### 6. Workflow Management - PRO+

**Mô tả**: Quản lý workflow và state transitions cho project

**Files**:
- [workflow/workflow-disabled-message.tsx](apps/web/ce/components/workflow/workflow-disabled-message.tsx) - Trả về `<></>`
- [workflow/workflow-disabled-overlay.tsx](apps/web/ce/components/workflow/workflow-disabled-overlay.tsx) - Trả về `<></>`
- [workflow/workflow-group-tree.tsx](apps/web/ce/components/workflow/workflow-group-tree.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có workflow management nâng cao

---

### 7. Teamspace trong Project - BUSINESS+

**Mô tả**: Liên kết project với teamspace

**Files**:
- [projects/teamspaces/teamspace-list.tsx](apps/web/ce/components/projects/teamspaces/teamspace-list.tsx) - Trả về `null`

**Trạng thái CE**: Không có teamspace functionality

---

## Các Tính Năng Bị Gate Trong Work Items (Issues)

### 1. Work Item Types (Loại Công Việc) - PRO+

**Mô tả**: Định nghĩa các loại work item tùy chỉnh (Bug, Feature, Task, etc.)

**Files**:
- [issues/issue-modal/issue-type-select.tsx](apps/web/ce/components/issues/issue-modal/issue-type-select.tsx) - Trả về `<></>`
- [issues/issue-details/issue-type-switcher.tsx](apps/web/ce/components/issues/issue-details/issue-type-switcher.tsx)
- [issues/filters/issue-types.tsx](apps/web/ce/components/issues/filters/issue-types.tsx) - Trả về `null`

**Trạng thái CE**: Không có work item types, tất cả issues đều cùng loại

---

### 2. Work Item Templates - PRO+

**Mô tả**: Sử dụng template khi tạo work item mới

**Files**:
- [issues/issue-modal/template-select.tsx](apps/web/ce/components/issues/issue-modal/template-select.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có work item templates

---

### 3. Custom Properties (Thuộc Tính Tùy Chỉnh) - PRO+

**Mô tả**: Thêm các thuộc tính tùy chỉnh cho work items

**Files**:
- [issues/issue-details/additional-properties.tsx](apps/web/ce/components/issues/issue-details/additional-properties.tsx) - Trả về `<></>`
- [issues/issue-layouts/additional-properties.tsx](apps/web/ce/components/issues/issue-layouts/additional-properties.tsx) - Trả về `<></>`
- [issues/issue-modal/modal-additional-properties.tsx](apps/web/ce/components/issues/issue-modal/modal-additional-properties.tsx) - Trả về `null`

**Trạng thái CE**: Không có custom properties

---

### 4. Worklogs & Time Tracking - PRO+

**Mô tả**: Theo dõi thời gian làm việc trên từng work item

**Files**:
- [issues/worklog/property/root.tsx](apps/web/ce/components/issues/worklog/property/root.tsx) - Trả về `<></>`
- [issues/worklog/activity/root.tsx](apps/web/ce/components/issues/worklog/activity/root.tsx) - Trả về `<></>`
- [issues/worklog/activity/worklog-create-button.tsx](apps/web/ce/components/issues/worklog/activity/worklog-create-button.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có worklog functionality

---

### 5. Bulk Operations - PRO+

**Mô tả**: Thao tác hàng loạt trên nhiều work items

**Files**:
- [issues/bulk-operations/root.tsx](apps/web/ce/components/issues/bulk-operations/root.tsx) - Hiển thị upgrade banner

**Trạng thái CE**: Hiển thị banner yêu cầu nâng cấp khi cố gắng sử dụng

---

### 6. Epics - PRO+

**Mô tả**: Tạo và quản lý Epic (công việc lớn chứa nhiều issues)

**Files**:
- [epics/epic-modal/modal.tsx](apps/web/ce/components/epics/epic-modal/modal.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có Epic functionality

---

### 7. De-Dupe (Phát Hiện Trùng Lặp) - PRO+

**Mô tả**: Phát hiện và xử lý work items trùng lặp

**Files**:
- [de-dupe/de-dupe-button.tsx](apps/web/ce/components/de-dupe/de-dupe-button.tsx) - Trả về `<></>`
- [de-dupe/duplicate-modal/root.tsx](apps/web/ce/components/de-dupe/duplicate-modal/root.tsx) - Trả về `<></>`
- [de-dupe/duplicate-popover/root.tsx](apps/web/ce/components/de-dupe/duplicate-popover/root.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có de-dupe functionality

---

### 8. Dependencies trong Gantt Chart - PRO+

**Mô tả**: Hiển thị và quản lý dependencies giữa các work items trong Gantt

**Files**:
- [gantt-chart/dependency/dependency-paths.tsx](apps/web/ce/components/gantt-chart/dependency/dependency-paths.tsx) - Trả về `<></>`
- [gantt-chart/dependency/draggable-dependency-path.tsx](apps/web/ce/components/gantt-chart/dependency/draggable-dependency-path.tsx) - Trả về `<></>`
- [gantt-chart/dependency/blockDraggables/left-draggable.tsx](apps/web/ce/components/gantt-chart/dependency/blockDraggables/left-draggable.tsx) - Trả về `<></>`
- [gantt-chart/dependency/blockDraggables/right-draggable.tsx](apps/web/ce/components/gantt-chart/dependency/blockDraggables/right-draggable.tsx) - Trả về `<></>`

**Trạng thái CE**: Gantt chart không hiển thị dependencies

---

## Các Tính Năng Bị Gate Trong Views

### 1. Publish Views - PRO+

**Mô tả**: Xuất bản view ra bên ngoài

**Files**:
- [views/publish/modal.tsx](apps/web/ce/components/views/publish/modal.tsx) - Trả về `<></>`

**Trạng thái CE**: Không thể publish views

---

### 2. View Access Controller - PRO+

**Mô tả**: Kiểm soát quyền truy cập cho views

**Files**:
- [views/access-controller.tsx](apps/web/ce/components/views/access-controller.tsx) - Trả về `<></>`
- [views/filters/access-filter.tsx](apps/web/ce/components/views/filters/access-filter.tsx) - Trả về `<></>`

**Trạng thái CE**: Không có access control cho views

---

### 3. Additional View Layouts - PRO+

**Mô tả**: Các layout bổ sung cho views

**Files**:
- [views/helper.tsx](apps/web/ce/components/views/helper.tsx) - Các function trả về `<></>`

**Trạng thái CE**: Chỉ có layouts cơ bản

---

## Các Tính Năng Bị Gate Trong Pages

### 1. Page Collaborators List - PRO+

**Mô tả**: Xem danh sách người cộng tác trên page

**Files**:
- [pages/header/collaborators-list.tsx](apps/web/ce/components/pages/header/collaborators-list.tsx) - Trả về `null`

**Trạng thái CE**: Không hiển thị collaborators

---

### 2. Share Page Control - PRO+

**Mô tả**: Chia sẻ page với người khác

**Files**:
- [pages/header/share-control.tsx](apps/web/ce/components/pages/header/share-control.tsx) - Trả về `null`

**Trạng thái CE**: Không có share functionality

---

### 3. Move Page - PRO+

**Mô tả**: Di chuyển page giữa các projects

**Files**:
- [pages/header/move-control.tsx](apps/web/ce/components/pages/header/move-control.tsx) - Trả về `null`
- [pages/modals/move-page-modal.tsx](apps/web/ce/components/pages/modals/move-page-modal.tsx) - Trả về `null`

**Trạng thái CE**: Không thể move pages

---

### 4. Page Assets Tab - PRO+

**Mô tả**: Tab quản lý assets trong page

**Files**:
- [pages/navigation-pane/tab-panels/assets.tsx](apps/web/ce/components/pages/navigation-pane/tab-panels/assets.tsx) - Trả về `null`

**Trạng thái CE**: Không có assets tab

---

## Bảng So Sánh Tính Năng Theo Plan (CE / Pro / Business)

### Tính Năng Bị Vô Hiệu Hóa Trong CE (Free)

| # | Tính Năng | Mô Tả | Có Trong Plan |
|---|-----------|-------|---------------|
| 1 | Bulk Operations | Thao tác hàng loạt | Pro+ |
| 2 | Time Tracking + Worklogs | Theo dõi thời gian | Pro+ |
| 3 | Active Cycles | Chu kỳ đang hoạt động | Pro+ |
| 4 | Work Item Types | Loại công việc tùy chỉnh | Pro+ |
| 5 | Custom Properties | Thuộc tính tùy chỉnh | Pro+ |
| 6 | Dependencies in Gantt | Phụ thuộc trong biểu đồ Gantt | Pro+ |
| 7 | Work Item Transfers | Chuyển công việc | Pro+ |
| 8 | Auto-transfer Cycle Items | Tự động chuyển items khi kết thúc cycle | Pro+ |
| 9 | Epics | Epic (công việc lớn) | Pro+ |
| 10 | Custom Automations | Automation tùy chỉnh | Pro+ |
| 11 | Workflow Management | Quản lý workflow nâng cao | Pro+ |
| 12 | Time Estimate System | Hệ thống estimate theo thời gian | Pro+ |
| 13 | Edit/Delete Estimates | Chỉnh sửa/xóa estimates | Pro+ |
| 14 | Work Item Templates | Mẫu work item | Pro+ |
| 15 | De-Dupe Detection | Phát hiện trùng lặp | Pro+ |
| 16 | Publish Views | Xuất bản view | Pro+ |
| 17 | View Access Control | Kiểm soát quyền truy cập view | Pro+ |
| 18 | Page Sharing | Chia sẻ page | Pro+ |
| 19 | Move Pages | Di chuyển page giữa projects | Pro+ |
| 20 | Page Assets | Quản lý assets trong page | Pro+ |
| 21 | Teamspaces | Không gian nhóm | Business |
| 22 | Teamspace Cycles | Cycle cho teamspace | Business |
| 23 | Project Templates | Mẫu dự án | Business |
| 24 | Baselines And Deviations | Baseline và độ lệch | Business |
| 25 | Intake Assignees | Người được gán trong intake | Business |
| 26 | Custom SLAs | SLA tùy chỉnh | Business |
| 27 | Intake Forms | Form intake | Business |
| 28 | Emails For Intake | Email cho intake | Business |
| 29 | Advanced Pages Analytics | Phân tích trang nâng cao | Business |
| 30 | Custom Reports | Báo cáo tùy chỉnh | Business |

---

### Chi Tiết Theo Từng Plan

#### CE (Free) - Các Tính Năng CÓ SẴN
- ✅ Projects cơ bản
- ✅ Work Items (Issues) cơ bản
- ✅ Cycles cơ bản
- ✅ Modules cơ bản
- ✅ Views cơ bản (List, Board, Calendar, Spreadsheet, Gantt)
- ✅ Pages cơ bản
- ✅ Intake cơ bản
- ✅ Auto-Archive Automation
- ✅ Auto-Close Automation
- ✅ Estimates: Points & Categories system
- ✅ Labels, States, Members management

#### PRO Plan - Thêm So Với CE
- ✅ Bulk Operations
- ✅ Time Tracking + Worklogs
- ✅ Active Cycles
- ✅ Work Item Types
- ✅ Custom Properties (project-level)
- ✅ Dependencies in Gantt
- ✅ Work Item Transfers
- ✅ Auto-transfer Cycle Items
- ✅ Epics
- ✅ Custom Automations
- ✅ Workflow Management
- ✅ Time Estimate System
- ✅ Edit/Delete Estimates
- ✅ Work Item Templates
- ✅ De-Dupe Detection
- ✅ Publish Views
- ✅ View Access Control
- ✅ Page Sharing
- ✅ Move Pages
- ✅ Page Assets/Collaborators

#### BUSINESS Plan - Thêm So Với Pro
- ✅ Teamspaces
- ✅ Teamspace Cycles
- ✅ Project Templates
- ✅ Baselines And Deviations
- ✅ Intake Assignees
- ✅ Custom SLAs
- ✅ Intake Forms
- ✅ Emails For Intake
- ✅ Advanced Pages Analytics
- ✅ Custom Reports
- ✅ Custom Properties (workspace-level)

---

## UI Components Liên Quan Đến Gating

### Upgrade Badge Component
**File**: [upgrade-badge.tsx](apps/web/ce/components/workspace/upgrade-badge.tsx)

Hiển thị badge "Pro" trong UI cho các tính năng chỉ có ở Pro.

### Upgrade Modal
**File**: [upgrade-modal.tsx](apps/web/ce/components/license/modal/upgrade-modal.tsx)

Hiển thị so sánh giá giữa Free, Pro, Business, Enterprise.

---

## Backend - License Module

### Instance Model
**File**: [instance.py](apps/api/plane/license/models/instance.py)

- Field `edition`: Lưu trữ edition (CE chỉ có `PLANE_COMMUNITY`)
- Theo dõi trạng thái xác minh, hoàn thành setup

### Cấu Trúc License Module
**Path**: `apps/api/plane/license/`

```
license/
├── management/commands/
│   ├── register_instance.py
│   └── configure_instance.py
├── utils/
│   └── instance value retrieval
└── migrations/
```

---

## Subscription Types (Enum)

```typescript
enum EProductSubscriptionEnum {
  FREE = "FREE",      // CE - Community Edition
  PRO = "PRO",        // Pro Plan
  BUSINESS = "BUSINESS" // Business Plan
}
```

---

## Files Cấu Hình Quan Trọng

| File | Mô Tả |
|------|-------|
| [subscription.ts](packages/constants/src/subscription.ts) | Định nghĩa danh sách tính năng cho từng plan |
| [payment.ts](packages/constants/src/payment.ts) | Cấu hình pricing, URLs |
| [plans.tsx](apps/web/ce/components/license/modal/plans.tsx) | UI so sánh plans |

---

## Ghi Chú

- Tất cả các tính năng bị gate đều được đánh dấu rõ ràng trong các component CE
- Không thể truy cập các tính năng này mà không nâng cấp lên plan trả phí
- Cơ chế gating được thực hiện ở cả frontend (empty components) và backend (license checks)

---

# PHẦN 2: ĐÁNH GIÁ KHẢ NĂNG IMPLEMENT

## Tổng Quan Kiến Trúc EE/CE

### Cấu trúc thư mục:
```
apps/web/
├── ce/              # Community Edition (base - empty stubs)
├── ee/              # Enterprise Edition (full implementation)
└── core/            # Shared implementation

apps/api/
├── plane/db/models/ # Database models
├── plane/app/views/ # API endpoints
└── plane/license/   # License checking
```

### Phát hiện quan trọng:
- **Hầu hết EE files chỉ là wrappers** re-export từ CE (không chứa logic riêng)
- Logic thực sự nằm trong `core/` components
- CE components trả về empty (`<></>` hoặc `null`) để ẩn UI
- Backend models **đã tồn tại** cho nhiều tính năng

---

## Bảng Đánh Giá Chi Tiết Khả Năng Implement

### Chú thích:
- 🟢 **DỄ**: 1-3 ngày, chỉ cần bật UI
- 🟡 **TRUNG BÌNH**: 1-2 tuần, cần thêm logic
- 🔴 **KHÓ**: 2-4 tuần, cần model mới hoặc service bên ngoài
- ⚫ **RẤT KHÓ**: > 1 tháng, cần infrastructure mới

| # | Tính năng | Độ khó | Frontend | Backend | DB Migration | External Service | Rủi ro | Ghi chú |
|---|-----------|--------|----------|---------|--------------|------------------|--------|---------|
| **PRO FEATURES** |
| 1 | Work Item Types | 🟢 DỄ | Bật component | Model `IssueType` đã có | ❌ Không cần | ❌ Không | Thấp | Model có sẵn, chỉ cần bật UI toggle |
| 2 | Edit/Delete Estimates | 🟢 DỄ | Bật modal + buttons | API đã có | ❌ Không cần | ❌ Không | Thấp | Logic có sẵn trong core |
| 3 | Time Estimate System | 🟢 DỄ | Đổi `is_ee: false` | Đã support | ❌ Không cần | ❌ Không | Thấp | Chỉ cần đổi 1 flag |
| 4 | Active Cycles | 🟢 DỄ | Xóa UpgradeBadge | Đã có endpoint | ❌ Không cần | ❌ Không | Thấp | Chỉ cần bỏ badge |
| 5 | Bulk Operations | 🟡 TB | Bật component | Batch endpoints cần review | ❌ Không cần | ❌ Không | TB | Cần test kỹ performance |
| 6 | Epics | 🟡 TB | Modal + Timeline UI | Model có (`is_epic` flag) | ❌ Không cần | ❌ Không | TB | Cần implement timeline view |
| 7 | Dependencies Gantt | 🟡 TB | SVG paths + drag | Issue relations có sẵn | ❌ Không cần | ❌ Không | TB | UI phức tạp (drag & drop) |
| 8 | Custom Properties | 🟡 TB | Form builder UI | ⚠️ Cần thêm model | ✅ Cần migration | ❌ Không | TB-Cao | Cần thiết kế schema linh hoạt |
| 9 | Time Tracking/Worklogs | 🔴 KHÓ | Full UI mới | ⚠️ Model `Worklog` thiếu | ✅ Cần migration | ❌ Không | Cao | Cần model + API + UI hoàn chỉnh |
| 10 | Custom Automations | 🔴 KHÓ | Rule builder UI | Automation engine | ✅ Cần migration | ❌ Không | Cao | Cần rule engine + task execution |
| 11 | Workflow Management | 🔴 KHÓ | State transition UI | State machine logic | ✅ Có thể cần | ❌ Không | Cao | Complex state transitions |
| 12 | Work Item Templates | 🟡 TB | Template picker | ⚠️ Model thiếu | ✅ Cần migration | ❌ Không | TB | Cần model `IssueTemplate` |
| 13 | De-Dupe Detection | 🔴 KHÓ | Matching UI | Similarity algorithm | ❌ Không cần | ⚠️ Có thể cần AI | Cao | Cần algorithm phát hiện trùng |
| 14 | Publish Views | 🟡 TB | Modal + public URL | Public access logic | ❌ Không cần | ❌ Không | TB | Cần generate public links |
| 15 | View Access Control | 🟡 TB | Permission UI | Permission checks | ❌ Không cần | ❌ Không | TB | Extend existing permission system |
| 16 | Page Sharing | 🟡 TB | Share modal | Share links | ❌ Không cần | ❌ Không | TB | Tương tự Publish Views |
| 17 | Move Pages | 🟢 DỄ | Modal | API đã có | ❌ Không cần | ❌ Không | Thấp | Chỉ update project_id |
| 18 | Page Collaborators | 🟢 DỄ | List component | Hocuspocus có sẵn | ❌ Không cần | ❌ Không | Thấp | Real-time đã có |
| 19 | Page Assets | 🟡 TB | Assets panel | FileAsset model có | ❌ Không cần | ✅ S3 storage | TB | Cần S3 config |
| 20 | Auto-transfer Cycle | 🟡 TB | Modal options | Celery task | ❌ Không cần | ❌ Không | TB | Background job |
| **BUSINESS FEATURES** |
| 21 | Teamspaces | 🟡 TB | Full UI section | Model `Team` đã có | ❌ Không cần | ❌ Không | TB | Model có, cần permission wiring |
| 22 | Teamspace Cycles | 🟡 TB | Extend Cycles UI | Extend Cycle model | ⚠️ Có thể cần | ❌ Không | TB | Link Team với Cycle |
| 23 | Project Templates | 🔴 KHÓ | Template builder | ⚠️ Model thiếu | ✅ Cần migration | ❌ Không | Cao | Cần model `ProjectTemplate` |
| 24 | Baselines & Deviations | 🔴 KHÓ | Timeline comparison | Snapshot storage | ✅ Cần migration | ❌ Không | Cao | Cần lưu trữ snapshot dữ liệu |
| 25 | Intake Assignees | 🟢 DỄ | Dropdown | Extend Intake model | ⚠️ Có thể cần | ❌ Không | Thấp | Thêm field vào model |
| 26 | Custom SLAs | 🔴 KHÓ | SLA config UI | ⚠️ Model thiếu | ✅ Cần migration | ❌ Không | Cao | Cần model + monitoring |
| 27 | Intake Forms | 🔴 KHÓ | Form builder | Form model | ✅ Cần migration | ❌ Không | Cao | Dynamic form engine |
| 28 | Emails For Intake | ⚫ RẤT KHÓ | Email config UI | Email parsing | ✅ Cần migration | ✅ SMTP + Webhooks | Rất cao | Cần email infrastructure |
| 29 | Advanced Analytics | 🔴 KHÓ | Charts + dashboards | Analytics queries | ❌ Không cần | ❌ Không | Cao | Complex aggregations |
| 30 | Custom Reports | 🔴 KHÓ | Report builder | Query builder | ⚠️ Có thể cần | ❌ Không | Cao | Dynamic query generation |

---

## Phân Nhóm Theo Độ Ưu Tiên Implement

### 🎯 Nhóm 1: Quick Wins (1-3 ngày mỗi tính năng)
*Chỉ cần bật UI, không cần backend changes*

| Tính năng | Effort | Impact | ROI |
|-----------|--------|--------|-----|
| Work Item Types | 1 ngày | Cao | ⭐⭐⭐⭐⭐ |
| Edit/Delete Estimates | 1 ngày | TB | ⭐⭐⭐⭐ |
| Time Estimate System | 0.5 ngày | TB | ⭐⭐⭐⭐⭐ |
| Active Cycles | 0.5 ngày | TB | ⭐⭐⭐⭐⭐ |
| Move Pages | 1 ngày | Thấp | ⭐⭐⭐ |
| Page Collaborators | 1 ngày | TB | ⭐⭐⭐⭐ |
| Intake Assignees | 1 ngày | Thấp | ⭐⭐⭐ |

**Tổng: ~7 ngày cho 7 tính năng**

---

### 🎯 Nhóm 2: Medium Effort (1-2 tuần mỗi tính năng)
*Cần thêm logic nhưng không cần model mới*

| Tính năng | Effort | Dependencies | Notes |
|-----------|--------|--------------|-------|
| Bulk Operations | 1 tuần | Batch API review | Test performance với dataset lớn |
| Epics | 1.5 tuần | Timeline component | Reuse existing issue model |
| Dependencies Gantt | 1.5 tuần | SVG rendering | Complex drag-drop UI |
| Publish Views | 1 tuần | Public route | Generate secure public links |
| View Access Control | 1 tuần | Permission system | Extend existing permissions |
| Page Sharing | 1 tuần | Share links | Similar to Publish Views |
| Page Assets | 1 tuần | S3 config | File upload system |
| Auto-transfer Cycle | 1 tuần | Celery | Background job |
| Teamspaces | 1.5 tuần | Permission wiring | Team model exists |
| Teamspace Cycles | 1 tuần | Team-Cycle link | Extend cycle model |

**Tổng: ~12 tuần cho 10 tính năng**

---

### 🎯 Nhóm 3: High Effort (2-4 tuần mỗi tính năng)
*Cần database migration và/hoặc model mới*

| Tính năng | Effort | Cần Model Mới | Migration Risk |
|-----------|--------|---------------|----------------|
| Custom Properties | 2 tuần | `CustomProperty`, `PropertyValue` | TB - Schema linh hoạt |
| Time Tracking/Worklogs | 3 tuần | `Worklog`, `Timesheet` | TB - Model hoàn toàn mới |
| Work Item Templates | 2 tuần | `IssueTemplate` | Thấp |
| Custom Automations | 3 tuần | `Automation`, `AutomationRule` | Cao - Rule engine |
| Workflow Management | 3 tuần | `StateTransition` (có thể) | Cao - State machine |
| Project Templates | 2.5 tuần | `ProjectTemplate` | TB |
| Custom SLAs | 2.5 tuần | `SLAConfig`, `SLAMetric` | TB |
| Baselines & Deviations | 3 tuần | `Baseline`, `Snapshot` | Cao - Data duplication |
| Advanced Analytics | 2 tuần | Không | TB - Query optimization |
| Custom Reports | 3 tuần | `Report`, `ReportConfig` | TB |

**Tổng: ~26 tuần cho 10 tính năng**

---

### 🎯 Nhóm 4: Very High Effort (> 1 tháng)
*Cần external services hoặc infrastructure mới*

| Tính năng | Effort | External Dependencies | Risk |
|-----------|--------|----------------------|------|
| Intake Forms | 4 tuần | Không | Cao - Form engine |
| De-Dupe Detection | 4 tuần | AI/ML (optional) | Cao - Algorithm |
| Emails For Intake | 6+ tuần | SMTP, Email webhooks, Parser | Rất cao |

**Tổng: ~14+ tuần cho 3 tính năng**

---

## Rủi Ro Và Cân Nhắc

### 🔴 Rủi Ro Cao

| Rủi ro | Tính năng bị ảnh hưởng | Giải pháp |
|--------|------------------------|-----------|
| **License violation** | Tất cả | Review kỹ license của Plane (AGPL-3.0) |
| **Breaking changes** | Custom Properties, Worklogs | Versioned migrations, backward compatible API |
| **Performance** | Bulk Ops, Analytics | Load testing, query optimization |
| **Security** | View Publishing, Page Sharing | Audit public access logic |
| **Data integrity** | Automations, Workflows | Transaction handling, rollback |

### 🟡 Rủi Ro Trung Bình

| Rủi ro | Tính năng bị ảnh hưởng | Giải pháp |
|--------|------------------------|-----------|
| **UI/UX complexity** | Epics Timeline, Gantt Dependencies | Incremental delivery |
| **External service config** | Page Assets, Email Intake | Optional features với graceful fallback |
| **Upgrade path** | All new models | Clear migration scripts |

### 🟢 Rủi Ro Thấp

| Rủi ro | Tính năng bị ảnh hưởng | Giải pháp |
|--------|------------------------|-----------|
| **Simple UI toggles** | Active Cycles, Estimates | Feature flags |
| **Existing infrastructure** | Move Pages, Collaborators | Leverage existing code |

---

## Database Models Cần Tạo Mới

```python
# Ước tính các models cần thêm

# 1. Time Tracking
class Worklog(BaseModel):
    issue = ForeignKey(Issue)
    user = ForeignKey(User)
    time_spent = IntegerField()  # minutes
    logged_at = DateTimeField()
    description = TextField()

# 2. Custom Properties
class CustomProperty(BaseModel):
    project = ForeignKey(Project)
    name = CharField()
    property_type = CharField()  # text, number, date, select, multi-select
    options = JSONField()  # for select types

class IssuePropertyValue(BaseModel):
    issue = ForeignKey(Issue)
    property = ForeignKey(CustomProperty)
    value = JSONField()

# 3. Templates
class IssueTemplate(BaseModel):
    project = ForeignKey(Project)
    name = CharField()
    template_data = JSONField()

class ProjectTemplate(BaseModel):
    workspace = ForeignKey(Workspace)
    name = CharField()
    template_data = JSONField()

# 4. Automations
class Automation(BaseModel):
    project = ForeignKey(Project)
    name = CharField()
    trigger_type = CharField()
    conditions = JSONField()
    actions = JSONField()
    is_active = BooleanField()

# 5. SLA
class SLAConfig(BaseModel):
    project = ForeignKey(Project)
    name = CharField()
    response_time = IntegerField()  # minutes
    resolution_time = IntegerField()
    conditions = JSONField()
```

---

## Đề Xuất Roadmap Implement

### Phase 1: Quick Wins (1-2 tuần)
```
Week 1-2:
├── Work Item Types ✓
├── Edit/Delete Estimates ✓
├── Time Estimate System ✓
├── Active Cycles ✓
├── Move Pages ✓
├── Page Collaborators ✓
└── Intake Assignees ✓
```

### Phase 2: Core Pro Features (4-6 tuần)
```
Week 3-4:
├── Bulk Operations
├── Epics (basic)
└── Publish Views

Week 5-6:
├── View Access Control
├── Page Sharing
└── Auto-transfer Cycle
```

### Phase 3: Advanced Pro Features (6-8 tuần)
```
Week 7-9:
├── Dependencies Gantt
├── Custom Properties (với migration)
└── Page Assets

Week 10-12:
├── Time Tracking/Worklogs
├── Work Item Templates
└── Workflow Management (basic)
```

### Phase 4: Business Features (8-12 tuần)
```
Week 13-16:
├── Teamspaces
├── Teamspace Cycles
├── Project Templates
└── Custom Automations

Week 17-20:
├── Custom SLAs
├── Advanced Analytics
├── Custom Reports
└── Baselines (basic)
```

### Phase 5: Advanced Business (8+ tuần)
```
Week 21+:
├── Intake Forms
├── De-Dupe Detection
├── Emails For Intake
└── Full Workflow Management
```

---

## Tổng Kết

| Metric | Giá trị |
|--------|---------|
| **Tổng số tính năng** | 30 |
| **Quick Wins** | 7 tính năng (~1-2 tuần) |
| **Medium Effort** | 10 tính năng (~12 tuần) |
| **High Effort** | 10 tính năng (~26 tuần) |
| **Very High Effort** | 3 tính năng (~14+ tuần) |
| **Tổng thời gian ước tính** | ~53+ tuần (full implementation) |
| **Database migrations cần** | ~5-8 models mới |
| **External services** | S3 (có), SMTP (cần setup), AI (optional) |

### Khuyến nghị:
1. **Bắt đầu với Quick Wins** để có kết quả nhanh
2. **Ưu tiên các tính năng không cần migration** trước
3. **Test kỹ trên staging** trước khi deploy migration
4. **Kiểm tra license AGPL-3.0** của Plane trước khi distribute
5. **Document mọi thay đổi** để dễ maintain
