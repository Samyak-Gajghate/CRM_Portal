package com.sscrm.controller;

import com.sscrm.dto.ApiResponse;
import com.sscrm.dto.TicketRequest;
import com.sscrm.entity.Ticket;
import com.sscrm.entity.Comment;
import com.sscrm.entity.TicketHistory;
import com.sscrm.entity.TicketStatus;
import com.sscrm.entity.User;
import com.sscrm.entity.UserRole;
import com.sscrm.service.TicketService;
import com.sscrm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.sscrm.repository.CustomerRepository;
import com.sscrm.entity.Customer;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;
    private final CustomerRepository customerRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Ticket>> createTicket(@RequestBody TicketRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            // If customer, find their customer profile
            if (user.getRole() == UserRole.CUSTOMER) {
                Customer customer = customerRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Customer profile not found"));
                request.setCustomerId(customer.getId());
            }

            Ticket ticket = ticketService.createTicket(request);
            return ResponseEntity.ok(ApiResponse.success("Ticket created successfully", ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Ticket>> getTicket(@PathVariable Long id) {
        try {
            Ticket ticket = ticketService.getTicketById(id);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            // Security check: Customers can only view their own tickets
            if (user.getRole() == UserRole.CUSTOMER) {
                Long ticketUserId = ticket.getCustomer().getUserId();
                if (ticketUserId == null || !ticketUserId.equals(user.getId())) {
                    return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
                }
            }

            return ResponseEntity.ok(ApiResponse.success("Ticket retrieved", ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAllTickets(@RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            List<Ticket> tickets;

            if (user.getRole() == UserRole.CUSTOMER) {
                // Find potential customer profile
                Customer customer = customerRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Customer profile not found"));

                tickets = ticketService.getTicketsByCustomer(customer.getId());
                if (status != null) {
                    tickets = tickets.stream()
                            .filter(t -> t.getStatus().name().equals(status))
                            .toList();
                }
            } else {
                // Admin/Agent logic
                if (status != null) {
                    tickets = ticketService.getTicketsByStatus(TicketStatus.valueOf(status));
                } else {
                    tickets = ticketService.getAllTickets();
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Tickets retrieved", tickets));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Ticket>> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) Long userId) { // userId optional as we derive from auth
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            // Customers can only close their own tickets (optional rule)
            if (user.getRole() == UserRole.CUSTOMER) {
                // Check ownership
                Ticket ticket = ticketService.getTicketById(id);
                if (!ticket.getCustomer().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
                }
                // Customers might only be allowed to set to CLOSED or RESOLVED?
                // For now allowing update if it passes service validation
            }

            Ticket ticket = ticketService.updateStatus(id, status, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Status updated", ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<Ticket>> assignAgent(
            @PathVariable Long id,
            @RequestParam Long agentId) {
        try {
            Ticket ticket = ticketService.assignAgent(id, agentId);
            return ResponseEntity.ok(ApiResponse.success("Agent assigned", ticket));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TicketHistory>>> getTicketHistory(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            if (user.getRole() == UserRole.CUSTOMER) {
                Ticket ticket = ticketService.getTicketById(id);
                if (!ticket.getCustomer().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
                }
            }

            List<TicketHistory> history = ticketService.getTicketHistory(id);
            return ResponseEntity.ok(ApiResponse.success("History retrieved", history));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByAgent(@PathVariable Long agentId) {
        List<Ticket> tickets = ticketService.getTicketsByAgent(agentId);
        return ResponseEntity.ok(ApiResponse.success("Agent tickets retrieved", tickets));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCustomerStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getUserByUsername(auth.getName());

        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        List<Ticket> tickets = ticketService.getTicketsByCustomer(customer.getId());

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) tickets.size());
        stats.put("open", tickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count());
        stats.put("escalated", tickets.stream().filter(t -> t.getStatus() == TicketStatus.ESCALATED).count()); // Assuming
                                                                                                               // ESCALATED
                                                                                                               // exists
                                                                                                               // or
                                                                                                               // using
                                                                                                               // logic
        stats.put("resolved", tickets.stream()
                .filter(t -> t.getStatus() == TicketStatus.RESOLVED || t.getStatus() == TicketStatus.CLOSED).count());

        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Comment content cannot be empty");
            }

            // Security check for customers
            if (user.getRole() == UserRole.CUSTOMER) {
                Ticket ticket = ticketService.getTicketById(id);
                Long ticketUserId = ticket.getCustomer().getUserId();
                if (ticketUserId == null || !ticketUserId.equals(user.getId())) {
                    return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
                }
            }

            Comment comment = ticketService.addComment(id, content, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Comment added", comment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<Comment>>> getTicketComments(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userService.getUserByUsername(auth.getName());

            if (user.getRole() == UserRole.CUSTOMER) {
                Ticket ticket = ticketService.getTicketById(id);
                Long ticketUserId = ticket.getCustomer().getUserId();
                if (ticketUserId == null || !ticketUserId.equals(user.getId())) {
                    return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
                }
            }

            List<Comment> comments = ticketService.getTicketComments(id);
            return ResponseEntity.ok(ApiResponse.success("Comments retrieved", comments));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
