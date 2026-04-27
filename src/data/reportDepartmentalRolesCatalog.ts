/**
 * "Select Report Departmental User Role" — grant dialog catalog (demo data).
 */

export type ReportDeptRoleLeaf = {
  id: string;
  label: string;
};

export type ReportDeptSubgroup = {
  id: string;
  /** Short name before (n/m selected) in UI */
  title: string;
  roles: ReportDeptRoleLeaf[];
};

export type ReportDeptMajorSection = {
  id: string;
  title: string;
  /** Basic Sciences: flat list + section-level Select All */
  roles?: ReportDeptRoleLeaf[];
  /** Clinical Sciences: grouped specialties */
  subgroups?: ReportDeptSubgroup[];
};

export const REPORT_DEPARTMENTAL_ROLE_CATALOG: ReportDeptMajorSection[] = [
  {
    id: "basic-sciences",
    title: "Basic Sciences",
    roles: [
      { id: "bs-anatomy", label: "Anatomy" },
      { id: "bs-biochemistry", label: "Biochemistry" },
      { id: "bs-bioethics", label: "Bioethics/Medical Humanities" },
      { id: "bs-biomedical-informatics", label: "Biomedical Informatics" },
      { id: "bs-biostatistics", label: "Biostatistics" },
      { id: "bs-genetics", label: "Genetics" },
      { id: "bs-microbiology", label: "Microbiology" },
      { id: "bs-molecular-cellular", label: "Molecular & Cellular Biology" },
      { id: "bs-neurosciences", label: "Neurosciences" },
      { id: "bs-pharmacology", label: "Pharmacology" },
      { id: "bs-physiology", label: "Physiology" },
      {
        id: "bs-population-health",
        label: "Population Health and Public Health",
      },
      { id: "bs-other", label: "Other Basic Sciences" },
    ],
  },
  {
    id: "clinical-sciences",
    title: "Clinical Sciences",
    subgroups: [
      {
        id: "cl-anesthesiology",
        title: "Anesthesiology",
        roles: [
          { id: "cl-anes-general", label: "Anesthesiology: General" },
          { id: "cl-anes-pain", label: "Anesthesiology: Pain Management" },
          { id: "cl-anes-pediatric", label: "Anesthesiology: Pediatric" },
        ],
      },
      {
        id: "cl-dermatology",
        title: "Dermatology",
        roles: [
          {
            id: "cl-derm-general",
            label: "Dermatology (excluding Mohs Surgery)",
          },
          { id: "cl-derm-mohs", label: "Dermatology: Mohs Surgery" },
        ],
      },
      {
        id: "cl-family-medicine",
        title: "Family Medicine",
        roles: [
          { id: "cl-fm-general", label: "Family Medicine: General" },
          { id: "cl-fm-sports", label: "Family Medicine: Sports Medicine" },
          { id: "cl-fm-other", label: "Family Medicine: Other" },
        ],
      },
      {
        id: "cl-medicine",
        title: "Medicine",
        roles: [
          { id: "cl-med-allergy", label: "Allergy/Immunology-Med." },
          {
            id: "cl-med-card-interventional",
            label: "Cardiology: Invasive Interventional-Med.",
          },
          {
            id: "cl-med-card-invasive-non",
            label: "Cardiology: Invasive Non-interventional-Med.",
          },
          {
            id: "cl-med-card-noninvasive",
            label: "Cardiology: Non-invasive-Med.",
          },
          {
            id: "cl-med-critical",
            label: "Critical/Intensive Care-Med.",
          },
          { id: "cl-med-endo", label: "Endocrinology-Med." },
          { id: "cl-med-gi", label: "Gastroenterology-Med." },
          { id: "cl-med-gim", label: "General Internal Medicine" },
          { id: "cl-med-geriatrics", label: "Geriatrics-Med." },
          {
            id: "cl-med-heme-onc",
            label: "Hematology/Oncology-Med.",
          },
          { id: "cl-med-hospital", label: "Hospital Medicine" },
          { id: "cl-med-id", label: "Infectious Disease-Med." },
          { id: "cl-med-nephro", label: "Nephrology-Med." },
          { id: "cl-med-palliative", label: "Palliative Care-Med." },
          { id: "cl-med-pulm", label: "Pulmonary-Med." },
          { id: "cl-med-rheum", label: "Rheumatology-Med." },
          { id: "cl-med-other", label: "Other Medicine" },
        ],
      },
      {
        id: "cl-obgyn",
        title: "OB/GYN",
        roles: [
          { id: "cl-ob-general", label: "OB/GYN: General" },
          {
            id: "cl-ob-gyn-onc",
            label: "OB/GYN: Gynecologic Oncology",
          },
          { id: "cl-ob-mfm", label: "OB/GYN: Maternal & Fetal" },
          {
            id: "cl-ob-repro",
            label: "OB/GYN: Reproductive Endocrinology",
          },
          { id: "cl-ob-uro", label: "OB/GYN: Urogynecology" },
          { id: "cl-ob-other", label: "OB/GYN: Other OB/GYN" },
        ],
      },
      {
        id: "cl-pathology",
        title: "Pathology",
        roles: [
          { id: "cl-path-anatomic", label: "Pathology: Anatomic" },
          { id: "cl-path-clinical", label: "Pathology: Clinical" },
          { id: "cl-path-other", label: "Pathology: Other Pathology" },
        ],
      },
      {
        id: "cl-pediatrics",
        title: "Pediatrics",
        roles: [
          { id: "cl-peds-adolescent", label: "Adolescent Medicine" },
          { id: "cl-peds-allergy", label: "Allergy/Immunology-Peds." },
          { id: "cl-peds-critical", label: "Critical/Intensive Care-Peds." },
          {
            id: "cl-peds-dev-beh",
            label: "Developmental-Behavioral Pediatrics",
          },
          { id: "cl-peds-em", label: "Emergency Medicine-Peds." },
          { id: "cl-peds-endo", label: "Endocrinology-Peds." },
          { id: "cl-peds-gi", label: "Gastroenterology-Peds." },
          { id: "cl-peds-general", label: "General Pediatrics" },
          { id: "cl-peds-genetics", label: "Genetics-Peds." },
          {
            id: "cl-peds-heme-onc",
            label: "Hematology/Oncology-Peds.",
          },
          { id: "cl-peds-hospital", label: "Hospital Medicine-Peds." },
          { id: "cl-peds-id", label: "Infectious Disease-Peds." },
          { id: "cl-peds-neo", label: "Neonatology" },
          { id: "cl-peds-nephro", label: "Nephrology-Peds." },
          { id: "cl-peds-neuro", label: "Neurology-Peds." },
          { id: "cl-peds-cardio", label: "Pediatric Cardiology" },
          { id: "cl-peds-psych", label: "Psychology-Peds." },
          { id: "cl-peds-pulm", label: "Pulmonary-Peds." },
          { id: "cl-peds-rheum", label: "Rheumatology-Peds." },
          { id: "cl-peds-other", label: "Other Pediatrics" },
        ],
      },
      {
        id: "cl-psychiatry",
        title: "Psychiatry",
        roles: [
          {
            id: "cl-psych-child",
            label: "Psychiatry: Child & Adolescent",
          },
          { id: "cl-psych-general", label: "Psychiatry: General" },
          { id: "cl-psych-psychology", label: "Psychiatry: Psychology" },
          { id: "cl-psych-other", label: "Psychiatry: Other" },
        ],
      },
      {
        id: "cl-radiology",
        title: "Radiology",
        roles: [
          {
            id: "cl-rad-interventional",
            label: "Diagnostic Radiology: Interventional",
          },
          {
            id: "cl-rad-noninterventional",
            label: "Diagnostic Radiology: Non-interventional",
          },
          { id: "cl-rad-nuclear", label: "Nuclear Medicine" },
          { id: "cl-rad-onc", label: "Radiation Oncology" },
          { id: "cl-rad-other", label: "Other Radiology" },
        ],
      },
      {
        id: "cl-surgery",
        title: "Surgery",
        roles: [
          { id: "cl-surg-cardiovascular", label: "Cardiovascular Surgery" },
          { id: "cl-surg-colorectal", label: "Colon and Rectal Surgery" },
          { id: "cl-surg-general", label: "General Surgery" },
          { id: "cl-surg-neuro", label: "Neurosurgery" },
          { id: "cl-surg-ortho-general", label: "Orthopedic Surgery: General" },
          { id: "cl-surg-ortho-hand", label: "Orthopedic Surgery: Hand" },
          { id: "cl-surg-ortho-spine", label: "Orthopedic Surgery: Spine" },
          {
            id: "cl-surg-ortho-sports",
            label: "Orthopedic Surgery: Sports Medicine",
          },
          {
            id: "cl-surg-ortho-trauma",
            label: "Orthopedic Surgery: Trauma",
          },
          {
            id: "cl-surg-peds-cardiovascular",
            label: "Pediatric Cardiovascular Surgery",
          },
          { id: "cl-surg-peds", label: "Pediatric Surgery" },
          { id: "cl-surg-plastic", label: "Plastic Surgery" },
          { id: "cl-surg-onc", label: "Surgical Oncology" },
          {
            id: "cl-surg-thoracic-cv",
            label: "Thoracic & Cardiovascular Surgery",
          },
          { id: "cl-surg-thoracic", label: "Thoracic Surgery" },
          { id: "cl-surg-transplant", label: "Transplant Surgery" },
          {
            id: "cl-surg-trauma-critical",
            label: "Trauma/Critical Care Surgery",
          },
          { id: "cl-surg-urology", label: "Urology" },
          { id: "cl-surg-vascular", label: "Vascular Surgery" },
          {
            id: "cl-surg-ortho-other",
            label: "Orthopedic Surgery: Other",
          },
          { id: "cl-surg-other", label: "Other Surgery" },
        ],
      },
      {
        id: "cl-other-clinical",
        title: "Other Clinical Science",
        roles: [
          { id: "cl-oc-community", label: "Community Health" },
          { id: "cl-oc-em", label: "Emergency Medicine" },
          { id: "cl-oc-neuro", label: "Neurology" },
          { id: "cl-oc-ophth", label: "Ophthalmology" },
          { id: "cl-oc-ent", label: "Otolaryngology" },
          { id: "cl-oc-pmr", label: "Physical Medicine & Rehabilitation" },
          { id: "cl-oc-preventive", label: "Preventive Medicine" },
          { id: "cl-oc-other", label: "Clinical Science: Other" },
        ],
      },
    ],
  },
];

export function collectRoleIdsFromSection(section: ReportDeptMajorSection): string[] {
  const ids: string[] = [];
  if (section.roles) {
    for (const r of section.roles) ids.push(r.id);
  }
  if (section.subgroups) {
    for (const sg of section.subgroups) {
      for (const r of sg.roles) ids.push(r.id);
    }
  }
  return ids;
}

export function collectRoleIdsFromSubgroup(sg: ReportDeptSubgroup): string[] {
  return sg.roles.map((r) => r.id);
}

export function getAllCatalogRoleIds(): string[] {
  const out: string[] = [];
  for (const s of REPORT_DEPARTMENTAL_ROLE_CATALOG) {
    out.push(...collectRoleIdsFromSection(s));
  }
  return out;
}

export function getRoleLabelById(id: string): string | undefined {
  for (const s of REPORT_DEPARTMENTAL_ROLE_CATALOG) {
    if (s.roles) {
      const hit = s.roles.find((r) => r.id === id);
      if (hit) return hit.label;
    }
    if (s.subgroups) {
      for (const sg of s.subgroups) {
        const hit = sg.roles.find((r) => r.id === id);
        if (hit) return hit.label;
      }
    }
  }
  return undefined;
}

function leafMatchesQuery(leaf: ReportDeptRoleLeaf, q: string): boolean {
  return leaf.label.toLowerCase().includes(q);
}

/** Returns shallow clones of sections/subgroups with only matching branches when `q` is non-empty. */
export function filterCatalogBySearch(
  qRaw: string,
): ReportDeptMajorSection[] {
  const q = qRaw.trim().toLowerCase();
  if (!q) return REPORT_DEPARTMENTAL_ROLE_CATALOG;

  const out: ReportDeptMajorSection[] = [];

  for (const section of REPORT_DEPARTMENTAL_ROLE_CATALOG) {
    if (section.roles) {
      const roles = section.roles.filter((r) => leafMatchesQuery(r, q));
      if (roles.length || section.title.toLowerCase().includes(q)) {
        out.push({
          ...section,
          roles: section.title.toLowerCase().includes(q)
            ? section.roles
            : roles,
        });
      }
    } else if (section.subgroups) {
      const subgroups: ReportDeptSubgroup[] = [];
      for (const sg of section.subgroups) {
        const titleHit = sg.title.toLowerCase().includes(q);
        const roles = titleHit
          ? sg.roles
          : sg.roles.filter((r) => leafMatchesQuery(r, q));
        if (roles.length || titleHit) {
          subgroups.push({ ...sg, roles });
        }
      }
      if (
        subgroups.length ||
        section.title.toLowerCase().includes(q)
      ) {
        out.push({
          ...section,
          subgroups:
            section.title.toLowerCase().includes(q)
              ? section.subgroups
              : subgroups,
        });
      }
    }
  }

  return out;
}
