import { Injectable } from '@nestjs/common';

/**
 * Converts all nested and flat arrays and objects from snake_case to camelCase
 */
@Injectable()
export class Transformer {
  toCamelCase(key: string) {
    return key.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('_', ''));
  }

  isObject(key: any) {
    return key && typeof key === 'object' && key.constructor === Object;
  }

  process(data: any) {
    if (Array.isArray(data)) {
      return data.map((item) => this.process(item));
    }

    if (this.isObject(data)) {
      if (Object.keys(data).length === 0) {
        return data;
      }

      const result = {};
      Object.keys(data).forEach((key) => {
        const newKey = this.toCamelCase(key);
        result[newKey] = this.process(data[key]);
      });

      return result;
    }

    return data;
  }

  toSnakeCase(key: string): string {
    return key?.replace(/\s+/g, '_')?.toLowerCase();
  }

  formatDateTime(dateTimeString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };

    return new Date(dateTimeString).toLocaleString('en-US', options);
  }

  convertStringToTitleCase(string: string) {
    return string?.split(/(?:_|\s)+/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
}
