package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.entity.ContactMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Emails a notification for each new contact message when SMTP is configured (MAIL_HOST and
 * APP_CONTACT_NOTIFY_TO). Runs off the request thread and never fails the submission: the message
 * is already safe in the inbox.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ContactNotifier {

    private final ObjectProvider<JavaMailSender> mailSender;
    private final MailProperties mailProperties;
    private final AppProperties properties;

    @Async
    public void notifyNewMessage(ContactMessage message) {
        String recipient = properties.contact().notifyTo();
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || !StringUtils.hasText(mailProperties.getHost()) || !StringUtils.hasText(recipient)) {
            return;
        }
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(recipient);
        if (StringUtils.hasText(properties.contact().notifyFrom())) {
            mail.setFrom(properties.contact().notifyFrom());
        }
        mail.setReplyTo(message.getEmail());
        mail.setSubject("Portfolio contact: "
                + (StringUtils.hasText(message.getSubject()) ? message.getSubject() : "new message"));
        mail.setText("From: %s <%s>%n%n%s".formatted(message.getName(), message.getEmail(), message.getMessage()));
        try {
            sender.send(mail);
        } catch (MailException exception) {
            log.error("Could not send the contact notification for message {}", message.getId(), exception);
        }
    }
}
