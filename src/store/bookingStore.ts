import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Booking, VehicleBooking, RoomBooking } from '@/types';

/**
 * 예약 스토어 상태
 */
interface BookingStore {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;

  // Actions
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  selectBooking: (booking: Booking | null) => void;
  setLoading: (isLoading: boolean) => void;

  // Filters
  getVehicleBookings: () => VehicleBooking[];
  getRoomBookings: () => RoomBooking[];
  getUserBookings: (userId: string) => Booking[];
  getUpcomingBookings: () => Booking[];
}

/**
 * 예약 스토어
 * immer 미들웨어를 사용하여 불변성 관리
 */
export const useBookingStore = create<BookingStore>()(
  immer((set, get) => ({
    bookings: [],
    selectedBooking: null,
    isLoading: false,

    setBookings: (bookings) =>
      set((state) => {
        state.bookings = bookings;
      }),

    addBooking: (booking) =>
      set((state) => {
        state.bookings.push(booking);
      }),

    updateBooking: (id, bookingData) =>
      set((state) => {
        const index = state.bookings.findIndex((b) => b.id === id);
        if (index !== -1) {
          const booking = state.bookings[index]!;
          Object.assign(booking, bookingData, {
            updatedAt: new Date().toISOString(),
          });
        }
      }),

    deleteBooking: (id) =>
      set((state) => {
        state.bookings = state.bookings.filter((b) => b.id !== id);
      }),

    selectBooking: (booking) =>
      set((state) => {
        state.selectedBooking = booking;
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),

    getVehicleBookings: () =>
      get().bookings.filter((b) => b.type === 'vehicle') as VehicleBooking[],

    getRoomBookings: () =>
      get().bookings.filter((b) => b.type === 'room') as RoomBooking[],

    getUserBookings: (userId) =>
      get().bookings.filter((b) => b.userId === userId),

    getUpcomingBookings: () => {
      const now = new Date().toISOString();
      return get()
        .bookings.filter((b) => b.startDate >= now && b.status !== 'cancelled')
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
    },
  }))
);
