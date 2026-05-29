// agent.js
// Run this with: node agent.js

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5175";
const ENDPOINT = `${API_BASE_URL}/api/admin/projects`;

// Your indefinite access token
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzgwMDIyNTg0fQ.1FOb73wttpFCdo4BpgIyzTxYBC7bgoCYcCtn_9jdZxY";

const newProject = {
    title: "AI Agent Project",
    description: "This project was uploaded via the AI agent script.",
    tags: ["Agent", "Node.js", "Automation"],
    liveUrl: "https://parjadm.ca",
    githubUrl: "https://github.com/ParjadM",
    image: "",
    featured: true,
    order: Date.now()
};

async function uploadProject() {
    try {
        console.log(`Uploading project to ${ENDPOINT}...`);
        const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
            body: JSON.stringify(newProject)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Failed to upload:", data.error || response.statusText);
        } else {
            console.log("✅ Success! Project uploaded. ID:", data.id);
        }
    } catch (error) {
        console.error("❌ Network or Execution Error:", error.message);
    }
}

uploadProject();
