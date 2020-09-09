export function unsanitize(str) {
  if (!str) return '';
  return unescape(
    str
      .replace(/%26/g, '&')
      .replace(/%3B/g, ';')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&rsquo;/g, '’')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&Phi;/g, 'Φ')
      .replace(/&Omega;/g, 'Ω')
  );
}
