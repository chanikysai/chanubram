import { buildPrompt } from '../llm/prompt-builder.js';
import { generateLlmText } from '../llm/llm-text.js';

export async function analyzeCodebaseForRoadmap(llmInput, userGoals) {
  console.log("Analyzing codebase for roadmap with LLM:", llmInput, userGoals);

  // Use prompt-builder to create the prompt for the LLM
  const prompt = buildPrompt(llmInput, userGoals);

  // Use llm-text to generate the response from the LLM
  const llmResponse = await generateLlmText(prompt);

  // In a real scenario, this would parse the LLM's raw response into a structured format
  // For now, we'll return the raw response as llmSuggestions
  return {
    llmSuggestions: llmResponse,
    confidence: 0.95 // Placeholder confidence
  };
}
