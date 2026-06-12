// ui.jsx — shared presentational components. Exported to window.
const { useState, useRef, useEffect } = React;

const cx = (...a) => a.filter(Boolean).join(' ');

// initials avatar with a hue derived from the name
function Avatar({ name, size = 34 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  let h = 0; for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flex: '0 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.38,
      color: `oklch(0.42 0.12 ${h})`, background: `oklch(0.93 0.05 ${h})`,
      border: `1px solid oklch(0.86 0.06 ${h})`, letterSpacing: '0.01em',
    }}>{initials}</div>
  );
}

const TONE = {
  ok:      { fg: 'var(--ok)',      bg: 'var(--ok-soft)' },
  bad:     { fg: 'var(--bad)',     bg: 'var(--bad-soft)' },
  warn:    { fg: 'oklch(0.55 0.14 70)', bg: 'var(--warn-soft)' },
  primary: { fg: 'var(--primary-strong)', bg: 'var(--primary-soft)' },
  neutral: { fg: 'var(--ink-2)',   bg: 'var(--surface-2)' },
};
function Badge({ tone = 'neutral', children, mono, style }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      color: t.fg, background: t.bg, lineHeight: 1.4, whiteSpace: 'nowrap',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      border: `1px solid color-mix(in oklch, ${t.fg} 18%, transparent)`,
      ...style,
    }}>{children}</span>
  );
}

function scoreTone(pct, threshold) {
  if (pct == null) return 'neutral';
  if (pct >= threshold) return 'ok';
  if (pct >= threshold - 15) return 'warn';
  return 'bad';
}

function Card({ title, subtitle, action, children, pad = true, style, bodyStyle }) {
  return (
    <section style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
      ...style,
    }}>
      {(title || action) && (
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '16px var(--pad-card)', borderBottom: '1px solid var(--line-soft)',
        }}>
          <div>
            <h3 style={{ fontSize: 15, color: 'var(--ink)', letterSpacing: '0.005em' }}>{title}</h3>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3, fontFamily: 'var(--font-ui)' }}>{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: pad ? 'var(--pad-card)' : 0, ...bodyStyle }}>{children}</div>
    </section>
  );
}

// circular score gauge
function ScoreRing({ value, size = 92, stroke = 9, threshold = 80, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value || 0));
  const t = scoreTone(value, threshold);
  const col = `var(--${t === 'neutral' ? 'ink-3' : t})`;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v/100)*c}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.7,.3,1), stroke 0.3s' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="tnum" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.28, color: 'var(--ink)', lineHeight: 1 }}>{Math.round(v)}<span style={{ fontSize: size*0.15, color: 'var(--ink-3)' }}>%</span></span>
        {label && <span style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>}
      </div>
    </div>
  );
}

// Yes / No / NA segmented control with big touch targets
const SEG = [
  { v: 'Yes', tone: 'ok',   sym: '\u2713' },
  { v: 'No',  tone: 'bad',  sym: '\u2715' },
  { v: 'NA',  tone: 'neutral', sym: '\u2013' },
];
function SegToggle({ value, onChange, size = 'md' }) {
  const h = size === 'sm' ? 32 : 38;
  return (
    <div role="radiogroup" style={{
      display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 10,
      padding: 3, gap: 3, border: '1px solid var(--line)',
    }}>
      {SEG.map(s => {
        const on = value === s.v;
        const t = TONE[s.tone];
        return (
          <button key={s.v} type="button" role="radio" aria-checked={on}
            onClick={() => onChange(s.v)}
            style={{
              minWidth: size === 'sm' ? 40 : 52, height: h, border: 'none', borderRadius: 7,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.01em',
              color: on ? (s.v === 'NA' ? 'var(--ink)' : '#fff') : 'var(--ink-3)',
              background: on ? (s.v === 'NA' ? 'var(--line)' : t.fg) : 'transparent',
              boxShadow: on && s.v !== 'NA' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}>
            <span style={{ fontSize: 13, opacity: on ? 1 : 0.6 }}>{s.sym}</span>{s.v}
          </button>
        );
      })}
    </div>
  );
}

// horizontal bar list (used for miss analysis & section breakdowns)
function HBars({ rows, max = 100, height = 8, unit = '%', invert = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map((r, i) => {
        const pct = Math.max(0, Math.min(100, (r.value / max) * 100));
        const tone = r.tone || (invert ? (r.value > 25 ? 'bad' : r.value > 10 ? 'warn' : 'ok') : scoreTone(r.value, 80));
        const col = `var(--${tone === 'neutral' ? 'ink-3' : tone})`;
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{r.label}</span>
              <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: col, fontFamily: 'var(--font-mono)' }}>{r.display ?? (r.value + unit)}</span>
            </div>
            <div style={{ gridColumn: '1 / -1', height, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: pct + '%', height: '100%', background: col, borderRadius: 99, transition: 'width 0.6s cubic-bezier(.2,.7,.3,1)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// svg sparkline / trend with optional threshold line
function TrendLine({ data, height = 64, threshold, color = 'var(--primary)' }) {
  if (!data || data.length === 0) return null;
  const W = 280, H = height, pad = 6;
  const xs = data.length === 1 ? [W/2] : data.map((_, i) => pad + (i/(data.length-1))*(W-2*pad));
  const ys = data.map(v => H - pad - (v/100)*(H-2*pad));
  const path = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length-1].toFixed(1)},${H-pad} L${xs[0].toFixed(1)},${H-pad} Z`;
  const ty = threshold != null ? H - pad - (threshold/100)*(H-2*pad) : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.18" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {ty != null && <line x1="0" y1={ty} x2={W} y2={ty} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />}
      <path d={area} fill="url(#tg)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="2.6" fill="var(--surface)" stroke={color} strokeWidth="1.8" />)}
    </svg>
  );
}

// ---- form atoms ----
function Field({ label, hint, children, span }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: span ? `span ${span}` : undefined, minWidth: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.01em' }}>{label}{hint && <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}> · {hint}</span>}</span>
      {children}
    </label>
  );
}
const inputBase = {
  height: 40, padding: '0 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)',
  fontSize: 14, outline: 'none', width: '100%', transition: 'border-color 0.15s, box-shadow 0.15s',
};
function TextInput({ value, onChange, locked, ...p }) {
  return <input {...p} value={value} disabled={locked}
    onChange={e => onChange && onChange(e.target.value)}
    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-soft)'; }}
    onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
    style={{ ...inputBase, background: locked ? 'var(--surface-2)' : 'var(--surface)', color: locked ? 'var(--ink-3)' : 'var(--ink)', cursor: locked ? 'not-allowed' : 'text' }} />;
}
function Select({ value, onChange, children, ...p }) {
  return (
    <div style={{ position: 'relative' }}>
      <select {...p} value={value} onChange={e => onChange && onChange(e.target.value)}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-soft)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
        style={{ ...inputBase, appearance: 'none', paddingRight: 34, cursor: 'pointer' }}>{children}</select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)', fontSize: 11 }}>▼</span>
    </div>
  );
}
function TextArea({ value, onChange, ...p }) {
  return <textarea {...p} value={value} onChange={e => onChange && onChange(e.target.value)}
    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-soft)'; }}
    onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none'; }}
    style={{ ...inputBase, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }} />;
}
function Button({ children, variant = 'primary', size = 'md', ...p }) {
  const h = size === 'sm' ? 34 : 42;
  const styles = {
    primary: { background: 'var(--primary)', color: '#fff', border: '1px solid transparent', boxShadow: 'var(--shadow-sm)' },
    ghost: { background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line)' },
    soft: { background: 'var(--primary-soft)', color: 'var(--primary-strong)', border: '1px solid transparent' },
  };
  return <button {...p} style={{
    height: h, padding: size === 'sm' ? '0 14px' : '0 20px', borderRadius: 'var(--radius-sm)',
    fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'transform 0.08s, filter 0.15s', ...styles[variant], ...(p.style || {}),
  }}
    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.04)'; }}
    onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
  >{children}</button>;
}

// simple table primitives
function Table({ children, style }) {
  return <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, ...style }}>{children}</table>;
}
const thStyle = { textAlign: 'left', padding: '12px 16px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', background: 'var(--surface-2)' };
const tdStyle = { padding: '0 16px', height: 'var(--row-h)', borderBottom: '1px solid var(--line-soft)', color: 'var(--ink)', verticalAlign: 'middle' };

function EmptyState({ icon = '○', title, body }) {
  return (
    <div style={{ padding: '54px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 30, color: 'var(--ink-3)', opacity: 0.5, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: 'var(--ink-2)', fontSize: 15 }}>{title}</div>
      {body && <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 5, maxWidth: 360, margin: '5px auto 0' }}>{body}</div>}
    </div>
  );
}

Object.assign(window, {
  cx, Avatar, Badge, Card, ScoreRing, SegToggle, HBars, TrendLine,
  Field, TextInput, Select, TextArea, Button, Table, thStyle, tdStyle,
  EmptyState, scoreTone, TONE,
});
