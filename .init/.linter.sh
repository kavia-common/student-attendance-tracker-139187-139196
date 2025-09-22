#!/bin/bash
cd /home/kavia/workspace/code-generation/student-attendance-tracker-139187-139196/student_attendance_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

