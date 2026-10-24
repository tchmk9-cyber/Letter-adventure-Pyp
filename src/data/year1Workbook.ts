/*
 * Year 1 PYP Workbook (ages 5–6). Aligned with the IB PYP framework.
 * Not official IB material and not endorsed by the International Baccalaureate.
 * One rich inquiry unit for each of the six transdisciplinary themes.
 */
import type { WbUnit } from "./year1/wbTypes";
import { UNIT_WHO_WE_ARE } from "./year1/unitWhoWeAre";
import { UNIT_WHERE_WE_ARE } from "./year1/unitWhereWeAre";
import { UNIT_EXPRESS } from "./year1/unitExpress";
import { UNIT_WORLD_WORKS } from "./year1/unitWorldWorks";
import { UNIT_ORGANIZE } from "./year1/unitOrganize";
import { UNIT_SHARING_PLANET } from "./year1/unitSharingPlanet";

export * from "./year1/wbTypes";

export const YEAR1_UNITS: WbUnit[] = [
  UNIT_WHO_WE_ARE,
  UNIT_WHERE_WE_ARE,
  UNIT_EXPRESS,
  UNIT_WORLD_WORKS,
  UNIT_ORGANIZE,
  UNIT_SHARING_PLANET,
];

export const WB_DISCLAIMER =
  "Aligned with the IB PYP framework. Independent teacher resource, not official IB material.";
