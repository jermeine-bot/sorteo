import { supabase } from '../../server/config/supabase';
import { Sale } from '../types/sale';
import { generateTicketCode } from '../utils/ticket';

type SaleRow = {
  id: string;
  code: string;
  raffle_id: string;
  seller_id: string;
  number: string;
  amount: number;
  commission_percentage: number;
  commission: number;
  status: 'CONFIRMED' | 'CANCELLED';
  created_at: string;
  raffles?: {
    id: string;
    name: string;
    raffle_number: string | null;
  } | null;
  profiles?: {
    id: string;
    name: string;
    last_name: string | null;
  } | null;
};

function mapSale(row: SaleRow): Sale {
  const createdAt = new Date(row.created_at);

  const date = createdAt.toISOString().split('T')[0];

  const time = createdAt.toLocaleTimeString('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    id: row.id,
    code: row.code,

    raffleId: row.raffle_id,
    raffleName: row.raffles?.name ?? 'Sorteo',

    sellerId: row.seller_id,
    sellerName: row.profiles
      ? `${row.profiles.name} ${row.profiles.last_name ?? ''}`.trim()
      : 'Vendedor',

    number: row.number,
    amount: Number(row.amount),

    commission: Number(row.commission),

    status: row.status,

    createdAt: row.created_at,

    date,
    time,
  };
}

export const saleService = {
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        code,
        raffle_id,
        seller_id,
        number,
        amount,
        commission_percentage,
        commission,
        status,
        created_at,
        raffles (
          id,
          name,
          raffle_number
        ),
        profiles (
          id,
          name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo ventas:', error);
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapSale(row as SaleRow));
  },

  async getSalesBySeller(sellerId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        id,
        code,
        raffle_id,
        seller_id,
        number,
        amount,
        commission_percentage,
        commission,
        status,
        created_at,
        raffles (
          id,
          name,
          raffle_number
        ),
        profiles (
          id,
          name,
          last_name
        )
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo ventas del vendedor:', error);
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapSale(row as SaleRow));
  },
  async createSale(saleData: {
    raffleId: string;
    number: string;
    amount: number;
  }): Promise<Sale> {

    const cleanNumber = saleData.number.trim();

    if (!cleanNumber) { 
      throw new Error(
        'Debe ingresar un número para el boleto.'
      );
    }

    if (!/^\d{1,4}$/.test(cleanNumber)) {
      throw new Error(
        'El número del boleto debe contener entre 1 y 4 dígitos.'
      );
    }

    if (
      !Number.isFinite(saleData.amount) ||
      saleData.amount <= 0
    ) {
      throw new Error(
        'El monto de la venta debe ser mayor que 0.'
      );
    }

    const code = generateTicketCode();

    const { data, error } = await supabase.rpc(
      'create_sale',
      {
        p_code: code,
        p_raffle_id: saleData.raffleId,
        p_number: cleanNumber,
        p_amount: saleData.amount,
      }
    );

    if (error) {
      console.error(
        '❌ Error creando venta:',
        error
      );

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        'No se pudo obtener la venta creada.'
      );
    }
    const { data: saleWithRelations, error: relationError } =
      await supabase
        .from('sales')
        .select(`
          id,
          code,
          raffle_id,
          seller_id,
          number,
          amount,
          commission_percentage,
          commission,
          status,
          created_at,
          raffles (
            id,
            name,
            raffle_number
          ),
          profiles (
            id,
            name,
            last_name
          )
        `)
        .eq('id', data.id)
        .single();

    if (relationError) {
      console.error(
        '❌ Error obteniendo venta creada:',
        relationError
      );

      throw new Error(
        relationError.message
      );
    }

    if (!saleWithRelations) {
      throw new Error(
        'No se pudo obtener la venta creada.'
      );
    }

    console.log(
      '✅ Venta creada correctamente:',
      saleWithRelations
    );

    return mapSale(
      saleWithRelations as SaleRow
    );
  },

  async cancelSale(saleId: string): Promise<Sale> {

    const { data, error } = await supabase.rpc(
      'cancel_sale',
      {
        p_sale_id: saleId,
      }
    );

    if (error) {
      console.error(
        '❌ Error cancelando venta:',
        error
      );

      throw new Error(error.message);
    }

    if (!data) {
      throw new Error(
        'No se encontró la venta.'
      );
    }

    const { data: saleWithRelations, error: relationError } =
      await supabase
        .from('sales')
        .select(`
          id,
          code,
          raffle_id,
          seller_id,
          number,
          amount,
          commission_percentage,
          commission,
          status,
          created_at,
          raffles (
            id,
            name,
            raffle_number
          ),
          profiles (
            id,
            name,
            last_name
          )
        `)
        .eq('id', data.id)
        .single();

    if (relationError) {
      console.error(
        '❌ Error obteniendo venta cancelada:',
        relationError
      );

      throw new Error(
        relationError.message
      );
    }

    if (!saleWithRelations) {
      throw new Error(
        'No se pudo obtener la venta cancelada.'
      );
    }

    return mapSale(
      saleWithRelations as SaleRow
    );
  },
};

