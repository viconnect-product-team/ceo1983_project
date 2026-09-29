# QUY CHUẨN PHÁT TRIỂN BACKEND NESTJS (BACKEND GUIDELINES)
## ÁP DỤNG CHO DỰ ÁN `apps/ceo1983_app_be`

---

## 1. NGUYÊN TẮC KIẾN TRÚC MODULAR
Mỗi tính năng trong hệ sinh thái CEO 1983 phải là một Module độc lập, tuân thủ nguyên tắc Single Responsibility:

```
src/
├── <module-name>/
│   ├── dto/
│   │   ├── create-<module>.dto.ts
│   │   ├── update-<module>.dto.ts
│   │   └── query-<module>.dto.ts
│   ├── <module-name>.controller.ts
│   ├── <module-name>.service.ts
│   ├── <module-name>.module.ts
│   └── <module-name>.entity.ts (hoặc types)
```

### Quy tắc phân định:
1. **Controller**:
   - Chỉ đảm nhận tiếp nhận HTTP Request, routing, áp dụng Guards (`@UseGuards(JwtAuthGuard)`), transform payload qua DTO và trả về HTTP Response.
   - Tuyệt đối không viết logic nghiệp vụ hay câu lệnh SQL trong Controller.
2. **Service**:
   - Chứa 100% logic nghiệp vụ, giao tiếp với Database qua Prisma / Raw SQL, gọi các service phụ trợ (Mail, Notification, S3 Upload).
   - Phải xử lý Exception và bọc trong các NestJS Built-in Exceptions.
3. **Module**:
   - Khai báo rõ ràng `controllers`, `providers`, và `exports` nếu module khác cần sử dụng (ví dụ `NotificationsService` cần export để `MeetingsService` và `EventsService` gọi).

---

## 2. QUY CHUẨN DTO & CLASS-VALIDATOR
Mọi dữ liệu gửi lên từ Client bắt buộc phải được định nghĩa kiểu dữ liệu chặt chẽ qua Data Transfer Object (DTO) có trang bị `class-validator` và `class-transformer`:

```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdvertisementDto {
  @IsString({ message: 'Tiêu đề quảng cáo không được để trống' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @IsString({ message: 'Tên doanh nghiệp không được để trống' })
  @IsNotEmpty({ message: 'Tên doanh nghiệp không được để trống' })
  companyName: string;

  @IsString()
  @IsOptional()
  badgeText?: string;

  @IsString({ message: 'Đường dẫn banner/video không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp bannerUrl hoặc videoUrl' })
  bannerUrl: string;

  @IsUrl({}, { message: 'Target URL phải là định dạng đường dẫn hợp lệ' })
  @IsOptional()
  targetUrl?: string;

  @IsEnum(['gradient-wave', 'gold-shimmer', 'pulse-glow'], { message: 'Hiệu ứng hiển thị không hợp lệ' })
  @IsOptional()
  animation?: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(['active', 'paused', 'expired'])
  @IsOptional()
  status?: 'active' | 'paused' | 'expired';
}
```

### Bắt buộc với ValidationPipe:
Trong `main.ts`, `ValidationPipe` phải được kích hoạt với:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }),
);
```

---

## 3. XỬ LÝ EXCEPTION (EXCEPTION HANDLING)
- Tuyệt đối không để ứng dụng crash hoặc throw string thô (`throw "error"`).
- Luôn sử dụng Built-in HTTP Exceptions của NestJS:
  - `NotFoundException`: Khi bản ghi không tồn tại trong DB.
  - `BadRequestException`: Khi tham số đầu vào không hợp lệ hoặc logic nghiệp vụ bị vi phạm.
  - `UnauthorizedException`: Khi token JWT không hợp lệ hoặc chưa đăng nhập.
  - `ForbiddenException`: Khi tài khoản không đủ quyền (ví dụ chỉ Ban Quản Trị hoặc Admin mới được phép thao tác).
  - `InternalServerErrorException`: Lỗi server nội bộ (kèm log chi tiết ra console backend).

Ví dụ chuẩn mực trong Service:
```typescript
async findById(id: string) {
  try {
    const row = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.advertisements WHERE id = ${id} LIMIT 1
    `;
    if (!row || row.length === 0) {
      throw new NotFoundException(`Không tìm thấy chiến dịch quảng cáo với ID: ${id}`);
    }
    return row[0];
  } catch (err: any) {
    if (err instanceof NotFoundException) throw err;
    this.logger.error(`[AdvertisementsService] Error in findById: ${err?.message}`, err?.stack);
    throw new InternalServerErrorException('Lỗi hệ thống khi truy vấn dữ liệu quảng cáo');
  }
}
```

---

## 4. XỬ LÝ GIAO TIẾP DATABASE (PRISMA & RAW SQL)
1. **Kiểm soát Kiểu & Column Mapping**:
   - Sử dụng Prisma Client cho các thao tác chuẩn ORM.
   - Khi sử dụng Raw SQL (`$queryRaw`, `$executeRaw`), luôn dùng parameterized queries dạng template literals (`${value}`) để phòng chống tuyệt đối lỗi **SQL Injection**.
2. **Transaction Integrity**:
   - Khi có các thao tác ghi dữ liệu liên quan nhiều bảng (như phân quyền, cuộc họp và thông báo, tạo hội viên và tài khoản), bắt buộc phải dùng Transaction:
   ```typescript
   await this.prisma.$transaction(async (tx) => {
     await tx.$executeRaw`...`;
     await tx.$executeRaw`...`;
   });
   ```
3. **Data Type Mapping**:
   - Các trường danh sách (scanners, sponsors, metadata) lưu dưới dạng `JSONB` hoặc mảng chuỗi trong PostgreSQL.
   - Khi select ra, map chính xác về Object / Array JSON trước khi trả về Client.
