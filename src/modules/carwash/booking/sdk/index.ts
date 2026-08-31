import { BookingService } from "../services/BookingService";

const service = new BookingService();

export const booking = {

  create: service.createBooking.bind(service),

  get: service.getBooking.bind(service),

  customerBookings:
    service.customerBookings.bind(service),

  updateStatus:
    service.updateBookingStatus.bind(service),

};