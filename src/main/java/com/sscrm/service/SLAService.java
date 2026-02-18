package com.sscrm.service;

import com.sscrm.entity.Ticket;
import com.sscrm.entity.TicketStatus;
import com.sscrm.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SLAService {

    private final TicketRepository ticketRepository;
    private final EmailService emailService;

    // Track tickets that have already received warning emails
    private final Set<Long> warningEmailsSent = new HashSet<>();
    private final Set<Long> breachEmailsSent = new HashSet<>();

    @Scheduled(fixedRate = 60000) // Run every 1 minute
    @Transactional
    public void checkSLABreaches() {
        log.info("Running SLA breach check...");

        LocalDateTime now = LocalDateTime.now();

        // Check for tickets approaching breach (< 25% time remaining)
        LocalDateTime warningThreshold = now.plusMinutes(30); // 30 minutes warning
        List<Ticket> approachingTickets = ticketRepository.findTicketsApproachingBreach(now, warningThreshold);

        for (Ticket ticket : approachingTickets) {
            if (!warningEmailsSent.contains(ticket.getId())) {
                Duration timeRemaining = Duration.between(now, ticket.getDueTime());
                Duration totalTime = Duration.between(ticket.getCreatedAt(), ticket.getDueTime());

                // Send warning if less than 25% time remaining
                if (timeRemaining.toMinutes() < totalTime.toMinutes() * 0.25) {
                    log.warn("SLA WARNING: Ticket {} has less than 25% time remaining", ticket.getId());
                    emailService.sendSLABreachWarningEmail(ticket);
                    warningEmailsSent.add(ticket.getId());
                }
            }
        }

        // Check for breached tickets
        List<Ticket> breachedTickets = ticketRepository.findBreachedTickets(now);

        for (Ticket ticket : breachedTickets) {
            if (ticket.getStatus() != TicketStatus.ESCALATED) {
                log.warn("SLA BREACH: Ticket {} breached SLA. Escalating...", ticket.getId());
                ticket.setStatus(TicketStatus.ESCALATED);
                ticketRepository.save(ticket);

                // Send breach email if not already sent
                if (!breachEmailsSent.contains(ticket.getId())) {
                    emailService.sendSLABreachEmail(ticket);
                    breachEmailsSent.add(ticket.getId());
                }
            }
        }

        log.info("SLA breach check completed. {} tickets escalated, {} warnings sent.",
                breachedTickets.size(), warningEmailsSent.size());
    }
}
