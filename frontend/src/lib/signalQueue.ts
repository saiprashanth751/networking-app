import { Subject, Observable, queueScheduler, of } from 'rxjs';
import {
  bufferTime,
  filter,
  map,
  mergeMap,
  observeOn,
  tap,
  catchError
} from 'rxjs/operators';
import { WebRTCSignal } from '../types/types';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'lib/signalQueue.ts' });

export class SignalQueue {
  private signalSubject = new Subject<WebRTCSignal>();
  private processingQueue = new Subject<WebRTCSignal>();

  // Observable for processed signals in order
  public signals$: Observable<WebRTCSignal>;

  constructor() {
    // Create ordered signal stream with buffering
    this.signals$ = this.signalSubject.pipe(
      // Buffer signals for 50ms to batch process
      bufferTime(50),
      // Filter out empty buffers
      filter(signals => signals.length > 0),
      // Sort by timestamp to ensure order
      map(signals => signals.sort((a, b) => a.timestamp - b.timestamp)),
      // Flatten array back to individual signals
      mergeMap(signals => of(...signals)),
      // Process on queue scheduler for order guarantee
      observeOn(queueScheduler),
      tap(signal => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SignalQueue] Processing: ${signal.type} from ${signal.senderId}`);
        }
      }),
      // Handle errors gracefully
      catchError((error, source) => {
        console.error('[SignalQueue] Error in signal processing:', error);
        return source; // Continue with next signals
      })
    );
  }

  // Add signal to queue
  enqueue(signal: WebRTCSignal) {
    logger.debug(`Enqueuing signal: ${signal.type}`, { senderId: signal.senderId, timestamp: signal.timestamp });
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SignalQueue] Enqueuing: ${signal.type} from ${signal.senderId}`);
    }
    this.signalSubject.next({
      ...signal,
      timestamp: signal.timestamp || Date.now()
    });
  }

  // Clear queue
  clear() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[SignalQueue] Clearing all signals');
    }

    // Complete the subjects and create new ones
    this.signalSubject.complete();
    this.processingQueue.complete();

    this.signalSubject = new Subject<WebRTCSignal>();
    this.processingQueue = new Subject<WebRTCSignal>();

    // Recreate the observable chain
    this.signals$ = this.signalSubject.pipe(
      bufferTime(50),
      filter(signals => signals.length > 0),
      map(signals => signals.sort((a, b) => a.timestamp - b.timestamp)),
      mergeMap(signals => of(...signals)),
      observeOn(queueScheduler),
      catchError((error, source) => {
        console.error('[SignalQueue] Error after recreation:', error);
        return source;
      })
    );
  }

  // Get current queue size (for debugging)
  getQueueSize(): Observable<number> {
    return this.signalSubject.pipe(
      bufferTime(100),
      map(signals => signals.length)
    );
  }
}

// Singleton instance
export const signalQueue = new SignalQueue();