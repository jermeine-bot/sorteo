import { supabase } from '../../server/config/supabase';
import { Raffle, RaffleStatus } from '../types/raffle';

const mapRaffle = (row: any): Raffle => ({
  id: row.id,
  raffleNumber: row.raffle_number ?? `SRT-${row.id.slice(0, 4)}`,
  name: row.name,
  description: row.description,
  startDate: row.start_date ?? row.created_at?.split('T')[0] ?? '',
  startTime: row.start_time ?? '08:00',
  drawDate: row.draw_date,
  drawTime: row.draw_time,
  mainPrize: row.main_prize,
  prizeAmount: Number(row.prize_amount),
  ticketPrice: Number(row.ticket_price),
  commissionPercentage: Number(row.commission_percentage),
  status: row.status as RaffleStatus,
  isUnlimitedTickets: Boolean(row.is_unlimited_tickets),
  totalSold: Number(row.total_sold),
  totalTickets: Number(row.total_tickets),
  winningNumber: row.winning_number ?? undefined,
  createdAt: row.created_at,
});

export const raffleService = {

  // get raffles
  async getRaffles(): Promise<Raffle[]> {

    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        'Error obteniendo sorteos:',
        error
      );

      throw new Error(
        error.message ||
        'No se pudieron obtener los sorteos.'
      );
    }

    return (data ?? []).map(mapRaffle);
  },

  // get data
  async getActiveRaffles(): Promise<Raffle[]> {

    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('draw_date', { ascending: true });

    if (error) {
      console.error(
        'Error obteniendo sorteos activos:',
        error
      );

      throw new Error(
        error.message ||
        'No se pudieron obtener los sorteos activos.'
      );
    }

    return (data ?? []).map(mapRaffle);
  },

  // Create Raffle
  async createRaffle(
    raffleData: Omit<
      Raffle,
      | 'id'
      | 'createdAt'
      | 'totalSold'
      | 'winningNumber'
      | 'status'
    >
  ): Promise<Raffle> {

    const { data, error } = await supabase
      .from('raffles')
      .insert({
        raffle_number: raffleData.raffleNumber,
        name: raffleData.name,
        description: raffleData.description,

        start_date: raffleData.startDate,
        start_time: raffleData.startTime,

        draw_date: raffleData.drawDate,
        draw_time: raffleData.drawTime,

        main_prize: raffleData.mainPrize,
        prize_amount: raffleData.prizeAmount,

        ticket_price: raffleData.ticketPrice,

        commission_percentage:
          raffleData.commissionPercentage,

        status: 'PROGRAMMED',
        
        is_unlimited_tickets: raffleData.isUnlimitedTickets,
        total_sold: 0,
        total_tickets: raffleData.isUnlimitedTickets ? 0 : raffleData.totalTickets,
        winning_number: null,
      })
      .select()
      .single();

    if (error || !data) {

      console.error(
        'Error creando sorteo:',
        error
      );

      throw new Error(
        error?.message ||
        'No se pudo crear el sorteo.'
      );
    }

    return mapRaffle(data);
  },

  // Update Raffle
  async updateRaffle(
    id: string,
    updates: Partial<Raffle>
  ): Promise<Raffle> {

    const updateData: Record<string, any> = {};

    if (updates.raffleNumber !== undefined) {
      updateData.raffle_number = updates.raffleNumber;
    }

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }

    if (updates.startDate !== undefined) {
      updateData.start_date = updates.startDate;
    }

    if (updates.startTime !== undefined) {
      updateData.start_time = updates.startTime;
    }

    if (updates.drawDate !== undefined) {
      updateData.draw_date = updates.drawDate;
    }

    if (updates.drawTime !== undefined) {
      updateData.draw_time = updates.drawTime;
    }

    if (updates.mainPrize !== undefined) {
      updateData.main_prize = updates.mainPrize;
    }

    if (updates.prizeAmount !== undefined) {
      updateData.prize_amount = updates.prizeAmount;
    }

    if (updates.ticketPrice !== undefined) {
      updateData.ticket_price = updates.ticketPrice;
    }

    if (updates.commissionPercentage !== undefined) {
      updateData.commission_percentage =
        updates.commissionPercentage;
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    if (updates.isUnlimitedTickets !== undefined) {
      updateData.is_unlimited_tickets = updates.isUnlimitedTickets;
    }

    if (updates.totalSold !== undefined) {
      updateData.total_sold = updates.totalSold;
    }

    if (updates.totalTickets !== undefined) {
      updateData.total_tickets = updates.totalTickets;
    }

    if (updates.winningNumber !== undefined) {
      updateData.winning_number =
        updates.winningNumber;
    }

    const { data, error } = await supabase
      .from('raffles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {

      console.error(
        'Error actualizando sorteo:',
        error
      );

      throw new Error(
        error?.message ||
        'No se pudo actualizar el sorteo.'
      );
    }

    return mapRaffle(data);
  },

  // delete Raffle
  async deleteRaffle(id: string): Promise<void> {

    const { error } = await supabase
      .from('raffles')
      .delete()
      .eq('id', id);

    if (error) {

      console.error(
        'Error eliminando sorteo:',
        error
      );

      throw new Error(
        error.message ||
        'No se pudo eliminar el sorteo.'
      );
    }
  },
};