export const profile = {
  name: 'Yago Borba',
  headline: 'Full-Stack Developer · Systems Integration & DevOps',
  prompt: '$ scan --target yago-borba',
  readouts: [
    ['ROLE', 'Backend-first'],
    ['BASE', 'Santa Catarina, BR'],
    ['STUDY', 'Software Eng. @ UGV'],
  ],
  pids: ['BACKEND', 'APIs & INTEGRATION', 'DEVOPS & CI/CD', 'MOBILE', 'EMBEDDED & IoT'],
};

export const projects = [
  {
    repo: 'BorbaCarLabs',
    title: 'BorbaCar Labs',
    kind: 'Android · OBD-II',
    summary: 'Android OBD-II diagnostic app in Java. Reads ELM327 adapters over Bluetooth, BLE or Wi-Fi, explains trouble codes in plain language and exports traceable PDF reports with optional AI analysis.',
    tags: ['Java 17', 'Android', 'Node.js', 'OBD-II'],
  },
  {
    repo: 'StackCode',
    title: 'StackCode',
    kind: 'CLI · VS Code',
    summary: 'Open-source developer toolkit: an npm CLI and a VS Code extension that automate Gitflow, conventional commits, changelogs and semantic versioning, so best practices become the easy path.',
    tags: ['TypeScript', 'Node.js', 'Vitest', 'GitHub Actions'],
  },
  {
    repo: 'MaxDiagnostic',
    title: 'MaxDiagnostic',
    kind: 'Flutter · Network',
    summary: 'Cross-platform network diagnostic app with Clean Architecture. Checks Wi-Fi signal, runs LibreSpeed speed tests and generates PDF reports for ISP support teams.',
    tags: ['Flutter', 'Dart', 'Clean Architecture', 'LibreSpeed'],
  },
  {
    repo: 'DevTaskManager',
    title: 'DevTaskManager',
    kind: 'Chrome · REST API',
    summary: 'Chrome extension for project and task management, backed by an ASP.NET Core 8 REST API with Entity Framework Core, SQLite and Swagger documentation.',
    tags: ['C#', '.NET 8', 'React', 'SQLite'],
  },
  {
    repo: 'WattHouse',
    title: 'WattHouse',
    kind: 'Web · Energy',
    summary: 'Residential energy management platform: register appliances, estimate daily and monthly consumption and track costs with configurable kWh pricing.',
    tags: ['React', 'TypeScript', 'Firebase', 'Docker'],
  },
  {
    repo: 'ESP32-Light-Tracker',
    title: 'ESP32 Light Tracker',
    kind: 'Embedded · IoT',
    summary: 'Dual-axis solar tracker: an ESP32 reads four LDR sensors and drives two servos, with Bluetooth manual control, automatic calibration and real-time telemetry.',
    tags: ['C++', 'ESP32', 'PlatformIO', 'Bluetooth'],
  },
];

export const contacts = [
  { id: 'linkedin', label: 'LinkedIn', glyph: 'in' },
  { id: 'email', label: 'Email', glyph: '@' },
  { id: 'stackoverflow', label: 'Stack Overflow', glyph: 'so' },
];

export const excludedLanguages = new Set(['HTML', 'CSS', 'SCSS', 'Smarty', 'CMake', 'Makefile', 'Batchfile', 'Dockerfile', 'Procfile']);
