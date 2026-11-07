/* All PYP Workbooks (Year 1 to Year 4). Aligned with the IB PYP framework; not official IB material. */
import type { WbYear, WbYearId } from "./year1/wbTypes";
import { YEAR1_UNITS } from "./year1Workbook";
import { YEAR2_UNITS } from "./year2Workbook";
import { YEAR3_UNITS } from "./year3Workbook";
import { YEAR4_UNITS } from "./year4Workbook";

export * from "./year1Workbook";

export const WB_YEARS: WbYear[] = [
  { id: "y1", label: "Year 1", ages: "Ages 5–6", focus: "Picture words, very short sentences, tap and draw", units: YEAR1_UNITS },
  { id: "y2", label: "Year 2", ages: "Ages 6–7", focus: "Short sentences and simple reasons", units: YEAR2_UNITS },
  { id: "y3", label: "Year 3", ages: "Ages 7–8", focus: "Explaining, comparing and short written answers", units: YEAR3_UNITS },
  { id: "y4", label: "Year 4", ages: "Ages 8–9", focus: "Research questions, cause and effect, and perspectives", units: YEAR4_UNITS },
];

export function wbYear(id: WbYearId): WbYear {
  return WB_YEARS.find((y: WbYear) => y.id === id) || WB_YEARS[0];
}
