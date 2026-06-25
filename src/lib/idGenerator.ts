// Centralized ID generators with separate counters per entity type

let trackCounter = 0;
let clipCounter = 0;
let noteCounter = 0;
let audioFileCounter = 0;
let automationPointCounter = 0;

export const generateTrackId = (): string => `track-${Date.now()}-${trackCounter++}`;
export const generateClipId = (): string => `clip-${Date.now()}-${clipCounter++}`;
export const generateNoteId = (): string => `n-${Date.now()}-${noteCounter++}`;
export const generateAudioFileId = (): string => `audio-${Date.now()}-${audioFileCounter++}`;
export const generateAutomationPointId = (): string => `ap-${Date.now()}-${automationPointCounter++}`;

// General purpose ID for any entity
let generalCounter = 0;
export const generateId = (prefix = 'id'): string => `${prefix}-${Date.now()}-${generalCounter++}`;
