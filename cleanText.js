function cleanText(text) {
  return text
    .replace(/\s+/g, " ")  // Replace multiple whitespace with single space
    .replace(/Confidentiality Note[\s\S]*/gi, "")  // Remove confidentiality notices
    .trim()
    .slice(0, 12000);  // Limit to 12k characters
}
