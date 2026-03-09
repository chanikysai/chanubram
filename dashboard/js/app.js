// dashboard/js/app.js
// Main entry point for the dashboard's JavaScript logic.

import { renderPullRequestReview } from './render/pr-review.js';
import { renderRoadmap } from './render/roadmap.js';
import { generateRoadmap } from '../../src/tasks/roadmap-generator.js'; // Adjust path as needed

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard app.js loaded.');

    const prReviewContainer = document.getElementById('pr-review-container');

    // Render initial PR review (if container exists)
    const prReviewData = {
        summary: "Initial PR review summary.",
        inlineComments: [
            { filePath: "src/agent/pr-reviewer.js", lineNumber: 10, comment: "Consider adding JSDoc comments." }
        ]
    };
    if (prReviewContainer) {
        // pr-review.js only logs to console, so we'll just log here for now as well
        renderPullRequestReview(prReviewData);
        prReviewContainer.innerHTML = `<h3>Pull Request Review</h3><pre>${JSON.stringify(prReviewData, null, 2)}</pre>`;
    }

    const roadmapContainer = document.getElementById('roadmap-container');
    if (roadmapContainer) {
        roadmapContainer.innerHTML = `
            <div>
                <h3>AI-Powered Project Roadmap Generator</h3>
                <textarea id="user-goals-input" placeholder="Enter high-level project goals (e.g., 'Improve performance and add user authentication')." rows="6" cols="80"></textarea><br>
                <button id="generate-roadmap-btn" style="margin-top: 10px; padding: 8px 15px;">Generate Roadmap</button>
                <div id="generated-roadmap-output" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; min-height: 150px; background-color: #f9f9f9; white-space: pre-wrap; font-family: monospace;">
                    Roadmap will appear here...
                </div>
            </div>
        `;

        const generateBtn = document.getElementById('generate-roadmap-btn');
        const userGoalsInput = document.getElementById('user-goals-input');
        const generatedRoadmapOutput = document.getElementById('generated-roadmap-output');

        if (generateBtn && userGoalsInput && generatedRoadmapOutput) {
            generateBtn.addEventListener('click', async () => {
                const userGoals = userGoalsInput.value;
                if (!userGoals.trim()) {
                    alert('Please enter some project goals to generate a roadmap.');
                    return;
                }

                generatedRoadmapOutput.innerHTML = '<p>Generating roadmap, please wait...</p>';
                try {
                    const roadmap = await generateRoadmap(userGoals);
                    renderRoadmap(roadmap, 'generated-roadmap-output');
                } catch (error) {
                    console.error('Error generating roadmap:', error);
                    generatedRoadmapOutput.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                }
            });
        }
    }

});

export function initializeDashboard() {
    console.log('Dashboard initialized.');
}

