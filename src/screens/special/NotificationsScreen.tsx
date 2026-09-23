import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../../constants';
import { AnimatedEntry } from '../../components/common/AnimatedEntry';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { PressScale } from '../../components/common/PressScale';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { useProfileStore } from '../../store/profileStore';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';
import { formatRelativeTime } from '../../utils/helpers';
import type { ActivityItem, NotifType } from '../../types';

interface NotifRow {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: number;
  unread?: boolean;
}

function mapActivity(item: ActivityItem): NotifRow {
  const type: NotifType =
    item.type === 'scan'
      ? 'card_scanned'
      : item.type === 'prescription'
        ? 'medicine_reminder'
        : item.type === 'sos'
          ? 'sos_sent'
          : 'medicine_reminder';

  return {
    id: item.id,
    type,
    title: item.title,
    body: item.subtitle,
    timestamp: item.timestamp,
    unread: Date.now() - item.timestamp < 1000 * 60 * 60 * 6,
  };
}

function toneFor(type: NotifType): 'orange' | 'teal' | 'gold' | 'danger' | 'success' {
  switch (type) {
    case 'card_scanned':
      return 'teal';
    case 'sos_sent':
      return 'danger';
    case 'medicine_refill':
      return 'gold';
    case 'plan_expiry_warning':
      return 'orange';
    case 'remote_announcement':
      return 'orange';
    default:
      return 'success';
  }
}

export function NotificationsScreen() {
  const navigation = useNavigation();
  const activity = useProfileStore((s) => s.activity);
  const { homeBanner, newFeature, tipOfDay } = useRemoteConfig();

  const rows = useMemo(() => {
    const list: NotifRow[] = activity.map(mapActivity);

    if (homeBanner.visible) {
      list.unshift({
        id: 'remote-banner',
        type: 'remote_announcement',
        title: homeBanner.title,
        body: homeBanner.subtitle,
        timestamp: Date.now(),
        unread: true,
      });
    }

    if (newFeature.visible) {
      list.unshift({
        id: 'remote-feature',
        type: 'remote_announcement',
        title: newFeature.title,
        body: newFeature.description,
        timestamp: Date.now() - 1000,
        unread: true,
      });
    }

    list.push({
      id: 'tip',
      type: 'medicine_reminder',
      title: 'Aaj ka tip',
      body: tipOfDay,
      timestamp: Date.now() - 1000 * 60 * 30,
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [activity, homeBanner, newFeature, tipOfDay]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Notifications" />
      <View style={styles.header}>
        <Text style={styles.sub}>Card scans, medicines, aur announcements</Text>
      </View>

      {rows.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="Koi notification nahi"
          subtitle="Jab card scan hoga ya medicine reminder aayega, yahan dikhega"
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <AnimatedEntry delay={index * 50}>
              <PressScale
                onPress={() => {
                  if (item.type === 'remote_announcement') {
                    (navigation as { navigate: (n: string) => void }).navigate('Announcement');
                  }
                }}
              >
                <View style={[styles.row, item.unread && styles.rowUnread]}>
                  <View style={styles.rowTop}>
                    <Badge label={item.type.replace(/_/g, ' ')} tone={toneFor(item.type)} />
                    <Text style={styles.time}>{formatRelativeTime(item.timestamp)}</Text>
                  </View>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowBody}>{item.body}</Text>
                </View>
              </PressScale>
            </AnimatedEntry>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.gray500, marginTop: 4 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  row: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.md,
  },
  rowUnread: {
    borderColor: colors.orangeGlow,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  time: { fontFamily: fonts.body, fontSize: 11, color: colors.gray500 },
  rowTitle: { fontFamily: fonts.headingMedium, fontSize: 16, color: colors.white },
  rowBody: { fontFamily: fonts.body, fontSize: 13, color: colors.gray300, marginTop: 4 },
  footer: { padding: spacing.lg },
});
