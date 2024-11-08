/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @license MIT
 * @file This script only lints the changed files using git diff. It is useful in large projects
 *       to avoid checking unnecessary files, where we assume files not changed already conform.
 */
import { execSync } from "child_process";

try {
  const diffCommand = `git diff --name-only origin/master...HEAD --diff-filter=ACMRTUXB`
  let changedFiles = execSync(diffCommand, { encoding: "utf-8" })
    .split("\n")
    .filter((file) => /\.(mjs|tsx?)$/.test(file))
    .join(" ");

  if (changedFiles.trim() === "") {
    console.log("There are no files to lint");
  } else {
    const eslintCommand = `yarn eslint --config eslint.config.mjs ${changedFiles}`;
    execSync(eslintCommand, { stdio: "inherit" });
  }
} catch (err) {
  console.error(err);
  process.exit(1)
}
