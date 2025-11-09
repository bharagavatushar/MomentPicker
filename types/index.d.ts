// types/index.d.ts
import type moment from "moment";

export type SelectionMode = "date" | "month" | "year";

export interface MomentPickerOptions {
  selectionMode?: SelectionMode;
  includeTime?: boolean;
  format?: string;
  datetimeFormat?: string;
  use12h?: boolean;
  minuteStep?: number;
  locale?: string;
  firstDay?: number | null;

  minDate?: string | number | Date | moment.Moment | null;
  maxDate?: string | number | Date | moment.Moment | null;

  blockFromTodayForward?: boolean;
  blockFromTodayBackward?: boolean;

  disable?: (m: moment.Moment) => boolean;
  inline?: boolean;
  position?: "auto" | "top" | "bottom";
  zIndex?: number;
  autoClose?: boolean;
  showToday?: boolean;
  showClear?: boolean;
  showNow?: boolean;
  showApply?: boolean;
  theme?: string;
  clickableStyle?: boolean;
  preventDefaultOnOpen?: boolean;
  required?: boolean;
  validate?: (value: moment.Moment | null, instance: MomentPicker) => string | null;
  targetInput?: string | HTMLElement | null;
  onOpen?: (instance: MomentPicker) => void;
  onClose?: (instance: MomentPicker) => void;
  onChange?: (value: moment.Moment | null, instance: MomentPicker) => void;

  value?: string | number | Date | moment.Moment | null;
}

export default class MomentPicker {
  constructor(target: string | HTMLElement, options?: MomentPickerOptions);
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;

  getDate(): moment.Moment | null;
  setDate(value: string | number | Date | moment.Moment, opts?: { silent?: boolean }): void;
  setOptions(next: Partial<MomentPickerOptions>): void;
}

declare global {
  interface Window {
    MomentPicker: typeof MomentPicker;
    jQuery?: any;
  }

  interface JQuery {
    momentPicker(
      options?: Partial<MomentPickerOptions> | keyof MomentPicker | string,
      ...args: any[]
    ): JQuery;
  }
}
