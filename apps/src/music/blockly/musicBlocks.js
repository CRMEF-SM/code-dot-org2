import {valueSample} from './blocks/samples';
import {forLoop} from './blocks/control';
import {whenRun, triggeredAt, triggeredAtSimple} from './blocks/events';
import {
  whenRunSimple2,
  triggeredAtSimple2,
  playSoundAtCurrentLocationSimple2,
  playPatternAtCurrentLocationSimple2,
  playRestAtCurrentLocationSimple2,
  setEffectAtCurrentLocationSimple2,
  playSoundsTogether,
  playSoundsSequential,
  playSoundsRandom,
  repeatSimple2,
  playChordAtCurrentLocationSimple2,
} from './blocks/simple2';
import {
  newTrackAtMeasure,
  newTrackAtStart,
  newTrackOnTrigger,
  playSoundInTrack,
  restInTrack,
} from './blocks/tracks';
import {
  playSoundAtCurrentLocation,
  setCurrentLocationNextMeasure,
} from './blocks/simple';
import {playSound} from './blocks/advanced';

// All blocks
const blockList = [
  whenRun,
  whenRunSimple2,
  triggeredAt,
  triggeredAtSimple,
  triggeredAtSimple2,
  playSound,
  playSoundAtCurrentLocation,
  setCurrentLocationNextMeasure,
  playSoundAtCurrentLocationSimple2,
  playPatternAtCurrentLocationSimple2,
  playRestAtCurrentLocationSimple2,
  setEffectAtCurrentLocationSimple2,
  playChordAtCurrentLocationSimple2,
  playSoundsTogether,
  playSoundsSequential,
  playSoundsRandom,
  repeatSimple2,
  forLoop,
  newTrackAtStart,
  newTrackAtMeasure,
  newTrackOnTrigger,
  playSoundInTrack,
  restInTrack,
  valueSample,
];

const MUSIC_BLOCKS = {};

// Construct mapping of BlockType -> block data
for (let block of blockList) {
  MUSIC_BLOCKS[block.definition.type] = block;
}

export {MUSIC_BLOCKS};
