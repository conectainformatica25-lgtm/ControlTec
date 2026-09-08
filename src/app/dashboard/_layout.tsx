import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme, getSidebarMode } from '../../ui/themes';
import TopBar from '../../ui/components/TopBar';
import MobileSidebar from '../../ui/components/MobileSidebar';
import { useBreakpoints } from '../../ui/useBreakpoints';

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();
  const { isCompact } = useBreakpoints();
  const [sidebarMode, setMode] = useState<'icons_hover' | 'expanded' | 'topbar'>('icons_hover');
  const [bgColor, setBgColor] = useState(Theme.colors.primary);

  useEffect(() => {
    setMode(getSidebarMode());
    setBgColor(Theme.colors.primary);

    const handleModeUpdate = () => {
      setMode(getSidebarMode());
    };
    const handleThemeUpdate = () => {
      setBgColor(Theme.colors.primary);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('controltec_sidebar_mode_updated', handleModeUpdate);
      window.addEventListener('controltec_theme_updated', handleThemeUpdate);
      return () => {
        window.removeEventListener('controltec_sidebar_mode_updated', handleModeUpdate);
        window.removeEventListener('controltec_theme_updated', handleThemeUpdate);
      };
    }
  }, []);

  // Se o usuário estiver no mobile, usa sempre a sidebar lateral
  if (isCompact) {
    return (
      <View style={[styles.mobileContainer, { backgroundColor: bgColor }]}>
        <MobileSidebar />
        <View style={[styles.mobileContent, { paddingBottom: Math.max(insets.bottom, Theme.spacing.sm) }]}>
          <Slot />
        </View>
      </View>
    );
  }

  // Desktop com modo TopBar horizontal
  if (sidebarMode === 'topbar') {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <TopBar />
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Theme.spacing.sm) }]}>
          <Slot />
        </View>
      </View>
    );
  }

  // Desktop com Sidebar Lateral (Apenas Ícones no Hover ou Expandida)
  return (
    <View style={[styles.mobileContainer, { backgroundColor: bgColor }]}>
      <MobileSidebar />
      <View style={[styles.mobileContent, { paddingBottom: Math.max(insets.bottom, Theme.spacing.sm) }]}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
  },
  mobileContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileContent: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
  },
});
