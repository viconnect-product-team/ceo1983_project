import { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldCheck,
  X,
  User,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getConnectAppSocket } from "@/hooks/use-connect-app-socket";
import { useViewerUserId } from "@/hooks/use-viewer-user-id";
import { useAuth } from "@/context/AuthContext";
import { resolveMediaUrl } from "@/lib/api-client";
import { safeRandomUUID } from "@/lib/utils";

export interface CeoCallRecordPayload {
  callType: "audio" | "video";
  status: "completed" | "missed" | "declined";
  duration: number;
}

export interface CeoWebRtcCallModalProps {
  open: boolean;
  type: "audio" | "video";
  callId?: string;
  peerUserId?: string;
  peerName: string;
  peerAvatar?: string | null;
  peerTitle?: string | null;
  isIncomingAcceptance?: boolean;
  onClose: () => void;
  onEndCall?: (result: CeoCallRecordPayload) => void;
}

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302", "stun:stun3.l.google.com:19302", "stun:stun4.l.google.com:19302"] },
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.cloudflare.com:3478" },
    // Metered OpenRelay public STUN/TURN fallback for NAT traversal between mobile 4G & WiFi
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

export function CeoWebRtcCallModal({
  open,
  type = "video",
  callId: callIdProp,
  peerUserId,
  peerName,
  peerAvatar,
  peerTitle,
  isIncomingAcceptance = false,
  onClose,
  onEndCall,
}: CeoWebRtcCallModalProps) {
  const viewerUserId = useViewerUserId();
  const { user } = useAuth();

  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">(
    isIncomingAcceptance ? "connected" : "calling"
  );
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === "video");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const queuedCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const callIdRef = useRef<string>(callIdProp || safeRandomUUID());
  const hasRecordedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const dialIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (callIdProp) callIdRef.current = callIdProp;
  }, [callIdProp]);

  // Outgoing ringtone generator using Web Audio API
  const startOutgoingTone = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playBeep = () => {
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(425, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      };

      playBeep();
      dialIntervalRef.current = setInterval(playBeep, 3000);
    } catch {}
  }, []);

  const stopOutgoingTone = useCallback(() => {
    if (dialIntervalRef.current) {
      clearInterval(dialIntervalRef.current);
      dialIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);

  const playConnectedChime = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  const finishCall = useCallback((status: "completed" | "missed" | "declined") => {
    stopOutgoingTone();
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    // Stop all local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Emit end call signal to peer
    try {
      const socket = getConnectAppSocket();
      socket.emit("call:end", {
        callId: callIdRef.current,
        targetUserId: peerUserId,
      });
    } catch {}

    const duration = callStatus === "connected" ? callSeconds : 0;
    if (onEndCall) {
      onEndCall({
        callType: type,
        status: duration > 0 ? "completed" : status,
        duration,
      });
    }
    onClose();
  }, [callSeconds, callStatus, onClose, onEndCall, peerUserId, stopOutgoingTone, type]);

  // 1. Initialize media stream and WebRTC connection
  useEffect(() => {
    if (!open) return;

    hasRecordedRef.current = false;
    setCallSeconds(0);
    setCallStatus(isIncomingAcceptance ? "connected" : "calling");
    setIsVideoEnabled(type === "video");
    setCameraError(null);
    setHasRemoteAudio(false);
    setHasRemoteVideo(false);
    queuedCandidatesRef.current = [];

    if (!isIncomingAcceptance) {
      startOutgoingTone();
    } else {
      playConnectedChime();
    }

    const socket = getConnectAppSocket();
    let isMounted = true;
    let pc: RTCPeerConnection | null = null;

    async function setupWebRtc() {
      try {
        // 1. Acquire Local Media
        let stream: MediaStream;
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Trình duyệt hoặc WebView không hỗ trợ truy cập Camera/Microphone.");
          }

          const constraints: MediaStreamConstraints = {
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video:
              type === "video"
                ? {
                    facingMode,
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                  }
                : false,
          };

          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (mediaErr: any) {
          console.warn("[WebRTC] getUserMedia failed:", mediaErr);
          // If video failed, attempt audio-only fallback
          if (type === "video") {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              toast.info("Không thể mở camera, tiếp tục cuộc gọi thoại");
              setIsVideoEnabled(false);
            } catch {
              throw mediaErr;
            }
          } else {
            throw mediaErr;
          }
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current && isVideoEnabled) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Instantiate RTCPeerConnection
        pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        // Attach local tracks
        stream.getTracks().forEach((track) => {
          if (pc && stream) {
            pc.addTrack(track, stream);
          }
        });

        // 3. Handle remote tracks (audio & video)
        pc.ontrack = (event) => {
          if (!isMounted || !event.streams || !event.streams[0]) return;
          const remoteStream = event.streams[0];

          // Always route audio to dedicated audio element
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.volume = 1.0;
            remoteAudioRef.current.play().catch((e) => console.log("[WebRTC] Audio auto-play prevented:", e));
          }

          // If video element exists, attach remote stream as well
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch((e) => console.log("[WebRTC] Video auto-play prevented:", e));
          }

          if (event.track.kind === "audio") setHasRemoteAudio(true);
          if (event.track.kind === "video") setHasRemoteVideo(true);
        };

        // 4. Relay ICE candidates to peer
        pc.onicecandidate = (event) => {
          if (event.candidate && peerUserId) {
            socket.emit("call:signal", {
              callId: callIdRef.current,
              targetUserId: peerUserId,
              signal: { type: "candidate", candidate: event.candidate },
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (!pc) return;
          console.log("[WebRTC] Connection state:", pc.connectionState);
          if (pc.connectionState === "connected") {
            setCallStatus("connected");
            stopOutgoingTone();
          } else if (pc.connectionState === "failed" || pc.connectionState === "closed") {
            // Attempt ICE restart or notify
          }
        };

        // 5. If caller: emit call:initiate
        if (!isIncomingAcceptance && peerUserId && viewerUserId) {
          socket.emit("call:initiate", {
            callId: callIdRef.current,
            recipientUserId: peerUserId,
            callerUserId: viewerUserId,
            callerName: user?.name || user?.user_metadata?.full_name || "Thành viên CEO 1983",
            callerAvatar: user?.avatar_url || user?.user_metadata?.avatar_url || null,
            callerTitle: peerTitle || "Hội viên CLB CEO 1983",
            callType: type,
          });
        }

        // 6. If callee accepted: wait for offer and answer immediately
        if (isIncomingAcceptance && peerUserId && viewerUserId) {
          socket.emit("call:accept", {
            callId: callIdRef.current,
            callerUserId: peerUserId,
            calleeUserId: viewerUserId,
            calleeName: user?.name || "Hội viên CEO 1983",
            calleeAvatar: user?.avatar_url || null,
          });
        }

      } catch (err: any) {
        console.warn("[WebRTC] Media / Connection error:", err);
        setCameraError(err.message || "Không thể truy cập camera hoặc micro.");
        toast.error("Không thể truy cập thiết bị âm thanh/hình ảnh. Vui lòng cấp quyền.");
      }
    }

    setupWebRtc();

    // 7. Socket Event Listeners for Call Lifecycle & Signaling
    const handleCallAccepted = async (payload: any) => {
      if (payload?.callId && payload.callId !== callIdRef.current) return;
      stopOutgoingTone();
      playConnectedChime();
      setCallStatus("connected");
      toast.success(`Đã kết nối cuộc gọi với ${peerName}`);

      // Caller creates offer once accepted
      if (pcRef.current && !isIncomingAcceptance && peerUserId) {
        try {
          const offer = await pcRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: type === "video",
          });
          await pcRef.current.setLocalDescription(offer);
          socket.emit("call:signal", {
            callId: callIdRef.current,
            targetUserId: peerUserId,
            signal: { type: "offer", sdp: offer },
          });
        } catch (offerErr) {
          console.warn("[WebRTC] createOffer error:", offerErr);
        }
      }
    };

    const handleCallDeclined = (payload: any) => {
      if (payload?.callId && payload.callId !== callIdRef.current) return;
      stopOutgoingTone();
      setCallStatus("ended");
      toast.error(`${peerName} đang bận hoặc đã từ chối cuộc gọi.`);
      setTimeout(() => finishCall("declined"), 1200);
    };

    const handleCallEnded = (payload: any) => {
      if (payload?.callId && payload.callId !== callIdRef.current) return;
      stopOutgoingTone();
      setCallStatus("ended");
      toast.info("Cuộc gọi đã kết thúc.");
      setTimeout(() => finishCall("completed"), 800);
    };

    const handleCallSignal = async (payload: any) => {
      const signal = payload?.signal;
      if (!signal || !pcRef.current) return;
      const peer = pcRef.current;

      try {
        if (signal.type === "offer") {
          // Callee receives offer -> sets remote desc -> creates answer -> responds
          await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          // Drain any queued ICE candidates
          while (queuedCandidatesRef.current.length > 0) {
            const cand = queuedCandidatesRef.current.shift();
            if (cand) await peer.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          if (peerUserId) {
            socket.emit("call:signal", {
              callId: callIdRef.current,
              targetUserId: peerUserId,
              signal: { type: "answer", sdp: answer },
            });
          }
          setCallStatus("connected");
          stopOutgoingTone();
        } else if (signal.type === "answer") {
          // Caller receives answer
          await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          while (queuedCandidatesRef.current.length > 0) {
            const cand = queuedCandidatesRef.current.shift();
            if (cand) await peer.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          setCallStatus("connected");
          stopOutgoingTone();
        } else if (signal.type === "candidate" && signal.candidate) {
          if (peer.remoteDescription && peer.remoteDescription.type) {
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
          } else {
            queuedCandidatesRef.current.push(signal.candidate);
          }
        }
      } catch (signalErr) {
        console.warn("[WebRTC] Signal handling error:", signalErr);
      }
    };

    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:declined", handleCallDeclined);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:signal", handleCallSignal);

    // Ringing timeout (45s) for caller
    let ringTimer: any = null;
    if (!isIncomingAcceptance) {
      ringTimer = setTimeout(() => {
        if (callStatus === "calling") {
          toast.info("Đối phương không trả lời cuộc gọi.");
          finishCall("missed");
        }
      }, 45000);
    }

    return () => {
      isMounted = false;
      stopOutgoingTone();
      if (ringTimer) clearTimeout(ringTimer);

      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:declined", handleCallDeclined);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:signal", handleCallSignal);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [
    open,
    type,
    facingMode,
    isIncomingAcceptance,
    peerUserId,
    viewerUserId,
    peerName,
    peerTitle,
    user?.name,
    user?.avatar_url,
    user?.user_metadata,
    startOutgoingTone,
    stopOutgoingTone,
    playConnectedChime,
    finishCall,
    isVideoEnabled,
  ]);

  // 2. Timer when call is connected
  useEffect(() => {
    if (callStatus !== "connected") return;
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !t.enabled));
      setIsMuted((prev) => !prev);
      toast.info(!isMuted ? "Đã tắt mic" : "Đã bật mic");
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((t) => (t.enabled = !t.enabled));
        setIsVideoEnabled((prev) => !prev);
        toast.info(!isVideoEnabled ? "Đã bật camera" : "Đã tắt camera");
      }
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const fmtDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-black text-white select-none animate-in fade-in-0 duration-300">
      {/* Hidden dedicated audio playback element that guarantees remote voice is always heard */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
        aria-hidden="true"
      />

      {/* Top Header: Encryption & Info */}
      <div className="w-full flex items-center justify-between px-5 pt-6 pb-2 z-20">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-blue-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{type === "video" ? "Cuộc gọi Video CEO 1983" : "Cuộc gọi Thoại CEO 1983"}</span>
        </div>
        <button
          type="button"
          onClick={() => finishCall("declined")}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Video or Avatar Area */}
      <div className="relative flex-1 w-full max-w-2xl mx-auto flex items-center justify-center p-4 overflow-hidden">
        {type === "video" && isVideoEnabled && !cameraError ? (
          <div className="relative w-full h-full max-h-[640px] rounded-3xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl flex items-center justify-center">
            {/* Main Video View (Remote / Partner) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Fallback if remote stream has no video yet: Show partner card inside */}
            {(!hasRemoteVideo || callStatus === "calling") && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-slate-950/70 backdrop-blur-xs">
                <div className="relative mb-4">
                  {peerAvatar ? (
                    <img
                      src={resolveMediaUrl(peerAvatar) || peerAvatar}
                      alt={peerName}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-[#2E3192]/60 shadow-xl"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#2E3192] to-[#19194D] grid place-items-center text-2xl font-black text-white ring-4 ring-amber-400/40 shadow-xl">
                      {peerName ? peerName.charAt(0).toUpperCase() : "C"}
                    </div>
                  )}
                  {callStatus === "calling" && (
                    <span className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ping opacity-60" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white drop-shadow-md">{peerName}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {callStatus === "calling" ? "Đang đổ chuông..." : fmtDuration(callSeconds)}
                </p>
              </div>
            )}

            {/* Floating PiP: Local Video Preview (Self) */}
            <div className="absolute bottom-4 right-4 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black z-30 pointer-events-auto">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              <div className="absolute top-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                Bạn
              </div>
            </div>
          </div>
        ) : (
          /* Audio Mode / Camera Off Mode */
          <div className="flex flex-col items-center justify-center text-center space-y-5 z-10">
            <div className="relative">
              {callStatus === "calling" && (
                <>
                  <div className="absolute -inset-6 rounded-full bg-[#2E3192]/30 animate-ping opacity-60" />
                  <div className="absolute -inset-10 rounded-full bg-[#2E3192]/15 animate-pulse opacity-40" />
                </>
              )}
              {peerAvatar ? (
                <img
                  src={resolveMediaUrl(peerAvatar) || peerAvatar}
                  alt={peerName}
                  className="relative h-32 w-32 rounded-full object-cover ring-4 ring-[#2E3192]/80 shadow-2xl"
                />
              ) : (
                <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-tr from-[#2E3192] to-[#19194D] text-white text-4xl font-black ring-4 ring-amber-400/40 shadow-2xl">
                  {peerName ? peerName.charAt(0).toUpperCase() : "C"}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                {peerName}
              </h2>
              {peerTitle && (
                <p className="text-xs text-amber-400/90 font-medium">{peerTitle}</p>
              )}
              <p className="text-sm font-semibold text-slate-400 font-mono pt-1">
                {callStatus === "calling" ? "Đang kết nối đối tác..." : fmtDuration(callSeconds)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-around px-6 py-8 z-20">
        {/* Mic toggle */}
        <button
          type="button"
          onClick={toggleMic}
          className={`flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer ${
            isMuted ? "text-rose-400" : "text-white"
          }`}
        >
          <div
            className={`grid h-13 w-13 place-items-center rounded-full border transition-colors ${
              isMuted
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
            }`}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </div>
          <span className="text-[11px] font-medium">{isMuted ? "Bật mic" : "Tắt mic"}</span>
        </button>

        {/* Video Camera Toggle */}
        <button
          type="button"
          onClick={toggleVideo}
          className={`flex flex-col items-center gap-1.5 transition active:scale-95 cursor-pointer ${
            !isVideoEnabled ? "text-rose-400" : "text-white"
          }`}
        >
          <div
            className={`grid h-13 w-13 place-items-center rounded-full border transition-colors ${
              !isVideoEnabled
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
            }`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </div>
          <span className="text-[11px] font-medium">{isVideoEnabled ? "Tắt cam" : "Bật cam"}</span>
        </button>

        {/* Flip Camera (for mobile) */}
        {isVideoEnabled && (
          <button
            type="button"
            onClick={switchCamera}
            className="flex flex-col items-center gap-1.5 text-white transition active:scale-95 cursor-pointer"
          >
            <div className="grid h-13 w-13 place-items-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors">
              <RefreshCw className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium">Đổi camera</span>
          </button>
        )}

        {/* End Call Button */}
        <button
          type="button"
          onClick={() => finishCall("completed")}
          className="flex flex-col items-center gap-1.5 transition active:scale-90 cursor-pointer text-white"
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-600 hover:bg-rose-700 shadow-[0_0_25px_rgba(225,29,72,0.6)]">
            <PhoneOff className="h-6 w-6 text-white" />
          </div>
          <span className="text-[11px] font-bold text-rose-300">Kết thúc</span>
        </button>
      </div>
    </div>
  );
}
