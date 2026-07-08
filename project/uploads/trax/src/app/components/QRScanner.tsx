import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useStore } from '../store';
import { useT } from '../i18n';
import { glowOf, toKey } from '../utils';
import { colorFor, initials } from '../data';
import Icon from './Icon';

interface Confirmed { name: string; color: string; ini: string; warn: string; }

export default function QRScanner() {
  const store = useStore();
  const t = useT();
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const pauseRef  = useRef(false);
  // latest store/t via refs so the camera effect never re-runs (no restart per scan)
  const storeRef  = useRef(store);
  storeRef.current = store;
  const tRef = useRef(t);
  tRef.current = t;

  const [camErr,    setCamErr]    = useState('');
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [alreadyIn, setAlreadyIn] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    let stopped = false;

    function handleDetected(memberId: number) {
      pauseRef.current = true;
      const { members, attendanceLog, toggleAttendance } = storeRef.current;
      const tt = tRef.current;
      const today  = toKey(new Date());
      const member = members.find(m => m.id === memberId);
      if (!member) {
        setTimeout(() => { pauseRef.current = false; }, 2000);
        return;
      }
      const was = (attendanceLog[today] || []).includes(memberId);
      if (!was) toggleAttendance(today, memberId);
      setAlreadyIn(was);

      // warn the front desk when this member should not be let in silently
      const g = glowOf(member);
      let warn = '';
      if (!was) {
        if (member.kind === 'paket' && (member.adet || 0) <= 0) warn = tt.qrPackageEnded;
        else if (g === 's-red') warn = tt.qrExpiredWarn;
        else if (g === 's-frozen') warn = tt.qrFrozenWarn;
      }
      setConfirmed({ name: member.name, color: colorFor(member.name), ini: initials(member.name), warn });
      setTimeout(() => {
        setConfirmed(null);
        pauseRef.current = false;
      }, 2800);
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    }).then(s => {
      if (stopped) { s.getTracks().forEach(tr => tr.stop()); return; }
      stream = s;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = s;
      video.play();
      rafRef.current = requestAnimationFrame(tick);
    }).catch(() => setCamErr(tRef.current.camError));

    function tick() {
      if (stopped) return;
      // always keep the loop alive — pausing only skips processing
      rafRef.current = requestAnimationFrame(tick);
      if (pauseRef.current) return;
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      const d    = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(d.data, d.width, d.height, { inversionAttempts: 'dontInvert' });
      if (code?.data?.startsWith('TRAX-')) {
        const id = parseInt(code.data.slice(5), 10);
        if (!isNaN(id)) handleDetected(id);
      }
    }

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach(tr => tr.stop());
    };
  }, []);

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
          {confirmed.warn && (
            <div className="qr-warn">{confirmed.warn}</div>
          )}
        </div>
      )}
    </div>
  );
}
