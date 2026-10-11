import type { DataErrorCode } from '@/domain/errors'

export const fa = {
  appName: 'روزنو',
  appTagline: 'کارهای همین دستگاه',
  skipToContent: 'رفتن به محتوا',
  retry: 'تلاش دوباره',
  nav: {
    today: 'امروز',
    upcoming: 'آینده',
    inbox: 'ورودی‌ها',
    calendar: 'تقویم',
    more: 'بیشتر',
    tasks: 'همه کارها',
    completed: 'تکمیل‌شده‌ها',
    lists: 'فهرست‌ها',
    focus: 'تمرکز',
    stats: 'آمار',
    settings: 'تنظیمات',
    primary: 'ناوبری اصلی',
    sections: 'بخش‌ها',
    main: 'اصلی',
    library: 'کتابخانه',
  },
  sections: {
    today: {
      title: 'امروز',
      description: 'کارهای امروز، عقب‌افتاده‌ها و پیشرفت روزانه اینجا دیده می‌شوند. افزودن کار از مرحله بعد فعال می‌شود.',
    },
    upcoming: {
      title: 'آینده',
      description: 'کارهای روزهای آینده بر اساس تاریخ گروه‌بندی می‌شوند. این نما هنوز به داده‌ها وصل نشده است.',
    },
    inbox: {
      title: 'ورودی‌ها',
      description: 'ایده‌ها و کارهای بدون تاریخ اینجا می‌مانند. تبدیل آن‌ها به کار برنامه‌ریزی‌شده در مرحله بعد ممکن می‌شود.',
    },
    calendar: {
      title: 'تقویم',
      description: 'نمای ماهانه و کارهای هر روز در مرحله قابلیت‌های پیشرفته اضافه می‌شود.',
    },
    tasks: {
      title: 'همه کارها',
      description: 'جست‌وجو، فیلتر و عملیات گروهی در مرحله هسته محصول فعال می‌شود.',
    },
    completed: {
      title: 'تکمیل‌شده‌ها',
      description: 'کارهای انجام‌شده و بازگرداندن آن‌ها به فهرست فعال در مرحله بعد در دسترس است.',
    },
    lists: {
      title: 'فهرست‌ها',
      description: 'ساخت فهرست، رنگ، آیکون و دیدن کارهای هر فهرست در مرحله بعد فعال می‌شود.',
    },
    focus: {
      title: 'تمرکز',
      description: 'تایمر تمرکز و اتصال آن به یک کار در مرحله قابلیت‌های پیشرفته اضافه می‌شود.',
    },
    stats: {
      title: 'آمار',
      description: 'آمار فقط از داده‌های واقعی شما محاسبه خواهد شد. نمودارها هنوز فعال نشده‌اند.',
    },
  },
  more: {
    title: 'بیشتر',
    description: 'بخش‌های دیگر برنامه.',
  },
  empty: {
    title: 'هنوز به داده‌ها وصل نشده',
    body: 'ذخیره محلی آماده است. کار با این بخش در مرحله بعد فعال می‌شود.',
  },
  settings: {
    title: 'تنظیمات',
    description: 'ظاهر برنامه و وضعیت ذخیره روی همین دستگاه.',
    theme: 'ظاهر',
    themeHint: 'انتخاب شما در پایگاه محلی ذخیره می‌شود.',
    light: 'روشن',
    dark: 'تاریک',
    system: 'دستگاه',
    storage: 'ذخیره‌سازی',
    ready: 'پایگاه محلی آماده است.',
    opening: 'در حال باز کردن پایگاه محلی…',
    failed: 'پایگاه محلی باز نشد.',
    versions: 'نسخه',
    appVersion: 'نسخه برنامه',
    schemaVersion: 'نسخه پایگاه',
    usage: 'فضای استفاده‌شده',
    quota: 'سقف تقریبی',
    estimateUnavailable: 'این مرورگر برآورد فضای ذخیره را نشان نمی‌دهد.',
  },
  errors: {
    TITLE_REQUIRED: 'عنوان کار لازم است.',
    NAME_REQUIRED: 'نام را وارد کنید.',
    NOT_FOUND: 'مورد درخواستی پیدا نشد.',
    INVALID_DATE: 'تاریخ معتبر نیست.',
    INVALID_TIME: 'ساعت معتبر نیست.',
    INVALID_PRIORITY: 'اولویت معتبر نیست.',
    INVALID_RECURRENCE: 'قاعده تکرار معتبر نیست.',
    INVALID_COLOR: 'رنگ معتبر نیست.',
    INVALID_ICON: 'آیکون معتبر نیست.',
    INVALID_SESSION: 'جلسه تمرکز معتبر نیست.',
    LIST_NOT_FOUND: 'فهرست پیدا نشد.',
    TAG_NOT_FOUND: 'برچسب پیدا نشد.',
    DUPLICATE_NAME: 'این نام قبلاً استفاده شده است.',
    QUOTA: 'فضای ذخیره‌سازی این مرورگر پر شده است.',
    VERSION: 'نسخه پایگاه داده با این برنامه سازگار نیست.',
    UNKNOWN: 'ذخیره‌سازی محلی با خطا روبه‌رو شد.',
  } satisfies Record<DataErrorCode, string>,
} as const

export function errorText(code: DataErrorCode): string {
  return fa.errors[code]
}
