import { ComponentRef, RefObject, useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform, StatusBar, View } from 'react-native';

/**
 * How much of the given container the native keyboard covers, in points.
 *
 * Measuring against the container (instead of trusting the keyboard height)
 * gives the right answer whether Android resizes the window for the keyboard
 * (adjustResize), draws edge-to-edge, or leaves the window alone. Both sides are
 * compared in screen coordinates (see windowTop below).
 */
export function useKeyboardInset(container: RefObject<ComponentRef<typeof View> | null>): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: KeyboardEvent) => {
      const kbTop = e.endCoordinates.screenY;
      const node = container.current;
      if (!node) {
        setInset(e.endCoordinates.height);
        return;
      }
      node.measureInWindow((_x, y, _w, h) => {
        // measureInWindow is relative to a window origin below the Android status bar, while the
        // keyboard's screenY is in screen coordinates: add the status bar height back, or the
        // overlap comes out that much too small and the input stays partly behind the keyboard.
        const windowTop = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
        setInset(Math.max(0, y + windowTop + h - kbTop));
      });
    };
    const onHide = () => setInset(0);
    const a = Keyboard.addListener(showEvt, onShow);
    const b = Keyboard.addListener(hideEvt, onHide);
    return () => {
      a.remove();
      b.remove();
    };
  }, [container]);

  return inset;
}
