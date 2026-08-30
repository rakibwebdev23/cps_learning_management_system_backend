#!/bin/bash
declare -A controllers=(
  ["enrollment"]="enrollment"
  ["quiz-result"]="quiz-result"
  ["quiz"]="quiz"
  ["lesson"]="lesson"
  ["question"]="question"
  ["lesson-progress"]="lesson-progress"
  ["quiz-answer"]="quiz-answer"
  ["option"]="option"
)

for name in "${!controllers[@]}"; do
  file="src/api/${name}/controllers/${name}.ts"
  if [ -f "$file" ]; then
    echo "import { factories } from '@strapi/strapi';" > "$file"
    echo "" >> "$file"
    echo "export default factories.createCoreController('api::${name}.${name}');" >> "$file"
    echo "Reverted $file"
  fi
done
