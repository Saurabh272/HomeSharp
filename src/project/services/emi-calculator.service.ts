import { Injectable } from '@nestjs/common';
import { EmiCalculatorDto } from '../dto/emi-calculator.dto';

@Injectable()
export class EmiCalculatorService {
  async emiCalculator(emiRequest: EmiCalculatorDto) {
    const { principal, interestRate, tenure } = emiRequest;

    let totalAmountPayable;
    let emi;
    let interestAmount = 0;

    if (interestRate === 0) {
      const numberOfMonths = tenure * 12;

      emi = principal / numberOfMonths;
      totalAmountPayable = emi * numberOfMonths;
    } else {
      const monthlyInterestRate = interestRate / 12 / 100;
      const numberOfMonths = tenure * 12;

      const emiMultiplier = (1 + monthlyInterestRate) ** numberOfMonths;
      const emiDenominator = emiMultiplier - 1;

      emi = (principal * monthlyInterestRate * emiMultiplier) / emiDenominator;
      totalAmountPayable = emi * numberOfMonths;
      interestAmount = totalAmountPayable - principal;
    }

    return {
      principalAmount: +principal,
      interestAmount: +interestAmount.toFixed(2),
      totalAmountPayable: +totalAmountPayable.toFixed(2),
      emi: +emi.toFixed(2)
    };
  }
}
