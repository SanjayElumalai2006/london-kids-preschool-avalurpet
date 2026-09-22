/**
 * WhatsApp Admission Enquiry Link Generator
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
}

export function formatWhatsAppMessage(data?: WhatsAppEnquiryData): string {
  if (!data || (!data.parentName && !data.childName)) {
    return `Hello London Kids Preschool Avalurpet,

I am interested in admission.

Please contact me with admission details.`;
  }

  const programLabelMap: Record<string, string> = {
    PLAY_SCHOOL: 'Play School',
    NURSERY: 'Nursery',
    LKG: 'LKG',
    UKG: 'UKG'
  };

  const progName = data.program 
    ? (programLabelMap[data.program] || data.program)
    : 'Nursery / Play School / LKG / UKG';

  return `Hello London Kids Preschool Avalurpet,

I am interested in admission.

Parent Name: ${data.parentName?.trim() || 'N/A'}
Child Name: ${data.childName?.trim() || 'N/A'}
Child Age: ${data.childAge?.trim() || 'N/A'}
Interested Program: ${progName}
Phone: ${data.phone?.trim() || 'N/A'}

Please contact me with admission details.`;
}

export function getWhatsAppEnquiryUrl(data?: WhatsAppEnquiryData): string {
  const message = formatWhatsAppMessage(data);
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
