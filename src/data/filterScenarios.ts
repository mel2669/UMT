/**
 * User-context scenarios from Figma Make: Global Filter — Strict Sequence.
 * https://www.figma.com/make/BLzNprYjVn0sERdzUO8gdi/Global-Filter---Strict-Sequence---With-Column-Filter-Updated-logic
 */

export type FilterScenarioId =
  | "single-inst-single-prog"
  | "single-inst-no-prog"
  | "single-app-single-inst-multi-prog"
  | "multi-app-prog-inst"
  | "multi-app-single-inst-multi-prog"
  | "single-app-multi-app-prog"
  | "single-app-single-inst-no-prog"
  | "multi-app-multi-inst-no-prog"
  | "multi-app-single-inst-no-prog";

export type FilterScenarioMeta = {
  id: FilterScenarioId;
  label: string;
};

export const FILTER_SCENARIOS: FilterScenarioMeta[] = [
  {
    id: "single-inst-single-prog",
    label: "Single Institution, Single Program",
  },
  {
    id: "single-inst-no-prog",
    label: "Single Institution, No Program",
  },
  {
    id: "single-app-single-inst-multi-prog",
    label: "Single Application, Single Institution, Multiple Programs",
  },
  {
    id: "multi-app-prog-inst",
    label: "Multiple Applications, Multiple Programs, Multiple Institutions",
  },
  {
    id: "multi-app-single-inst-multi-prog",
    label: "Multiple Application, Single Institution, Multiple Programs",
  },
  {
    id: "single-app-multi-app-prog",
    label: "Single Application, Multiple Institutions, Multiple Programs",
  },
  {
    id: "single-app-single-inst-no-prog",
    label: "Single Application, Single Institution, No Programs",
  },
  {
    id: "multi-app-multi-inst-no-prog",
    label: "Multiple Application, Multiple Institution, No Programs",
  },
  {
    id: "multi-app-single-inst-no-prog",
    label: "Multiple Application, Single Institution, No Programs",
  },
];

export type ScenarioUiFlags = {
  appReadOnly: boolean;
  instReadOnly: boolean;
  progReadOnly: boolean;
  showProgramFilter: boolean;
  showGlobalFiltersCard: boolean;
  hideApplyRow: boolean;
};

export type ActiveGlobalFilters = {
  appIds: string[];
  instIds: string[];
  progIds: string[];
};

const EMPTY_FILTERS: ActiveGlobalFilters = {
  appIds: [],
  instIds: [],
  progIds: [],
};

/**
 * Baseline draft/active filters when switching scenarios (Figma Make user-context).
 * Empty arrays mean “no restriction” for that dimension (except requireEmptyProgram).
 */
export function defaultScenarioState(scenario: FilterScenarioId): {
  active: ActiveGlobalFilters;
  draft: ActiveGlobalFilters;
  requireEmptyProgram: boolean;
} {
  switch (scenario) {
    case "single-inst-single-prog":
      return {
        active: {
          appIds: ["eras"],
          instIds: ["inst-buffalo"],
          progIds: ["prog-ub-allergy"],
        },
        draft: {
          appIds: ["eras"],
          instIds: ["inst-buffalo"],
          progIds: ["prog-ub-allergy"],
        },
        requireEmptyProgram: false,
      };
    case "single-inst-no-prog":
      return {
        active: {
          appIds: ["eras"],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        draft: {
          appIds: ["eras"],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        requireEmptyProgram: true,
      };
    case "single-app-single-inst-multi-prog":
      return {
        active: {
          appIds: ["eras"],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        draft: {
          appIds: ["eras"],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        requireEmptyProgram: false,
      };
    case "multi-app-single-inst-multi-prog":
      return {
        active: {
          appIds: [],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        draft: {
          appIds: [],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        requireEmptyProgram: false,
      };
    case "single-app-multi-app-prog":
      return {
        active: {
          appIds: ["eras"],
          instIds: [],
          progIds: [],
        },
        draft: {
          appIds: ["eras"],
          instIds: [],
          progIds: [],
        },
        requireEmptyProgram: false,
      };
    case "single-app-single-inst-no-prog":
      return {
        active: {
          appIds: ["eras"],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        draft: {
          appIds: ["eras"],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        requireEmptyProgram: true,
      };
    case "multi-app-multi-inst-no-prog":
      return {
        active: { ...EMPTY_FILTERS },
        draft: { ...EMPTY_FILTERS },
        requireEmptyProgram: true,
      };
    case "multi-app-single-inst-no-prog":
      return {
        active: {
          appIds: [],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        draft: {
          appIds: [],
          instIds: ["inst-jhu"],
          progIds: [],
        },
        requireEmptyProgram: true,
      };
    case "multi-app-prog-inst":
    default:
      return {
        active: { ...EMPTY_FILTERS },
        draft: { ...EMPTY_FILTERS },
        requireEmptyProgram: false,
      };
  }
}

export function clearedDraftForScenario(
  scenario: FilterScenarioId,
): ActiveGlobalFilters {
  const base = defaultScenarioState(scenario);
  const flags = getScenarioFlags(scenario);
  return {
    appIds: flags.appReadOnly ? [...base.draft.appIds] : [],
    instIds: flags.instReadOnly ? [...base.draft.instIds] : [],
    progIds:
      flags.progReadOnly || !flags.showProgramFilter
        ? [...base.draft.progIds]
        : [],
  };
}

function getScenarioFlagsImpl(scenario: FilterScenarioId): ScenarioUiFlags {
  const isSingleApp =
    scenario.includes("single-app") || scenario.startsWith("single-inst");
  const isSingleInst = scenario.includes("single-inst");
  const isNoProg = scenario.includes("no-prog");
  const isSingleProg = scenario.includes("single-prog");

  const appReadOnly = isSingleApp;
  const instReadOnly = isSingleInst;
  const progReadOnly = isNoProg || isSingleProg;
  const showProgramFilter = !isNoProg;
  const showGlobalFiltersCard =
    scenario !== "single-inst-single-prog" && scenario !== "single-inst-no-prog";
  const hideApplyRow = scenario === "single-app-single-inst-no-prog";

  return {
    appReadOnly,
    instReadOnly,
    progReadOnly,
    showProgramFilter,
    showGlobalFiltersCard,
    hideApplyRow,
  };
}

export function getScenarioFlags(scenario: FilterScenarioId): ScenarioUiFlags {
  return getScenarioFlagsImpl(scenario);
}
