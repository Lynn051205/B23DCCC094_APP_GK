# Study Planner — Quản lý học tập online/offline

Ứng dụng React Native quản lý môn học, lịch học, bài tập, hồ sơ và kết quả học tập. Ứng dụng có 5 Bottom Tabs, mỗi tab dùng Native Stack riêng. Dữ liệu online lấy qua service/API client; AsyncStorage giữ cache và outbox để xem dữ liệu, ghi nhận thao tác khi mất mạng và tự đồng bộ lại.

## Công nghệ và trạng thái project

- React Native CLI 0.87, React 19 và TypeScript.
- React Navigation Bottom Tabs + Native Stack.
- `json-server@0.17.4` làm REST API giả lập.
- Fetch qua API client chung; timeout mỗi request 10 giây.
- AsyncStorage cho cache và hàng đợi outbox.
- `@react-native-community/netinfo` theo dõi kết nối.
- Jest, React Native Testing Library chưa được cài; kiểm thử hiện dùng Jest đang có.

> Project này **chưa được cấu hình Expo** (không có dependency `expo`/`app.json`). Vì yêu cầu giữ nguyên project, hướng dẫn chạy bên dưới dùng React Native CLI. `npx expo start` hiện không phải lệnh chạy ứng dụng này.

## Cài đặt và khởi chạy

Yêu cầu Node.js `>=22.11.0`, Android Studio/Android SDK cho Android. Với iOS cần macOS và Xcode.

```sh
npm install
```

Mở terminal thứ nhất tại thư mục project để chạy API:

```sh
npm run api
```

Lệnh tương đương:

```sh
npx json-server --watch db.json --host 0.0.0.0 --port 3000 --delay 800
```

Mở terminal thứ hai để chạy Metro và app:

```sh
npm start
npm run android
```

Trên macOS có thể chạy `npm run ios`; sau khi thêm native dependency, chạy `cd ios && pod install` trước khi build iOS. Sau khi thêm NetInfo, Android cần build lại native app (không chỉ reload Metro).

## Cấu hình BASE_URL

Chỉnh một nơi duy nhất trong `src/api/config.ts`:

- Android Emulator mặc định: `http://10.0.2.2:3000`.
- iOS Simulator mặc định: `http://localhost:3000`.
- Thiết bị thật: thay host bằng IP LAN của máy chạy json-server, ví dụ `http://192.168.1.10:3000`; thiết bị và máy tính cần cùng mạng, firewall cho phép cổng 3000.

## API

| Method | Endpoint | Mục đích |
|---|---|---|
| GET, PATCH | `/students/1` | Đọc/cập nhật hồ sơ sinh viên |
| GET | `/courses`, `/courses/:id` | Danh sách/chi tiết môn học |
| GET | `/sessions?_expand=course` | Lịch học kèm môn |
| GET | `/assignments?_expand=course&_sort=dueDate` | Bài tập kèm môn, sắp hạn nộp |
| PATCH | `/assignments/:id` | Cập nhật trạng thái bài tập |
| POST | `/assignments` | Tạo bài tập |
| GET | `/grades?_expand=course` | Điểm kèm môn |

Tất cả request đi qua `src/api/client.ts`, lỗi chuẩn hóa thành `{ type, status, message }`. `type` gồm `network`, `timeout`, `http`.

## Cấu trúc liên quan

```text
db.json
src/
  api/                 # BASE_URL, kiểu dữ liệu, API client
  components/          # UI dùng chung, OfflineBanner
  hooks/               # useNetworkStatus, useSyncQueue
  navigation/          # 5 tab, mỗi tab có stack
  screens/             # màn hình học tập
  services/            # service API và syncService
  state/               # AppDataContext: dữ liệu/UI dùng chung
  storage/             # cache và outbox AsyncStorage
  utils/               # tính điểm, kiểm tra ngày
__tests__/             # Jest: UI cơ bản, cache, outbox, sync, GPA
```

## Online, cache và offline

- Mỗi resource có cache key riêng và envelope `{ data, savedAt }`. Khi mở app, cache được nạp trước rồi API được gọi nếu có mạng; dữ liệu API mới thay thế UI/cache. Cache JSON/schema không hợp lệ bị bỏ và tải lại từ API.
- Khi offline, app giữ dữ liệu đã nạp/cache; nếu chưa có cache, màn hình báo lỗi cùng nút thử lại.
- OfflineBanner hiển thị trạng thái offline, số thao tác chờ, tình trạng sync/lỗi; các danh sách hiển thị thời điểm cập nhật cache gần nhất.
- Outbox giữ action `{ id, method, url, body, createdAt }` cho PATCH assignment, POST assignment và PATCH student. Action được lưu tuần tự trong AsyncStorage và áp dụng optimistic vào UI/cache.
- Khi mạng trở lại hoặc app khởi động, hook sync lấy action theo thứ tự thời gian, gửi tuần tự, chỉ xóa khi server xác nhận hoặc action được giải quyết theo server-wins. Lỗi dừng hàng đợi tại action đó; action thất bại và các action sau vẫn được giữ để thử lại.
- Với PATCH, sync GET bản ghi server trước. Nếu `updatedAt` hợp lệ trên server mới hơn `createdAt` của action, server thắng; action được đánh dấu đã xử lý, sau đó refresh API cập nhật UI/cache.
- Với POST assignment, body có `clientRequestId`. Trước khi POST lại, client truy vấn `/assignments?clientRequestId=...` để tránh tạo trùng nếu lần trước server đã tạo record nhưng client timeout. json-server không cung cấp idempotency key/transaction; nếu request đầu còn đang xử lý và truy vấn kiểm tra chạy trước khi record xuất hiện, vẫn có cửa sổ hiếm có thể tạo trùng. Đây là giảm rủi ro, không phải bảo đảm exactly-once.
- `updatedAt` đã có trên student và assignment trong `db.json`; app cập nhật trường này cùng action.

### Data flow

```text
Online read:
Screen -> AppDataContext -> service -> API client -> json-server
                     \-> AsyncStorage cache (data + savedAt)

Offline read/write:
AsyncStorage cache -> AppDataContext -> Screen + OfflineBanner
Screen action -> optimistic Context/UI -> AsyncStorage outbox
NetInfo online -> useSyncQueue -> ordered outbox -> service/API client -> json-server
                                                    \-> refresh Context/cache
```

## Test và kiểm tra

```sh
npx tsc --noEmit
npm run lint -- --no-cache
npm test -- --runInBand
```

Checklist bảy kịch bản:

1. **Lần đầu, server tắt:** xoá app data/cache hoặc dùng cài đặt sạch, dừng json-server, mở app. Màn hình không crash; danh sách không tải được và có nút thử lại.
2. **Cache + máy bay:** bật API khi có mạng để cache được tạo; bật airplane mode. Kiểm tra danh sách vẫn hiện, OfflineBanner và thời gian `savedAt`.
3. **Ghi offline:** khi airplane mode, đánh dấu hai bài tập hoàn thành và tạo một bài tập. Banner phải báo ba thao tác chờ; đóng/mở app để xác nhận UI/outbox vẫn giữ.
4. **Đồng bộ lại:** tắt airplane mode và chờ banner báo đồng bộ; xác nhận số chờ giảm về 0 và kiểm tra các record trong `db.json`/GET API.
5. **Server-wins:** tạo PATCH action offline, sửa cùng record phía server với `updatedAt` muộn hơn `createdAt` của action, kết nối lại; giá trị server phải được giữ, action xung đột được loại sau khi xử lý.
6. **Tìm kiếm/lọc rỗng:** nhập từ khóa không khớp môn học hoặc chọn bộ lọc bài tập không có phần tử; empty state phù hợp, không crash.
7. **Pull-to-refresh:** kéo làm mới khi online sau khi thay đổi dữ liệu server; UI và cache cập nhật, thời gian cập nhật thay đổi.

## Demo 3–5 phút

1. Chạy `npm run api`, sau đó mở app để xem dữ liệu từ server.
2. Tắt mạng/airplane mode; cho xem cache và OfflineBanner.
3. Hoàn thành hai bài tập, tạo bài tập mới hoặc sửa hồ sơ; xác nhận số action chờ.
4. Khởi động lại app khi vẫn offline để trình diễn dữ liệu/outbox được lưu bền.
5. Bật mạng, đợi thông báo `Đã đồng bộ N thay đổi`; kiểm tra danh sách và API/`db.json`.
6. (Tuỳ chọn) tạo conflict bằng cách sửa `updatedAt` trên server mới hơn trước khi reconnect; xác nhận server-wins.

## Giới hạn đã biết

- Chạy Expo chưa được hỗ trợ; đây là app React Native CLI hiện hữu.
- Chưa xác minh build trên emulator/thiết bị thật trong môi trường này. Máy Windows không thể chạy Xcode/iOS simulator.
- `json-server` chỉ phù hợp demo/local; không có xác thực, idempotency key phía server, transaction hay kiểm soát conflict nguyên tử.
- Nếu AsyncStorage gặp lỗi hệ thống, app hiển thị lỗi; không thể đảm bảo lưu offline khi hệ điều hành từ chối ghi.
- Thao tác sync thất bại được giữ lại và thử lại khi có lần kết nối lại hoặc app mở lại; không tự retry liên tục để tránh gửi lặp.
