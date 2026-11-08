/**
 * 46 — Design Pattern Pragmatism: BUILDER PATTERN
 * Phục vụ Kịch bản 4: Khởi tạo dữ liệu phức tạp (Chứng thư Hội viên, Hợp đồng, Báo cáo xuất khẩu).
 * Cấm nhồi nhét hàng chục tham số vào constructor. Tách thành các bước lắp ráp rõ ràng.
 */

export interface CertificateHeader {
  associationName: string;
  certificateTitle: string;
  certificateNumber: string;
  issueDate: Date;
}

export interface MemberProfileSummary {
  memberId: string;
  fullName: string;
  companyName: string;
  taxCode?: string;
  executiveRole?: string;
  department?: string;
  joinedDate: Date;
}

export interface CertificateTerms {
  termStart: Date;
  termEnd: Date;
  governingCharter: string;
  sealVerified: boolean;
}

export interface DigitalCertificateOutput {
  id: string;
  header: CertificateHeader;
  member: MemberProfileSummary;
  terms: CertificateTerms;
  metadata: {
    generatedAt: Date;
    verificationQrUrl: string;
    checksum: string;
  };
}

export class MembershipCertificateBuilder {
  private header?: CertificateHeader;
  private member?: MemberProfileSummary;
  private terms?: CertificateTerms;
  private checksum?: string;

  setHeader(header: CertificateHeader): this {
    this.header = header;
    return this;
  }

  setMember(member: MemberProfileSummary): this {
    this.member = member;
    return this;
  }

  setTerms(terms: CertificateTerms): this {
    this.terms = terms;
    return this;
  }

  setChecksum(checksum: string): this {
    this.checksum = checksum;
    return this;
  }

  getResult(): DigitalCertificateOutput {
    if (!this.header || !this.member || !this.terms) {
      throw new Error(
        'Chưa thể xuất chứng thư: Thiếu các khối dữ liệu bắt buộc (Header, Member, hoặc Terms).',
      );
    }

    const verificationQrUrl = `https://ceo1983.viconnect.vn/verify-certificate/${this.header.certificateNumber}`;
    return {
      id: `CERT-${this.header.certificateNumber}`,
      header: this.header,
      member: this.member,
      terms: this.terms,
      metadata: {
        generatedAt: new Date(),
        verificationQrUrl,
        checksum: this.checksum || 'SHA256:VERIFIED',
      },
    };
  }
}
