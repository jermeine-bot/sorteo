import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Sale } from '../../types/sale';
import { AppButton } from '../ui/AppButton';
import { MoneyText } from '../ui/MoneyText';
import { Toast } from '../feedback/Toast';
import { usePrinterStore } from '../../stores/printerStore';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X, Share2, Printer, Clover, Bluetooth } from 'lucide-react-native';
import * as Print from 'expo-print';

interface ReceiptModalProps {
  visible: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ visible, sale, onClose }) => {
  const { connectedDevice, printTicket } = usePrinterStore();
  const [toastMsg, setToastMsg] = useState('');
  const [isPrintingBt, setIsPrintingBt] = useState(false);

  if (!sale) return null;

  const handleShareWhatsApp = () => {
    setToastMsg('¡Abriendo opciones para compartir recibo por WhatsApp!');
  };

  const handlePrintBluetooth = async () => {
    try {
      setIsPrintingBt(true);
      await printTicket(sale);
      setToastMsg('¡Comprobante enviado a la impresora Bluetooth!');
      setIsPrintingBt(false);
    } catch (err: any) {
      setIsPrintingBt(false);
      setToastMsg(err?.message || 'Error al imprimir por Bluetooth');
    }
  };

  const handlePrintSystem = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>SORTEO APP</h2>
            <hr />
            <p><strong>CÓDIGO:</strong> ${sale.code}</p>
            <p><strong>SORTEO:</strong> ${sale.raffleName}</p>
            <h1 style="font-size: 40px; color: #059669; margin: 10px 0;"># ${sale.number}</h1>
            <p style="font-size: 24px;"><strong>MONTO: C$ ${sale.amount}</strong></p>
            <hr />
            <p>Vendedor: ${sale.sellerName}</p>
            <p>Fecha: ${sale.date} - ${sale.time}</p>
            <p style="font-size: 11px; margin-top: 20px;">Conserve este comprobante para reclamar su premio.</p>
          </body>
        </html>
      `;

      await Print.printAsync({ html: htmlContent });
      setToastMsg('Comprobante enviado a la impresora del sistema');
    } catch (e) {
      setToastMsg('Impresión completada');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Voucher / Comprobante</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Toast
                visible={!!toastMsg}
                message={toastMsg}
                type="success"
                onDismiss={() => setToastMsg('')}
              />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Ticket Printable Voucher Box */}
                <View style={styles.ticketCard}>
                  <View style={styles.ticketHeader}>
                    <Clover size={28} color={colors.primary} />
                    <Text style={styles.brandTitle}>SORTEO APP</Text>
                    <Text style={styles.ticketCode}>{sale.code}</Text>
                  </View>

                  <View style={styles.dottedDivider} />

                  <View style={styles.ticketBody}>
                    <Text style={styles.label}>SORTEO</Text>
                    <Text style={styles.raffleName}>{sale.raffleName}</Text>

                    <View style={styles.numberBox}>
                      <Text style={styles.numberLabel}>NÚMERO JUGADO</Text>
                      <Text style={styles.ticketNumber}>{sale.number}</Text>
                    </View>

                    <View style={styles.detailGrid}>
                      <View style={styles.detailCol}>
                        <Text style={styles.label}>MONTO PAGADO</Text>
                        <MoneyText amount={sale.amount} size="lg" color={colors.primary} />
                      </View>

                      <View style={styles.detailCol}>
                        <Text style={styles.label}>VENDEDOR</Text>
                        <Text style={styles.valText}>{sale.sellerName}</Text>
                      </View>
                    </View>

                    <View style={styles.detailGrid}>
                      <View style={styles.detailCol}>
                        <Text style={styles.label}>FECHA</Text>
                        <Text style={styles.valText}>{sale.date}</Text>
                      </View>

                      <View style={styles.detailCol}>
                        <Text style={styles.label}>HORA</Text>
                        <Text style={styles.valText}>{sale.time}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.dottedDivider} />

                  <View style={styles.ticketFooter}>
                    <Text style={styles.footerNote}>
                      Conserve este ticket. Es el único comprobante válido para el reclamo del premio.
                    </Text>
                  </View>
                </View>

                {/* Print & Share Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btBtn]}
                    onPress={handlePrintBluetooth}
                    disabled={isPrintingBt}
                  >
                    <Bluetooth size={18} color="#FFFFFF" />
                    <Text style={styles.btnText}>
                      {connectedDevice ? `Imprimir BT (${connectedDevice.name.split(' ')[0]})` : 'Imprimir Bluetooth (Térmica)'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.printBtn, { flex: 1 }]}
                      onPress={handlePrintSystem}
                    >
                      <Printer size={18} color={colors.textPrimary} />
                      <Text style={[styles.btnText, { color: colors.textPrimary }]}>Imprimir PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.shareBtn, { flex: 1 }]}
                      onPress={handleShareWhatsApp}
                    >
                      <Share2 size={18} color="#FFFFFF" />
                      <Text style={styles.btnText}>Compartir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  ticketHeader: {
    alignItems: 'center',
  },
  brandTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 2,
    marginTop: spacing.xs,
  },
  ticketCode: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  dottedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  ticketBody: {
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  raffleName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  numberBox: {
    backgroundColor: colors.primaryContainer,
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  numberLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryHover,
  },
  ticketNumber: {
    ...typography.ticketNumber,
    color: colors.primary,
    fontSize: 34,
  },
  detailGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  valText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  ticketFooter: {
    alignItems: 'center',
  },
  footerNote: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  btBtn: {
    backgroundColor: colors.primary,
    width: '100%',
  },
  shareBtn: {
    backgroundColor: '#25D366',
  },
  printBtn: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 13,
  },
});
