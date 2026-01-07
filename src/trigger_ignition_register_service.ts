import type { Program } from "ollieos/types";

export default {
    name: "trigger_ignition_register_service",
    description: "",
    usage_suffix: "",
    arg_descriptions: {},
    hide_from_help: true,
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

        const service_path = fs.join("/usr/bin", pkg_name, service_file);

        if (!await fs.exists(service_path)) {
            term.writeln(`Service file ${service_file} does not exist for package ${pkg_name} version ${pkg_version}.`);
            return 1;
        }

        // get the service file basename
        const service_basename = service_file.split("/").pop();

        // check the destination path doesn't already exist
        const dest_path = fs.join("/etc/services", service_basename!);
        if (await fs.exists(dest_path)) {
            term.writeln(`Service file at ${dest_path} already exists.`);
            return 1;
        }

        // fs doesnt support copy yet, so read and write
        const service_content = await fs.read_file(service_path);
        await fs.write_file(dest_path, service_content);

        // TODO: when service CLI exists, tell it to start the service

        return 0;
    }
} as Program;
