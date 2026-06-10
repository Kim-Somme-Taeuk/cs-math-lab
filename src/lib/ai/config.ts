export function getPlannerModel() {
  return process.env.OPENAI_MODEL_PLANNER ?? "gpt-5.4-nano";
}

export function getTutorModel() {
  return process.env.OPENAI_MODEL_TUTOR ?? "gpt-5.4-mini";
}
