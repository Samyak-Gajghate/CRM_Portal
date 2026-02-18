package com.sscrm.controller;

import com.sscrm.dto.ApiResponse;
import com.sscrm.entity.TicketStatus;
import com.sscrm.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final TicketRepository ticketRepository;
    
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("totalTickets", ticketRepository.count());
        summary.put("openTickets", ticketRepository.countByStatus(TicketStatus.OPEN));
        summary.put("inProgressTickets", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        summary.put("escalatedTickets", ticketRepository.countByStatus(TicketStatus.ESCALATED));
        summary.put("resolvedTickets", ticketRepository.countByStatus(TicketStatus.RESOLVED));
        summary.put("closedTickets", ticketRepository.countByStatus(TicketStatus.CLOSED));
        
        Double avgResolutionTime = ticketRepository.getAverageResolutionTime();
        summary.put("averageResolutionTimeHours", avgResolutionTime != null ? avgResolutionTime : 0.0);
        
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary", summary));
    }
}
