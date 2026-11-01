export type BookingStatus = 'verification_pending' | 'pending' | 'confirmed' | 'rejected' | 'cancelled';
export type BookingTab = 'bookings' | 'facilities' | 'blocks';

export interface Resource {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  allowed_groups?: string[];
  instant_approval_groups?: string[];
  access?: {
    allowed_groups?: string[];
    instant_approval_groups?: string[];
  };
}

export interface AvailabilityWindow {
  start: string;
  end: string;
}

export type BookingEntryMode = 'simple' | 'custom';

export interface ResourceBookingSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
}

export interface BookingInterface {
  default_mode?: BookingEntryMode;
  whole_day_start_time?: string;
  whole_day_end_time?: string;
  resource_slots?: ResourceBookingSlot[];
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  timezone: string;
  booking_mode: 'facility' | 'resources' | 'both' | string;
  approval_mode: 'manual' | 'automatic' | string;
  booking_interface?: BookingInterface;
  availability_windows: AvailabilityWindow[];
  booking_rules?: {
    minimum_duration_seconds?: number;
    maximum_duration_seconds?: number;
    booking_interval_seconds?: number;
    minimum_advance_notice_seconds?: number;
    maximum_horizon_seconds?: number;
    pending_blocks_availability?: boolean;
  };
  resources: Resource[];
  access?: {
    guest_requests?: boolean;
    allowed_groups?: string[];
    instant_approval_groups?: string[];
  };
  notifications?: {
    enabled?: boolean;
    admin_recipients?: string[];
    facility_events?: string[];
    requester_events?: string[];
    templates?: Record<string, string>;
  };
}

export interface Booking {
  id: string;
  facility_id: string;
  facility_name: string;
  resource_id?: string | null;
  resource_name?: string | null;
  timezone?: string;
  start: string;
  end: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_note?: string | null;
  admin_note?: string | null;
  status: BookingStatus;
}

export interface AvailabilityBlock {
  id: string;
  facility_id: string;
  resource_id?: string | null;
  title: string;
  start: string;
  end: string;
}

export interface RecurringBlock {
  id: string;
  facility_id: string;
  resource_id?: string | null;
  title: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface BookingEvent {
  happened_at: string;
  action: string;
  actor: string;
}

export interface BookingNotification {
  event: string;
  recipient?: string | null;
  status: string;
  last_error?: string | null;
}

export interface MigrationPreview {
  source_counts?: Record<string, number>;
  errors?: Array<{ source: string; message: string }>;
  already_imported?: boolean;
  can_import?: boolean;
}
