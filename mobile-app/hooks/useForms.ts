import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  hotelBookingSchema,
  transportBookingSchema,
  flightSearchSchema,
  aiPlannerSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type ForgotPasswordFormValues,
  type HotelBookingFormValues,
  type TransportBookingFormValues,
  type FlightSearchFormValues,
  type AIPlannerFormValues,
} from '../lib/schemas';

export const useLoginForm = (defaults?: Partial<LoginFormValues>) =>
  useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaults?.email ?? '',
      password: defaults?.password ?? '',
    },
    mode: 'onBlur',
  });

export const useRegisterForm = () =>
  useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

export const useForgotPasswordForm = () =>
  useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

export const useHotelBookingForm = (defaults?: Partial<HotelBookingFormValues>) =>
  useForm<HotelBookingFormValues>({
    resolver: zodResolver(hotelBookingSchema),
    defaultValues: {
      guestName: defaults?.guestName ?? '',
      guestEmail: defaults?.guestEmail ?? '',
      guestPhone: defaults?.guestPhone ?? '',
      checkIn: defaults?.checkIn ?? '',
      checkOut: defaults?.checkOut ?? '',
      guests: defaults?.guests ?? 2,
      specialRequests: defaults?.specialRequests ?? '',
    },
    mode: 'onBlur',
  });

export const useTransportBookingForm = (defaults?: Partial<TransportBookingFormValues>) =>
  useForm<TransportBookingFormValues>({
    resolver: zodResolver(transportBookingSchema),
    defaultValues: {
      passengerName: defaults?.passengerName ?? '',
      passengerPhone: defaults?.passengerPhone ?? '',
      pickupLocation: defaults?.pickupLocation ?? '',
      dropoffLocation: defaults?.dropoffLocation ?? '',
      pickupDate: defaults?.pickupDate ?? '',
      pickupTime: defaults?.pickupTime ?? '09:00',
      passengerCount: defaults?.passengerCount ?? 2,
      notes: defaults?.notes ?? '',
    },
    mode: 'onBlur',
  });

export const useFlightSearchForm = (defaults?: Partial<FlightSearchFormValues>) =>
  useForm<FlightSearchFormValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: defaults?.origin ?? '서울 인천 (ICN)',
      destination: defaults?.destination ?? '다낭 (DAD)',
      departureDate: defaults?.departureDate ?? '',
      returnDate: defaults?.returnDate ?? '',
      passengers: defaults?.passengers ?? 2,
      flightClass: defaults?.flightClass ?? 'economy',
      tripType: defaults?.tripType ?? 'round',
    },
    mode: 'onBlur',
  });

export const useAIPlannerForm = (defaults?: Partial<AIPlannerFormValues>) =>
  useForm<AIPlannerFormValues>({
    resolver: zodResolver(aiPlannerSchema),
    defaultValues: {
      destination: defaults?.destination ?? '',
      duration: defaults?.duration ?? 5,
      budget: defaults?.budget ?? 1500000,
      travelStyle: defaults?.travelStyle ?? 'cultural',
      travelers: defaults?.travelers ?? 'couple',
      pace: defaults?.pace ?? 'moderate',
      startDate: defaults?.startDate ?? '',
      interests: defaults?.interests ?? [],
    },
    mode: 'onBlur',
  });
