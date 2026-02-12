const API_KEY = "Add You API key here"; 

// Function to list available models (for debugging/verification)
async function listAvailableModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("📋 Available Models:", data.models?.map(m => m.name) || []);
    return data.models || [];
  } catch (error) {
    console.error("❌ Error listing models:", error);
    return [];
  }
}

async function summarizeTicket(text) {
  console.log("🤖 Calling Gemini API...");

  const prompt = `
Analyze this support ticket and return ONLY valid JSON (no markdown, no backticks):

{
  "customer_issue": "",
  "root_cause": "",
  "what_we_provided": [],
  "what_customer_wants": [],
  "action_required": [],
  "priority": "Low | Medium | High",
  "sentiment": ""
}

The conversation is pre-labeled with [AGENT - Message N] and [CUSTOMER - Message N] to identify the sender:
- AGENT = our support team / company representative
- CUSTOMER = the person who submitted the ticket

CRITICAL INSTRUCTIONS:
1. customer_issue: Brief, clear description of the customer's problem

2. root_cause: The underlying cause of the issue. NEVER leave this empty or say "unknown" or "not available".
   - If explicitly stated in ticket, provide it directly
   - If not stated, analyze the symptoms and provide your best educated guess
   - Prefix assumptions with "[Likely]" or "[Assumed based on symptoms]"
   - Example: "[Likely] Database connection timeout due to high server load"

3. what_we_provided: Extract ONLY from messages labeled [AGENT - Message N].
   - Include everything the agent communicated: explanations, troubleshooting steps, solutions, workarounds, documentation shared, escalation promises, follow-up commitments, requests for more info
   - Each array item should be a specific action or piece of information the agent provided
   - If there are NO [AGENT] labeled messages at all, return: ["No response from support team yet - ticket awaiting initial reply"]
   - Do NOT include anything from [CUSTOMER] messages in this field

4. what_customer_wants: What the customer is trying to achieve or their desired outcome

5. action_required: Next steps for the support team (what needs to be done)

6. priority: Low/Medium/High based on business impact and urgency

7. sentiment: Customer's emotional tone (Positive/Neutral/Negative)

Ticket Content:
${text}
`;

  try {
    // Using gemini-2.5-flash (the recommended stable model as of Feb 2026)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    // Check for HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error (${response.status}): ${errorData.error?.message || response.statusText}\n\n` +
        `Details: ${JSON.stringify(errorData, null, 2)}`
      );
    }

    const data = await response.json();
    console.log("✅ Gemini Response:", data);

    // Extract the text from the response
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("No text content in API response");
    }

    // Clean up the response (remove markdown code blocks if present)
    const cleanedText = rawText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    console.log("📝 Cleaned Response:", cleanedText);

    // Parse JSON
    try {
      const parsed = JSON.parse(cleanedText);
      return parsed;
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("Raw text was:", cleanedText);
      throw new Error(`Failed to parse AI response as JSON. Response was: ${cleanedText.substring(0, 200)}...`);
    }

  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    
    // Re-throw with helpful error message
    if (error.message.includes("404")) {
      throw new Error(
        "Model not found. Please verify your API key has access to gemini-2.5-flash. " +
        "You can list available models in the console."
      );
    }
    
    throw error;
  }
}
