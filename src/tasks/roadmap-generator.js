import { performCodebaseAnalysis } from '../analysis/codebase-analyzer.js';
import { getProjectKnowledge } from '../knowledge/project-knowledge.js';
import { analyzeCodebaseForRoadmap } from '../analysis/llm-analyzer.js';
import { parseRoadmapContent } from './roadmap-parser.js';

/**
 * Generates a project roadmap based on codebase analysis and user goals.
 * @param {string} userGoals - High-level goals provided by the user.
 * @returns {Promise<object>} - A promise that resolves to the generated roadmap.
 */
export async function generateRoadmap(userGoals) {
  if (!userGoals || typeof userGoals !== 'string' || userGoals.trim() === '') {
    throw new Error('User goals cannot be empty.');
  }

  console.log('Generating roadmap with user goals:', userGoals);

  try {
    // Step 1: Analyze the codebase
    const codebaseAnalysisResult = performCodebaseAnalysis();
    console.log('Codebase analysis complete:', codebaseAnalysisResult);

    // Step 2: Get project knowledge
    const projectKnowledge = getProjectKnowledge();
    console.log('Project knowledge retrieved:', projectKnowledge);

    // Step 3: Combine analysis and knowledge for LLM
    const llmInput = {
      codebase: codebaseAnalysisResult,
      knowledge: projectKnowledge,
      userGoals: userGoals,
    };

    // Step 4: Get LLM suggestions for roadmap
    const llmSuggestions = await analyzeCodebaseForRoadmap(llmInput, userGoals);
    console.log('LLM suggestions received:', llmSuggestions);

    // Step 5: Parse the LLM output into a structured roadmap
    const roadmap = parseRoadmapContent(llmSuggestions.llmSuggestions);
    console.log('Roadmap parsed:', roadmap);

    return roadmap;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
}

/**
 * Updates an existing roadmap based on new input.
 * (Placeholder for future functionality)
 * @param {object} existingRoadmap - The current roadmap.
 * @param {string} updateInstructions - Instructions for updating the roadmap.
 * @returns {Promise<object>} - A promise that resolves to the updated roadmap.
 */
export async function updateRoadmap(existingRoadmap, updateInstructions) {
  if (!existingRoadmap || typeof existingRoadmap !== 'object') {
    throw new Error('Existing roadmap must be a valid object.');
  }
  if (!updateInstructions || typeof updateInstructions !== 'string' || updateInstructions.trim() === '') {
    throw new Error('Update instructions cannot be empty.');
  }
  console.log('Updating roadmap with instructions:', updateInstructions);
  // In a real scenario, this would involve another LLM call or a re-generation
  // based on the existing roadmap and update instructions.
  return {
    ...existingRoadmap,
    updated: true,
    updateInstructions: updateInstructions,
    // Dummy updated content
    parsedData: existingRoadmap.parsedData + `

Updated with: ${updateInstructions}`
  };
}