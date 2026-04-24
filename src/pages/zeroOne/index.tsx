import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OutRule } from '../../types';
import { useZeroOneGame, type PlayerCount, type StartScore, type BullMode } from './hooks';
import {
  ZeroOneSetupTemplate,
  ZeroOneGameTemplate,
  type ZeroOneGameTemplateProps,
} from './template';

interface ZeroOneGameProps extends Pick<
  ZeroOneGameTemplateProps,
  'playerCount' | 'outRule' | 'bullMode' | 'onExitToHome'
> {
  startScore: StartScore;
}

const ZeroOneGame = ({
  playerCount,
  startScore,
  outRule,
  bullMode,
  onExitToHome,
}: ZeroOneGameProps) => {
  const state = useZeroOneGame({ playerCount, startScore, outRule, bullMode });
  return (
    <ZeroOneGameTemplate
      {...state}
      playerCount={playerCount}
      outRule={outRule}
      bullMode={bullMode}
      onExitToHome={onExitToHome}
    />
  );
};

export const ZeroOne = () => {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<PlayerCount>(1);
  const [startScore, setStartScore] = useState<StartScore>(501);
  const [outRule, setOutRule] = useState<OutRule>('open');
  const [bullMode, setBullMode] = useState<BullMode>('fat');
  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-base transition-colors shrink-0"
        >
          ← ホームへ
        </button>
        <span className="text-white font-bold tracking-wide text-lg">01</span>
        <div className="w-[64px] shrink-0" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {isGameStarted ? (
          <ZeroOneGame
            playerCount={playerCount}
            startScore={startScore}
            outRule={outRule}
            bullMode={bullMode}
            onExitToHome={() => navigate('/')}
          />
        ) : (
          <ZeroOneSetupTemplate
            playerCount={playerCount}
            startScore={startScore}
            outRule={outRule}
            bullMode={bullMode}
            onPlayerCountChange={setPlayerCount}
            onStartScoreChange={setStartScore}
            onOutRuleChange={setOutRule}
            onBullModeChange={setBullMode}
            onStartGame={() => setIsGameStarted(true)}
          />
        )}
      </div>
    </div>
  );
};
