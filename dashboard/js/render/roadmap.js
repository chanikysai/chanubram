// dashboard/js/render/roadmap.js
// This file is responsible for rendering the generated roadmap on the dashboard.

/**
 * Renders the project roadmap into a specified DOM element.
 * The roadmap content is expected to be in markdown format.
 * @param {object} roadmapData - The structured roadmap data, assumed to have a `parsedData` field containing markdown.
 * @param {HTMLElement|string} containerElement - The DOM element or its ID where the roadmap should be rendered.
 */
export function renderRoadmap(roadmapData, containerElement) {
  if (!roadmapData || !roadmapData.parsedData) {
    console.warn("No roadmap data or parsedData found to render.");
    return;
  }

  let container;
  if (typeof containerElement === 'string') {
    container = document.getElementById(containerElement);
  } else if (containerElement instanceof HTMLElement) {
    container = containerElement;
  }

  if (!container) {
    console.error("Roadmap container element not found:", containerElement);
    return;
  }

  console.log("Rendering Roadmap on dashboard...");

  // For simplicity, we'll just put the markdown content into a pre-formatted block.
  // In a real application, a markdown parser/renderer library would be used (e.g., marked.js).
  container.innerHTML = `
    <div class="roadmap-output">
      <h3>Generated Project Roadmap</h3>
      <pre>${roadmapData.parsedData}</pre>
    </div>
  `;

  console.log("--- End of Roadmap Render ---");
}