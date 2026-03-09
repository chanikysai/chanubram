// dashboard/js/render/roadmap.test.js
import { renderRoadmap } from './roadmap.js';

describe('renderRoadmap', () => {
  let container;

  beforeEach(() => {
    // Clear the document body and create a fresh container for each test
    document.body.innerHTML = '<div id="roadmap-container"></div>';
    container = document.getElementById('roadmap-container');
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Happy path test case - rendering with ID
  test('should render roadmap content into the container when provided with a valid ID', () => {
    const roadmapData = { parsedData: '# Project Roadmap
- Epic 1
  - Task A' };
    renderRoadmap(roadmapData, 'roadmap-container');

    expect(container.innerHTML).toContain('<h3>Generated Project Roadmap</h3>');
    expect(container.innerHTML).toContain('<pre># Project Roadmap
- Epic 1
  - Task A</pre>');
    expect(console.log).toHaveBeenCalledWith("Rendering Roadmap on dashboard...");
  });

  // Happy path test case - rendering with HTMLElement
  test('should render roadmap content into the container when provided with a valid HTMLElement', () => {
    const roadmapData = { parsedData: '## Another Roadmap
* Feature X' };
    renderRoadmap(roadmapData, container);

    expect(container.innerHTML).toContain('<h3>Generated Project Roadmap</h3>');
    expect(container.innerHTML).toContain('<pre>## Another Roadmap
* Feature X</pre>');
    expect(console.log).toHaveBeenCalledWith("Rendering Roadmap on dashboard...");
  });

  // Edge case: no roadmap data
  test('should log a warning and not render if roadmapData is null or undefined', () => {
    renderRoadmap(null, 'roadmap-container');
    expect(container.innerHTML).toBe('');
    expect(console.warn).toHaveBeenCalledWith("No roadmap data or parsedData found to render.");

    renderRoadmap(undefined, 'roadmap-container');
    expect(container.innerHTML).toBe('');
    expect(console.warn).toHaveBeenCalledWith("No roadmap data or parsedData found to render.");
  });

  // Edge case: roadmapData with no parsedData
  test('should log a warning and not render if roadmapData has no parsedData property', () => {
    const roadmapData = { someOtherProperty: 'value' };
    renderRoadmap(roadmapData, 'roadmap-container');
    expect(container.innerHTML).toBe('');
    expect(console.warn).toHaveBeenCalledWith("No roadmap data or parsedData found to render.");
  });

  // Error handling: non-existent container ID
  test('should log an error if the container element is not found by ID', () => {
    const roadmapData = { parsedData: 'Some content' };
    renderRoadmap(roadmapData, 'non-existent-container');
    expect(document.getElementById('non-existent-container')).toBeNull(); // Ensure it doesn't exist
    expect(console.error).toHaveBeenCalledWith("Roadmap container element not found:", "non-existent-container");
    // Ensure no content is added to the body if the container doesn't exist
    expect(document.body.innerHTML).toBe('<div id="roadmap-container"></div>');
  });

  // Error handling: invalid containerElement type
  test('should log an error if the containerElement is of an invalid type', () => {
    const roadmapData = { parsedData: 'Some content' };
    renderRoadmap(roadmapData, 123); // Number is not a valid type
    expect(console.error).toHaveBeenCalledWith("Roadmap container element not found:", 123);
    expect(container.innerHTML).toBe('');
  });
});