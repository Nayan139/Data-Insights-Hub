import { z } from "zod";
import { validatePhoneNumber } from "./whatsapp";

export interface ImportContact {
  name: string;
  whatsappNumber: string;
  status: "REGISTERED" | "NOT_REGISTERED" | "ERROR";
}

export interface ImportResult {
  success: boolean;
  contacts: ImportContact[];
  errors: string[];
  skipped: number;
}

// Parse CSV content
export const parseCSV = (content: string): string[][] => {
  const lines = content.trim().split('\n');
  const result: string[][] = [];

  for (const line of lines) {
    // Simple CSV parsing (handles quoted fields)
    const row: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    if (row.some(field => field.length > 0)) {
      result.push(row);
    }
  }

  return result;
};

// Validate CSV structure and content
export const validateCSVStructure = (rows: string[][]): { valid: boolean; error?: string } => {
  if (rows.length === 0) {
    return { valid: false, error: "File is empty" };
  }

  const headers = rows[0].map(h => h.toLowerCase().trim());

  // Check required columns
  const hasName = headers.includes('name');
  const hasPhoneNumber = headers.some(h => h.includes('phone') || h.includes('whatsapp') || h.includes('number'));

  if (!hasName || !hasPhoneNumber) {
    return {
      valid: false,
      error: "CSV must contain 'name' and 'whatsapp_number' columns"
    };
  }

  // Check for extra columns
  if (headers.length > 2) {
    return {
      valid: false,
      error: `CSV contains ${headers.length} columns. Only 'name' and 'whatsapp_number' are allowed.`
    };
  }

  return { valid: true };
};

// Process and validate CSV data
export const processCSVData = async (content: string): Promise<ImportResult> => {
  const errors: string[] = [];
  const contacts: ImportContact[] = [];
  let skipped = 0;

  try {
    const rows = parseCSV(content);

    // Validate structure
    const structureValidation = validateCSVStructure(rows);
    if (!structureValidation.valid) {
      return {
        success: false,
        contacts: [],
        errors: [structureValidation.error!],
        skipped: 0
      };
    }

    // Find column indices
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const nameIndex = headers.indexOf('name');
    const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('whatsapp') || h.includes('number'));

    // Process data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      if (row.length < 2 || (nameIndex >= row.length && phoneIndex >= row.length)) {
        continue;
      }

      const name = row[nameIndex]?.trim();
      const phone = row[phoneIndex]?.trim();

      // Validate row data
      if (!name || !phone) {
        errors.push(`Row ${i + 1}: Missing name or phone number`);
        skipped++;
        continue;
      }

      if (name.length === 0) {
        errors.push(`Row ${i + 1}: Name cannot be empty`);
        skipped++;
        continue;
      }

      if (!validatePhoneNumber(phone)) {
        errors.push(`Row ${i + 1}: Invalid phone number format: ${phone}`);
        skipped++;
        continue;
      }

      // In production, verify with WhatsApp API
      const isWhatsApp = true; // Assume registered for now

      contacts.push({
        name,
        whatsappNumber: phone,
        status: isWhatsApp ? "REGISTERED" : "NOT_REGISTERED"
      });
    }

    return {
      success: contacts.length > 0,
      contacts,
      errors,
      skipped
    };
  } catch (error) {
    return {
      success: false,
      contacts: [],
      errors: ["Failed to parse CSV file"],
      skipped: 0
    };
  }
};
