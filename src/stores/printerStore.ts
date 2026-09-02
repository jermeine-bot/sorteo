import { create } from 'zustand';
import { BluetoothDevice, printerService } from '../services/printerService';
import { Sale } from '../types/sale';

interface PrinterState {
  devices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  isScanning: boolean;
  isConnecting: boolean;
  isAutoPrintEnabled: boolean;
  error: string | null;

  scanDevices: () => Promise<void>;
  connectPrinter: (device: BluetoothDevice) => Promise<void>;
  disconnectPrinter: () => void;
  toggleAutoPrint: (enabled: boolean) => void;
  printTicket: (sale: Sale) => Promise<void>;
  printTestTicket: () => Promise<void>;
}

export const usePrinterStore = create<PrinterState>((set, get) => ({
  devices: [],
  connectedDevice: { id: 'bt-001', name: 'Impresora Térmica PT-210', address: '00:11:22:33:FF:01', connected: true },
  isScanning: false,
  isConnecting: false,
  isAutoPrintEnabled: true,
  error: null,

  scanDevices: async () => {
    set({ isScanning: true, error: null });
    try {
      const scanned = await printerService.scanDevices();
      set({ devices: scanned, isScanning: false });
    } catch (err: any) {
      set({ isScanning: false, error: 'Error escaneando dispositivos Bluetooth' });
    }
  },

  connectPrinter: async (device: BluetoothDevice) => {
    set({ isConnecting: true, error: null });
    try {
      const connected = await printerService.connectDevice(device);
      set({ connectedDevice: connected, isConnecting: false });
    } catch (err: any) {
      set({ isConnecting: false, error: 'No se pudo conectar a la impresora Bluetooth' });
    }
  },

  disconnectPrinter: () => {
    set({ connectedDevice: null });
  },

  toggleAutoPrint: (enabled: boolean) => {
    set({ isAutoPrintEnabled: enabled });
  },

  printTicket: async (sale: Sale) => {
    const { connectedDevice } = get();
    await printerService.printReceipt(sale, connectedDevice?.name);
  },

  printTestTicket: async () => {
    const { connectedDevice } = get();
    if (!connectedDevice) {
      throw new Error('No hay ninguna impresora Bluetooth conectada.');
    }
    await printerService.printTestTicket(connectedDevice.name);
  },
}));
