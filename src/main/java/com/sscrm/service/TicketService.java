package com.sscrm.service;

import com.sscrm.dto.TicketRequest;
import com.sscrm.entity.*;
import com.sscrm.repository.CommentRepository;
import com.sscrm.repository.CustomerRepository;
import com.sscrm.repository.TicketHistoryRepository;
import com.sscrm.repository.TicketRepository;
import com.sscrm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final EmailService emailService;
    private final CommentRepository commentRepository;

    @Transactional
    public Ticket createTicket(TicketRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCustomer(customer);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setDueTime(calculateDueTime(request.getPriority()));

        Ticket savedTicket = ticketRepository.save(ticket);
        logHistory(savedTicket, "TICKET_CREATED", null, "Ticket created", null);

        // Send email notification
        emailService.sendTicketCreatedEmail(savedTicket);

        return savedTicket;
    }

    private LocalDateTime calculateDueTime(TicketPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case LOW -> now.plusHours(48);
            case MEDIUM -> now.plusHours(24);
            case HIGH -> now.plusHours(8);
            case CRITICAL -> now.plusHours(2);
        };
    }

    @Transactional
    public Ticket updateStatus(Long ticketId, TicketStatus newStatus, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus oldStatus = ticket.getStatus();

        // Workflow validation
        validateStatusTransition(oldStatus, newStatus);

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        User user = userRepository.findById(userId).orElse(null);
        logHistory(savedTicket, "STATUS_CHANGE", oldStatus.name(), newStatus.name(), user);

        // Send email notification
        String updateMessage = "Status changed from " + oldStatus + " to " + newStatus;
        emailService.sendTicketUpdatedEmail(savedTicket, updateMessage);

        return savedTicket;
    }

    private void validateStatusTransition(TicketStatus from, TicketStatus to) {
        // Implement state machine logic
        if (from == TicketStatus.CLOSED) {
            throw new RuntimeException("Cannot change status of closed ticket");
        }
    }

    @Transactional
    public Ticket assignAgent(Long ticketId, Long agentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (agent.getRole() != UserRole.AGENT && agent.getRole() != UserRole.SUPERVISOR) {
            throw new RuntimeException("User is not an agent or supervisor");
        }

        User oldAgent = ticket.getAssignedAgent();
        ticket.setAssignedAgent(agent);

        Ticket savedTicket = ticketRepository.save(ticket);

        logHistory(savedTicket, "ASSIGNMENT_CHANGE",
                oldAgent != null ? oldAgent.getUsername() : "Unassigned",
                agent.getUsername(), agent);

        // Send email notification
        emailService.sendTicketAssignedEmail(savedTicket, agent);

        return savedTicket;
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    public List<Ticket> getTicketsByAgent(Long agentId) {
        return ticketRepository.findByAssignedAgentId(agentId);
    }

    public List<Ticket> getTicketsByCustomer(Long customerId) {
        return ticketRepository.findByCustomerId(customerId);
    }

    public List<TicketHistory> getTicketHistory(Long ticketId) {
        return ticketHistoryRepository.findByTicketIdOrderByTimestampDesc(ticketId);
    }

    private void logHistory(Ticket ticket, String actionType, String oldValue, String newValue, User user) {
        TicketHistory history = new TicketHistory();
        history.setTicket(ticket);
        history.setActionType(actionType);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setChangedBy(user);
        ticketHistoryRepository.save(history);
    }

    public List<Comment> getTicketComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    @Transactional
    public Comment addComment(Long ticketId, String content, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }
}
