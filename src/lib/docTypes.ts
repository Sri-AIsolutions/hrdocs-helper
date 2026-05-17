export type FieldType = "text" | "number" | "date" | "textarea" | "select";

export type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  autofillFrom?: "companyName"; // company profile key
};

export type DocTypeDef = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  fields: FieldDef[];
  promptInstructions: string; // appended into the system/user prompt
  filenameSlug: string;
};

const companyField: FieldDef = {
  key: "companyName",
  label: "Company name",
  autofillFrom: "companyName",
};

export const DOC_TYPES: Record<string, DocTypeDef> = {
  offer: {
    slug: "offer",
    title: "Offer Letter",
    shortTitle: "Offer Letter",
    description: "Professional offer letter with Indian labour law standards.",
    filenameSlug: "offer-letter",
    fields: [
      companyField,
      { key: "employeeName", label: "Employee full name" },
      { key: "jobTitle", label: "Job title" },
      { key: "ctc", label: "CTC per annum (₹)", type: "number" },
      { key: "joiningDate", label: "Joining date", type: "date" },
      { key: "probationMonths", label: "Probation period (months)", type: "number" },
      { key: "workLocation", label: "Work location (city)" },
    ],
    promptInstructions:
      "Generate a professional offer letter using Indian labour law standards. Include sections for Date, Subject, Body covering position, compensation in INR, joining date, probation, work location, confidentiality, governing law, and a Signature block.",
  },
  appointment: {
    slug: "appointment",
    title: "Appointment Letter (Contract)",
    shortTitle: "Appointment Letter",
    description: "Appointment letter for fixed-term contract employees.",
    filenameSlug: "appointment-letter",
    fields: [
      companyField,
      { key: "employeeName", label: "Employee full name" },
      { key: "jobTitle", label: "Job title" },
      { key: "contractDurationMonths", label: "Contract duration (months)", type: "number" },
      { key: "ctc", label: "CTC per annum (₹)", type: "number" },
      { key: "joiningDate", label: "Joining date", type: "date" },
      { key: "workLocation", label: "Work location (city)" },
    ],
    promptInstructions:
      "Generate a formal Appointment Letter for a fixed-term contract employee under Indian labour law. Clearly state contract duration, scope of work, compensation, termination terms for fixed-term contracts, confidentiality, and governing law. Include Date, Subject, Body and Signature block.",
  },
  leave: {
    slug: "leave",
    title: "Leave Policy",
    shortTitle: "Leave Policy",
    description: "Leave policy covering casual, sick and earned leave.",
    filenameSlug: "leave-policy",
    fields: [
      companyField,
      { key: "totalEmployees", label: "Total employees", type: "number" },
      { key: "annualLeaveDays", label: "Annual leave days", type: "number" },
      { key: "leaveTypes", label: "Leave types to cover", placeholder: "Casual, Sick, Earned, Maternity..." },
      { key: "workLocation", label: "Primary work location (city)" },
    ],
    promptInstructions:
      "Draft a complete employee Leave Policy compliant with Indian labour law (Shops & Establishments Acts and Factories Act where applicable). Cover types of leave, accrual, carry forward and encashment, holidays, application procedure, approval workflow, leave without pay, and policy review. Format with numbered sections.",
  },
  warning: {
    slug: "warning",
    title: "Warning Letter",
    shortTitle: "Warning Letter",
    description: "Formal warning letter with clear documentation and tone.",
    filenameSlug: "warning-letter",
    fields: [
      companyField,
      { key: "employeeName", label: "Employee full name" },
      { key: "designation", label: "Designation" },
      { key: "incidentDate", label: "Incident date", type: "date" },
      { key: "severity", label: "Severity", type: "select", options: ["First Warning", "Second Warning", "Final Warning"] },
      { key: "incidentDescription", label: "Incident description", type: "textarea" },
    ],
    promptInstructions:
      "Generate a formal Warning Letter aligned with Indian labour law and principles of natural justice. Include date, employee details, subject, factual description of the incident, prior discussions if any, expected corrective action, consequences of repeat behaviour, and acknowledgement section. Keep tone professional and neutral.",
  },
  relieving: {
    slug: "relieving",
    title: "Relieving Letter",
    shortTitle: "Relieving Letter",
    description: "Formal relieving letter on employee exit.",
    filenameSlug: "relieving-letter",
    fields: [
      companyField,
      { key: "employeeName", label: "Employee full name" },
      { key: "designation", label: "Designation" },
      { key: "joiningDate", label: "Joining date", type: "date" },
      { key: "lastWorkingDate", label: "Last working date", type: "date" },
      { key: "reason", label: "Reason for separation", placeholder: "Resignation, end of contract..." },
    ],
    promptInstructions:
      "Generate a professional Relieving Letter confirming the employee has been relieved from their duties. Mention designation, dates of service, that all dues/handovers are completed, and best wishes for the future. Indian HR conventions.",
  },
  experience: {
    slug: "experience",
    title: "Experience Letter",
    shortTitle: "Experience Letter",
    description: "Letter confirming tenure, role and conduct.",
    filenameSlug: "experience-letter",
    fields: [
      companyField,
      { key: "employeeName", label: "Employee full name" },
      { key: "designation", label: "Last designation" },
      { key: "joiningDate", label: "Joining date", type: "date" },
      { key: "lastWorkingDate", label: "Last working date", type: "date" },
    ],
    promptInstructions:
      "Generate a professional Experience Letter confirming the employee's tenure, designation, brief description of responsibilities, and a remark on conduct/performance. Indian HR style. Include date and signature block.",
  },
  increment: {
    slug: "increment",
    title: "Increment Letter",
    shortTitle: "Increment Letter",
    description: "Salary revision letter with old and new CTC.",
    filenameSlug: "increment-letter",
    fields: [
      companyField,
      { key: "employeeName", label: "Employee full name" },
      { key: "designation", label: "Designation" },
      { key: "oldCtc", label: "Old CTC per annum (₹)", type: "number" },
      { key: "newCtc", label: "New CTC per annum (₹)", type: "number" },
      { key: "effectiveDate", label: "Effective date", type: "date" },
    ],
    promptInstructions:
      "Generate a formal Salary Increment Letter recognising performance. Clearly show old CTC, new CTC, percentage increase, and effective date. Mention that other terms of employment remain unchanged. Include Indian HR signature block.",
  },
  posh: {
    slug: "posh",
    title: "POSH Policy",
    shortTitle: "POSH Policy",
    description: "Prevention of Sexual Harassment policy (Indian compliance).",
    filenameSlug: "posh-policy",
    fields: [
      companyField,
      { key: "totalEmployees", label: "Total employees", type: "number" },
      { key: "icMembers", label: "Internal Committee members (names, roles)", type: "textarea" },
      { key: "workLocation", label: "Primary work location (city)" },
    ],
    promptInstructions:
      "Draft a complete POSH (Prevention of Sexual Harassment) Policy compliant with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 of India. Include scope, definitions, Internal Committee composition and roles, complaint procedure, timelines, confidentiality, protection against retaliation, false complaints, awareness/training, and annual reporting. Format with numbered sections.",
  },
};

export const DOC_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(DOC_TYPES).map((d) => [d.slug, d.shortTitle]),
);

export const LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Marathi"] as const;
export type Language = (typeof LANGUAGES)[number];
