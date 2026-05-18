/**
 * Sample structure for Student LMS: prerecorded + live session replays.
 * Replace with API `/api/student/recordings` when backend auth is ready.
 */

export const PORTAL_PREVIEW_KEY = 'intelera_student_portal_preview';

/** @typedef {'prerecorded' | 'live-replay'} RecordingType */

/** @type {Array<{ id: string; courseSlug: string; title: string; type: RecordingType; durationMin: number; recordedAt: string; moduleLabel: string }>} */
export const portalRecordings = [
  {
    id: 'rec-1',
    courseSlug: 'intro-cyber-security-foundations',
    title: 'Welcome & how to use the Student Portal',
    type: 'prerecorded',
    durationMin: 12,
    recordedAt: '2025-02-01',
    moduleLabel: 'Orientation',
  },
  {
    id: 'rec-2',
    courseSlug: 'intro-cyber-security-foundations',
    title: 'Live: Why cybersecurity matters (cohort A replay)',
    type: 'live-replay',
    durationMin: 54,
    recordedAt: '2025-02-05',
    moduleLabel: 'Module 1',
  },
  {
    id: 'rec-3',
    courseSlug: 'intro-cyber-security-foundations',
    title: 'Live: Attack vocabulary for beginners (cohort A replay)',
    type: 'live-replay',
    durationMin: 61,
    recordedAt: '2025-02-12',
    moduleLabel: 'Module 2',
  },
  {
    id: 'rec-4',
    courseSlug: 'intro-digital-safety-privacy',
    title: 'Micro-lesson: Password managers in 15 minutes',
    type: 'prerecorded',
    durationMin: 15,
    recordedAt: '2025-02-03',
    moduleLabel: 'Module 1',
  },
  {
    id: 'rec-5',
    courseSlug: 'intro-digital-safety-privacy',
    title: 'Live workshop: Scams & verification (replay)',
    type: 'live-replay',
    durationMin: 48,
    recordedAt: '2025-02-10',
    moduleLabel: 'Module 3',
  },
  {
    id: 'rec-6',
    courseSlug: 'intro-networking-for-security',
    title: 'Lab walkthrough: Tracing a simple request',
    type: 'prerecorded',
    durationMin: 38,
    recordedAt: '2025-02-04',
    moduleLabel: 'Module 2',
  },
  {
    id: 'rec-7',
    courseSlug: 'intro-networking-for-security',
    title: 'Live: DNS & HTTP Q&A session (replay)',
    type: 'live-replay',
    durationMin: 55,
    recordedAt: '2025-02-14',
    moduleLabel: 'Module 2',
  },
  {
    id: 'rec-8',
    courseSlug: 'intro-web-html-css',
    title: 'Live coding: Your first HTML page (replay)',
    type: 'live-replay',
    durationMin: 72,
    recordedAt: '2025-02-06',
    moduleLabel: 'Module 1',
  },
  {
    id: 'rec-9',
    courseSlug: 'intro-web-html-css',
    title: 'Micro-lesson: Flexbox with diagrams',
    type: 'prerecorded',
    durationMin: 22,
    recordedAt: '2025-02-08',
    moduleLabel: 'Module 3',
  },
  {
    id: 'rec-10',
    courseSlug: 'intro-javascript-essentials',
    title: 'Live: Variables, functions & the console (replay)',
    type: 'live-replay',
    durationMin: 68,
    recordedAt: '2025-02-07',
    moduleLabel: 'Module 1',
  },
  {
    id: 'rec-11',
    courseSlug: 'intro-javascript-essentials',
    title: 'Prerecorded: fetch & JSON step by step',
    type: 'prerecorded',
    durationMin: 41,
    recordedAt: '2025-02-11',
    moduleLabel: 'Module 3',
  },
  {
    id: 'rec-12',
    courseSlug: 'intro-building-web-projects',
    title: 'Office hours: scoping your full-stack capstone (recording)',
    type: 'live-replay',
    durationMin: 44,
    recordedAt: '2025-02-13',
    moduleLabel: 'Module 1',
  },
];
