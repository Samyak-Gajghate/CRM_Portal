package com.sscrm.controller.view;

import com.sscrm.entity.Ticket;
import com.sscrm.entity.TicketPriority;
import com.sscrm.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/sla")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'AGENT')")
public class SLAViewController {

    private final TicketRepository ticketRepository;

    @GetMapping("/monitor")
    public String slaMonitor(@RequestParam(required = false) String priority, Model model) {
        LocalDateTime now = LocalDateTime.now();
        // Show tickets with less than 4 hours until breach
        LocalDateTime threshold = now.plusHours(4);

        List<Ticket> approachingBreachTickets = ticketRepository.findTicketsApproachingBreach(now, threshold);

        // Filter by priority if specified
        if (priority != null && !priority.isEmpty()) {
            approachingBreachTickets = approachingBreachTickets.stream()
                    .filter(t -> t.getPriority().name().equals(priority))
                    .collect(Collectors.toList());
        }

        // Calculate time remaining and urgency level for each ticket
        Map<Long, Map<String, Object>> ticketMetrics = new HashMap<>();
        for (Ticket ticket : approachingBreachTickets) {
            Map<String, Object> metrics = new HashMap<>();

            Duration timeRemaining = Duration.between(now, ticket.getDueTime());
            long hoursRemaining = timeRemaining.toHours();
            long minutesRemaining = timeRemaining.toMinutes() % 60;

            metrics.put("hoursRemaining", hoursRemaining);
            metrics.put("minutesRemaining", minutesRemaining);
            metrics.put("totalMinutesRemaining", timeRemaining.toMinutes());

            // Determine urgency level
            String urgencyLevel;
            String urgencyClass;
            if (timeRemaining.toMinutes() < 60) {
                urgencyLevel = "CRITICAL";
                urgencyClass = "danger";
            } else if (timeRemaining.toMinutes() < 120) {
                urgencyLevel = "HIGH";
                urgencyClass = "warning";
            } else {
                urgencyLevel = "MEDIUM";
                urgencyClass = "info";
            }

            metrics.put("urgencyLevel", urgencyLevel);
            metrics.put("urgencyClass", urgencyClass);

            ticketMetrics.put(ticket.getId(), metrics);
        }

        // Get breach statistics
        List<Ticket> breachedTickets = ticketRepository.findBreachedTickets(now);

        model.addAttribute("pageTitle", "SLA Monitor");
        model.addAttribute("tickets", approachingBreachTickets);
        model.addAttribute("ticketMetrics", ticketMetrics);
        model.addAttribute("breachedCount", breachedTickets.size());
        model.addAttribute("approachingCount", approachingBreachTickets.size());
        model.addAttribute("priorities", TicketPriority.values());
        model.addAttribute("selectedPriority", priority);

        return "sla/monitor";
    }
}
