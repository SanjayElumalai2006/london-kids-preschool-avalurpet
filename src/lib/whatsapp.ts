/**
 * WhatsApp Admission & Campus Visit Enquiry Link Generator
 * London Kids Preschool Avalurpet
 * Official Number: +91 90436 33545 (wa.me/919043633545)
 */

export const SCHOOL_WHATSAPP_NUMBER = '919043633545';
export const WHATSAPP_BASE_URL = `https://wa.me/${SCHOOL_WHATSAPP_NUMBER}`;

export interface WhatsAppEnquiryData {
  parentName?: string;
  childName?: string;
  childAge?: string;
  program?: string;
  phone?: string;
  enquiryType?: 'ADMISSION_INFO' | 'CAMPUS_VISIT' | 'FEE_STRUCTURE' | 'GENERAL';
  /** Must be explicitly true to include personal family/child details in WhatsApp URL */
  hasConsent?: boolean;
}

const PROGRAM_LABEL_MAP: Record<string, string> = {
  PLAY_SCHOOL: 'Play School (1.5 - 2.5 yrs)',
  NURSERY: 'Nursery (2.5 - 3.5 yrs)',
  LKG: 'LKG (3.5 - 4.5 yrs)',
  UKG: 'UKG (4.5 - 6 yrs)',
  ALL: 'Preschool Programs',
};

export function formatWhatsAppMessage(data?: WhatsAppEnquiryData): string {
  // If no data provided or user has NOT explicitly consented to transmitting personal details
  if (!data || !data.hasConsent) {
    const progLabel = data?.program ? (PROGRAM_LABEL_MAP[data.program] || data.program) : null;
    const typeLabel =
      data?.enquiryType === 'CAMPUS_VISIT'
        ? 'schedule a preschool campus visit'
        : data?.enquiryType === 'FEE_STRUCTURE'
        ? 'request fee structure information'
        : 'enquire about preschool admissions';

    return [
      'Hello London Kids Preschool Avalurpet,',
      '',
      `I would like to ${typeLabel}${progLabel ? ` for ${progLabel}` : ''}.`,
      '',
      'Please share admission guidelines, timings, and visit availability.',
    ].join('\n');
  }

  // User has explicitly checked the consent box to send pre-filled family info
  const progName = data.program
    ? (PROGRAM_LABEL_MAP[data.program] || data.program)
    : 'Play School / Nursery / LKG / UKG';

  const typeDesc =
    data.enquiryType === 'CAMPUS_VISIT'
      ? 'Campus Visit Request & Admission Enquiry'
      : 'Admission Enquiry';

  const lines = [
    'Hello London Kids Preschool Avalurpet,',
    '',
    `I am submitting a ${typeDesc}:`,
    '',
    `• Parent Name: ${data.parentName?.trim() || 'Parent'}`,
    `• Child Name: ${data.childName?.trim() || 'Child'}`,
    `• Child Age: ${data.childAge?.trim() || 'N/A'}`,
    `• Interested Program: ${progName}`,
    `• Contact Phone: ${data.phone?.trim() || 'N/A'}`,
    '',
    'Please contact me with admission details and visit scheduling.',
  ];

  return lines.join('\n');
}

export function getWhatsAppEnquiryUrl(data?: WhatsAppEnquiryData): string {
  const message = formatWhatsAppMessage(data);
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
