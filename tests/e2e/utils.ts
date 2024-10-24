import { Course, HttpClient, NewCourseData, Semester } from "ag-client-typescript";
import * as child_process from "child_process";
import * as lodash from "lodash";
import { BrowserContext } from "playwright/test";
import * as uuid from "uuid";

// IMPORTANT: Keep the base url up to date with the value in playwright.config.ts.
// The domains have to match exactly.
const BASE_URL = 'http://127.0.0.1:8080';

export const PYTHON = "python3";
export const CONTAINER_NAME = "ag-vue-e2e-django";
export const SUPERUSER_NAME = "superuser@localtest.autograder.io";

export function fake_login(context: BrowserContext, username: string) {
  return context.addCookies([
    { name: "username", value: username, url: BASE_URL },
    { name: "token", value: "anytokenvalueworks", url: BASE_URL },
  ]);
}

export function unique_name(prefix: string) {
  return prefix + " " + uuid.v4();
}

// Set the current API client user to the given username.
// Defaults to the superuser we add to the DB during global test setup.
// This seems to be necessary because of how playwright sets up
// environments. Authenticating as the superuser as part of global setup
// doesn't seem to carry over into other tests, so we need to do it
// explicitly.
// In the most common case (a superuser creating a course), we
// can just have the make_course helper function below call this function.
export function api_fake_auth(username: string = SUPERUSER_NAME) {
  HttpClient.get_instance().set_base_url(BASE_URL + '/api/');
  HttpClient.get_instance().set_default_headers({
    // Note: Make sure the test server is using fake authentication.
    Cookie: `username=${username}`,
  });
}

export function make_course(course_data?: NewCourseData) {
  api_fake_auth();
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
  const result = child_process.spawnSync("docker", [
    "exec",
    CONTAINER_NAME,
    PYTHON,
    "manage.py",
    "shell",
    "-c",
    python_str,
  ]);
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  if (result.status !== 0) {
    throw new Error(
      "Running Django shell code failed:\n" + stdout + "\n" + stderr,
    );
  }
  return { stdout: stdout, stderr: stderr, status: result.status };
}

// Runs the given command as a subprocess and throws an exception if the command fails.
export function subprocess_check_call(cmd: string) {
  const result = child_process.spawnSync(cmd, { shell: true });
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  if (result.status !== 0) {
    throw new Error(`Command "${cmd}" exited nonzero:\n${stdout}\n${stderr}`);
  }
}

// Flushes all data from the test database and deletes the
// test media_root filesystem.
export function reset_db() {
  subprocess_check_call(
    `docker exec ${CONTAINER_NAME} ${PYTHON} manage.py migrate`,
  );
  // Because of the overhead in flushing the database using manage.py flush,
  // we'll instead delete all objects in the "top-level" tables that all
  // the other data depends on.
  const delete_data = `import shutil
from django.core.cache import cache;
from django.contrib.auth.models import User
from autograder.core.models import Course, SandboxDockerImage, BuildSandboxDockerImageTask
Course.objects.all().delete()
User.objects.all().delete()
SandboxDockerImage.objects.exclude(name='default').delete()
BuildSandboxDockerImageTask.objects.all().delete()

shutil.rmtree('/usr/src/app/media_root_dev/', ignore_errors=True)
cache.clear()

superuser = User.objects.get_or_create(username='${SUPERUSER_NAME}')[0]
superuser.is_superuser = True
superuser.save()
`;
  run_in_django_shell(delete_data);
}
