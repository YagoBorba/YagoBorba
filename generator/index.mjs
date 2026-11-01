import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { contacts, profile, projects } from './content.mjs';
import { fetchProfile } from './github.mjs';
import { renderContact, renderFooter, renderHeader, renderProject, renderTelemetry } from './render.mjs';
import { themes } from './theme.mjs';

const login = process.env.PROFILE_LOGIN ?? 'YagoBorba';
const token = process.env.GITHUB_TOKEN;
const outputDir = process.env.OUTPUT_DIR ?? 'dist';

if (!token) {
  console.error('GITHUB_TOKEN is required');
  process.exit(1);
}

const now = new Date();
const stamp = `${now.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
const data = await fetchProfile(login, token);

const files = {};
for (const theme of Object.values(themes)) {
  const suffix = `-${theme.name}.svg`;
  files[`header${suffix}`] = renderHeader(theme, profile, data);
  files[`telemetry${suffix}`] = renderTelemetry(theme, data, stamp);
  files[`footer${suffix}`] = renderFooter(theme, stamp);
  projects.forEach((project, index) => {
    files[`project-${project.repo.toLowerCase()}${suffix}`] = renderProject(theme, project, index, data.repos[project.repo], now);
  });
  for (const contact of contacts) {
    files[`contact-${contact.id}${suffix}`] = renderContact(theme, contact);
  }
}

await mkdir(outputDir, { recursive: true });
await Promise.all(Object.entries(files).map(([name, content]) => writeFile(join(outputDir, name), content)));
console.log(`Generated ${Object.keys(files).length} files in ${outputDir}`);
