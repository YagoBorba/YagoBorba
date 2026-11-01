import { document, esc, fmt, monoWidth, niceCeil, panel, smoothPath, text, wrap } from './svg.mjs';

const glow = (theme) =>
  theme.glow > 0
    ? `<filter id="glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>`
    : '';

export function renderHeader(theme, profile, data) {
  const width = 1200;
  const height = 380;
  const scope = { x: 740, y: 76, w: 428, h: 228 };
  const plot = { x: scope.x + 1, y: scope.y + 40, w: scope.w - 2, h: scope.h - 64 };
  const period = plot.w / 2;
  const span = plot.w + period;
  const analog = [];
  for (let i = 0; i <= 180; i += 1) {
    const t = (i / 180) * (span / period);
    const wave = 0.55 * Math.sin(2 * Math.PI * t) + 0.28 * Math.sin(6 * Math.PI * t + 0.6) + 0.12 * Math.sin(14 * Math.PI * t + 1.1);
    analog.push([plot.x + t * period, plot.y + plot.h * 0.36 - wave * plot.h * 0.3]);
  }
  const trace = smoothPath(analog);
  const bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1];
  const bitWidth = period / bits.length;
  const high = plot.y + plot.h * 0.8;
  const low = plot.y + plot.h * 0.95;
  const bus = Array.from({ length: Math.ceil(span / bitWidth) }, (_, index) => {
    const x = plot.x + index * bitWidth;
    const y = bits[index % bits.length] ? high : low;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y} L${(x + bitWidth).toFixed(1)},${y}`;
  }).join(' ');

  const gridLines = [];
  for (let i = 1; i < 10; i += 1) {
    const x = scope.x + (scope.w / 10) * i;
    gridLines.push(`<line x1="${x}" y1="${scope.y + 1}" x2="${x}" y2="${scope.y + scope.h - 1}"/>`);
  }
  for (let i = 1; i < 6; i += 1) {
    const y = scope.y + (scope.h / 6) * i;
    gridLines.push(`<line x1="${scope.x + 1}" y1="${y}" x2="${scope.x + scope.w - 1}" y2="${y}"/>`);
  }

  const readouts = profile.readouts
    .map(([label, value], index) => {
      const x = 32 + index * 220;
      return text(x, 268, label, { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1.5"' }) +
        text(x, 290, value, { cls: 'mono', size: 15, fill: theme.text });
    })
    .join('');

  let chipX = 32;
  const chips = profile.pids
    .map((label, index) => {
      const code = `PID 0${index + 1}`;
      const chipWidth = monoWidth(`${code}  ${label}`, 12) + 24;
      const chip = `<rect x="${chipX}" y="324" width="${chipWidth}" height="28" rx="14" fill="none" stroke="${theme.border}"/>` +
        `<text x="${chipX + 12}" y="342" class="mono" font-size="12"><tspan fill="${theme.amber}">${code}</tspan><tspan fill="${theme.text}" dx="${monoWidth('  ', 12)}">${esc(label)}</tspan></text>`;
      chipX += chipWidth + 12;
      return chip;
    })
    .join('');

  const status = 'LINK ESTABLISHED';
  const statusX = width - 32 - monoWidth(status, 13);

  const body = `
<defs>${glow(theme)}
<clipPath id="screen"><rect x="${scope.x}" y="${scope.y}" width="${scope.w}" height="${scope.h}" rx="8"/></clipPath>
</defs>
${panel(width, height, theme)}
${text(32, 34, 'YB-01  //  DEVELOPER PROFILE  //  SYSTEM SCAN', { cls: 'mono', size: 13, fill: theme.muted, extra: ' letter-spacing="1"' })}
<circle class="pulse" cx="${statusX - 14}" cy="29.5" r="5" fill="${theme.green}"/>
${text(width - 32, 34, status, { cls: 'mono', size: 13, fill: theme.green, anchor: 'end' })}
<line x1="0" y1="52" x2="${width}" y2="52" stroke="${theme.border}"/>
<text x="32" y="104" class="mono" font-size="15" fill="${theme.amber}">${esc(profile.prompt)}</text>
<rect class="cursor" x="${32 + monoWidth(profile.prompt, 15) + 6}" y="92" width="9" height="16" fill="${theme.amber}"/>
${text(32, 176, profile.name, { size: 64, weight: 700, fill: theme.text, extra: ' letter-spacing="-1"' })}
${text(32, 218, profile.headline, { size: 22, fill: theme.muted })}
${readouts}
<rect x="${scope.x}" y="${scope.y}" width="${scope.w}" height="${scope.h}" rx="8" fill="${theme.inset}" stroke="${theme.border}"/>
<g stroke="${theme.grid}" stroke-width="1">${gridLines.join('')}</g>
<g clip-path="url(#screen)">
<g class="scroll">
${theme.glow > 0 ? `<path d="${trace}" fill="none" stroke="${theme.amber}" stroke-width="4" opacity="${theme.glow}" filter="url(#glow)"/>` : ''}
<path d="${trace}" fill="none" stroke="${theme.amber}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="${bus}" fill="none" stroke="${theme.cyan}" stroke-width="1.8" stroke-linejoin="round"/>
</g>
</g>
<text x="${scope.x + 16}" y="${scope.y + 24}" class="mono" font-size="11" letter-spacing="1"><tspan fill="${theme.amber}">CH1 ANALOG</tspan><tspan fill="${theme.cyan}" dx="16">CH2 DATA BUS</tspan></text>
${text(scope.x + scope.w - 16, scope.y + 24, 'LIVE', { cls: 'mono', size: 11, fill: theme.muted, anchor: 'end' })}
${text(scope.x + 16, scope.y + scope.h - 8, 'SIGNAL NOMINAL', { cls: 'mono', size: 11, fill: theme.muted })}
${text(scope.x + scope.w - 16, scope.y + scope.h - 8, `${fmt(data.totals.contributions)} CONTRIBUTIONS / 12 MO`, { cls: 'mono', size: 11, fill: theme.muted, anchor: 'end' })}
${chips}
${text(width - 32, 343, 'github.com/YagoBorba', { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
`;

  const css = `
.pulse{animation:pulse 2s ease-in-out infinite}
.cursor{animation:blink 1.1s steps(1) infinite}
.scroll{animation:scroll 6s linear infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes blink{0%,50%{opacity:1}50.01%,100%{opacity:0}}
@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-${period}px)}}
`;

  return document({
    width,
    height,
    title: `${profile.name} — ${profile.headline}`,
    desc: `Profile header styled as a diagnostic console. Focus areas: ${profile.pids.join(', ')}. An oscilloscope shows an animated analog signal and data bus, next to ${fmt(data.totals.contributions)} GitHub contributions in the last 12 months.`,
    css,
    body,
  });
}

function arc(cx, cy, r, startDeg, endDeg) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const start = [cx + r * Math.cos(rad(startDeg)), cy + r * Math.sin(rad(startDeg))];
  const end = [cx + r * Math.cos(rad(endDeg)), cy + r * Math.sin(rad(endDeg))];
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${start[0].toFixed(2)},${start[1].toFixed(2)} A${r},${r} 0 ${large} 1 ${end[0].toFixed(2)},${end[1].toFixed(2)}`;
}

export function renderTelemetry(theme, data, stamp) {
  const width = 1200;
  const height = 430;
  const { totals, streaks, languages } = data;

  const cx = 180;
  const cy = 196;
  const r = 104;
  const start = 150;
  const sweep = 240;
  const max = niceCeil(totals.contributions * 1.15);
  const ratio = Math.min(1, totals.contributions / max);
  const ticks = [];
  for (let i = 0; i <= 24; i += 1) {
    const angle = ((start + (sweep / 24) * i) * Math.PI) / 180;
    const major = i % 6 === 0;
    const inner = r - (major ? 28 : 22);
    const outer = r - 16;
    ticks.push(`<line x1="${(cx + inner * Math.cos(angle)).toFixed(2)}" y1="${(cy + inner * Math.sin(angle)).toFixed(2)}" x2="${(cx + outer * Math.cos(angle)).toFixed(2)}" y2="${(cy + outer * Math.sin(angle)).toFixed(2)}" stroke="${major ? theme.muted : theme.border}" stroke-width="${major ? 2 : 1}"/>`);
  }
  const needleAngle = start + sweep * ratio;
  const valueArc = ratio > 0 ? arc(cx, cy, r, start, start + sweep * ratio) : '';

  const metrics = [
    ['COMMITS', totals.commits],
    ['PULL REQUESTS', totals.pullRequests],
    ['ISSUES', totals.issues],
    ['STARS EARNED', totals.stars],
    ['PUBLIC REPOS', totals.repositories],
    ['FOLLOWERS', totals.followers],
  ];
  const cells = metrics
    .map(([label, value], index) => {
      const x = 372 + (index % 3) * 164;
      const y = 76 + Math.floor(index / 3) * 104;
      return `<rect x="${x}" y="${y}" width="152" height="92" rx="8" fill="${theme.inset}" stroke="${theme.border}"/>` +
        `<rect x="${x}" y="${y + 18}" width="3" height="16" fill="${theme.amber}"/>` +
        text(x + 16, y + 31, label, { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1"' }) +
        text(x + 16, y + 74, fmt(value), { cls: 'mono', size: 34, weight: 700, fill: theme.text });
    })
    .join('');

  const streakX = 880;
  const streak = `
<rect x="${streakX}" y="76" width="288" height="196" rx="8" fill="${theme.inset}" stroke="${theme.border}"/>
${text(streakX + 20, 104, 'STREAK MONITOR', { cls: 'mono', size: 11, fill: theme.cyan, extra: ' letter-spacing="1"' })}
<text x="${streakX + 20}" y="162" class="sans" fill="${theme.text}"><tspan font-size="54" font-weight="700">${streaks.current}</tspan><tspan font-size="16" fill="${theme.muted}" dx="8">${streaks.current === 1 ? 'day' : 'days'}</tspan></text>
${text(streakX + 20, 186, 'CURRENT STREAK', { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1"' })}
<line x1="${streakX + 20}" y1="204" x2="${streakX + 268}" y2="204" stroke="${theme.border}"/>
${text(streakX + 20, 230, 'LONGEST (12 MO)', { cls: 'mono', size: 12, fill: theme.muted })}
${text(streakX + 268, 230, `${streaks.longest} days`, { cls: 'mono', size: 12, fill: theme.text, anchor: 'end' })}
${text(streakX + 20, 254, 'BEST DAY', { cls: 'mono', size: 12, fill: theme.muted })}
${text(streakX + 268, 254, `${streaks.bestDay} contributions`, { cls: 'mono', size: 12, fill: theme.text, anchor: 'end' })}
`;

  const barX = 32;
  const barW = width - 64;
  let cursor = barX;
  const gap = 3;
  const usable = barW - gap * Math.max(0, languages.length - 1);
  const segments = languages
    .map((entry) => {
      const segmentWidth = Math.max(2, usable * entry.share);
      const rect = `<rect x="${cursor.toFixed(2)}" y="334" width="${segmentWidth.toFixed(2)}" height="12" fill="${entry.color ?? theme.muted}"/>`;
      cursor += segmentWidth + gap;
      return rect;
    })
    .join('');
  const slot = barW / Math.max(1, languages.length);
  const legend = languages
    .map((entry, index) => {
      const x = barX + index * slot;
      return `<circle cx="${x + 5}" cy="377" r="5" fill="${entry.color ?? theme.muted}"/>` +
        `<text x="${x + 16}" y="381" class="mono" font-size="12"><tspan fill="${theme.text}">${esc(entry.name)}</tspan><tspan fill="${theme.muted}" dx="7">${(entry.share * 100).toFixed(1)}%</tspan></text>`;
    })
    .join('');

  const body = `
<defs><clipPath id="bar"><rect x="${barX}" y="334" width="${barW}" height="12" rx="6"/></clipPath></defs>
${panel(width, height, theme)}
${text(32, 34, 'TELEMETRY  //  LAST 12 MONTHS', { cls: 'mono', size: 13, fill: theme.muted, extra: ' letter-spacing="1"' })}
${text(width - 32, 34, `SOURCE GITHUB GRAPHQL API  ·  ${stamp}`, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
<line x1="0" y1="52" x2="${width}" y2="52" stroke="${theme.border}"/>
<path d="${arc(cx, cy, r, start, start + sweep)}" fill="none" stroke="${theme.grid}" stroke-width="12" stroke-linecap="round"/>
${valueArc ? `<path class="fill" d="${valueArc}" pathLength="1" fill="none" stroke="${theme.amber}" stroke-width="12" stroke-linecap="round"/>` : ''}
${ticks.join('')}
<g class="needle" style="transform-origin:${cx}px ${cy}px">
<line x1="${cx}" y1="${cy}" x2="${(cx + (r - 34) * Math.cos((needleAngle * Math.PI) / 180)).toFixed(2)}" y2="${(cy + (r - 34) * Math.sin((needleAngle * Math.PI) / 180)).toFixed(2)}" stroke="${theme.cyan}" stroke-width="3" stroke-linecap="round"/>
</g>
<circle cx="${cx}" cy="${cy}" r="7" fill="${theme.panel}" stroke="${theme.cyan}" stroke-width="3"/>
${text(cx, cy + 62, fmt(totals.contributions), { size: 40, weight: 700, fill: theme.text, anchor: 'middle' })}
${text(cx, cy + 84, 'CONTRIBUTIONS', { cls: 'mono', size: 11, fill: theme.muted, anchor: 'middle', extra: ' letter-spacing="1.5"' })}
${text(cx - r * 0.87, cy + r * 0.5 + 26, '0', { cls: 'mono', size: 11, fill: theme.muted, anchor: 'middle' })}
${text(cx + r * 0.87, cy + r * 0.5 + 26, fmt(max), { cls: 'mono', size: 11, fill: theme.muted, anchor: 'middle' })}
${cells}
${streak}
<line x1="0" y1="300" x2="${width}" y2="300" stroke="${theme.border}"/>
${text(32, 322, 'LANGUAGE MIX  //  PUBLIC REPOSITORIES BY CODE SIZE', { cls: 'mono', size: 11, fill: theme.muted, extra: ' letter-spacing="1"' })}
<rect x="${barX}" y="334" width="${barW}" height="12" rx="6" fill="${theme.grid}"/>
<g clip-path="url(#bar)" class="grow">${segments}</g>
${legend}
`;

  const css = `
.fill{stroke-dasharray:1;animation:draw 1.8s ease-out both}
.needle{animation:swing 1.8s cubic-bezier(.3,1.4,.5,1) both}
.grow{animation:fade 1.2s ease-out both}
@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes swing{from{transform:rotate(-${(sweep * ratio).toFixed(1)}deg)}to{transform:rotate(0)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
`;

  const languageSummary = languages.map((entry) => `${entry.name} ${(entry.share * 100).toFixed(1)}%`).join(', ');
  return document({
    width,
    height,
    title: 'GitHub telemetry for the last 12 months',
    desc: `${fmt(totals.contributions)} contributions, ${fmt(totals.commits)} commits, ${fmt(totals.pullRequests)} pull requests, ${fmt(totals.issues)} issues, ${fmt(totals.stars)} stars earned, ${totals.repositories} public repositories, ${totals.followers} followers. Current streak ${streaks.current} days, longest ${streaks.longest} days. Language mix: ${languageSummary}.`,
    css,
    body,
  });
}

export function renderProject(theme, project, index, repo, now) {
  const width = 580;
  const height = 210;
  const pushed = repo?.pushedAt ? new Date(repo.pushedAt) : null;
  const active = pushed && now - pushed < 1000 * 60 * 60 * 24 * 60;
  const status = active ? 'ACTIVE' : 'STABLE';
  const statusColor = active ? theme.green : theme.cyan;
  const pillWidth = monoWidth(status, 11) + 34;
  const pillX = width - 24 - pillWidth;

  const lines = wrap(project.summary, 66, 3)
    .map((line, lineIndex) => text(24, 110 + lineIndex * 21, line, { size: 14, fill: theme.muted }))
    .join('');

  let chipX = 24;
  const chips = project.tags
    .map((tag) => {
      const chipWidth = monoWidth(tag, 11) + 18;
      const chip = `<rect x="${chipX}" y="168" width="${chipWidth}" height="22" rx="5" fill="${theme.inset}" stroke="${theme.border}"/>` +
        text(chipX + 9, 183, tag, { cls: 'mono', size: 11, fill: theme.text });
      chipX += chipWidth + 8;
      return chip;
    })
    .join('');

  const month = pushed ? pushed.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : '';
  const meta = [`★ ${repo?.stargazerCount ?? 0}`, month].filter(Boolean).join('  ·  ');
  const moduleLabel = `MOD-${String(index + 1).padStart(2, '0')}  ·  ${project.kind.toUpperCase()}`;

  const body = `
${panel(width, height, theme)}
<rect x="0.5" y="24" width="3" height="20" fill="${theme.amber}"/>
${text(24, 39, moduleLabel, { cls: 'mono', size: 12, fill: theme.muted, extra: ' letter-spacing="1"' })}
<rect x="${pillX}" y="22" width="${pillWidth}" height="22" rx="11" fill="none" stroke="${theme.border}"/>
<circle cx="${pillX + 13}" cy="33" r="4" fill="${statusColor}"/>
${text(pillX + 24, 37, status, { cls: 'mono', size: 11, fill: statusColor })}
${text(24, 80, project.title, { size: 26, weight: 700, fill: theme.text })}
${lines}
${chips}
${text(width - 24, 184, meta, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'end' })}
`;

  return document({
    width,
    height,
    title: `${project.title} — ${project.kind}`,
    desc: `${project.summary} Built with ${project.tags.join(', ')}. Status: ${status.toLowerCase()}.`,
    body,
  });
}

export function renderContact(theme, contact) {
  const width = 220;
  const height = 52;
  const body = `
${panel(width, height, theme, 10)}
<rect x="12" y="12" width="28" height="28" rx="6" fill="none" stroke="${theme.amber}"/>
${text(26, 31, contact.glyph, { cls: 'mono', size: 13, weight: 700, fill: theme.amber, anchor: 'middle' })}
${text(54, 32, contact.label, { size: 16, weight: 600, fill: theme.text })}
${text(width - 16, 32, '↗', { size: 16, fill: theme.muted, anchor: 'end' })}
`;
  return document({ width, height, title: contact.label, desc: `Contact Yago Borba via ${contact.label}`, body });
}

export function renderFooter(theme, stamp) {
  const width = 1200;
  const height = 48;
  const message = `END OF REPORT  ·  NO FAULTS DETECTED  ·  LAST SCAN ${stamp}`;
  const body = `
<line x1="0" y1="8" x2="${width}" y2="8" stroke="${theme.border}" stroke-dasharray="4 6"/>
${text(width / 2, 36, message, { cls: 'mono', size: 12, fill: theme.muted, anchor: 'middle', extra: ' letter-spacing="1"' })}
`;
  return document({ width, height, title: 'End of report', desc: `Profile assets last generated ${stamp}`, body });
}
