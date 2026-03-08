// src/agent/pr-reviewer.js
import {
  getPullRequestDiff,
  getPullRequestDetails,
  postReviewComment,
  postPullRequestComment,
  getChangedFiles
} from '../git/git-ops.js';
import {
  analyzePullRequestChanges
} from '../analysis/codebase-analyzer.js';
import {
  generateLlmText
} from '../llm/llm-text.js';

export async function reviewPullRequest(prId) {
  console.log(`Starting review for Pull Request #${prId}`);

  try {
    // 1. Get PR details and diff
    const prDetails = await getPullRequestDetails(prId);
    const diffContent = await getPullRequestDiff(prId);
    const changedFiles = await getChangedFiles(prId);

    console.log(`Received PR #${prId} details:`, prDetails.title);
    console.log(`Changed files:`, changedFiles);

    // 2. Analyze the diff using codebase-analyzer.js
    const analysisResult = analyzePullRequestChanges(diffContent, changedFiles);
    console.log("Codebase analysis result:", analysisResult.summary);

    // 3. Use llm-text.js to generate review comments and a summary
    const llmReviewSummaryPrompt = `Given the following code changes:
${diffContent}
And codebase analysis: ${analysisResult.summary}

Please provide a concise pull request review summary, highlighting potential issues and suggesting improvements.`;
    const llmReviewSummary = await generateLlmText(llmReviewSummaryPrompt);
    console.log("LLM Review Summary:", llmReviewSummary);

    // For inline comments, we would parse the diff more deeply and generate comments per line/hunk
    // For now, let's simulate a single inline comment based on the first changed file
    let inlineComments = [];
    if (changedFiles.length > 0) {
      const inlineCommentPrompt = `Given the changes in file ${changedFiles[0]}:
${diffContent}
Suggest an inline improvement for line 2 of the new code block.`;
      const inlineSuggestion = await generateLlmText(inlineCommentPrompt);
      inlineComments.push({
        filePath: changedFiles[0],
        lineNumber: 2,
        comment: `LLM suggested improvement for ${changedFiles[0]} at line 2: ${inlineSuggestion}`
      });
      console.log("LLM Inline Suggestion:", inlineComments[0]);
    }


    // 4. Post the generated comments back to the PR using git-ops.js
    await postPullRequestComment(prId, `🤖 Automated PR Review Summary:
${llmReviewSummary}`);

    for (const comment of inlineComments) {
      await postReviewComment(prId, comment.filePath, comment.lineNumber, comment.comment);
    }

    console.log(`Completed review for Pull Request #${prId}. Comments posted.`);
    return {
      success: true,
      summary: llmReviewSummary,
      inlineComments: inlineComments
    };

  } catch (error) {
    console.error(`Error reviewing PR #${prId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}
