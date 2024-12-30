import * as nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailOtpEvent } from '../events/email-otp.event';
import config from '../../app/config';

@Injectable()
export class EmailOtpListener {
  private readonly logger = new Logger(EmailOtpListener.name);

  @OnEvent('email.otp')
  async handle(event: EmailOtpEvent) {
    const transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_SECURE,
      auth: {
        user: config.EMAIL_USERNAME,
        pass: config.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM_ADDRESS}>`,
      to: event?.email,
      subject: 'One Time Password',
      text: `Your OTP is ${event?.otp}`
    };

    await transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        this.logger.error(error);
      } else {
        this.logger.log(`Email Sent: ${info}`);
      }
    });
  }
}
