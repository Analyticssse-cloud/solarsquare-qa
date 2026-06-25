// calibration.jsx — TL vs QA Auditor comparison.
// A QA Auditor independently re-audits leads that Team Leads have already scored. This view
// pairs the two scores per lead so you can see calibration: where TL and QA agree, where
// they diverge, and which leads still await a QA review. Scored on the same framework.
const { useMemo: useMemoCal } = React;

function CalibrationView({ audits = [], threshold }) {
  const { SECTIONS, fmtDate, roleForEmail } = window.QA;
  const roleOf = a => a.auditorRole || roleForEmail(a.auditorEmail || '');

  const { pairs, awaiting, kpis, secGap } = useMemoCal(() => {
    // Keep the latest audit of each role, per lead.
    const byLead = {};
    audits.forEach(a => {
      const k = a.leadId;
      if (!k) return;
      byLead[k] = byLead[k] || { leadId: k, agentName: a.agentName, tlName: a.tlName };
      const slot = roleOf(a) === 'QA' ? 'qa' : 'tl';
      if (!byLead[k][slot] || (a.ts || 0) > (byLead[k][slot].ts || 0)) byLead[k][slot] = a;
    });
    const all = Object.values(byLead);
    const pairs = all.filter(r => r.tl && r.qa)
      .map(r => ({ ...r, gap: r.qa.overall - r.tl.overall }))
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
    const awaiting = all.filter(r => r.tl && !r.qa).length;

    const n = pairs.length;
    const avgAbs = n ? Math.round(pairs.reduce((s, p) => s + Math.abs(p.gap), 0) / n) : 0;
    const agree = n ? Math.round(100 * pairs.filter(p => (p.tl.overall >= threshold) === (p.qa.overall >= threshold)).length / n) : 0;

    // Per-section average signed gap (QA − TL): which parts of the call QA scores tougher/softer.
    const secGap = SECTIONS.map(s => {
      let sum = 0, c = 0;
      pairs.forEach(p => {
        const tv = p.tl.sectionPct[s.key], qv = p.qa.sectionPct[s.key];
        if (tv != null && qv != null) { sum += (qv - tv); c++; }
      });
      return { key: s.key, name: s.name, gap: c ? Math.round(sum / c) : null };
    });
    return { pairs, awaiting, kpis: { n, avgAbs, agree }, secGap };
  }, [audits, threshold]);

  const gapTone = g => { const a = Math.abs(g); return a <= 5 ? 'ok' : a <= 12 ? 'warn' : 'bad'; };
  const sign = g => (g > 0 ? '+' : '') + g;

  const KPIS = [
    { label: 'Leads calibrated', val: kpis.n, sub: 'TL + QA both scored' },
    { label: 'Avg score gap', val: kpis.avgAbs + ' pts', sub: 'absolute |QA − TL|' },
    { label: 'Pass/fail agreement', val: kpis.agree + '%', sub: 'same verdict @ ' + threshold + '%' },
    { label: 'Awaiting QA', val: awaiting, sub: 'TL-scored, no QA yet' },
  ];

  return (
    <div>
      <ViewHeader title="Calibration"
        sub="TL vs QA Auditor scores on the same lead — where they agree, where they diverge, and which leads still need a QA review." />

      {kpis.n === 0 ? (
        <Card>
          <EmptyState title="No paired audits yet"
            body={awaiting
              ? `${awaiting} lead${awaiting > 1 ? 's' : ''} a Team Lead has scored ${awaiting > 1 ? 'are' : 'is'} waiting for a QA review. Once a QA Auditor re-audits one, the comparison appears here.`
              : 'Once a QA Auditor re-audits a lead a Team Lead has already scored, the side-by-side comparison appears here.'} />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
            {KPIS.map((k, i) => (
              <Card key={i}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)' }}>{k.label}</div>
                <div className="tnum" style={{ fontSize: 30, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', margin: '6px 0 2px' }}>{k.val}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{k.sub}</div>
              </Card>
            ))}
          </div>

          <Card title="Where QA differs from TL" subtitle="Average signed gap by section (QA minus TL). Bar right / green = QA scores higher; left / red = QA scores tougher.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {secGap.map(s => {
                const g = s.gap; const pos = (g || 0) >= 0;
                const w = Math.min(50, Math.abs(g || 0));
                return (
                  <div key={s.key} style={{ display: 'grid', gridTemplateColumns: '132px 1fr 48px', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{s.name}</span>
                    <div style={{ position: 'relative', height: 10, background: 'var(--surface-2)', borderRadius: 99, border: '1px solid var(--line-soft)' }}>
                      <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: 'var(--line)' }} />
                      {g != null && <div style={{ position: 'absolute', top: 1, bottom: 1, left: pos ? '50%' : 'auto', right: pos ? 'auto' : '50%', width: w + '%', maxWidth: '50%', background: pos ? 'var(--ok)' : 'var(--bad)', borderRadius: 99 }} />}
                    </div>
                    <span className="tnum" style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'right', color: g == null ? 'var(--ink-3)' : (pos ? 'var(--ok)' : 'var(--bad)') }}>{g == null ? '—' : sign(g)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Lead-by-lead comparison" subtitle="Sorted by largest gap — the biggest divergences are your best calibration conversations." pad={false}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Lead</th>
                    <th style={thStyle}>LRM</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL score</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>QA score</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Gap</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Verdict</th>
                    <th style={thStyle}>QA Auditor</th>
                  </tr>
                </thead>
                <tbody>
                  {pairs.map(p => {
                    const sameVerdict = (p.tl.overall >= threshold) === (p.qa.overall >= threshold);
                    return (
                      <tr key={p.leadId}>
                        <td style={tdStyle}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: 'var(--primary-strong)' }}>{p.leadId}</span></td>
                        <td style={tdStyle}>{p.agentName}</td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}><Badge tone={scoreTone(p.tl.overall, threshold)} mono>{p.tl.overall}%</Badge></td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}><Badge tone={scoreTone(p.qa.overall, threshold)} mono>{p.qa.overall}%</Badge></td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}><Badge tone={gapTone(p.gap)} mono>{sign(p.gap)}</Badge></td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          {sameVerdict
                            ? <span style={{ color: 'var(--ok)', fontSize: 13, fontWeight: 600 }}>Agree</span>
                            : <span style={{ color: 'var(--bad)', fontSize: 13, fontWeight: 700 }}>Disagree</span>}
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{p.qa.auditorName || '—'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CalibrationView });
