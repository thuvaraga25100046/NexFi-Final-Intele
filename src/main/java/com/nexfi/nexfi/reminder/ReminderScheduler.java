package com.nexfi.nexfi.reminder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger log =
            LoggerFactory.getLogger(ReminderScheduler.class);

    private static final ZoneId ZONE =
            ZoneId.of("Asia/Colombo");

    private final ReminderRepository repository;
    private final ReminderSmsService smsService;

    @Value("${nexfi.sms.enabled:false}")
    private boolean smsEnabled;

    public ReminderScheduler(
            ReminderRepository repository,
            ReminderSmsService smsService) {
        this.repository = repository;
        this.smsService = smsService;
    }

    @Scheduled(
            cron = "${nexfi.reminders.cron:0 0 9 * * *}",
            zone = "Asia/Colombo"
    )
    public void sendDueDateReminders() {

        if (!smsEnabled) {
            log.info("NexFi SMS reminders are disabled.");
            return;
        }

        LocalDate today = LocalDate.now(ZONE);
        LocalDate cutoff = today.plusDays(7);

        List<Reminder> pending =
                repository.findPendingReminders(today, cutoff);

        for (Reminder reminder : pending) {
            try {
                smsService.sendPaymentReminder(reminder);

                reminder.setSentAt(LocalDateTime.now(ZONE));
                repository.save(reminder);

                log.info(
                        "Reminder SMS submitted for reminder ID {}",
                        reminder.getId()
                );

            } catch (Exception exception) {
                log.error(
                        "Reminder SMS failed for reminder ID {}",
                        reminder.getId(),
                        exception
                );
            }
        }
    }
}