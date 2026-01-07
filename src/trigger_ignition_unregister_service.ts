import type { Program } from "ollieos/types";

export default {
    name: "trigger_ignition_unregister_service",
    description: "",
    usage_suffix: "",
    arg_descriptions: {},
    main: async (data) => {
        // extract from data to make code less verbose
        const { term, args } = data;

        if (args.length !== 3) {
            term.writeln("Usage: trigger_ignition_register_service pkg_name pkg_version serivce_file");
            return 1;
        }

        const fs = term.get_fs();

        const [pkg_name, pkg_version, service_file] = args;

        // service must end with .service.json
        if (!service_file.endsWith(".service.json")) {
            term.writeln("Error: service file must end with .service.json");
            return 1;
        }

        // get the service file basename
        const service_basename = service_file.split("/").pop();

        // check the destination path already exists
        const dest_path = fs.join("/etc/services", service_basename!);
        if (!await fs.exists(dest_path)) {
            term.writeln(`Service file at ${dest_path} does not exist.`);
            return 1;
        }

        // TODO: when service CLI exists, tell it to stop the service

        await fs.delete_file(dest_path);

        return 0;
    }
} as Program;
