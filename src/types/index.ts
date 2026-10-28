export type FieldType = '5 người' | '7 người';
export type FieldStatus = 'Hoạt động' | 'Bảo trì';

export type FootballField = {
  id: string;
  name: string;
  type: FieldType;
  pricePerHour: number;
  status: FieldStatus;
};

export type Booking = {
  id: string;
  fieldId: string;
  customerName: string;
  phone: string;
  date: string;
  startHour: number;
  hours: number;
};

export type FieldFormValues = {
  name: string;
  type: FieldType;
  pricePerHour: string;
  status: FieldStatus;
};

export type BookingFormValues = {
  customerName: string;
  phone: string;
  date: string;
  startHour: number;
  hours: number;
};
