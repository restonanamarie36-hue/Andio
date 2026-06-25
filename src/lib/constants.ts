// Grid and timing constants used across the DAW
export const STEPS_PER_BAR = 16;
export const BEATS_PER_BAR = 4;
export const STEPS_PER_BEAT = STEPS_PER_BAR / BEATS_PER_BAR;

// Visual sizing constants
export const BEAT_WIDTH = 56;
export const STEP_WIDTH = BEAT_WIDTH / STEPS_PER_BEAT;
export const BAR_WIDTH = BEAT_WIDTH * BEATS_PER_BAR;
export const TRACK_HEIGHT = 68;
export const HEADER_WIDTH = 200;
export const RULER_HEIGHT = 40;
export const RESIZE_HANDLE_WIDTH = 8;

// Piano roll constants
export const PIANO_ROW_HEIGHT = 13;
export const PIANO_KEY_WIDTH = 46;
export const BASE_COLUMN_WIDTH = 32;

// BPM limits
export const BPM_MIN = 40;
export const BPM_MAX = 240;

// Velocity limits
export const VELOCITY_MIN = 0;
export const VELOCITY_MAX = 1;

// Percent limits (for volume, pan, sends)
export const PERCENT_MIN = 0;
export const PERCENT_MAX = 100;

// Default project settings
export const DEFAULT_BPM = 120;
export const DEFAULT_LOOP_BARS = 4;
