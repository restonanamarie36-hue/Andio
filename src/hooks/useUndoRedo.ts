import { useReducer } from 'react';
import { Track } from '../types';

interface HistoryState {
  past: Track[][];
  present: Track[];
  future: Track[][];
}

type HistoryAction =
  | { type: 'push'; tracks: Track[] }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; tracks: Track[] };

const MAX_HISTORY = 50;

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'push': {
      const newPast = [...state.past, state.present];
      if (newPast.length > MAX_HISTORY) newPast.shift();
      return { past: newPast, present: action.tracks, future: [] };
    }
    case 'undo': {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
      };
    }
    case 'redo': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    case 'reset':
      return { past: [], present: action.tracks, future: [] };
  }
}

export function useUndoRedo(initial: Track[]) {
  const [state, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initial,
    future: [],
  });

  return {
    tracks: state.present,
    pushTracks: (tracks: Track[]) => dispatch({ type: 'push', tracks }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    reset: (tracks: Track[]) => dispatch({ type: 'reset', tracks }),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
