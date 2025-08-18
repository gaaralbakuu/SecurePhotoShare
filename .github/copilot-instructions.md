# Hướng dẫn cho GitHub Copilot / Copilot Chat (SecurePhotoShare)

Tài liệu này hướng dẫn cách đóng góp, sửa đổi mã nguồn và các quy tắc đặc thù khi bạn (hoặc Copilot) tạo/đề xuất thay đổi cho repository SecurePhotoShare.

Nguyên tắc tổng quát:

- Luôn trả lời bằng tiếng Việt cho người dùng cuối. Nếu người dùng yêu cầu ngôn ngữ khác, vẫn trả lời bằng tiếng Việt.
- Không chỉnh sửa file `README.md` trừ khi có chỉ dẫn tường minh từ maintainer.
- Mọi thay đổi trong code phải giữ comment và chuỗi hiển thị trong file mã (in-code comments and text) bằng tiếng Anh; không dịch hoặc thay đổi ngôn ngữ comment/text trong source code.
- Không bao giờ thêm, in hoặc cố gắng rò rỉ secrets, private keys, hoặc giá trị nhạy cảm vào code hoặc vào các PR descriptions.

Quy ước repository (những thư mục cần quan tâm):

- `app/` — chính là mã nguồn TypeScript/React Native. Các thay đổi UI / business logic đi vào đây.
- `app/auth/` — authentication context và cấu hình Entra ID. Thận trọng khi thay đổi flows và secrets.
- `app/components/` — components tái sử dụng.
- `assets/` — fonts và static assets.
- `android/`, `ios/` — cấu hình native; các thay đổi native cần kiểm tra build trên platform tương ứng.

Khi tạo sửa đổi (guidelines for changes):

1. Giữ scope nhỏ và tập trung: một PR tốt nên sửa 1-2 vấn đề liên quan thôi.
2. Nếu thay đổi code, luôn:
	- Chạy unit tests (Jest) nếu liên quan.
	- Kiểm tra build nhanh: `npm start` và `yarn android` / `yarn ios` (hoặc tương đương). (Command blocks giữ nguyên bằng tiếng Anh.)
3. Khi cập nhật cấu hình (Entra ID, keystore), cung cấp hướng dẫn rõ ràng về cách inject giá trị an toàn (env vars or secrets) — không hardcode.

4. Stylesheet trong component:
	- Khi viết component React/React Native, ưu tiên đặt phần styles (ví dụ `const styles = StyleSheet.create({...})` hoặc hàm `createStyles`) ở CUỐI file, ngay trước `export` của component.
	- Chỉ tách styles ra file riêng khi styles đó được tái sử dụng giữa nhiều component. Nếu styles là riêng cho 1 component thì giữ nội bộ (in-file).
	- Khi cần styles động theo theme/props, dùng factory như `const createStyles = (theme) => StyleSheet.create({...})` và memoize (`useMemo`) trong component.
	- Luôn sử dụng `StyleSheet.create` để tận dụng tối ưu hiệu năng của React Native.

Định dạng commit / PR suggestion:

- Title (Vietnamese): ngắn gọn mô tả thay đổi.
- Body (Vietnamese): tóm tắt, file changed, cách test. Nếu có đoạn code mẫu hoặc lệnh cần chạy, giữ phần đó bằng tiếng Anh.

Ví dụ PR body (mẫu):

"Fix auth token refresh flow in `app/auth` and add unit tests.

Files changed: `app/auth/*`, `__tests__/auth.test.ts`

How to test:
1. Start Metro: `yarn start`
2. Run tests: `yarn test`
3. Manual: open app and perform sign-in flow"

Các lưu ý bảo mật và phát hành:

- Không commit file chứa secrets (keystore release passwords, client secrets). Thay vào đó, mô tả cách cấu hình chúng qua env vars hoặc secret store.
- Nếu đề xuất thay đổi release signing hoặc CI, yêu cầu maintainer kiểm tra và set secrets trong GitHub Actions/CI.

Nếu không chắc chắn về thay đổi lớn (native build, release signing, Entra ID):

- Tạo issue mô tả thay đổi trước khi làm PR. Đợi review từ maintainer.

Tóm tắt ngắn:

- Trả lời user bằng tiếng Việt.
- Giữ comment/text trong code bằng tiếng Anh.
- Sửa file này (`.github/copilot-instructions.md`) khi cần cập nhật quy tắc; không sửa `README.md` theo yêu cầu hiện tại.

---

Last updated: 2025-08-18
