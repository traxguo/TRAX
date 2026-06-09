import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { useStore } from '../store';
import { useT } from '../i18n';
import { colorFor, initials } from '../data';
import Icon from './Icon';

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

interface Confirmed { name: string; color: string; ini: string; }

export default function QRScanner() {
  const { members, attendanceLog, toggleAttendance } = useStore();
  const t = useT();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const pauseRef  = useRef(false);

  const [camErr,    setCamErr]    = useState('');
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [alreadyIn, setAlreadyIn] = useState(false);

  const handleDetected = useCallback((memberId: number) => {
    pauseRef.current = true;
    const today  = toKey(new Date());
    const member = members.find(m => m.id === memberId);
    if (!member) {
      setTimeout(() => { pauseRef.current = false; }, 2000);
      return;
    }
    const was = (attendanceLog[today] || []).includes(memberId);
    if (!was) toggleAttendance(today, memberId);
    setAlreadyIn(was);
    setConfirmed({ name: member.name, color: colorFor(member.name), ini: initials(member.name) });
    setTimeout(() => {
      setConfirmed(null);
      pauseRef.current = false;
    }, 2800);
  }, [members, attendanceLog, toggleAttendance]);

  useEffect(() => {
    let stream: MediaStream;
    let stopped = false;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    }).then(s => {
      if (stopped) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = s;
      video.play();
      rafRef.current = requestAnimationFrame(tick);
    }).catch(() => setCamErr(t.camError));

    function tick() {
      if (stopped) return;
      if (pauseRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick); return;
      }
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      const d    = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(d.data, d.width, d.height, { inversionAttempts: 'dontInvert' });
      if (code?.data?.startsWith('TRAX-')) {
        const id = parseInt(code.data.slice(5));
        if (!isNaN(id)) { handleDetected(id); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [handleDetected]);

  if (camErr) return (
    <div className="qr-err-wrap">
      <div className="qr-err-ic"><Icon name="ban" size={28} /></div>
      <div className="qr-err-txt">{camErr}</div>
    </div>
  );

  return (
    <div className="qr-wrap">
      <video ref={videoRef} playsInline muted className="qr-video" />
      <canvas ref={canvasRef} style={{ display:'none' }} />

      {/* scanning overlay */}
      {!confirmed && (
        <div className="qr-overlay">
          <div className="qr-frame">
            <span /><span /><span /><span />
          </div>
          <div className="qr-hint">{t.qrInstruction}</div>
        </div>
      )}

      {/* confirmation */}
      {confirmed && (
        <div className="qr-confirm">
          <div className="qr-confirm-av" style={{ background: confirmed.color }}>
            {confirmed.ini}
          </div>
          <div className="qr-confirm-name">{confirmed.name}</div>
          <div className="qr-confirm-label">
            {alreadyIn
              ? <><Icon name="check" size={14} stroke={2.6} />{t.alreadyIn}</>
              : <><Icon name="check" size={14} stroke={2.6} />{t.checkedIn}</>
            }
          </div>
        </div>
      )}
    </div>
  );
}
