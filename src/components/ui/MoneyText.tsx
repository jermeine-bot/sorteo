import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/currency';
import { colors, typography } from '../../theme';

interface MoneyTextProps {
  amount: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: TextStyle;
}

export const MoneyText: React.FC<MoneyTextProps> = ({
  amount,
  size = 'md',
  color = colors.primary,
  style,
}) => {
  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return 13;
      case 'lg':
        return 20;
      case 'xl':
        return 26;
      case 'md':
      default:
        return 16;
    }
  };

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: getFontSize(),
          color,
        },
        style,
      ]}
    >
      {formatCurrency(amount)}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    ...typography.h3,
    fontWeight: '700',
  },
});
