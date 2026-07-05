/**
 * Animation timing and spring presets used by the UI.
 * Kept framework-agnostic so screens can load without Reanimated.
 */

type SpringConfig = {
  damping: number;
  stiffness: number;
  mass: number;
};

type TimingConfig = {
  duration: number;
  easing: string;
};

export const springConfigs = {
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  } satisfies SpringConfig,
  snappy: {
    damping: 15,
    stiffness: 300,
    mass: 0.8,
  } satisfies SpringConfig,
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 1,
  } satisfies SpringConfig,
  stiff: {
    damping: 25,
    stiffness: 400,
    mass: 0.6,
  } satisfies SpringConfig,
};

export const timingConfigs = {
  fast: {
    duration: 200,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  } satisfies TimingConfig,
  normal: {
    duration: 350,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  } satisfies TimingConfig,
  slow: {
    duration: 500,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  } satisfies TimingConfig,
  entrance: {
    duration: 400,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
  } satisfies TimingConfig,
  exit: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
  } satisfies TimingConfig,
};

export const STAGGER_DELAY = 80;
export const PULSE_DURATION = 1500;
export const COUNTER_DURATION = 800;
