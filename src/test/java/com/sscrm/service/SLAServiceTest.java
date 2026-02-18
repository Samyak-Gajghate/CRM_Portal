package com.sscrm.service;

import com.sscrm.entity.Ticket;
import com.sscrm.entity.TicketPriority;
import com.sscrm.entity.TicketStatus;
import com.sscrm.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class SLAServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private SLAService slaService;

    private Ticket openTicket;
    private Ticket breachedTicket;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();

        openTicket = new Ticket();
        openTicket.setId(1L);
        openTicket.setTitle("Open Ticket");
        openTicket.setPriority(TicketPriority.MEDIUM);
        openTicket.setStatus(TicketStatus.OPEN);
        openTicket.setCreatedAt(now.minusHours(20));
        openTicket.setDueTime(now.plusHours(4)); // Still within SLA

        breachedTicket = new Ticket();
        breachedTicket.setId(2L);
        breachedTicket.setTitle("Breached Ticket");
        breachedTicket.setPriority(TicketPriority.HIGH);
        breachedTicket.setStatus(TicketStatus.OPEN);
        breachedTicket.setCreatedAt(now.minusHours(10));
        breachedTicket.setDueTime(now.minusHours(2)); // SLA already breached
    }

    @Test
    void testCheckSLABreaches_NoTickets_NoEmailsSent() {
        // Arrange
        when(ticketRepository.findTicketsApproachingBreach(any(), any()))
                .thenReturn(Collections.emptyList());
        when(ticketRepository.findBreachedTickets(any()))
                .thenReturn(Collections.emptyList());

        // Act
        slaService.checkSLABreaches();

        // Assert
        verify(emailService, never()).sendSLABreachEmail(any());
        verify(emailService, never()).sendSLABreachWarningEmail(any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void testCheckSLABreaches_BreachedTicket_EscalatesStatus() {
        // Arrange
        when(ticketRepository.findTicketsApproachingBreach(any(), any()))
                .thenReturn(Collections.emptyList());
        when(ticketRepository.findBreachedTickets(any()))
                .thenReturn(Arrays.asList(breachedTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(breachedTicket);
        doNothing().when(emailService).sendSLABreachEmail(any(Ticket.class));

        // Act
        slaService.checkSLABreaches();

        // Assert
        assertEquals(TicketStatus.ESCALATED, breachedTicket.getStatus());
        verify(ticketRepository, times(1)).save(breachedTicket);
    }

    @Test
    void testCheckSLABreaches_BreachedTicket_SendsBreachEmail() {
        // Arrange
        when(ticketRepository.findTicketsApproachingBreach(any(), any()))
                .thenReturn(Collections.emptyList());
        when(ticketRepository.findBreachedTickets(any()))
                .thenReturn(Arrays.asList(breachedTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(breachedTicket);
        doNothing().when(emailService).sendSLABreachEmail(any(Ticket.class));

        // Act
        slaService.checkSLABreaches();

        // Assert
        verify(emailService, times(1)).sendSLABreachEmail(breachedTicket);
    }

    @Test
    void testCheckSLABreaches_AlreadyEscalated_NoDoubleEmail() {
        // Arrange
        breachedTicket.setStatus(TicketStatus.ESCALATED);
        when(ticketRepository.findTicketsApproachingBreach(any(), any()))
                .thenReturn(Collections.emptyList());
        when(ticketRepository.findBreachedTickets(any()))
                .thenReturn(Arrays.asList(breachedTicket));

        // Act
        slaService.checkSLABreaches();

        // Assert — already ESCALATED, so no save and no email
        verify(ticketRepository, never()).save(any());
        verify(emailService, never()).sendSLABreachEmail(any());
    }

    @Test
    void testCheckSLABreaches_MultipleBreachedTickets_AllEscalated() {
        // Arrange
        Ticket secondBreached = new Ticket();
        secondBreached.setId(3L);
        secondBreached.setTitle("Second Breached");
        secondBreached.setPriority(TicketPriority.CRITICAL);
        secondBreached.setStatus(TicketStatus.OPEN);
        secondBreached.setCreatedAt(LocalDateTime.now().minusHours(5));
        secondBreached.setDueTime(LocalDateTime.now().minusHours(3));

        List<Ticket> breachedList = Arrays.asList(breachedTicket, secondBreached);

        when(ticketRepository.findTicketsApproachingBreach(any(), any()))
                .thenReturn(Collections.emptyList());
        when(ticketRepository.findBreachedTickets(any())).thenReturn(breachedList);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailService).sendSLABreachEmail(any(Ticket.class));

        // Act
        slaService.checkSLABreaches();

        // Assert
        assertEquals(TicketStatus.ESCALATED, breachedTicket.getStatus());
        assertEquals(TicketStatus.ESCALATED, secondBreached.getStatus());
        verify(ticketRepository, times(2)).save(any(Ticket.class));
        verify(emailService, times(2)).sendSLABreachEmail(any(Ticket.class));
    }
}
