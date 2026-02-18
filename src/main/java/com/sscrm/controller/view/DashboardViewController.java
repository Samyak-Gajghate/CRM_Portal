package com.sscrm.controller.view;

import com.sscrm.entity.TicketStatus;
import com.sscrm.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardViewController {
    
    private final TicketRepository ticketRepository;
    
    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Dashboard");
        model.addAttribute("totalTickets", ticketRepository.count());
        model.addAttribute("openTickets", ticketRepository.countByStatus(TicketStatus.OPEN));
        model.addAttribute("inProgressTickets", ticketRepository.countByStatus(TicketStatus.IN_PROGRESS));
        model.addAttribute("escalatedTickets", ticketRepository.countByStatus(TicketStatus.ESCALATED));
        model.addAttribute("resolvedTickets", ticketRepository.countByStatus(TicketStatus.RESOLVED));
        
        Double avgResolutionTime = ticketRepository.getAverageResolutionTime();
        model.addAttribute("avgResolutionTime", avgResolutionTime != null ? avgResolutionTime : 0.0);
        
        return "dashboard";
    }
}
