import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

/**
 * A minimal screen stack: the bottom entry is the tab shell, anything pushed on
 * top (create flow, camera, editors) covers it. Android's back button pops one
 * entry. Screens that need their own back behaviour (e.g. CreateScreen's discard
 * prompt) register their own BackHandler, which runs before this one.
 */
export function useScreenStack<R extends { name: string }>(root: R) {
  const [stack, setStack] = useState<R[]>([root]);
  const depth = useRef(1);
  depth.current = stack.length;

  const push = useCallback((route: R) => setStack((s) => [...s, route]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const popToRoot = useCallback(() => setStack((s) => s.slice(0, 1)), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (depth.current > 1) {
        pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [pop]);

  return { stack, top: stack[stack.length - 1], push, pop, popToRoot };
}
