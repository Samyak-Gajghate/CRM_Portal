package com.sscrm.controller.view;

import com.sscrm.entity.Ticket;
import com.sscrm.entity.TicketHistory;
import com.sscrm.entity.TicketPriority;
import com.sscrm.entity.TicketStatus;
import com.sscrm.dto.TicketRequest;
import com.sscrm.service.CustomerService;
import com.sscrm.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketViewController {

    private final TicketService ticketService;
    private final CustomerService customerService;

    @GetMapping
    public String listTickets(@RequestParam(required = false) String status, Model model) {
        List<Ticket> tickets;
        if (status != null && !status.isEmpty()) {
            tickets = ticketService.getTicketsByStatus(TicketStatus.valueOf(status));
        } else {
            tickets = ticketService.getAllTickets();
        }

        model.addAttribute("pageTitle", "Tickets");
        model.addAttribute("tickets", tickets);
        model.addAttribute("statuses", TicketStatus.values());
        return "tickets/list";
    }

    @GetMapping("/{id}")
    public String viewTicket(@PathVariable Long id, Model model) {
        Ticket ticket = ticketService.getTicketById(id);
        List<TicketHistory> history = ticketService.getTicketHistory(id);

        model.addAttribute("pageTitle", "Ticket #" + id);
        model.addAttribute("ticket", ticket);
        model.addAttribute("history", history);
        model.addAttribute("statuses", TicketStatus.values());
        return "tickets/detail";
    }

    @GetMapping("/create")
    public String createTicketForm(Model model) {
        model.addAttribute("pageTitle", "Create Ticket");
        model.addAttribute("customers", customerService.getAllCustomers());
        model.addAttribute("priorities", TicketPriority.values());
        return "tickets/create";
    }

    @PostMapping("/create")
    public String createTicket(@RequestParam String title,
            @RequestParam String description,
            @RequestParam Long customerId,
            @RequestParam TicketPriority priority,
            RedirectAttributes redirectAttributes) {
        try {
            TicketRequest request = new TicketRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setCustomerId(customerId);
            request.setPriority(priority);

            Ticket ticket = ticketService.createTicket(request);
            redirectAttributes.addFlashAttribute("successMessage",
                    "Ticket #" + ticket.getId() + " created successfully");
            return "redirect:/tickets/" + ticket.getId();
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Failed to create ticket: " + e.getMessage());
            return "redirect:/tickets/create";
        }
    }

    @PostMapping("/{id}/status")
    public String updateStatus(@PathVariable Long id,
            @RequestParam TicketStatus status,
            @RequestParam Long userId,
            RedirectAttributes redirectAttributes) {
        try {
            ticketService.updateStatus(id, status, userId);
            redirectAttributes.addFlashAttribute("successMessage", "Ticket status updated successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/tickets/" + id;
    }
}
