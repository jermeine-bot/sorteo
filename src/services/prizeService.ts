import { supabase } from '../../server/config/supabase';
import { Prize, PrizeStatus } from '../types/prize';

type WinnerSaleRow = {
  id: string;
  code: string;
  raffle_id: string;
  seller_id: string;
  number: string;
  amount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  profiles?: {
    name: string;
    last_name: string | null;
  } | null;
};

const mapPrize = (row: any): Prize => ({
  id: row.id,
  raffleId: row.raffle_id,
  raffleName: row.raffle_name,
  winningNumber: row.winning_number,
  prizeDescription: row.prize_description,
  amount: Number(row.amount),
  status: row.status as PrizeStatus,

  winnerSaleId: row.winner_sale_id ?? undefined,
  winnerCode: row.winner_code ?? undefined,
  winnerSellerName: row.winner_seller_name ?? undefined,

  paidAt: row.paid_at ?? undefined,
  createdAt: row.created_at,
});

export const prizeService = {
  async getPrizes(): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo premios:', error);

      throw new Error(
        error.message || 'No se pudieron obtener los premios.'
      );
    }

    return (data ?? []).map(mapPrize);
  },

  async registerWinner(
    raffleId: string,
    raffleName: string,
    winningNumber: string,
    prizeDescription: string,
    amount: number
  ): Promise<Prize> {
    const number = winningNumber.trim();
    if (!raffleId) {
      throw new Error('No se especificó el sorteo.');
    }

    if (!number) {
      throw new Error('Debes ingresar el número ganador.');
    }

    if (!/^\d{1,4}$/.test(number)) {
      throw new Error(
        'El número ganador debe contener entre 1 y 4 dígitos.'
      );
    }

    if (!prizeDescription.trim()) {
      throw new Error('Debes ingresar la descripción del premio.');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('El monto del premio debe ser mayor que 0.');
    }

    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select(`
        id,
        name,
        status,
        winning_number
      `)
      .eq('id', raffleId)
      .single();

    if (raffleError) {
      console.error('❌ Error obteniendo sorteo:', raffleError);

      throw new Error(
        'No se pudo verificar el sorteo seleccionado.'
      );
    }

    if (!raffle) {
      throw new Error('El sorteo seleccionado no existe.');
    }

    if (raffle.status !== 'ACTIVE') {
      throw new Error(
        'Solo se puede registrar un ganador para un sorteo activo.'
      );
    }

    if (raffle.winning_number) {
      throw new Error(
        `Este sorteo ya tiene registrado el número ganador ${raffle.winning_number}.`
      );
    }

    const { data: existingPrize, error: existingPrizeError } =
      await supabase
        .from('prizes')
        .select('id, winning_number, status')
        .eq('raffle_id', raffleId)
        .limit(1)
        .maybeSingle();

    if (existingPrizeError) {
      console.error('❌ ERROR COMPLETO verificando premio existente:', {
        message: existingPrizeError.message,
        details: existingPrizeError.details,
        hint: existingPrizeError.hint,
        code: existingPrizeError.code,
      });

      throw new Error(
        existingPrizeError.message ||
        'No se pudo verificar si el sorteo ya tiene un ganador.'
      );
    }

    if (existingPrize) {
      throw new Error(
        'Este sorteo ya tiene un ganador registrado.'
      );
    }

    const { data: winnerSale, error: saleError } = await supabase
      .from('sales')
      .select(`
        id,
        code,
        raffle_id,
        seller_id,
        number,
        amount,
        status,
        profiles (
          name,
          last_name
        )
      `)
      .eq('raffle_id', raffleId)
      .eq('number', number)
      .eq('status', 'CONFIRMED')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (saleError) {
      console.error(
        '❌ Error buscando boleto ganador:',
        saleError
      );

      throw new Error(
        'No se pudo verificar si el número ganador fue vendido.'
      );
    }

    if (!winnerSale) {
      throw new Error(
        `El número ${number} no tiene una venta confirmada en este sorteo.`
      );
    }

    const sale = winnerSale as WinnerSaleRow;

    const winnerSellerName = sale.profiles
      ? `${sale.profiles.name} ${sale.profiles.last_name ?? ''}`.trim()
      : 'Vendedor';

    const { data: insertedPrize, error: insertError } = await supabase
      .from('prizes')
      .insert({
        raffle_id: raffleId,
        raffle_name: raffleName,
        winning_number: number,
        prize_description: prizeDescription.trim(),
        amount,
        status: 'VERIFIED',

        // Información del boleto ganador
        winner_sale_id: sale.id,
        winner_code: sale.code,
        winner_seller_name: winnerSellerName,
      })
      .select()
      .single();

    if (insertError) {
      console.error(
        '❌ Error registrando ganador:',
        insertError
      );

      throw new Error(
        insertError.message ||
        'No se pudo registrar el ganador.'
      );
    }

    if (!insertedPrize) {
      throw new Error(
        'No se pudo obtener el premio registrado.'
      );
    }

    console.log('🏆 Ganador registrado:', {
      prizeId: insertedPrize.id,
      raffleId,
      winningNumber: number,
      saleId: sale.id,
      ticketCode: sale.code,
      seller: winnerSellerName,
    });

    return mapPrize(insertedPrize);
  },

  async markAsPaid(prizeId: string): Promise<Prize> {
    const { data, error } = await supabase
      .from('prizes')
      .update({
        status: 'PAID',
        paid_at: new Date().toISOString(),
      })
      .eq('id', prizeId)
      .select()
      .single();

    if (error) {
      console.error(
        '❌ Error marcando premio como pagado:',
        error
      );

      throw new Error(
        error.message ||
        'No se pudo marcar el premio como pagado.'
      );
    }

    if (!data) {
      throw new Error(
        'No se encontró el premio.'
      );
    }

    return mapPrize(data);
  },
};
