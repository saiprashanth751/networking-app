import { createMachine, assign } from 'xstate';
import { CallContext } from '@/types/types';
import { createCallLogger } from '@/utils/callLogger';

const logger = createCallLogger({ file: 'state/callMachine.ts' });

export const createCallMachine = () =>
  createMachine({
    id: 'call',
    initial: 'idle',

    context: {
      callDetails: null,
      localStream: null,
      remoteStream: null,
      isConnected: false,
      connectionError: null,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      pendingSignals: [],
      peerConnection: null,
      ringingStartTime: null,
      callStartTime: null,
      isRinging: false
    } as CallContext,

    states: {
      // ============================================================
      // IDLE
      // ============================================================
      idle: {
        on: {
          CALL_INITIATE: {
            target: 'outgoing.ringing',
            actions: assign(({ event }) => {
              logger.info('STATE: idle → outgoing.ringing', {
                callType: event.callType,
                remoteUserId: event.remoteUser?.id
              });

              return {
                callDetails: {
                  callId: '',
                  type: event.callType,
                  direction: 'outgoing',
                  participants: {
                    local: {
                      id: 'local',
                      name: 'You',
                      avatar: null,
                      isOnline: true
                    },
                    remote: event.remoteUser
                  },
                  startTime: null,
                  endTime: null,
                  duration: 0
                },
                ringingStartTime: Date.now(),
                isRinging: true
              };
            })
          },

          CALL_RECEIVED: {
            target: 'incoming.ringing',
            actions: assign(({ event }) => {
              logger.info('STATE: idle → incoming.ringing', {
                callId: event.callId,
                callerId: event.callerId
              });

              return {
                callDetails: {
                  callId: event.callId,
                  type: event.callType,
                  direction: 'incoming',
                  participants: {
                    local: {
                      id: 'local',
                      name: 'You',
                      avatar: null,
                      isOnline: true
                    },
                    remote: {
                      id: event.callerId,
                      name: event.callerName,
                      avatar: event.callerAvatar,
                      isOnline: true
                    }
                  },
                  startTime: null,
                  endTime: null,
                  duration: 0
                },
                ringingStartTime: Date.now(),
                isRinging: true
              };
            })
          }
        }
      },

      // ============================================================
      // INCOMING
      // ============================================================
      incoming: {
        initial: 'ringing',
        states: {
          ringing: {
            on: {
              CALL_ACCEPT: {
                target: '#call.connecting',
                actions: assign({
                  isRinging: false,
                  ringingStartTime: null
                })
              },

              CALL_REJECT: {
                target: '#call.idle',
                actions: assign({
                  callDetails: null,
                  isRinging: false,
                  ringingStartTime: null
                })
              },

              TIMEOUT: {
                target: '#call.idle',
                actions: assign({
                  callDetails: null,
                  isRinging: false,
                  ringingStartTime: null,
                  connectionError: 'Call timeout'
                })
              }
            }
          }
        }
      },

      // ============================================================
      // OUTGOING
      // ============================================================
      outgoing: {
        initial: 'ringing',
        states: {
          ringing: {
            on: {
              CALL_ACCEPT: {
                target: '#call.connecting',
                actions: assign({
                  isRinging: false,
                  ringingStartTime: null
                })
              },

              CALL_REJECT: {
                target: '#call.idle',
                actions: assign({
                  callDetails: null,
                  isRinging: false,
                  ringingStartTime: null,
                  connectionError: 'Call declined'
                })
              },

              TIMEOUT: {
                target: '#call.idle',
                actions: assign({
                  callDetails: null,
                  isRinging: false,
                  ringingStartTime: null,
                  connectionError: 'Call timeout'
                })
              }
            }
          }
        }
      },

      // ============================================================
      // CONNECTING
      // ============================================================
      connecting: {
        on: {
          WEBRTC_CONNECTED: {
            target: 'active',
            actions: assign({
              callStartTime: Date.now(),
              isConnected: true
            })
          },

          WEBRTC_FAILED: {
            target: 'ending',
            actions: assign(({ event }) => ({
              connectionError: event.error || 'WebRTC connection failed'
            }))
          },

          CALL_END: {
            target: 'ending'
          },

          TIMEOUT: {
            target: 'ending',
            actions: assign({
              connectionError: 'Connection timeout'
            })
          }
        }
      },

      // ============================================================
      // ACTIVE
      // ============================================================
      active: {
        entry: assign(({ context }) => ({
          callStartTime: context.callStartTime ?? Date.now()
        })),

        on: {
          MEDIA_TOGGLE_MUTE: {
            actions: assign(({ context }) => ({
              isMuted: !context.isMuted
            }))
          },

          MEDIA_TOGGLE_VIDEO: {
            actions: assign(({ context }) => ({
              isVideoOff: !context.isVideoOff
            }))
          },

          MEDIA_TOGGLE_SCREEN_SHARE: {
            actions: assign(({ context }) => ({
              isScreenSharing: !context.isScreenSharing
            }))
          },

          CALL_END: {
            target: 'ending'
          },

          // ✅ FIX: Go to reconnecting instead of ending on connection failure
          WEBRTC_FAILED: {
            target: 'reconnecting',
            actions: assign(({ event }) => ({
              connectionError: event.error || 'Connection lost'
            }))
          }
        }
      },

      // ============================================================
      // RECONNECTING - ✅ NEW STATE
      // ============================================================
      reconnecting: {
        entry: () => {
          logger.info('STATE: Entered reconnecting, will attempt recovery');
          console.log('[CallMachine] Attempting to reconnect...');
        },

        after: {
          // 10 second timeout for reconnection
          10000: {
            target: 'ending',
            actions: assign({
              connectionError: 'Failed to reconnect'
            })
          }
        },

        on: {
          WEBRTC_CONNECTED: {
            target: 'active',
            actions: assign({
              connectionError: null,
              isConnected: true
            })
          },

          CALL_END: {
            target: 'ending'
          },

          WEBRTC_FAILED: {
            // Stay in reconnecting, let timeout handle
            actions: assign(({ event }) => ({
              connectionError: event.error || 'Reconnection failed'
            }))
          }
        }
      },

      // ============================================================
      // ENDING
      // ============================================================
      ending: {
        entry: assign({
          isConnected: false,
          isRinging: false
        }),

        always: {
          target: 'idle',
          actions: assign({
            callDetails: null,
            localStream: null,
            remoteStream: null,
            peerConnection: null,
            pendingSignals: [],
            callStartTime: null,
            ringingStartTime: null,
            connectionError: null
          })
        }
      }
    }
  });
