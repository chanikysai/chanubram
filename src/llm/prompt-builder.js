// This file will craft prompts for LLM text generation.

export function buildPrompt(llmInput, userGoals) {
  console.log("Building LLM prompt with analysis:", llmInput, "and user goals:", userGoals);

  const { codebase, knowledge } = llmInput;

  const codebaseSummary = `Codebase analysis reveals:
  - Files: ${codebase.files.join(', ')}
  - Dependencies: ${codebase.dependencies.join(', ')}
  - Structure: ${codebase.structure}`;

  const projectKnowledgeSummary = `Existing project knowledge:
  - Current Features: ${knowledge.currentFeatures.join(', ')}
  - Tech Stack: ${knowledge.techStack.join(', ')}`;

  const prompt = `
  You are an AI assistant tasked with generating a project roadmap.
  Consider the following information:

  User's High-Level Goals: ${userGoals}

  ${codebaseSummary}

  ${projectKnowledgeSummary}

  Based on the above, please generate a detailed project roadmap.
  The roadmap should be broken down into Epics and Tasks.
  Each Epic should have a clear title and a brief description.
  Each Task within an Epic should have a title, a description, and estimated effort (e.g., Small, Medium, Large).
  Present the roadmap in a clear, structured, and easy-to-read format, preferably Markdown.
  Focus on actionable steps that align with the user's goals, leveraging the existing codebase and project knowledge.
  `;

  return prompt;
}
