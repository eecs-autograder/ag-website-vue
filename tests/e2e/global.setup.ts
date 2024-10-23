import {test as setup} from '@playwright/test';
import * as child_process from 'child_process';

const PYTHON = 'python3';
const CONTAINER_NAME = 'ag-vue-e2e-django'


setup('Reset DB', () => {
    reset_db();
})

// Flushes all data from the test database and deletes the
// test media_root filesystem.
export function reset_db() {

    subprocess_check_call(`docker exec ${CONTAINER_NAME} ${PYTHON} manage.py migrate`);
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
`;
    run_in_django_shell(delete_data);
}

export function run_in_django_shell(python_str: string) {
    // If you add -it to the docker command, be sure to set
    // stdio to ['inherit', ...] for stdin.
    let result = child_process.spawnSync(
        'docker', ['exec', CONTAINER_NAME, PYTHON, 'manage.py', 'shell',
                   '-c', python_str]);
    let stdout = result.stdout.toString();
    let stderr = result.stderr.toString();
    if (result.status !== 0) {
        throw new Error('Running Django shell code failed:\n' + stdout + '\n' + stderr);
    }
    return {stdout: stdout, stderr: stderr, status: result.status};
}

// Runs the given command as a subprocess and throws an exception if the command fails.
function subprocess_check_call(cmd: string) {
    let result = child_process.spawnSync(cmd, {shell: true});
    let stdout = result.stdout.toString();
    let stderr = result.stderr.toString();
    if (result.status !== 0) {
        throw new Error(`Command "${cmd}" exited nonzero:\n${stdout}\n${stderr}`);
    }
}

export const SUPERUSER_NAME = 'superuser@umich.edu';

export function make_superuser() {
    let make_superuser_code = `
from django.contrib.auth.models import User

user = User.objects.get_or_create(username='${SUPERUSER_NAME}')[0]
user.is_superuser = True
user.save()
        `;

    run_in_django_shell(make_superuser_code);
}
