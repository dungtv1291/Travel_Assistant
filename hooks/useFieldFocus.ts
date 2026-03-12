import { useCallback, useRef } from 'react';
import { TextInput } from 'react-native';

/**
 * Returns a ref-based focus chain helper.
 * Usage:
 *   const { ref, onSubmit } = useFieldFocus(3);   // 3 inputs
 *   <TextInput ref={ref(0)} onSubmitEditing={onSubmit(0)} returnKeyType="next" />
 *   <TextInput ref={ref(1)} onSubmitEditing={onSubmit(1)} returnKeyType="next" />
 *   <TextInput ref={ref(2)} ...  returnKeyType="done" />
 */
export const useFieldFocus = (count: number) => {
  const refs = useRef<(TextInput | null)[]>(Array(count).fill(null));

  const ref = useCallback(
    (index: number) => (el: TextInput | null) => {
      refs.current[index] = el;
    },
    []
  );

  const onSubmit = useCallback(
    (index: number) => () => {
      const next = refs.current[index + 1];
      if (next) next.focus();
    },
    []
  );

  const focus = useCallback((index: number) => {
    refs.current[index]?.focus();
  }, []);

  return { ref, onSubmit, focus };
};
