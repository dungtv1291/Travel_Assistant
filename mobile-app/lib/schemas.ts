import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다.')
      .max(50, '이름은 50자를 초과할 수 없습니다.'),
    email: z
      .string()
      .min(1, '이메일을 입력해주세요.')
      .email('올바른 이메일 형식을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .regex(/[A-Z]/, '대문자를 하나 이상 포함해야 합니다.')
      .regex(/[0-9]/, '숫자를 하나 이상 포함해야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
});

// ─── Hotel Booking ───────────────────────────────────────────────────────────

export const hotelBookingSchema = z.object({
  guestName: z
    .string()
    .min(2, '이름을 입력해주세요.')
    .max(100, '이름이 너무 깁니다.'),
  guestEmail: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
  guestPhone: z
    .string()
    .min(8, '연락처를 입력해주세요.')
    .regex(/^\+?[0-9\-\s]+$/, '올바른 전화번호를 입력해주세요.'),
  checkIn: z.string().min(1, '체크인 날짜를 선택해주세요.'),
  checkOut: z.string().min(1, '체크아웃 날짜를 선택해주세요.'),
  guests: z
    .number({ invalid_type_error: '인원수를 입력해주세요.' })
    .min(1, '최소 1명 이상이어야 합니다.')
    .max(10, '최대 10명까지 예약 가능합니다.'),
  specialRequests: z.string().max(500, '특별 요청은 500자를 초과할 수 없습니다.').optional(),
});

// ─── Transport Booking ───────────────────────────────────────────────────────

export const transportBookingSchema = z.object({
  passengerName: z
    .string()
    .min(2, '이름을 입력해주세요.'),
  passengerPhone: z
    .string()
    .min(8, '연락처를 입력해주세요.')
    .regex(/^\+?[0-9\-\s]+$/, '올바른 전화번호를 입력해주세요.'),
  pickupLocation: z
    .string()
    .min(3, '픽업 장소를 입력해주세요.'),
  dropoffLocation: z
    .string()
    .optional(),
  pickupDate: z.string().min(1, '픽업 날짜를 선택해주세요.'),
  pickupTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '올바른 시간 형식을 입력해주세요. (예: 14:30)'),
  passengerCount: z
    .number({ invalid_type_error: '인원수를 입력해주세요.' })
    .min(1, '최소 1명 이상이어야 합니다.')
    .max(15, '최대 15명까지 예약 가능합니다.'),
  notes: z.string().max(300, '메모는 300자를 초과할 수 없습니다.').optional(),
});

// ─── Flight Search ───────────────────────────────────────────────────────────

export const flightSearchSchema = z.object({
  origin: z.string().min(1, '출발지를 선택해주세요.'),
  destination: z.string().min(1, '목적지를 선택해주세요.'),
  departureDate: z.string().min(1, '출발 날짜를 선택해주세요.'),
  returnDate: z.string().optional(),
  passengers: z
    .number({ invalid_type_error: '인원수를 입력해주세요.' })
    .min(1, '최소 1명 이상이어야 합니다.')
    .max(9, '최대 9명까지 검색 가능합니다.'),
  flightClass: z.enum(['economy', 'business', 'first']),
  tripType: z.enum(['round', 'one']),
});

// ─── AI Planner ──────────────────────────────────────────────────────────────

export const aiPlannerSchema = z.object({
  destination: z.string().min(1, '목적지를 선택해주세요.'),
  duration: z
    .number({ invalid_type_error: '여행 기간을 선택해주세요.' })
    .min(1, '최소 1일 이상이어야 합니다.')
    .max(30, '최대 30일까지 생성 가능합니다.'),
  budget: z
    .number({ invalid_type_error: '예산을 입력해주세요.' })
    .min(0, '예산은 0 이상이어야 합니다.'),
  travelStyle: z.enum(['adventure', 'cultural', 'relaxed', 'foodie', 'luxury', 'budget']),
  travelers: z.enum(['solo', 'couple', 'family', 'friends']),
  pace: z.enum(['relaxed', 'moderate', 'intensive']),
  startDate: z.string().min(1, '시작 날짜를 선택해주세요.'),
  interests: z.array(z.string()).min(1, '관심사를 하나 이상 선택해주세요.'),
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type HotelBookingFormValues = z.infer<typeof hotelBookingSchema>;
export type TransportBookingFormValues = z.infer<typeof transportBookingSchema>;
export type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;
export type AIPlannerFormValues = z.infer<typeof aiPlannerSchema>;
