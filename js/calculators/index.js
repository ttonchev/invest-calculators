/** Registry: add a calculator here and nothing else changes (open/closed). */
import { NeededSavings } from "./needed-savings.js";
import { CompoundInterest } from "./compound-interest.js";
import { EtfPlusCompany } from "./etf-plus-company.js";
import { FeeImpact } from "./fee-impact.js";
import { IncomeDuration } from "./income-duration.js";
import { CostOfWaiting } from "./cost-of-waiting.js";

export const REGISTRY = [new NeededSavings(), new CompoundInterest(), new EtfPlusCompany(), new FeeImpact(), new IncomeDuration(), new CostOfWaiting()];
