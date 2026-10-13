package com.nexfi.nexfi.reminder;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class ReminderSmsService {

    @Value("${nexfi.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    public void sendPaymentReminder(Reminder reminder) {

        if (!smsEnabled) {
            throw new IllegalStateException(
                    "SMS is disabled. Configure Twilio first."
            );
        }

        if (accountSid.isBlank()
                || authToken.isBlank()
                || fromNumber.isBlank()) {
            throw new IllegalStateException(
                    "Twilio credentials are missing."
            );
        }

        String amount = String.format(
                Locale.US, "%,.2f", reminder.getAmount()
        );

        String messageBody =
                "NexFi Reminder: " + reminder.getTitle()
                        + " payment of LKR " + amount
                        + " is due on " + reminder.getDueDate()
                        + ". Please plan your payment. "
                        + "You received this reminder 7 days in advance.";

        Twilio.init(accountSid, authToken);

        Message.creator(
                new PhoneNumber(reminder.getPhoneNumber()),
                new PhoneNumber(fromNumber),
                messageBody
        ).create();
    }
}