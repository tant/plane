
## Bảng Đánh Giá Chi Tiết Khả Năng Implement

### Chú thích:
- 🟢 **DỄ**: 1-3 ngày, chỉ cần bật UI
- 🟡 **TRUNG BÌNH**: 1-2 tuần, cần thêm logic
- 🔴 **KHÓ**: 2-4 tuần, cần model mới hoặc service bên ngoài
- ⚫ **RẤT KHÓ**: > 1 tháng, cần infrastructure mới

| # | Tính năng | Độ khó | Frontend | Backend | DB Migration | External Service | Rủi ro | Triển khai | Ghi chú |
|---|-----------|--------|----------|---------|--------------|------------------|--------|------------|---------|
| **PRO FEATURES** |
| 1 | Work Item Types | 🟢 DỄ | Bật component | Model `IssueType` đã có | ❌ Không cần | ❌ Không | Thấp | ✅ Xong | Đã implement: Store, Service, UI (Select, Filter, Switcher) với checkmark icon |
| 2 | Edit/Delete Estimates | 🟢 DỄ | Bật modal + buttons | API đã có | ❌ Không cần | ❌ Không | Thấp | ⏳ Chưa | Logic có sẵn trong core |
| 3 | Time Estimate System | 🟢 DỄ | Đổi `is_ee: false` | Đã support | ❌ Không cần | ❌ Không | Thấp | ✅ Xong | Đã đổi flag trong issue-properties.constant.ts |
| 4 | Active Cycles | 🟢 DỄ | Xóa UpgradeBadge | Đã có endpoint | ❌ Không cần | ❌ Không | Thấp | ✅ Xong | Đã xóa upgrade page, bật tính năng |
| 5 | Move Pages | 🟢 DỄ | Modal | API đã có | ❌ Không cần | ❌ Không | Thấp | ⏳ Chưa | Chỉ update project_id |
| 6 | Page Collaborators | 🟢 DỄ | List component | Hocuspocus có sẵn | ❌ Không cần | ❌ Không | Thấp | ⏳ Chưa | Real-time đã có |
| 7 | Epics | 🟡 TB | Modal + Timeline UI | Model có (`is_epic` flag) | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Cần implement timeline view |
| 8 | Dependencies Gantt | 🟡 TB | SVG paths + drag | Issue relations có sẵn | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | UI phức tạp (drag & drop) |
| 9 | Publish Views | 🟡 TB | Modal + public URL | Public access logic | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Cần generate public links |
| 10 | View Access Control | 🟡 TB | Permission UI | Permission checks | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Extend existing permission system |
| 11 | Page Sharing | 🟡 TB | Share modal | Share links | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Tương tự Publish Views |
| 12 | Page Assets | 🟡 TB | Assets panel | FileAsset model có | ❌ Không cần | ✅ S3 storage | TB | ⏳ Chưa | Cần S3 config |
| 13 | Auto-transfer Cycle | 🟡 TB | Modal options | Celery task | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Background job |
| 14 | Time Tracking/Worklogs | 🔴 KHÓ | Full UI mới | ⚠️ Model `Worklog` thiếu | ✅ Cần migration | ❌ Không | Cao | ⏳ Chưa | Cần model + API + UI hoàn chỉnh |
| 15 | De-Dupe Detection | 🔴 KHÓ | Matching UI | Similarity algorithm | ❌ Không cần | ⚠️ Có thể cần AI | Cao | ⏳ Chưa | Cần algorithm phát hiện trùng |
| **BUSINESS FEATURES** |
| 16 | Teamspaces | 🟡 TB | Full UI section | Model `Team` đã có | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Model có, cần permission wiring |
| 17 | Teamspace Cycles | 🟡 TB | Extend Cycles UI | Extend Cycle model | ⚠️ Có thể cần | ❌ Không | TB | ⏳ Chưa | Link Team với Cycle |
| 18 | Project Templates | 🔴 KHÓ | Template builder | ⚠️ Model thiếu | ✅ Cần migration | ❌ Không | Cao | ⏳ Chưa | Cần model `ProjectTemplate` |
| 19 | Baselines & Deviations | 🔴 KHÓ | Timeline comparison | Snapshot storage | ✅ Cần migration | ❌ Không | Cao | ⏳ Chưa | Cần lưu trữ snapshot dữ liệu |
| 20 | Custom SLAs | 🔴 KHÓ | SLA config UI | ⚠️ Model thiếu | ✅ Cần migration | ❌ Không | Cao | ⏳ Chưa | Cần model + monitoring |
| 21 | Advanced Analytics | 🔴 KHÓ | Charts + dashboards | Analytics queries | ❌ Không cần | ❌ Không | Cao | ⏳ Chưa | Complex aggregations |
| 22 | Emails For Intake | ⚫ RẤT KHÓ | Email config UI | Email parsing | ✅ Cần migration | ✅ SMTP + Webhooks | Rất cao | ⏳ Chưa | Cần email infrastructure |
| **ĐỂ SAU (KHÔNG CẦN NGAY)** |
| 23 | Bulk Operations | 🟡 TB | Bật component | Batch endpoints cần review | ❌ Không cần | ❌ Không | TB | ⏳ Chưa | Cần test kỹ performance |
| 24 | Custom Properties | 🟡 TB | Form builder UI | ⚠️ Cần thêm model | ✅ Cần migration | ❌ Không | TB-Cao | ⏳ Chưa | Cần thiết kế schema linh hoạt |
| 25 | Work Item Templates | 🟡 TB | Template picker | ⚠️ Model thiếu | ✅ Cần migration | ❌ Không | TB | ⏳ Chưa | Cần model `IssueTemplate` |
| 26 | Intake Assignees | 🟢 DỄ | Dropdown | Extend Intake model | ⚠️ Có thể cần | ❌ Không | Thấp | ⏳ Chưa | Thêm field vào model |
| 27 | Intake Forms | 🔴 KHÓ | Form builder | Form model | ✅ Cần migration | ❌ Không | Cao | ⏳ Chưa | Dynamic form engine |
| 28 | Custom Automations | 🔴 KHÓ | Rule builder UI | Automation engine | ✅ Cần migration | ❌ Không | Cao | ⏳ Chưa | Cần rule engine + task execution |
| 29 | Workflow Management | 🔴 KHÓ | State transition UI | State machine logic | ✅ Có thể cần | ❌ Không | Cao | ⏳ Chưa | Complex state transitions |
| 30 | Custom Reports | 🔴 KHÓ | Report builder | Query builder | ⚠️ Có thể cần | ❌ Không | Cao | ⏳ Chưa | Dynamic query generation |

---

