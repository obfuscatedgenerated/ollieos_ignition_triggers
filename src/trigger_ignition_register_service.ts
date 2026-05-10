import type { Program } from "ollieos/types";
import {Kernel, UserspaceKernel} from "ollieos/kernel";

export default {
    name: "trigger_ignition_register_service",
    description: "",
    usage_suffix: "",
    arg_descriptions: {},
    hide_from_help: true,
    compat: "2.0.0",
    main: async (data) => {
        // extract from data to make code less verbose
        const { kernel, shell, term, args } = data;
        let effective_kernel: UserspaceKernel | Kernel = kernel;

        if (args.length !== 3) {
            term.writeln("Usage: trigger_ignition_register_service pkg_name pkg_version service_file");
            return 1;
        }

        const pkg_name = args[0];
        const service_file = JSON.parse(args[2]);

        // service must end with .service.json
        if (!service_file.endsWith(".service.json")) {
            term.writeln("Error: service file must end with .service.json");
            return 1;
        }

        // prevent directory traversal in service file path
        if (service_file.includes("..")) {
            term.writeln("Error: service file path cannot contain ..");
            return 1;
        }

        // if service is registering to the privileged subdirectory, need to escalate
        if (service_file.startsWith("privileged/")) {
            const priv_kernel = await kernel.request_privilege(`${pkg_name} wishes to register a privileged service at ${service_file}`);
            if (!priv_kernel) {
                term.writeln("Error: privilege request denied");
                return 1;
            }

            effective_kernel = priv_kernel;
        }

        const fs = effective_kernel.get_fs();

        const service_path = fs.join("/usr/bin", pkg_name, service_file);

        if (!await fs.exists(service_path)) {
            term.writeln(`Service file ${service_file} does not exist for package ${pkg_name}.`);
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

        // invoke spark to reload-services and start the new service
        console.log("Starting new service:", service_basename);

        try {
            const reload = kernel.spawn("spark", ["reload-services"], shell);
            const reload_code = await reload.completion;

            if (reload_code !== 0) {
                term.writeln(`Warning: exit code ${reload_code} to reload services`);
            }
        } catch {
            term.writeln("Warning: failed to reload services");
        }

        try {
            const start = kernel.spawn("spark", ["service", "start", service_basename!.replace(".service.json", "")], shell);
            const start_code = await start.completion;

            if (start_code !== 0) {
                term.writeln(`Warning: exit code ${start_code} when trying to start service ${service_basename}`);
            }
        } catch {
            term.writeln(`Warning: failed to start service ${service_basename}`);
        }

        // TODO: make exit code reflect success of above operations
        // TODO: ability to pass object to tell it to not start the service immediately
        return 0;
    }
} as Program;
