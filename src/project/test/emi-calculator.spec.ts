import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { EmiCalculatorController } from '../controllers/emi-calculator.controller';
import { EmiCalculatorService } from '../services/emi-calculator.service';
import { EmiCalculatorDto } from '../dto/emi-calculator.dto';
import { mockDb } from '../../app/tests/mock-providers';
import { Db } from '../../app/utils/db.util';

describe('EMI calculator', () => {
  let controller: EmiCalculatorController;
  let service: EmiCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test
      .createTestingModule({
        controllers: [EmiCalculatorController],
        providers: [
          EmiCalculatorService,
          mockDb
        ]
      })
      .overrideProvider(Db)
      .useValue(mockDb.useValue)
      .compile();

    controller = module.get<EmiCalculatorController>(EmiCalculatorController);
    service = module.get<EmiCalculatorService>(EmiCalculatorService);
  });

  it('should calculate EMI with valid inputs', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 10,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 72091.27,
      totalAmountPayable: 172091.27,
      emi: 1195.08
    });
  });

  it('should handle zero principal amount', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 0,
      interestRate: 10,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 0,
      interestAmount: 0.00,
      totalAmountPayable: 0.00,
      emi: 0.00
    });
  });

  it('should handle zero interest rate', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 0,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 0,
      totalAmountPayable: 100000,
      emi: 694.44
    });
  });

  it('should handle negative principal amount', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: -100000,
      interestRate: 10,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: -100000,
      interestAmount: -72091.27,
      totalAmountPayable: -172091.27,
      emi: -1195.08
    });
  });

  it('should handle negative interest rate', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: -10,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: -48648.87,
      totalAmountPayable: 51351.13,
      emi: 356.61
    });
  });

  it('should handle negative tenure', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 10,
      tenure: -12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: -47908.73,
      totalAmountPayable: 52091.27,
      emi: -361.74
    });
  });

  it('should handle decimal principal amount', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000.5,
      interestRate: 10,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000.5,
      interestAmount: 72091.63,
      totalAmountPayable: 172092.13,
      emi: 1195.08
    });
  });

  it('should handle decimal interest rate', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 10.5,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 76276.26,
      totalAmountPayable: 176276.26,
      emi: 1224.14
    });
  });

  it('should handle decimal tenure', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 10,
      tenure: 12.5
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 75559.98,
      totalAmountPayable: 175559.98,
      emi: 1170.4
    });
  });

  it('should handle large principal amount', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 1000000000,
      interestRate: 10,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 1000000000,
      interestAmount: 720912698.47,
      totalAmountPayable: 1720912698.47,
      emi: 11950782.63
    });
  });

  it('should handle large interest rate', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 100,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 1100011.84,
      totalAmountPayable: 1200011.84,
      emi: 8333.42
    });
  });

  it('should handle large tenure', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 10,
      tenure: 120
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 1100007.75,
      totalAmountPayable: 1200007.75,
      emi: 833.34
    });
  });

  it('should return zero if principle amount is 0', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 0,
      interestRate: 100,
      tenure: 12
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 0,
      interestAmount: 0,
      totalAmountPayable: 0,
      emi: 0
    });
  });

  it('should handle non-integer values', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 1234.56,
      interestRate: 7.89,
      tenure: 10.11
    };

    const result = await service.emiCalculator(emiRequest);

    expect(result).toEqual({
      principalAmount: 1234.56,
      interestAmount: 561.02,
      totalAmountPayable: 1795.58,
      emi: 14.8
    });
  });

  it('should pass validation with valid input', async () => {
    const validInput: EmiCalculatorDto = {
      principal: 200000,
      interestRate: 10,
      tenure: 15
    };

    const errors = await validate(validInput);

    expect(errors.length).toBe(0);
  });

  it('should calculate EMI successfully', async () => {
    const emiRequest: EmiCalculatorDto = {
      principal: 100000,
      interestRate: 10,
      tenure: 12
    };

    const result = await controller.emiCalculator(emiRequest);

    expect(result).toEqual({
      emi: 1195.08,
      interestAmount: 72091.27,
      principalAmount: 100000,
      totalAmountPayable: 172091.27
    });
    expect(result).toEqual({
      principalAmount: 100000,
      interestAmount: 72091.27,
      totalAmountPayable: 172091.27,
      emi: 1195.08
    });
  });
});
