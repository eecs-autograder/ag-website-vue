import { test as setup, expect } from "@playwright/test";
import { CONTAINER_NAME, PYTHON, run_in_django_shell, subprocess_check_call } from "./utils";
import { HttpClient } from "ag-client-typescript";

const SUPERUSER_NAME = "superuser@autograder.io";

setup("Global Setup", ({ baseURL }) => {
  expect(
    baseURL,
    "baseURL should be set in playwright.config.ts to point to the e2e test stack server",
  ).not.toBeUndefined();

  // Authenticate the API client
  HttpClient.get_instance().set_base_url(baseURL!);
  HttpClient.get_instance().set_default_headers({
    // Note: Make sure the test server is using fake authentication.
    Cookie: `username=${SUPERUSER_NAME}`,
  });

  reset_db();
});

// Flushes all data from the test database and deletes the
// test media_root filesystem.
export function reset_db() {
  subprocess_check_call(
    `docker exec ${CONTAINER_NAME} ${PYTHON} manage.py migrate`,
  );
  // Because of the overhead in flushing the database using manage.py flush,
  // we'll instead delete all objects in the "top-level" tables that all
  // the other data depends on.
  let delete_data = `import shutil
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
