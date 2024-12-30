import { Response } from 'express';
import { BadRequestException, ArgumentsHost } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { BadRequestExceptionFilter } from '../exceptions/bad-request-filter.exception';
import { Transformer } from '../utils/transformer.util';
import { TrimStringsPipe } from '../pipe/trim-strings.pipe';

describe('Common App Module', () => {
  let badRequestExceptionFilter: BadRequestExceptionFilter;
  let responseMock: jest.Mocked<Response<any, Record<string, any>>>;
  let httpArgumentsHostMock: jest.Mocked<HttpArgumentsHost>;
  let argumentsHostMock: jest.Mocked<ArgumentsHost>;
  let trimStringsPipe: TrimStringsPipe;

  beforeEach(() => {
    responseMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as jest.Mocked<Response<any, Record<string, any>>>;

    httpArgumentsHostMock = {
      getResponse: jest.fn().mockReturnValue(responseMock)
    } as unknown as jest.Mocked<HttpArgumentsHost>;

    argumentsHostMock = {
      switchToHttp: jest.fn().mockReturnValue(httpArgumentsHostMock)
    } as unknown as jest.Mocked<ArgumentsHost>;

    badRequestExceptionFilter = new BadRequestExceptionFilter();
    trimStringsPipe = new TrimStringsPipe();
  });

  describe('request exceptions', () => {
    it('should flatten the validation error message array and send the response', () => {
      const exception = new BadRequestException({
        message: ['Error 1', 'Error 2'],
        statusCode: 400
      });

      badRequestExceptionFilter.catch(exception, argumentsHostMock);

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Error 1, Error 2',
        statusCode: 400
      });
    });

    it('should send the original response if the message is not an array', () => {
      const exception = new BadRequestException({
        message: 'Single error',
        statusCode: 400
      });

      badRequestExceptionFilter.catch(exception, argumentsHostMock);

      expect(responseMock.status).toHaveBeenCalledWith(400);
      expect(responseMock.json).toHaveBeenCalledWith({
        message: 'Single error',
        statusCode: 400
      });
    });
  });

  describe('decorator pipes', () => {
    it('should trim string values in the body object', () => {
      const input = {
        username: '  user ',
        email: ' email@example.com ',
        password: '  password ',
        nested: {
          value: ' nested value '
        }
      };

      const expectedOutput = {
        username: 'user',
        email: 'email@example.com',
        password: '  password ',
        nested: {
          value: 'nested value'
        }
      };

      const result = trimStringsPipe.transform(input, { type: 'body' });

      expect(result).toEqual(expectedOutput);
    });

    it('should throw BadRequestException if values is not an object', () => {
      const input = 'not an object';
      const transformed = () => trimStringsPipe.transform(input, { type: 'body' });

      expect(transformed).toThrowError(BadRequestException);
    });

    it('should throw BadRequestException if metadata type is not "body"', () => {
      const input = { username: '  user ' };
      const transformed = () => trimStringsPipe.transform(input, { type: 'query' });

      expect(transformed).toThrowError(BadRequestException);
    });

    it('should trim string value', () => {
      const input = { key: '  value ' };
      const expectedOutput = { key: 'value' };

      const result = trimStringsPipe.trim(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should not trim password field', () => {
      const input = {
        username: '  user ',
        password: '  password '
      };

      const expectedOutput = {
        username: 'user',
        password: '  password '
      };

      const result = trimStringsPipe.trim(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should recursively trim nested objects', () => {
      const input = {
        username: '  user ',
        nested: {
          value: '  nested value '
        }
      };

      const expectedOutput = {
        username: 'user',
        nested: {
          value: 'nested value'
        }
      };

      const result = trimStringsPipe.trim(input);

      expect(result).toEqual(expectedOutput);
    });

    it('should not modify non-string values', () => {
      const input = {
        numberValue: 42,
        booleanValue: true,
        arrayValue: ['  item1 ', 'item2 ']
      };

      const expectedOutput = {
        numberValue: 42,
        booleanValue: true,
        arrayValue: ['item1', 'item2']
      };

      const result = trimStringsPipe.trim(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('transformer utils', () => {
    let transformer: Transformer;

    beforeEach(() => {
      transformer = new Transformer();
    });

    describe('toCamelCase', () => {
      it('should convert snake_case to camelCase', () => {
        const result = transformer.toCamelCase('hello_world');
        expect(result).toBe('helloWorld');
      });

      it('should convert snake_case string with multiple underscores to camelCase', () => {
        const result = transformer.toCamelCase('hello_my_world');
        expect(result).toBe('helloMyWorld');
      });

      it('should not convert snake_case string with numbers to camelCase', () => {
        const result = transformer.toCamelCase('hello_world_123');
        expect(result).toBe('helloWorld_123');
      });

      it('should not convert snake_case string with special characters to camelCase', () => {
        const result = transformer.toCamelCase('hello_$world');
        expect(result).toBe('hello_$world');
      });

      it('should not convert snake_case string with all caps to camelCase', () => {
        const result = transformer.toCamelCase('HELLO_WORLD');
        expect(result).toBe('HELLOWORLD');
      });

      it('should preserve camelCase if input has no underscores', () => {
        const result = transformer.toCamelCase('helloWorld');
        expect(result).toBe('helloWorld');
      });
    });

    describe('isObject', () => {
      it('should return true if the input is an object', () => {
        const result = transformer.isObject({ key: 'value' });
        expect(result).toBe(true);
      });

      it('should return null for null', () => {
        const result = transformer.isObject(null);
        expect(result).toBe(null);
      });

      it('should return undefined for undefined', () => {
        const result = transformer.isObject(undefined);
        expect(result).toBe(undefined);
      });

      it('should return false if the input is not an object', () => {
        const result = transformer.isObject('string');
        expect(result).toBe(false);
      });
    });

    describe('process', () => {
      it('should convert all nested and flat arrays and objects from snake_case to camelCase', () => {
        const data = {
          my_array: [
            {
              nested_key: 'value',
              another_nested_key: 'value'
            },
            {
              nested_key: 'value',
              another_nested_key: 'value'
            }
          ],
          my_object: {
            nested_key: 'value',
            another_nested_key: 'value'
          }
        };

        const expected = {
          myArray: [
            {
              nestedKey: 'value',
              anotherNestedKey: 'value'
            },
            {
              nestedKey: 'value',
              anotherNestedKey: 'value'
            }
          ],
          myObject: {
            nestedKey: 'value',
            anotherNestedKey: 'value'
          }
        };

        const result = transformer.process(data);
        expect(result).toEqual(expected);
      });

      it('should preserve an empty object', () => {
        const data = {};

        const result = transformer.process(data);
        expect(result).toEqual(data);
      });

      it('should preserve non-object values', () => {
        const data = 'string';

        const result = transformer.process(data);
        expect(result).toEqual(data);
      });
    });

    it('should convert strings to title case', () => {
      expect(transformer.convertStringToTitleCase('hello')).toBe('Hello');
      expect(transformer.convertStringToTitleCase('hello_world')).toBe('Hello World');
      expect(transformer.convertStringToTitleCase('_new_world_')).toBe('New World');
      expect(transformer.convertStringToTitleCase('MiXeD_CaSe_StRiNg')).toBe('Mixed Case String');
      expect(transformer.convertStringToTitleCase('')).toBe('');
      expect(transformer.convertStringToTitleCase(null)).toBe(undefined);
      expect(transformer.convertStringToTitleCase(undefined)).toBe(undefined);
      expect(transformer.convertStringToTitleCase('hello123_world456')).toBe('Hello123 World456');
      expect(transformer.convertStringToTitleCase('special$char!_string#')).toBe('Special$char! String#');
      expect(transformer.convertStringToTitleCase('_')).toBe('');
      expect(transformer.convertStringToTitleCase('______')).toBe('');
      expect(transformer.convertStringToTitleCase('test world')).toBe('Test World');
      expect(transformer.convertStringToTitleCase('lorem_ _ipsum')).toBe('Lorem Ipsum');
      expect(transformer.convertStringToTitleCase('_test_lorem')).toBe('Test Lorem');
      expect(transformer.convertStringToTitleCase('foo_bar_')).toBe('Foo Bar');
      expect(transformer.convertStringToTitleCase('hello_world_this is a test')).toBe('Hello World This Is A Test');
    });
  });
});
