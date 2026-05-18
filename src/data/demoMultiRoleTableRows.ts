import { DEMO_PROGRAM_TITLE, programName } from "./globalFilterCatalog";
import { getAllCatalogRoleLabels } from "./reportDepartmentalRolesCatalog";

type TabId = "all" | "expiring" | "expiredRecent";

export type DemoSamUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "expired" | "active" | "revoked";
  program: string;
  applicationId: string;
  institutionId: string;
  programId: string;
  expirationDisplay: string;
  tabMatch: TabId[];
};

type RowProfile = Pick<
  DemoSamUserRow,
  "applicationId" | "institutionId" | "programId" | "program"
>;

const ACTIVE_EXPIRATION = "Aug 15, 2026";
const EXPIRED_EXPIRATION = "Aug 22, 2025";

const JHU_IM_PROGRAM = programName("prog-jhu-im");

const JHU_PROFILE: RowProfile = {
  applicationId: "eras",
  institutionId: "inst-jhu",
  programId: "prog-jhu-im",
  program: JHU_IM_PROGRAM,
};

const BUFFALO_PROFILE: RowProfile = {
  applicationId: "eras",
  institutionId: "inst-buffalo",
  programId: "prog-ub-allergy",
  program: DEMO_PROGRAM_TITLE,
};

const JHU_NO_PROG_PROFILE: RowProfile = {
  applicationId: "eras",
  institutionId: "inst-jhu",
  programId: "",
  program: "-",
};

function tabMatchForStatus(status: DemoSamUserRow["status"]): TabId[] {
  const tabMatch: TabId[] = ["all"];
  if (status === "expired") tabMatch.push("expiredRecent");
  if (status === "active") tabMatch.push("expiring");
  return tabMatch;
}

function buildAssignmentRowsForUser(params: {
  idStart: number;
  firstName: string;
  lastName: string;
  email: string;
  profile: RowProfile;
  roleLabels: readonly string[];
  statusAt: (index: number) => DemoSamUserRow["status"];
}): DemoSamUserRow[] {
  return params.roleLabels.map((role, index) => {
    const status = params.statusAt(index);
    return {
      id: String(params.idStart + index),
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      role,
      status,
      program: params.profile.program,
      applicationId: params.profile.applicationId,
      institutionId: params.profile.institutionId,
      programId: params.profile.programId,
      expirationDisplay:
        status === "expired" ? EXPIRED_EXPIRATION : ACTIVE_EXPIRATION,
      tabMatch: tabMatchForStatus(status),
    };
  });
}

/** Demo users with many grant-catalog roles for row-level extend-all testing. */
export function buildDemoMultiRoleRows(): DemoSamUserRow[] {
  const labels = getAllCatalogRoleLabels();

  const morganLee = buildAssignmentRowsForUser({
    idStart: 1,
    firstName: "Morgan",
    lastName: "Lee",
    email: "morgan.lee@jh.edu",
    profile: JHU_PROFILE,
    roleLabels: labels.slice(0, 16),
    statusAt: (i) => ([2, 7, 11].includes(i) ? "expired" : "active"),
  });

  const jordanPark = buildAssignmentRowsForUser({
    idStart: 1 + morganLee.length,
    firstName: "Jordan",
    lastName: "Park",
    email: "jordan.park@jh.edu",
    profile: JHU_PROFILE,
    roleLabels: labels.slice(16, 21),
    statusAt: (i) => (i === 1 || i === 3 ? "expired" : "active"),
  });

  const emilyHoganmoody = buildAssignmentRowsForUser({
    idStart: 1 + morganLee.length + jordanPark.length,
    firstName: "Emily",
    lastName: "Hoganmoody",
    email: "emily.hoganmoody@jh.edu",
    profile: JHU_NO_PROG_PROFILE,
    roleLabels: labels.slice(25, 29),
    statusAt: (i) => (i === 2 ? "expired" : "active"),
  });

  const danielConnor = buildAssignmentRowsForUser({
    idStart: 1 + morganLee.length + jordanPark.length + emilyHoganmoody.length,
    firstName: "Daniel",
    lastName: "Connor",
    email: "daniel.connor@jh.edu",
    profile: BUFFALO_PROFILE,
    roleLabels: labels.slice(35, 39),
    statusAt: () => "active",
  });

  return [...morganLee, ...jordanPark, ...emilyHoganmoody, ...danielConnor];
}
