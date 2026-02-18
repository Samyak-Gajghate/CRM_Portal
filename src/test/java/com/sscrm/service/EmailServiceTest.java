package com.sscrm.service;

import com.sscrm.entity.*;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    private Ticket testTicket;
    private Customer testCustomer;
    private User testAgent;

    @BeforeEach
    void setUp() {
        // Set properties using reflection
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@crm-system.com");
        ReflectionTestUtils.setField(emailService, "emailEnabled", true);

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("Test Customer");
        testCustomer.setEmail("customer@example.com");

        testTicket = new Ticket();
        testTicket.setId(1L);
        testTicket.setTitle("Test Ticket");
        testTicket.setDescription("Test Description");
        testTicket.setPriority(TicketPriority.MEDIUM);
        testTicket.setCustomer(testCustomer);
        testTicket.setDueTime(LocalDateTime.now().plusHours(24));
        testTicket.setCreatedAt(LocalDateTime.now());

        testAgent = new User();
        testAgent.setId(1L);
        testAgent.setUsername("agent1");
        testAgent.setEmail("agent@example.com");
    }

    @Test
    void testSendTicketCreatedEmail() {
        // Arrange
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Email content</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // Act
        emailService.sendTicketCreatedEmail(testTicket);

        // Wait for async execution
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(templateEngine, timeout(1000).times(1)).process(eq("email/ticket-created"), any(Context.class));
    }

    @Test
    void testSendTicketUpdatedEmail() {
        // Arrange
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Email content</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // Act
        emailService.sendTicketUpdatedEmail(testTicket, "Status changed");

        // Wait for async execution
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(templateEngine, timeout(1000).times(1)).process(eq("email/ticket-updated"), any(Context.class));
    }

    @Test
    void testSendTicketAssignedEmail() {
        // Arrange
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Email content</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(any(MimeMessage.class));

        // Act
        emailService.sendTicketAssignedEmail(testTicket, testAgent);

        // Wait for async execution
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(templateEngine, timeout(1000).times(1)).process(eq("email/ticket-assigned"), any(Context.class));
    }

    @Test
    void testEmailDisabled_NoEmailSent() {
        // Arrange
        ReflectionTestUtils.setField(emailService, "emailEnabled", false);

        // Act
        emailService.sendTicketCreatedEmail(testTicket);

        // Wait for async execution
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
