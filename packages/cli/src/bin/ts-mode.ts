if (process.env.CLI_MODE === "ts") {
  try {
    await import("@swc-node/register/esm-register");
  } catch {
    console.error("CLI_MODE=ts requires '@swc-node/register'. Install it and @swc/core to continue.");
    process.env.CLI_MODE = undefined;
  }
}
