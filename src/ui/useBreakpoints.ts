import { useWindowDimensions } from 'react-native';

/** Largura abaixo disso: cartões em listagens, cabeçalhos empilhados, config. em coluna. */
export const COMPACT_MAX = 768;

/** Largura abaixo disso: layout empilhado na tela de agendamento (calendário + lista). */
export const SCHEDULE_STACK_MAX = 900;

export function useBreakpoints() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isCompact: width < COMPACT_MAX,
    isTablet: width >= COMPACT_MAX && width < 1024,
    isWide: width >= 1024,
    useTableLayout: width >= COMPACT_MAX,
    useScheduleTwoColumn: width >= SCHEDULE_STACK_MAX,
  };
}
