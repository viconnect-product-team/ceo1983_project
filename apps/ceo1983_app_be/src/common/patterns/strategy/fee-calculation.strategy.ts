/**
 * 46 — Design Pattern Pragmatism: STRATEGY PATTERN
 * Phục vụ Kịch bản 1: Logic tính toán phân nhánh (Tính phí hội viên, chiết khấu, quyền lợi).
 * Tách biệt từng đối tượng thành Strategy riêng thay vì dùng chuỗi if/else dài dòng.
 */

export interface FeeCalculationContext {
  baseAmount: number;
  yearsJoined: number;
  isEarlyBird?: boolean;
  hasReferral?: boolean;
}

export interface CalculationResult {
  finalAmount: number;
  discountAmount: number;
  tierName: string;
  appliedBenefits: string[];
}

export interface IFeeCalculationStrategy {
  readonly tierCode: string;
  calculate(context: FeeCalculationContext): CalculationResult;
}

export class RegularMemberFeeStrategy implements IFeeCalculationStrategy {
  readonly tierCode = 'REGULAR';

  calculate(context: FeeCalculationContext): CalculationResult {
    let discount = 0;
    if (context.isEarlyBird) {
      discount += context.baseAmount * 0.05; // 5% ưu đãi đóng sớm
    }
    const finalAmount = Math.max(0, context.baseAmount - discount);
    return {
      finalAmount,
      discountAmount: discount,
      tierName: 'Hội viên Chính thức',
      appliedBenefits: [
        'Tham gia sinh hoạt định kỳ',
        'Sở hữu Danh thiếp số thông minh',
        'Tham gia kết nối giao thương B2B',
      ],
    };
  }
}

export class VipMemberFeeStrategy implements IFeeCalculationStrategy {
  readonly tierCode = 'VIP';

  calculate(context: FeeCalculationContext): CalculationResult {
    let discount = 0;
    if (context.yearsJoined >= 2) {
      discount += context.baseAmount * 0.1; // 10% tri ân hội viên gắn kết
    }
    if (context.isEarlyBird) {
      discount += context.baseAmount * 0.05;
    }
    const finalAmount = Math.max(0, context.baseAmount * 1.5 - discount);
    return {
      finalAmount,
      discountAmount: discount,
      tierName: 'Hội viên VIP',
      appliedBenefits: [
        'Toàn bộ quyền lợi Hội viên Chính thức',
        'Ưu tiên kết nối xúc tiến thương mại cấp cao',
        'Vị trí gian hàng danh dự tại Caravan & Triển lãm',
        'Biểu tượng VIP Badge trên nền tảng số',
      ],
    };
  }
}

export class ExecutiveMemberFeeStrategy implements IFeeCalculationStrategy {
  readonly tierCode = 'EXECUTIVE';

  calculate(context: FeeCalculationContext): CalculationResult {
    // Ban Điều Hành đóng mức phí trách nhiệm lãnh đạo
    const baseFee = context.baseAmount * 2.0;
    return {
      finalAmount: baseFee,
      discountAmount: 0,
      tierName: 'Hội viên Ban Điều Hành',
      appliedBenefits: [
        'Quyền biểu quyết và hoạch định chiến lược CLB',
        'Đại diện hiệp hội tham gia đối thoại chính sách',
        'Tham dự các hội nghị kín của Ban Lãnh đạo',
      ],
    };
  }
}

/**
 * Strategy Registry Factory
 */
export class FeeCalculationStrategyResolver {
  private static strategies: Map<string, IFeeCalculationStrategy> = new Map<
    string,
    IFeeCalculationStrategy
  >([
    ['REGULAR', new RegularMemberFeeStrategy()],
    ['VIP', new VipMemberFeeStrategy()],
    ['EXECUTIVE', new ExecutiveMemberFeeStrategy()],
    ['BAN_DIEU_HANH', new ExecutiveMemberFeeStrategy()],
  ]);

  static resolve(tier: string): IFeeCalculationStrategy {
    const strategy = this.strategies.get((tier || 'REGULAR').toUpperCase());
    return strategy || this.strategies.get('REGULAR')!;
  }
}
