import {log, progress, spinner, taskLog} from "@clack/prompts";

async function extracted() {
  // const log1 = taskLog({title: "Starting task..."});
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // log1.message("Message");
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // const group = log1.group("Subtask 1");
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // group.message("Subtask message");
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // group.message("Subtask message");
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // group.success("Subtask message 2");
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // const group2 = log1.group("Subtask 2");
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // group2.message("Subtask 2 message");
  //
  // const spin = spinner(); //
  // spin.start("Loading...");
  //
  // await new Promise((r) => setTimeout(r, 1000));
  //
  // spin.stop("Loading...");
  // spin.clear();
  //
  // log1.success("Message");
  //

  // const task = taskLog({title: "Starting task..."});
  const p = progress({
    style: "block",
    max: 100
  });

  p.start("Preparing...");

  await new Promise((r) => setTimeout(r, 1000));

  p.advance(10, "Install...");

  await new Promise((r) => setTimeout(r, 1000));

  p.advance(50, "Update...");

  await new Promise((r) => setTimeout(r, 1000));

  p.advance(90, "Update...");
  //
  // p.stop("Complete!");
}

await extracted();
// await extracted();
