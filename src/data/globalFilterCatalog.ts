/** Demo catalog for global App → Institution → Program filters (Figma Make prototype parity). */

export const DEMO_PROGRAM_TITLE =
  "0203521053 - University at Buffalo Program - Allergy and Immunology";

export type ApplicationOption = { id: string; name: string };
export type InstitutionOption = {
  id: string;
  name: string;
  applicationId: string;
};
export type ProgramOption = {
  id: string;
  name: string;
  institutionId: string;
  applicationId: string;
};

export const APPLICATIONS: ApplicationOption[] = [
  { id: "eras", name: "ERAS Program Director Work Station" },
  { id: "gme", name: "GME Track" },
];

export const INSTITUTIONS: InstitutionOption[] = [
  {
    id: "inst-jhu",
    name: "Johns Hopkins University School of Medicine",
    applicationId: "eras",
  },
  {
    id: "inst-buffalo",
    name: "Jacobs School of Medicine and Biomedical Sciences at the University at Buffalo",
    applicationId: "eras",
  },
  {
    id: "inst-mayo",
    name: "Mayo Clinic College of Medicine and Science",
    applicationId: "gme",
  },
];

export const PROGRAMS: ProgramOption[] = [
  {
    id: "prog-ub-allergy",
    name: DEMO_PROGRAM_TITLE,
    institutionId: "inst-buffalo",
    applicationId: "eras",
  },
  {
    id: "prog-jhu-im",
    name: "1202300001 - Johns Hopkins Program - Internal Medicine",
    institutionId: "inst-jhu",
    applicationId: "eras",
  },
  {
    id: "prog-mayo-derm",
    name: "1400500002 - Mayo Clinic Program - Dermatology",
    institutionId: "inst-mayo",
    applicationId: "gme",
  },
];

export function applicationName(id: string): string {
  return APPLICATIONS.find((a) => a.id === id)?.name ?? id;
}

export function institutionName(id: string): string {
  return INSTITUTIONS.find((i) => i.id === id)?.name ?? id;
}

export function programName(id: string): string {
  if (!id) return "—";
  return PROGRAMS.find((p) => p.id === id)?.name ?? id;
}
