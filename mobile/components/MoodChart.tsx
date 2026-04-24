import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors, FontSize } from '@/constants/theme';

interface DataPoint {
  date: string;
  averageIntensity: number;
  count: number;
}

interface MoodChartProps {
  data: DataPoint[];
  title?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function MoodChart({ data, title = 'Évolution de votre humeur' }: MoodChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Pas encore de données à afficher</Text>
      </View>
    );
  }

  const last14 = data.slice(-14);

  const chartData = {
    labels: last14.map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: last14.map((d) => Math.round(d.averageIntensity * 10) / 10),
        color: () => Colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={chartData}
          width={Math.max(SCREEN_WIDTH - 32, last14.length * 52)}
          height={200}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: Colors.card,
            backgroundGradientFrom: Colors.card,
            backgroundGradientTo: Colors.card,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(138, 154, 91, ${opacity})`,
            labelColor: () => Colors.mutedForeground,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: Colors.primary,
            },
          }}
          bezier
          style={styles.chart}
          fromZero
          segments={5}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.foreground,
    paddingHorizontal: 4,
  },
  chart: { borderRadius: 12 },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.muted,
    borderRadius: 12,
  },
  emptyText: { color: Colors.mutedForeground, fontSize: FontSize.sm },
});
