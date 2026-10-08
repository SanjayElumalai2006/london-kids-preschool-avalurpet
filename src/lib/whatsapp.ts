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

function cleanWhatsAppField(val?: string, maxLen = 60): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[<>{}[\]\\]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function formatWhatsAppMessage(data?: WhatsAppEnquiryData): string {
  // If no data provided or user has NOT explicitly consented to transmitting personal details
  if (!data || !data.hasConsent) {
    const rawProg = cleanWhatsAppField(data?.program, 30);
    const progLabel = rawProg ? (PROGRAM_LABEL_MAP[rawProg] || rawProg) : null;
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
  const rawProg = cleanWhatsAppField(data.program, 30);
  const progName = rawProg
    ? (PROGRAM_LABEL_MAP[rawProg] || rawProg)
    : 'Play School / Nursery / LKG / UKG';

  const typeDesc =
    data.enquiryType === 'CAMPUS_VISIT'
      ? 'Campus Visit Request & Admission Enquiry'
      : 'Admission Enquiry';

  const pName = cleanWhatsAppField(data.parentName, 60) || 'Parent';
  const cName = cleanWhatsAppField(data.childName, 60) || 'Child';
  const cAge = cleanWhatsAppField(data.childAge, 20) || 'N/A';
  const phone = cleanWhatsAppField(data.phone, 20) || 'N/A';

  const lines = [
    'Hello London Kids Preschool Avalurpet,',
    '',
    `I am submitting a ${typeDesc}:`,
    '',
    `• Parent Name: ${pName}`,
    `• Child Name: ${cName}`,
    `• Child Age: ${cAge}`,
    `• Interested Program: ${progName}`,
    `• Contact Phone: ${phone}`,
    '',
    'Please contact me with admission details and visit scheduling.',
  ];

  return lines.join('\n');
}

export function getWhatsAppEnquiryUrl(data?: WhatsAppEnquiryData): string {
  const message = formatWhatsAppMessage(data);
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
