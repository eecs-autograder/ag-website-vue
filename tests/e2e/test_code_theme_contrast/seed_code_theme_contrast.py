from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

import autograder.core.models as ag_models
import autograder.handgrading.models as hg_models
import autograder.utils.testing.model_obj_builders as obj_build

STUDENT = "contrast-e2e-student@localtest.autograder.io"
GRADER = "contrast-e2e-grader@localtest.autograder.io"

# Each file's token-rich block is duplicated so its tokens appear on both a
# commented-line background (first copy) and a plain code background (second
# copy). Between them these exercise every syntax color bucket the test checks
# (see TOKEN_BUCKET_CLASSES in test_code_theme_contrast.ts).
CODE_BLOCKS = {
    "example.py": """\
# compute the total for the given values
import os
def compute_total(values):
    total = len(values) + 42
    return "result: " + str(total)""",
    "example.css": """\
/* set the theme colors */
.button-primary {
    color: #ffffff;
    width: 42px;
}""",
}

course = obj_build.make_course()
project = obj_build.make_project(course=course, visible_to_students=True)

student = User.objects.get_or_create(username=STUDENT)[0]
course.students.add(student)
grader = User.objects.get_or_create(username=GRADER)[0]
course.staff.add(grader)

submitted_files = []
for filename, block in CODE_BLOCKS.items():
    obj_build.make_expected_student_file(project, pattern=filename)
    submitted_files.append(
        SimpleUploadedFile(filename, (block + "\n" + block).encode()))

group = ag_models.Group.objects.validate_and_create(
    members=[student], project=project, check_group_size_limits=False)
submission = obj_build.make_finished_submission(
    group=group, submitted_files=submitted_files)

rubric = hg_models.HandgradingRubric.objects.validate_and_create(
    project=project,
    points_style=hg_models.PointsStyle.start_at_max_and_subtract,
    max_points=0,
    show_grades_and_rubric_to_students=True,
    handgraders_can_leave_comments=True,
    handgraders_can_adjust_points=True,
)
result = hg_models.HandgradingResult.objects.validate_and_create(
    submission=submission, group=group, handgrading_rubric=rubric)

# Comment the first copy of each file (lines 0..N) so those lines render on the
# commented-line background.
for filename, block in CODE_BLOCKS.items():
    hg_models.Comment.objects.validate_and_create(
        location={
            "first_line": 0,
            "last_line": block.count("\n"),
            "filename": filename,
        },
        text="contrast test comment",
        handgrading_result=result)

print("PROJECT_PK=" + str(project.pk))
print("STUDENT=" + STUDENT)
print("GRADER=" + GRADER)
