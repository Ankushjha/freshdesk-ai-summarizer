function extractTicket() {
  console.log("🔍 Attempting to extract ticket content...");

  // Extract description
  const description =
    document.querySelector('[data-test-id="ticket-description"]')
      ?.innerText || "";

  console.log(`📝 Description length: ${description.length}`);

  // Extract conversations with AGENT / CUSTOMER labels
  const conversationEls = Array.from(
    document.querySelectorAll('[data-test-id="conversation-content"]')
  );

  const labeledConversations = conversationEls.map((el, i) => {
    const role = detectSenderRole(el);
    const text = el.innerText?.trim() || "";
    return `[${role} - Message ${i + 1}]:\n${text}`;
  }).join("\n\n");

  console.log(`💬 Conversations found: ${conversationEls.length}`);

  let fullText = "";
  if (description) fullText += `=== TICKET DESCRIPTION ===\n${description}\n\n`;
  if (labeledConversations) fullText += `=== CONVERSATION HISTORY ===\n${labeledConversations}`;

  const cleaned = cleanText(fullText);
  console.log(`✅ Total extracted text length: ${cleaned.length}`);

  return cleaned;
}

function detectSenderRole(el) {
  // Walk up DOM up to 8 levels looking for role indicators
  let node = el;
  for (let i = 0; i < 8; i++) {
    if (!node) break;
    const classes = (node.className || "").toLowerCase();
    const dataAttrs = [...(node.attributes || [])]
      .map(a => `${a.name}=${a.value}`.toLowerCase()).join(" ");

    if (
      classes.includes("agent") || classes.includes("staff") ||
      classes.includes("reply-from-agent") || classes.includes("private-note") ||
      classes.includes("note") || dataAttrs.includes("agent")
    ) return "AGENT";

    if (
      classes.includes("customer") || classes.includes("requester") ||
      classes.includes("client") || dataAttrs.includes("requester")
    ) return "CUSTOMER";

    node = node.parentElement;
  }

  // Heuristic fallback: agent messages typically contain these phrases
  const text = (el.innerText || "").toLowerCase();
  const agentPhrases = [
    "best regards", "warm regards", "kind regards", "thanks and regards",
    "sincerely", "support team", "merchant care", "customer success",
    "technical support", "helpdesk", "we have reviewed", "we have identified",
    "please let us know", "kindly ", "we are unable", "we will escalate",
    "we have escalated", "our team will", "please find", "as discussed",
    "i have checked", "i have verified", "we have checked", "we have verified",
    "could you please", "would you please", "please share", "please provide",
    "we need", "we require"
  ];
  for (const phrase of agentPhrases) {
    if (text.includes(phrase)) return "AGENT";
  }

  return "CUSTOMER";
}