// Store domain barrel (Milestone M2.2). Re-exports the port + the mock
// source. The seeded literals live in seed/demoStore.ts and are re-exported
// here for convenient typed access by the dashboard/tests.

export type { StoreSource } from "./StoreSource";
export { mockStore } from "./mockStore";
export { demoStore, demoBrief } from "../../../seed/demoStore";
