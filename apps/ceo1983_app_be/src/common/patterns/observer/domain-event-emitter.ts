import { EventEmitter } from 'events';

/**
 * 46 — Design Pattern Pragmatism: OBSERVER (PUB/SUB) PATTERN
 * Phục vụ Kịch bản 3: Hiệu ứng dây chuyền (User created, Payment completed, Member renewed).
 * Service chính KHÔNG ĐƯỢC gọi trực tiếp các hàm phụ.
 * Nó chỉ phát sự kiện và các listeners tự động lắng nghe, xử lý bất đồng bộ.
 */

export interface DomainEvent<T = any> {
  eventName: string;
  timestamp: Date;
  payload: T;
  actorId?: string;
}

export type DomainEventListener<T = any> = (
  event: DomainEvent<T>,
) => Promise<void> | void;

export class DomainEventEmitter {
  private static instance: DomainEventEmitter;
  private emitter = new EventEmitter();

  private constructor() {
    this.emitter.setMaxListeners(50);
  }

  static getInstance(): DomainEventEmitter {
    if (!DomainEventEmitter.instance) {
      DomainEventEmitter.instance = new DomainEventEmitter();
    }
    return DomainEventEmitter.instance;
  }

  emit<T>(eventName: string, payload: T, actorId?: string): boolean {
    const event: DomainEvent<T> = {
      eventName,
      timestamp: new Date(),
      payload,
      actorId,
    };
    return this.emitter.emit(eventName, event);
  }

  subscribe<T>(eventName: string, listener: DomainEventListener<T>): void {
    this.emitter.on(eventName, async (event: DomainEvent<T>) => {
      try {
        await listener(event);
      } catch (err: any) {
        console.error(
          `[DomainObserver] Error handling event ${eventName}:`,
          err?.message || err,
        );
      }
    });
  }

  unsubscribe(eventName: string, listener: (...args: any[]) => void): void {
    this.emitter.off(eventName, listener);
  }
}

// Global Domain Event Bus
export const domainEventBus = DomainEventEmitter.getInstance();
