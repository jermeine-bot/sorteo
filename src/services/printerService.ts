import * as Print from 'expo-print';
import { Sale } from '../types/sale';

export interface BluetoothDevice {
  id: string;
  name: string;
  address?: string;
  connected?: boolean;
}

export const MOCK_BLUETOOTH_DEVICES: BluetoothDevice[] = [
  { id: 'bt-001', name: 'Impresora Térmica PT-210', address: '00:11:22:33:FF:01' },
  { id: 'bt-002', name: 'POS-5802DD Bluetooth', address: 'AA:BB:CC:DD:EE:02' },
  { id: 'bt-003', name: 'MTP-II Portable Printer', address: '12:34:56:78:90:03' },
  { id: 'bt-004', name: 'Mini Thermal Printer 58mm', address: 'FE:ED:FA:CE:00:04' },
];

export const printerService = {
  // Scan for nearby bluetooth thermal printers
  async scanDevices(): Promise<BluetoothDevice[]> {
    // Simulate Bluetooth discovery scan delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return MOCK_BLUETOOTH_DEVICES;
  },

  // Connect to a Bluetooth printer
  async connectDevice(device: BluetoothDevice): Promise<BluetoothDevice> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { ...device, connected: true };
  },

  // Generate HTML formatted specifically for thermal receipt paper width (58mm / 80mm)
  generateThermalHtml(sale: Sale): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta viewport="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 280px;
              margin: 0 auto;
              padding: 10px;
              font-size: 13px;
              color: #000000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .flex-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .big-number { font-size: 32px; font-weight: bold; margin: 10px 0; border: 2px solid #000; padding: 6px; }
            .footer { font-size: 10px; text-align: center; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 18px;">SORTEO APP</div>
          <div class="center" style="font-size: 11px;">COMPROBANTE OFICIAL DE VENTA</div>
          <div class="divider"></div>
          
          <div class="flex-row">
            <span>CÓDIGO:</span>
            <span class="bold">${sale.code}</span>
          </div>
          <div class="flex-row">
            <span>FECHA:</span>
            <span>${sale.date} ${sale.time}</span>
          </div>
          <div class="flex-row">
            <span>VENDEDOR:</span>
            <span>${sale.sellerName}</span>
          </div>
          
          <div class="divider"></div>
          <div class="center bold" style="font-size: 14px;">${sale.raffleName}</div>
          
          <div class="center">
            <div class="big-number"># ${sale.number}</div>
          </div>
          
          <div class="flex-row" style="font-size: 16px;">
            <span class="bold">MONTO PAGADO:</span>
            <span class="bold">C$ ${sale.amount.toLocaleString()}</span>
          </div>
          
          <div class="divider"></div>
          <div class="footer">
            *** GRACIAS POR SU COMPRA ***<br/>
            Conserve este ticket para reclamar su premio.<br/>
            ¡Mucha suerte! 🍀
          </div>
        </body>
      </html>
    `;
  },

  // Print receipt ticket via system / Bluetooth printer driver
  async printReceipt(sale: Sale, printerName?: string): Promise<boolean> {
    try {
      const html = this.generateThermalHtml(sale);
      await Print.printAsync({ html });
      return true;
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      throw new Error('No se pudo enviar la orden de impresión.');
    }
  },

  // Print test receipt ticket
  async printTestTicket(printerName: string): Promise<boolean> {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: monospace; width: 280px; margin: 0 auto; text-align: center; padding: 10px; }
              .divider { border-top: 1px dashed #000; margin: 8px 0; }
            </style>
          </head>
          <body>
            <h2>*** IMPRESORA CONECTADA ***</h2>
            <p><strong>Dispositivo:</strong> ${printerName}</p>
            <div class="divider"></div>
            <p>Prueba de impresión Bluetooth completada con éxito.</p>
            <p>SORTEO APP v1.0.0</p>
            <div class="divider"></div>
          </body>
        </html>
      `;
      await Print.printAsync({ html });
      return true;
    } catch (e) {
      console.error('Error imprimiendo ticket de prueba:', e);
      throw e;
    }
  },
};
