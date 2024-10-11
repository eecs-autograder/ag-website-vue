import { defineConfig } from "cypress";
import * as child_process from 'child_process';

const SUPERUSER_NAME = 'superuser@autograder.io'
const ADMIN_NAME = 'admin@autograder.io'
const STAFF_NAME = 'staff@autograder.io'
const STUDENT_NAME = 'student@autograder.io'

const CONTAINER_NAME = 'ag-vue-e2e-django'

export default defineConfig({
  component: {
    devServer: {
      framework: "vue-cli",
      bundler: "webpack",
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        setup_db
      })
    },
    baseUrl: 'http://localhost:8080',
    env: {
      superuser: SUPERUSER_NAME,
      admin: ADMIN_NAME,
      staff: STAFF_NAME,
      student: STUDENT_NAME,
    },
  },
});

const setup_db = () => {
    let django_code = `import shutil
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

admin = User.objects.get_or_create(username='${ADMIN_NAME}')[0]
admin.save()

staff = User.objects.get_or_create(username='${STAFF_NAME}')[0]
staff.save()

student = User.objects.get_or_create(username='${STUDENT_NAME}')[0]
student.save()
`;
    return run_in_django_shell(django_code);
}

const run_in_django_shell = (python_str: string) => {
  // If you add -it to the docker command, be sure to set
  // stdio to ['inherit', ...] for stdin.
  let result = child_process.spawnSync(
      'docker', ['exec', CONTAINER_NAME, 'python', 'manage.py', 'shell',
                 '-c', python_str]);
  let stdout = result.stdout.toString();
  let stderr = result.stderr.toString();
  if (result.status !== 0) {
      throw new Error('Running Django shell code failed:\n' + stdout + '\n' + stderr);
  }
  return {stdout: stdout, stderr: stderr, status: result.status};
}
