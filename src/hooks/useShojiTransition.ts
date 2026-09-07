import { useState, useCallback } from 'react';
import { ShojiTransitionConfig } from '../components/ShojiTransition';

export function useShojiTransition() {
  const [isShojiActive, setIsShojiActive] = useState(false);
  const [shojiConfig, setShojiConfig] = useState<ShojiTransitionConfig | null>(null);

  const triggerShoji = useCallback((config: ShojiTransitionConfig) => {
    setShojiConfig(config);
    setIsShojiActive(true);
  }, []);

  const handleShojiFinished = useCallback(() => {
    setIsShojiActive(false);
    setShojiConfig(null);
  }, []);

  return {
    isShojiActive,
    shojiConfig,
    triggerShoji,
    handleShojiFinished,
  };
}
