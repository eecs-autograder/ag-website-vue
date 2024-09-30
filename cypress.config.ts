import { defineConfig } from "cypress";
import * as child_process from 'child_process';

// reset db
// make super user

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
    baseUrl: 'http://localhost:8080'
  },
});

const SUPERUSER_NAME = 'superuser@autograder.io'
const CONTAINER_NAME = 'ag-vue-e2e-django'

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

user = User.objects.get_or_create(username='${SUPERUSER_NAME}')[0]
user.is_superuser = True
user.save()
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
