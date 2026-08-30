import { supabase } from '../../server/config/supabase';
import { Prize, PrizeStatus } from '../types/prize';

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

  // Obtener todos los premios
  async getPrizes(): Promise<Prize[]> {

    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        'Error obteniendo premios:',
        error
      );

      throw new Error(
        error.message || 'No se pudieron obtener los premios.'
      );
    }

    return (data ?? []).map(mapPrize);
  },

  // Registrar ganador
  async registerWinner(
    raffleId: string,
    raffleName: string,
    winningNumber: string,
    prizeDescription: string,
    amount: number
  ): Promise<Prize> {

    const { data, error } = await supabase
      .from('prizes')
      .insert({
        raffle_id: raffleId,
        raffle_name: raffleName,
        winning_number: winningNumber,
        prize_description: prizeDescription,
        amount: amount,
        status: 'VERIFIED',
      })
      .select()
      .single();

    if (error || !data) {

      console.error(
        'Error registrando ganador:',
        error
      );

      throw new Error(
        error?.message ||
        'No se pudo registrar el ganador.'
      );
    }

    return mapPrize(data);
  },

  // Marcar premio como pagado
  async markAsPaid(
    prizeId: string
  ): Promise<Prize> {

    const { data, error } = await supabase
      .from('prizes')
      .update({
        status: 'PAID',
        paid_at: new Date().toISOString(),
      })
      .eq('id', prizeId)
      .select()
      .single();

    if (error || !data) {

      console.error(
        'Error marcando premio como pagado:',
        error
      );

      throw new Error(
        error?.message ||
        'No se pudo marcar el premio como pagado.'
      );
    }

    return mapPrize(data);
  },
};