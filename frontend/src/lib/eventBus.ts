import EventEmitter from 'eventemitter3';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'lib/eventBus.ts' });

export type CallEventType =
  | 'call:initiate'
  | 'call:received'
  | 'call:accept'
  | 'call:reject'
  | 'call:end'
  | 'webrtc:offer'
  | 'webrtc:answer'
  | 'webrtc:candidate'
  | 'webrtc:connected'
  | 'webrtc:failed'
  | 'media:mute'
  | 'media:video'
  | 'media:screenshare'
  | 'connection:lost'
  | 'timeout'
  | 'sound:startRinging'
  | 'sound:stopRinging';

export class CallEventBus {
  private emitter = new EventEmitter();

  emit<T = any>(event: CallEventType, data?: T) {
    logger.debug(`EVENT EMIT: ${event}`, { data });
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBus] Emitting: ${event}`, data);
    }
    this.emitter.emit(event, data);
  }

  on<T = any>(event: CallEventType, handler: (data: T) => void) {
    this.emitter.on(event, handler);
  }

  off<T = any>(event: CallEventType, handler: (data: T) => void) {
    this.emitter.off(event, handler);
  }

  once<T = any>(event: CallEventType, handler: (data: T) => void) {
    this.emitter.once(event, handler);
  }

  removeAllListeners(event?: CallEventType) {
    this.emitter.removeAllListeners(event);
  }
}

// Singleton instance
export const callEventBus = new CallEventBus();