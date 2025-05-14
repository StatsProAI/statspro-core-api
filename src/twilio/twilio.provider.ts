import { Provider } from '@nestjs/common';
import { Twilio } from 'twilio';

export const TwilioClientProvider: Provider = {
  provide: 'TWILIO_CLIENT',
  useFactory: (): Twilio => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error(
        'Twilio credentials are not set in environment variables',
      );
    }

    return new Twilio(accountSid, authToken);
  },
};
