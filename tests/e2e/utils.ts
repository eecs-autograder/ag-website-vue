import { Course, NewCourseData, Semester } from "ag-client-typescript";
import * as child_process from "child_process";
import * as lodash from "lodash";
import { BrowserContext } from "playwright/test";
import * as uuid from "uuid";

export const PYTHON = "python3";
export const CONTAINER_NAME = "ag-vue-e2e-django";
export const SUPERUSER_NAME = "superuser@localtest.autograder.io";

export function fake_login(context: BrowserContext, username: string) {
  return context.addCookies([
    { name: "username", value: username },
    { name: "token", value: "anytokenvalueworks" },
  ]);
}

export function unique_name(prefix: string) {
  return prefix + " " + uuid.v4();
}

export function make_course(course_data?: NewCourseData) {
  if (course_data === undefined) {
    course_data = {
      name: unique_name("Test Course"),
      semester: lodash.sample(Object.values(Semester)),
      year: 2015 + Math.floor(Math.random() * 20),
    };
  }

  return Course.create(course_data);
}

export function run_in_django_shell(python_str: string) {
  // If you add -it to the docker command, be sure to set
  // stdio to ['inherit', ...] for stdin.
  let result = child_process.spawnSync("docker", [
    "exec",
    CONTAINER_NAME,
    PYTHON,
    "manage.py",
    "shell",
    "-c",
    python_str,
  ]);
  let stdout = result.stdout.toString();
  let stderr = result.stderr.toString();
  if (result.status !== 0) {
    throw new Error(
      "Running Django shell code failed:\n" + stdout + "\n" + stderr,
    );
  }
  return { stdout: stdout, stderr: stderr, status: result.status };
}

// Runs the given command as a subprocess and throws an exception if the command fails.
export function subprocess_check_call(cmd: string) {
  let result = child_process.spawnSync(cmd, { shell: true });
  let stdout = result.stdout.toString();
  let stderr = result.stderr.toString();
  if (result.status !== 0) {
    throw new Error(`Command "${cmd}" exited nonzero:\n${stdout}\n${stderr}`);
  }
}
