package com.sscrm.service;

import com.sscrm.entity.Ticket;
import com.sscrm.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${email.enabled:true}")
    private boolean emailEnabled;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Async
    public void sendTicketCreatedEmail(Ticket ticket) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping ticket created email for ticket #{}", ticket.getId());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("ticket", ticket);
            context.setVariable("customerName", ticket.getCustomer().getName());
            context.setVariable("ticketId", ticket.getId());
            context.setVariable("title", ticket.getTitle());
            context.setVariable("description", ticket.getDescription());
            context.setVariable("priority", ticket.getPriority());
            context.setVariable("dueTime", ticket.getDueTime().format(DATE_FORMATTER));

            String htmlContent = templateEngine.process("email/ticket-created", context);

            sendEmail(
                    ticket.getCustomer().getEmail(),
                    "Ticket #" + ticket.getId() + " Created - " + ticket.getTitle(),
                    htmlContent);

            log.info("Ticket created email sent successfully to {} for ticket #{}",
                    ticket.getCustomer().getEmail(), ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send ticket created email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    @Async
    public void sendTicketUpdatedEmail(Ticket ticket, String updateMessage) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping ticket updated email for ticket #{}", ticket.getId());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("ticket", ticket);
            context.setVariable("customerName", ticket.getCustomer().getName());
            context.setVariable("ticketId", ticket.getId());
            context.setVariable("title", ticket.getTitle());
            context.setVariable("status", ticket.getStatus());
            context.setVariable("updateMessage", updateMessage);
            context.setVariable("updatedAt", LocalDateTime.now().format(DATE_FORMATTER));

            String htmlContent = templateEngine.process("email/ticket-updated", context);

            sendEmail(
                    ticket.getCustomer().getEmail(),
                    "Ticket #" + ticket.getId() + " Updated - " + ticket.getTitle(),
                    htmlContent);

            log.info("Ticket updated email sent successfully to {} for ticket #{}",
                    ticket.getCustomer().getEmail(), ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send ticket updated email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    @Async
    public void sendSLABreachWarningEmail(Ticket ticket) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping SLA warning email for ticket #{}", ticket.getId());
            return;
        }

        try {
            Duration timeRemaining = Duration.between(LocalDateTime.now(), ticket.getDueTime());
            long hoursRemaining = timeRemaining.toHours();
            long minutesRemaining = timeRemaining.toMinutes() % 60;

            Context context = new Context();
            context.setVariable("ticket", ticket);
            context.setVariable("ticketId", ticket.getId());
            context.setVariable("title", ticket.getTitle());
            context.setVariable("priority", ticket.getPriority());
            context.setVariable("hoursRemaining", hoursRemaining);
            context.setVariable("minutesRemaining", minutesRemaining);
            context.setVariable("dueTime", ticket.getDueTime().format(DATE_FORMATTER));

            String htmlContent = templateEngine.process("email/sla-breach-warning", context);

            // Send to assigned agent if exists, otherwise to admin
            String recipientEmail = ticket.getAssignedAgent() != null
                    ? ticket.getAssignedAgent().getEmail()
                    : fromEmail;

            sendEmail(
                    recipientEmail,
                    "⚠️ SLA WARNING: Ticket #" + ticket.getId() + " - " + ticket.getTitle(),
                    htmlContent);

            log.info("SLA warning email sent successfully for ticket #{}", ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send SLA warning email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    @Async
    public void sendSLABreachEmail(Ticket ticket) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping SLA breach email for ticket #{}", ticket.getId());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("ticket", ticket);
            context.setVariable("ticketId", ticket.getId());
            context.setVariable("title", ticket.getTitle());
            context.setVariable("priority", ticket.getPriority());
            context.setVariable("customerName", ticket.getCustomer().getName());
            context.setVariable("dueTime", ticket.getDueTime().format(DATE_FORMATTER));
            context.setVariable("breachedAt", LocalDateTime.now().format(DATE_FORMATTER));

            String htmlContent = templateEngine.process("email/sla-breach", context);

            // Send to assigned agent if exists, otherwise to admin
            String recipientEmail = ticket.getAssignedAgent() != null
                    ? ticket.getAssignedAgent().getEmail()
                    : fromEmail;

            sendEmail(
                    recipientEmail,
                    "🚨 SLA BREACH: Ticket #" + ticket.getId() + " - " + ticket.getTitle(),
                    htmlContent);

            log.info("SLA breach email sent successfully for ticket #{}", ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send SLA breach email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    @Async
    public void sendTicketAssignedEmail(Ticket ticket, User agent) {
        if (!emailEnabled) {
            log.info("Email sending is disabled. Skipping ticket assigned email for ticket #{}", ticket.getId());
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("agentName", agent.getUsername());
            context.setVariable("ticketId", ticket.getId());
            context.setVariable("title", ticket.getTitle());
            context.setVariable("description", ticket.getDescription());
            context.setVariable("priority", ticket.getPriority());
            context.setVariable("customerName", ticket.getCustomer().getName());
            context.setVariable("dueTime", ticket.getDueTime().format(DATE_FORMATTER));

            String htmlContent = templateEngine.process("email/ticket-assigned", context);

            sendEmail(
                    agent.getEmail(),
                    "New Assignment: Ticket #" + ticket.getId() + " - " + ticket.getTitle(),
                    htmlContent);

            log.info("Ticket assigned email sent successfully to {} for ticket #{}",
                    agent.getEmail(), ticket.getId());
        } catch (Exception e) {
            log.error("Failed to send ticket assigned email for ticket #{}: {}", ticket.getId(), e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
