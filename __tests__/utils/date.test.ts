import {
  formatDate,
  formatRelativeDate,
  isDateToday,
  isDateOverdue,
  daysBetween,
  formatForDateInput
} from '@/lib/utils/date';

describe('Date Utils', () => {
  const testDate = new Date('2024-01-15T10:30:00Z');
  const today = new Date();

  describe('formatDate', () => {
    it('should format date with default pattern', () => {
      const result = formatDate(testDate);
      expect(result).toBe('15/01/2024');
    });

    it('should format date with custom pattern', () => {
      const result = formatDate(testDate, 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toBe('15/01/2024');
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Fecha inválida');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "Hoy" for today', () => {
      const result = formatRelativeDate(today);
      expect(result).toBe('Hoy');
    });

    it('should handle invalid dates', () => {
      const result = formatRelativeDate('invalid-date');
      expect(result).toBe('Fecha inválida');
    });
  });

  describe('isDateToday', () => {
    it('should return true for today', () => {
      const result = isDateToday(today);
      expect(result).toBe(true);
    });

    it('should return false for other dates', () => {
      const result = isDateToday(testDate);
      expect(result).toBe(false);
    });

    it('should handle invalid dates', () => {
      const result = isDateToday('invalid-date');
      expect(result).toBe(false);
    });
  });

  describe('isDateOverdue', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date('2020-01-01');
      const result = isDateOverdue(pastDate);
      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date('2030-01-01');
      const result = isDateOverdue(futureDate);
      expect(result).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-15');
      const result = daysBetween(start, end);
      expect(result).toBe(14);
    });

    it('should handle string dates', () => {
      const result = daysBetween('2024-01-01', '2024-01-15');
      expect(result).toBe(14);
    });

    it('should return 0 for invalid dates', () => {
      const result = daysBetween('invalid', 'invalid');
      expect(result).toBe(0);
    });
  });

  describe('formatForDateInput', () => {
    it('should format date for HTML input', () => {
      const result = formatForDateInput(testDate);
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid dates', () => {
      const result = formatForDateInput('invalid-date');
      expect(result).toBe('');
    });
  });
});