/** Composition root. */
import { REGISTRY } from "./calculators/index.js";
import { App } from "./ui/app.js";

new App(REGISTRY, document.getElementById("nav"), document.getElementById("main"));
