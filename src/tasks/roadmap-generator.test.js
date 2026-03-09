import { generateRoadmap, updateRoadmap } from '../src/tasks/roadmap-generator.js';
import { performCodebaseAnalysis } from '../src/analysis/codebase-analyzer.js';
import { getProjectKnowledge } from '../src/knowledge/project-knowledge.js';
import { analyzeCodebaseForRoadmap } from '../src/analysis/llm-analyzer.js';
import { parseRoadmapContent } from '../src/tasks/roadmap-parser.js';

// Mock dependencies
jest.mock('../src/analysis/codebase-analyzer.js');
jest.mock('../src/knowledge/project-knowledge.js');
jest.mock('../src/analysis/llm-analyzer.js');
jest.mock('../src/tasks/roadmap-parser.js');

describe('roadmap-generator', () => {
  beforeEach(() => {
    // Reset mocks before each test
    performCodebaseAnalysis.mockClear();
    getProjectKnowledge.mockClear();
    analyzeCodebaseForRoadmap.mockClear();
    parseRoadmapContent.mockClear();

    // Default mock implementations
    performCodebaseAnalysis.mockReturnValue({ files: ['file1.js'], dependencies: ['dep1'] });
    getProjectKnowledge.mockReturnValue({ currentFeatures: ['feat1'], techStack: ['tech1'] });
    analyzeCodebaseForRoadmap.mockResolvedValue({ llmSuggestions: 'LLM generated roadmap content.', confidence: 0.9 });
    parseRoadmapContent.mockReturnValue({ parsedData: 'Structured roadmap data' });
  });

  describe('generateRoadmap', () => {
    // Happy path test case
    test('should generate a roadmap successfully with valid user goals', async () => {
      const userGoals = 'Develop a new user authentication module.';
      const roadmap = await generateRoadmap(userGoals);

      expect(performCodebaseAnalysis).toHaveBeenCalledTimes(1);
      expect(getProjectKnowledge).toHaveBeenCalledTimes(1);
      expect(analyzeCodebaseForRoadmap).toHaveBeenCalledTimes(1);
      expect(analyzeCodebaseForRoadmap).toHaveBeenCalledWith(
        {
          codebase: { files: ['file1.js'], dependencies: ['dep1'] },
          knowledge: { currentFeatures: ['feat1'], techStack: ['tech1'] },
          userGoals: userGoals,
        },
        userGoals
      );
      expect(parseRoadmapContent).toHaveBeenCalledTimes(1);
      expect(parseRoadmapContent).toHaveBeenCalledWith('LLM generated roadmap content.');
      expect(roadmap).toEqual({ parsedData: 'Structured roadmap data' });
    });

    // Edge case: empty user goals
    test('should throw an error if user goals are empty', async () => {
      await expect(generateRoadmap('')).rejects.toThrow('User goals cannot be empty.');
      expect(performCodebaseAnalysis).not.toHaveBeenCalled();
    });

    // Error handling: codebase analysis fails
    test('should throw an error if codebase analysis fails', async () => {
      performCodebaseAnalysis.mockImplementation(() => {
        throw new Error('Codebase analysis failed');
      });

      await expect(generateRoadmap('Some goals')).rejects.toThrow('Failed to generate roadmap: Codebase analysis failed');
      expect(performCodebaseAnalysis).toHaveBeenCalledTimes(1);
      expect(getProjectKnowledge).not.toHaveBeenCalled();
    });

    // Error handling: LLM analysis fails
    test('should throw an error if LLM analysis fails', async () => {
      analyzeCodebaseForRoadmap.mockRejectedValue(new Error('LLM service unavailable'));

      await expect(generateRoadmap('Some goals')).rejects.toThrow('Failed to generate roadmap: LLM service unavailable');
      expect(performCodebaseAnalysis).toHaveBeenCalledTimes(1);
      expect(getProjectKnowledge).toHaveBeenCalledTimes(1);
      expect(analyzeCodebaseForRoadmap).toHaveBeenCalledTimes(1);
      expect(parseRoadmapContent).not.toHaveBeenCalled();
    });
  });

  describe('updateRoadmap', () => {
    const mockRoadmap = { parsedData: 'Initial roadmap data' };

    // Happy path test case
    test('should update a roadmap successfully with valid instructions', async () => {
      const updateInstructions = 'Add more details to user authentication epic.';
      const updatedRoadmap = await updateRoadmap(mockRoadmap, updateInstructions);

      expect(updatedRoadmap.updated).toBe(true);
      expect(updatedRoadmap.updateInstructions).toBe(updateInstructions);
      expect(updatedRoadmap.parsedData).toContain(mockRoadmap.parsedData);
      expect(updatedRoadmap.parsedData).toContain(`Updated with: ${updateInstructions}`);
    });

    // Edge case: empty update instructions
    test('should throw an error if update instructions are empty', async () => {
      await expect(updateRoadmap(mockRoadmap, '')).rejects.toThrow('Update instructions cannot be empty.');
    });

    // Edge case: invalid existing roadmap
    test('should throw an error if existing roadmap is null or invalid', async () => {
      await expect(updateRoadmap(null, 'Some instructions')).rejects.toThrow('Existing roadmap must be a valid object.');
      await expect(updateRoadmap('not an object', 'Some instructions')).rejects.toThrow('Existing roadmap must be a valid object.');
    });
  });
});