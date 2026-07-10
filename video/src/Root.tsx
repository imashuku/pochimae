import './fonts';
import React from 'react';
import { Composition } from 'remotion';
import { DareuriHowTo } from './Dareuri';
import { DareuriShort, SHORT_TOTAL_FRAMES } from './Short';
import { FPS, TOTAL_FRAMES } from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DareuriHowTo"
      component={DareuriHowTo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* SNS用の30秒版。実演を中心に据えた別構成 */}
    <Composition
      id="DareuriShort"
      component={DareuriShort}
      durationInFrames={SHORT_TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
