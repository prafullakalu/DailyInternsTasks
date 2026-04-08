class Utils {
  static escapeHtml(str) {
    try {
      return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    } catch (error) {
      console.error('Error escaping string:', error, str);
      return '';
    }
  }

  static parseExperienceYears(exp) {
    try {
      if (!exp) return 0;
      const match = exp.match(/(\d+)\s*year/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      console.error('Error parsing experience years:', error, exp);
      return 0;
    }
  }

  static formatPhoneNumber(phone) {
    try {
      if (!phone) return '—';
      // Basic phone number formatting
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return phone;
    } catch (error) {
      console.error('Error formatting phone number:', error, phone);
      return phone || '—';
    }
  }

  static createClickableLink(text, href, isEmail = false) {
    try {
      if (!text) return '—';
      const protocol = isEmail ? 'mailto:' : 'tel:';
      return `<a href="${protocol}${text}" class="clickable-link" title="Click to ${isEmail ? 'email' : 'call'}">${text}</a>`;
    } catch (error) {
      console.error('Error creating clickable link:', error, { text, href, isEmail });
      return text || '—';
    }
  }
}