import { booking } from "../sdk";

export function useBooking() {

  return {

    createBooking: booking.create,

    getBooking: booking.get,

    customerBookings: booking.customerBookings,

    updateStatus: booking.updateStatus,

  };

}