/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const pkgbuild = require("ollieos_pkgbuild");

// EDIT THIS OBJECT TO ADD MORE PROGRAMS OR CHANGE THE FILE PATHS/NAMES
// key: the name of the program
// value: the path to the entry point
const programs = {
    "trigger_ignition_register_service": "./src/trigger_ignition_register_service.ts",
    "trigger_ignition_unregister_service": "./src/trigger_ignition_unregister_service.ts",
};

// EDIT THIS ARRAY TO ADD DEPENDENCIES FOR THE VERSION CURRENTLY BEING BUILT
// format: name@version
const deps = [];

// EDIT THIS TO CHANGE THE HOMEPAGE URL
const homepage_url = "https://ollieg.codes";

// EDIT THIS OBJECT TO DEFINE ADDITIONAL WEBPACK EXTERNALS
// key: the name of the module
// value: the external name
const externals = {};

// EDIT THIS ARRAY TO DEFINE ADDITIONAL FILES TO BE INCLUDED IN THE PACKAGE
const additional_files = [
    "./src/register_service.json",
];

// EDIT THIS OBJECT TO DEFINE TRIGGERS TO RUN ON INSTALL/REMOVAL
// key: the name of the trigger
// value: any data to pass to the trigger
const triggers = {
    "create_trigger": "register_service.json",
};

module.exports = pkgbuild(programs, deps, homepage_url, externals, triggers, additional_files);
