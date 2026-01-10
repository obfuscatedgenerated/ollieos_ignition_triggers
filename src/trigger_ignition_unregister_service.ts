import type { Program } from "ollieos/types";

export default {
    name: "trigger_ignition_unregister_service",
    description: "",
    usage_suffix: "",
    arg_descriptions: {},
    hide_from_help: true,
    compat: "2.0.0",
    main: async (data) => {
        // extract from data to make code less verbose
        const { kernel, term, args, shell } = data;

        if (args.length !== 3) {
            term.writeln("Usage: trigger_ignition_register_service pkg_name pkg_version serivce_file");
            return 1;
        }

        const fs = kernel.get_fs();

        const pkg_name = args[0];
        const service_file = JSON.parse(args[2]);

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

        await fs.delete_file(dest_path);

        // invoke spark to stop the old service and reload-services
        console.log("Stopping old service:", service_basename);

        try {
            const stop = kernel.spawn("spark", ["service", "stop", service_basename!.replace(".service.json", "")], shell);
            const stop_code = await stop.completion;

            if (stop_code !== 0) {
                term.writeln(`Warning: exit code ${stop_code} when trying to stop service ${service_basename}`);
            }
        } catch {
            term.writeln(`Warning: failed to stop service ${service_basename}`);
        }

        try {
            const reload = kernel.spawn("spark", ["reload-services"], shell);
            const reload_code = await reload.completion;

            if (reload_code !== 0) {
                term.writeln(`Warning: exit code ${reload_code} to reload services`);
            }
        } catch {
            term.writeln("Warning: failed to reload services");
        }

        return 0;
    }
} as Program;
