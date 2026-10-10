import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { VotingRepository } from './voting.repository';
import { CreatePollDto, CastVoteDto } from './dto';

export { CreatePollDto, CastVoteDto };

@Injectable()
export class VotingService {
  constructor(private readonly votingRepo: VotingRepository) {}

  private computeOptionsWithStats(rawOptions: any[]): any[] {
    const opts = (rawOptions || []).map((o) => ({
      id: String(o.id),
      title: String(o.title || ''),
      votesCount: Number(o.votes_count || 0),
      associationVotes: Number(o.association_votes || 0),
      crmVotes: Number(o.crm_votes || 0),
      percentage: 0,
      isLeading: false,
    }));

    const totalVotes = opts.reduce((sum, o) => sum + o.votesCount, 0);
    const maxVotes = opts.length > 0 ? Math.max(...opts.map((o) => o.votesCount)) : 0;

    return opts.map((o) => ({
      ...o,
      percentage: totalVotes > 0 ? Number(((o.votesCount / totalVotes) * 100).toFixed(1)) : 0,
      isLeading: totalVotes > 0 && o.votesCount === maxVotes && maxVotes > 0,
    }));
  }

  async listPolls(userId: string, associationId?: string) {
    const rows = await this.votingRepo.listPollsRaw(userId);

    return rows.map((r) => {
      const options = this.computeOptionsWithStats(r.options || []);
      const totalVotes = options.reduce((sum, o) => sum + o.votesCount, 0);
      const sourceStats = r.source_stats || {
        associationApp: options.reduce((sum, o) => sum + o.associationVotes, 0),
        crm: options.reduce((sum, o) => sum + o.crmVotes, 0),
      };

      let pollStatus = r.status || 'open';
      if (r.event_id) {
        const evStatus = String(r.event_status || '').toLowerCase();
        let evEnded = evStatus === 'completed' || evStatus === 'cancelled';
        if (!evEnded && r.event_date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const evDate = new Date(r.event_date);
          evDate.setHours(0, 0, 0, 0);
          if (evDate.getTime() < today.getTime()) {
            evEnded = true;
          }
        }
        if (evEnded) {
          pollStatus = 'closed';
        }
      }

      return {
        id: r.id,
        title: r.title,
        description: r.description || '',
        status: pollStatus,
        eventId: r.event_id || null,
        eventName: r.event_name || null,
        options,
        myVote: r.my_vote || null,
        myVoteSource: r.my_vote_source || null,
        totalVotes,
        sourceStats,
        createdAt: r.created_at,
        startDate: r.start_date || null,
        endDate: r.end_date || null,
      };
    });
  }

  async getPollById(userId: string, id: string) {
    const rows = await this.votingRepo.getPollByIdRaw(userId, id);
    if (rows.length === 0) throw new NotFoundException('Poll not found');

    const r = rows[0];
    const options = this.computeOptionsWithStats(r.options || []);
    const totalVotes = options.reduce((sum, o) => sum + o.votesCount, 0);
    const sourceStats = r.source_stats || {
      associationApp: options.reduce((sum, o) => sum + o.associationVotes, 0),
      crm: options.reduce((sum, o) => sum + o.crmVotes, 0),
    };

    let pollStatus = r.status || 'open';
    if (r.event_id) {
      const evStatus = String(r.event_status || '').toLowerCase();
      let evEnded = evStatus === 'completed' || evStatus === 'cancelled';
      if (!evEnded && r.event_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const evDate = new Date(r.event_date);
        evDate.setHours(0, 0, 0, 0);
        if (evDate.getTime() < today.getTime()) {
          evEnded = true;
        }
      }
      if (evEnded) {
        pollStatus = 'closed';
      }
    }

    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      status: pollStatus,
      eventId: r.event_id || null,
      eventName: r.event_name || null,
      options,
      myVote: r.my_vote || null,
      myVoteSource: r.my_vote_source || null,
      totalVotes,
      sourceStats,
      createdAt: r.created_at,
      endDate: r.end_date || null,
    };
  }

  async castVote(userId: string, pollId: string, optionId: string, sourceApp: string = 'association_app') {
    if (!pollId || !optionId) {
      throw new BadRequestException('pollId and optionId are required');
    }

    const validSource = sourceApp === 'crm' ? 'crm' : 'association_app';
    const voteId = crypto.randomUUID();

    await this.votingRepo.insertVote(voteId, pollId, optionId, userId, validSource);
    return this.getPollById(userId, pollId);
  }

  async createPoll(userId: string, data: CreatePollDto) {
    if (!data.title || !Array.isArray(data.options) || data.options.length < 2) {
      throw new BadRequestException('Tiêu đề và ít nhất 2 phương án bình chọn là bắt buộc');
    }

    const pollId = crypto.randomUUID();
    let startDate = (data as any).startsAt || data.startDate || null;
    let endDate = (data as any).endsAt || data.endDate || null;
    const eventId = data.eventId || (data as any).event_id || null;

    if (!startDate && !endDate && eventId) {
      const ev = await this.votingRepo.findEventDate(eventId);
      if (ev.length > 0 && ev[0].date) {
        const evDateStr = ev[0].date instanceof Date ? ev[0].date.toISOString().slice(0, 10) : String(ev[0].date).slice(0, 10);
        startDate = evDateStr;
        endDate = evDateStr;
      }
    }

    if (startDate && !endDate) endDate = startDate;
    if (!startDate && endDate) startDate = endDate;

    let startDt = startDate ? new Date(startDate) : new Date();
    let endDt = endDate ? new Date(endDate) : new Date(startDt);
    if (startDate && endDate && String(startDate).slice(0, 10) === String(endDate).slice(0, 10)) {
      endDt.setHours(23, 59, 59, 999);
    }

    await this.votingRepo.insertPoll(pollId, data.title, data.description || null, startDt, endDt, eventId);

    const createdOptions: Array<{ id: string; title: string }> = [];
    for (const optTitle of data.options) {
      const optId = crypto.randomUUID();
      await this.votingRepo.insertPollOption(optId, pollId, optTitle);
      createdOptions.push({ id: optId, title: optTitle });
    }

    // Broadcast in-app interactive poll notification
    try {
      const audience = data.targetAudience || 'all';
      const users = await this.votingRepo.findAudienceUsers(audience);
      const notifTitle = `[Biểu quyết mới] ${data.title}`;
      const notifBody = data.description || 'Tham gia biểu quyết ý kiến ngay trên ứng dụng Hiệp hội & CRM.';
      const safeDisplayData = JSON.stringify({
        title: data.title,
        body: notifBody,
        pollId,
        options: createdOptions,
        type: 'poll',
        targetRoute: '/voting',
        status: 'open',
      });

      for (const u of users) {
        if (!u.id) continue;
        const dedupeKey = `poll-notif-${pollId}-${u.id}`;
        await this.votingRepo.createNotification(u.id, notifTitle, notifBody, pollId, safeDisplayData, dedupeKey, 'interactive_poll');
      }
    } catch (err: any) {
      console.warn('[VotingService] Error broadcasting poll notification:', err?.message);
    }

    return this.getPollById(userId, pollId);
  }

  async closePoll(userId: string, id: string) {
    if (!id) throw new BadRequestException('ID is required');

    await this.votingRepo.markPollClosed(id);
    const poll = await this.getPollById(userId, id);
    const leadingOption = poll.options.find((o: any) => o.isLeading) || poll.options[0] || null;

    try {
      const users = await this.votingRepo.findAudienceUsers('all');
      const notifTitle = `[Kết quả biểu quyết] ${poll.title}`;
      const notifBody = `Biểu quyết đã kết thúc. Phương án dẫn đầu: "${leadingOption?.title || 'Đã đóng'}" (${leadingOption?.percentage || 0}%). Tổng số: ${poll.totalVotes} lượt (${poll.sourceStats?.associationApp || 0} App Hiệp hội, ${poll.sourceStats?.crm || 0} CRM).`;

      const safeDisplayData = JSON.stringify({
        title: poll.title,
        body: notifBody,
        pollId: id,
        status: 'closed',
        winner: leadingOption,
        options: poll.options,
        totalVotes: poll.totalVotes,
        sourceStats: poll.sourceStats,
        type: 'poll_result',
        targetRoute: '/voting',
      });

      for (const u of users) {
        if (!u.id) continue;
        const dedupeKey = `poll-result-${id}-${u.id}`;
        await this.votingRepo.createNotification(u.id, notifTitle, notifBody, id, safeDisplayData, dedupeKey, 'poll_result');
      }
    } catch (err: any) {
      console.warn('[VotingService] Error broadcasting poll close notification:', err?.message);
    }

    return poll;
  }

  async updatePoll(userId: string, id: string, data: any) {
    if (!id) throw new BadRequestException('ID is required');
    const eventId = data.eventId !== undefined ? data.eventId : (data.event_id !== undefined ? data.event_id : null);
    let startDate = (data as any).startsAt || data.startDate || null;
    let endDate = (data as any).endsAt || data.endDate || null;
    if (startDate && !endDate) endDate = startDate;
    if (!startDate && endDate) startDate = endDate;

    let startDt = startDate ? new Date(startDate) : null;
    let endDt = endDate ? new Date(endDate) : null;
    if (startDt && endDt && String(startDate).slice(0, 10) === String(endDate).slice(0, 10)) {
      endDt.setHours(23, 59, 59, 999);
    }

    await this.votingRepo.updatePollRaw(id, data.title, data.description || null, data.status || null, startDt, endDt, eventId);
    return this.getPollById(userId, id);
  }

  async deletePoll(userId: string, id: string) {
    if (!id) throw new BadRequestException('ID is required');
    await this.votingRepo.deletePollRaw(id);
    return { ok: true, id };
  }

  async notifyLuckyDrawWinner(userId: string, data: {
    winnerName: string;
    winnerCompany?: string;
    winnerCode?: string;
    luckyNumber?: string;
    prize: string;
    eventName?: string;
    eventId?: string;
  }) {
    const title = `🎉 Chúc mừng bạn đã trúng ${data.prize}!`;
    const body = `Ban Tổ chức CLB Doanh Nhân CEO 1983 xin trân trọng chúc mừng Anh/Chị ${data.winnerName} (${data.winnerCompany || 'Hội viên'}, Số may mắn: #${data.luckyNumber || 'LUCKY'}) đã xuất sắc trúng giải thưởng "${data.prize}" tại sự kiện "${data.eventName || 'Sự kiện CEO 1983'}". Vui lòng liên hệ Ban Thư Ký để nhận giải!`;

    const recipients = await this.votingRepo.findMemberForLuckyDraw(data.winnerCode, data.winnerName);
    const safeDisplayData = JSON.stringify({
      winnerName: data.winnerName,
      winnerCompany: data.winnerCompany,
      winnerCode: data.winnerCode,
      luckyNumber: data.luckyNumber,
      prize: data.prize,
      eventName: data.eventName,
      eventId: data.eventId,
      type: 'lucky_draw_winner',
      targetRoute: '/association/events',
    });

    const targetUserId = recipients[0]?.id || userId;
    const targetMemberCode = recipients[0]?.code || data.winnerCode;

    await this.votingRepo.sendLuckyDrawNotification(targetUserId, title, body, data.eventId || 'lucky-draw', safeDisplayData, targetMemberCode);

    return { ok: true, recipient: data.winnerName, prize: data.prize };
  }
}
