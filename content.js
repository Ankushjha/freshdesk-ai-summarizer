console.log("🔥 Freshdesk AI Extension Loaded");

// Only create panel if it doesn't already exist
if (!document.querySelector(".ai-panel")) {
  createPanel(async () => {
    try {
      showLoading();
      
      console.log("📄 Extracting ticket data...");
      const ticketText = extractTicket();
      
      if (!ticketText || ticketText.trim().length < 10) {
        throw new Error("Could not extract ticket content. Please make sure you're on a Freshdesk ticket page.");
      }
      
      console.log(`✅ Extracted ${ticketText.length} characters`);
      
      const result = await summarizeTicket(ticketText);
      
      console.log("✅ Summary generated successfully");
      renderSummary(result);
      
    } catch (err) {
      console.error("❌ Extension Error:", err);
      showError(err.message || "Failed to summarize ticket. Please try again.");
    }
  });
}
