### Phase 1: User-Centric Extensions

1.1 [NEW] [Add User Feedback After DOB Check Attempt]  
Tag: [extend]  
What: Users receive clear, granular feedback if they submit incorrect DOBs, including which date was wrong if only one matches.  
Approach: Extend route_post_L36 in secure-dob-page/app.js to differentiate error messages and provide more instructive feedback.  
How it works:
  - Extend logic in route_post_L36 to check both bramDob and chanuDob independently.
  - Return distinct error messages if one or both dates are incorrect.
  - Modify the "Incorrect Dates. Try Again." logic to give more useful feedback to the frontend.
Files: 
Impact: HIGH

1.2 [NEW] [GPS-Based Personalized Welcome Message]  
Tag: [extend]  
What: Upon a successful DOB check, users submitting valid latitude and longitude receive a location-aware greeting on the success page.  
Approach: Extend route_post_L36 to process geolocation and pass the info to the success template or as response, updating secure-dob-page/public/success.html as needed.  
How it works:
  - Enhance route_post_L36 to read latitude and longitude.
  - Compose a greeting string that includes city/country if possible (use a geo-IP or a simple placeholder for demonstration).
  - Adjust frontend logic in script.js (if used to render message) or template in success.html to display location-aware greeting.
Files: 
Impact: HIGH

### Phase 2: Multi-Surface Workflows

2.1 [NEW] [Self-Service Retry Option From Error State]  
Tag: [extend]  
What: After a failed DOB check, users can retry submission directly from the failure message without reloading the form or page.  
Approach: Extend script.js to intercept error responses and display retry option/modal inline on the homepage.  
How it works:
  - Modify on_submit_L2 in script.js to handle error JSON responses and inject a retry prompt or reset button in the DOM.
  - Ensure users remain on the homepage and are guided to correct entries without full page reload.
Files: update secure-dob-page/script.js
Impact: MEDIUM

2.2 [PARTIAL] [Enhance Cross-File Data Flow Coverage]  
Tag: [partial]  
What: Expand code such that entities/functions in script.js and app.js are leveraged in chained workflows, setting the stage for integrating additional user input types or business rules.  
Approach: Create/reuse functions in secure-dob-page/app.js and secure-dob-page/script.js to support new workflow hops (such as passing normalized/validated data bi-directionally or prepping for future extensibility).  
How it works:
  - Identify and modularize business logic for user data handling in secure-dob-page/app.js.
  - Refactor front-end event handlers in secure-dob-page/script.js to better engage with backend responses and handle additional data validation scenarios.
Files: update secure-dob-page/app.js, update secure-dob-page/script.js
Impact: MEDIUM

### Phase 3: Deeper Integration, Resilience & Coverage

3.1 [GAP] [Expand Execution Flow Integration for Onboarding and Multi-Step Journey]  
Tag: [gap]  
What: Introduce additional cross-module execution (e.g., chaining further backend validation or logging flows) to address current shallow execution coverage and support richer onboarding or multi-step user journeys.  
Approach: Add intermediary logic and backend functions in secure-dob-page/app.js to enable multi-stage workflows (e.g., onboarding check after initial success, audit logging, or bonus reveal stages).  
How it works:
  - Implement new middleware functions in secure-dob-page/app.js for onboarding/logging.
  - Ensure these functions are called after successful POST /check-dob, allowing flexible orchestration and future feature growth (in line with integration-coverage).
Files: 
Impact: HIGH

---

**All roadmap items are grounded in existing code and entity flows. New features leverage and extend only what exists, never duplicate. File paths and extension points strictly follow codebase structure and evidence from the flows and indexed files. Every new item proposes specific user-facing or developer-evident improvements, not abstractions.**