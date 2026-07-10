import './fonts';
import React from 'react';
import { Composition } from 'remotion';
import { DareuriHowTo } from './Dareuri';
import { FPS, TOTAL_FRAMES } from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DareuriHowTo"
    component={DareuriHowTo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
