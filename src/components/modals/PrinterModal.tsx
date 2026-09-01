import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { usePrinterStore } from '../../stores/printerStore';
import { AppButton } from '../ui/AppButton';
import { Toast } from '../feedback/Toast';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X, Printer, Bluetooth, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface PrinterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrinterModal: React.FC<PrinterModalProps> = ({ visible, onClose }) => {
  const {
    devices,
    connectedDevice,
    isScanning,
    isConnecting,
    isAutoPrintEnabled,
    scanDevices,
    connectPrinter,
    disconnectPrinter,
    toggleAutoPrint,
    printTestTicket,
  } = usePrinterStore();

  const [toastMsg, setToastMsg] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (visible && devices.length === 0) {
      scanDevices();
    }
  }, [visible]);

  const handleTestPrint = async () => {
    try {
      setTestLoading(true);
      await printTestTicket();
      setToastMsg('¡Ticket de prueba enviado a la impresora!');
      setTestLoading(false);
    } catch (err: any) {
      setTestLoading(false);
      setToastMsg(err?.message || 'Error al imprimir ticket de prueba');
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
                <View style={styles.headerTitleRow}>
                  <Printer size={22} color={colors.primary} />
                  <Text style={styles.title}>Impresora Bluetooth</Text>
                </View>
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

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Connection status banner */}
                <View
                  style={[
                    styles.statusBanner,
                    connectedDevice ? styles.statusBannerConnected : styles.statusBannerDisconnected,
                  ]}
                >
                  {connectedDevice ? (
                    <CheckCircle2 size={24} color={colors.success} />
                  ) : (
                    <AlertCircle size={24} color={colors.warning} />
                  )}
                  <View style={styles.statusTextCol}>
                    <Text style={styles.statusTitle}>
                      {connectedDevice ? 'Impresora Conectada' : 'Sin Impresora Conectada'}
                    </Text>
                    <Text style={styles.statusDesc}>
                      {connectedDevice
                        ? `${connectedDevice.name} (${connectedDevice.address || 'Bluetooth'})`
                        : 'Vincula una impresora térmica de tickets vía Bluetooth.'}
                    </Text>
                  </View>

                  {connectedDevice && (
                    <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectPrinter}>
                      <Text style={styles.disconnectText}>Desconectar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Auto Print Setting Toggle */}
                <View style={styles.settingCard}>
                  <View style={styles.settingTextCol}>
                    <Text style={styles.settingTitle}>Impresión Automática al Vender</Text>
                    <Text style={styles.settingSub}>
                      Imprimir comprobante automáticamente después de confirmar una venta.
                    </Text>
                  </View>
                  <Switch
                    value={isAutoPrintEnabled}
                    onValueChange={toggleAutoPrint}
                    trackColor={{ false: colors.border, true: colors.primaryContainer }}
                    thumbColor={isAutoPrintEnabled ? colors.primary : colors.textSecondary}
                  />
                </View>

                {/* Test Print Action */}
                {connectedDevice && (
                  <View style={styles.testBox}>
                    <AppButton
                      title="Imprimir Ticket de Prueba"
                      onPress={handleTestPrint}
                      loading={testLoading}
                      variant="secondary"
                      size="sm"
                      icon={<Printer size={16} color={colors.primary} />}
                    />
                  </View>
                )}

                {/* Devices scan list */}
                <View style={styles.scanHeaderRow}>
                  <Text style={styles.sectionTitle}>Dispositivos Bluetooth Cercanos</Text>
                  <TouchableOpacity
                    style={styles.scanBtn}
                    onPress={scanDevices}
                    disabled={isScanning}
                  >
                    <RefreshCw size={14} color={colors.primary} style={isScanning ? styles.spin : undefined} />
                    <Text style={styles.scanBtnText}>{isScanning ? 'Buscando...' : 'Escanear'}</Text>
                  </TouchableOpacity>
                </View>

                {isScanning ? (
                  <View style={styles.scanningBox}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.scanningText}>Buscando impresoras Bluetooth en el área...</Text>
                  </View>
                ) : devices.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Bluetooth size={28} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No se encontraron impresoras Bluetooth.</Text>
                    <Text style={styles.emptySub}>Asegúrate de tener encendido el Bluetooth y la impresora.</Text>
                  </View>
                ) : (
                  devices.map((device) => {
                    const isCurrent = connectedDevice?.id === device.id;
                    return (
                      <TouchableOpacity
                        key={device.id}
                        style={[styles.deviceItem, isCurrent && styles.deviceItemActive]}
                        onPress={() => connectPrinter(device)}
                        disabled={isConnecting}
                      >
                        <View style={styles.deviceIcon}>
                          <Printer size={20} color={isCurrent ? colors.primary : colors.textSecondary} />
                        </View>
                        <View style={styles.deviceInfo}>
                          <Text style={[styles.deviceName, isCurrent && styles.deviceNameActive]}>
                            {device.name}
                          </Text>
                          <Text style={styles.deviceMac}>{device.address || 'MAC: 00:11:22:33:FF'}</Text>
                        </View>
                        {isCurrent ? (
                          <View style={styles.connectedBadge}>
                            <Text style={styles.connectedBadgeText}>Conectado</Text>
                          </View>
                        ) : (
                          <Text style={styles.connectLink}>Conectar</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.actions}>
                <AppButton title="Cerrar" onPress={onClose} variant="ghost" style={{ width: '100%' }} />
              </View>
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
    maxHeight: '85%',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusBannerConnected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  statusBannerDisconnected: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.border,
  },
  statusTextCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  statusTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statusDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  disconnectBtn: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: spacing.xs,
    backgroundColor: colors.errorBg,
    borderRadius: borderRadius.sm,
  },
  disconnectText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 11,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  settingTextCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  settingSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  testBox: {
    marginBottom: spacing.md,
  },
  scanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.sm,
  },
  scanBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  spin: {
    transform: [{ rotate: '45deg' }],
  },
  scanningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  scanningText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs + 2,
  },
  deviceItemActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  deviceIcon: {
    marginRight: spacing.sm,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  deviceNameActive: {
    color: colors.primaryHover,
  },
  deviceMac: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  connectedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  connectedBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  connectLink: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
