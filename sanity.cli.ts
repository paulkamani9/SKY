import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

export default defineCliConfig({
  api: { projectId, dataset },
  // Pins the deploy target, so `sanity deploy` never prompts for it again.
  deployment: { appId: "umy7m1gkhsy29w8ax5pkzxid" },
  // Deployed Studio at https://sky-menu.sanity.studio. The Studio embedded in
  // the Next app at /studio is the same config; both read the same dataset.
  studioHost: "sky-menu",
});
