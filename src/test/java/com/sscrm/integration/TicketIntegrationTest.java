package com.sscrm.integration;

import com.sscrm.dto.TicketRequest;
import com.sscrm.entity.*;
import com.sscrm.repository.CustomerRepository;
import com.sscrm.repository.TicketRepository;
import com.sscrm.repository.UserRepository;
import com.sscrm.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@SuppressWarnings("null")
class TicketIntegrationTest {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    private Customer testCustomer;
    private User testAgent;

    @BeforeEach
    void setUp() {
        // Clean up
        ticketRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();

        // Create test customer
        testCustomer = new Customer();
        testCustomer.setName("Integration Test Customer");
        testCustomer.setEmail("integration@example.com");
        testCustomer.setPhone("1234567890");
        testCustomer.setCategory(CustomerCategory.REGULAR);
        testCustomer = customerRepository.save(testCustomer);

        // Create test agent
        testAgent = new User();
        testAgent.setUsername("testagent");
        testAgent.setEmail("agent@example.com");
        testAgent.setPassword("password");
        testAgent.setRole(UserRole.AGENT);
        testAgent.setActive(true);
        testAgent = userRepository.save(testAgent);
    }

    @Test
    void testCompleteTicketLifecycle() {
        // 1. Create ticket
        TicketRequest request = new TicketRequest();
        request.setTitle("Integration Test Ticket");
        request.setDescription("Testing complete lifecycle");
        request.setPriority(TicketPriority.HIGH);
        request.setCustomerId(testCustomer.getId());

        Ticket createdTicket = ticketService.createTicket(request);

        assertNotNull(createdTicket);
        assertNotNull(createdTicket.getId());
        assertEquals(TicketStatus.OPEN, createdTicket.getStatus());
        assertNotNull(createdTicket.getDueTime());

        // 2. Assign agent
        Ticket assignedTicket = ticketService.assignAgent(createdTicket.getId(), testAgent.getId());

        assertNotNull(assignedTicket.getAssignedAgent());
        assertEquals(testAgent.getId(), assignedTicket.getAssignedAgent().getId());

        // 3. Update status to IN_PROGRESS
        Ticket inProgressTicket = ticketService.updateStatus(
                createdTicket.getId(),
                TicketStatus.IN_PROGRESS,
                testAgent.getId());

        assertEquals(TicketStatus.IN_PROGRESS, inProgressTicket.getStatus());

        // 4. Resolve ticket
        Ticket resolvedTicket = ticketService.updateStatus(
                createdTicket.getId(),
                TicketStatus.RESOLVED,
                testAgent.getId());

        assertEquals(TicketStatus.RESOLVED, resolvedTicket.getStatus());
        assertNotNull(resolvedTicket.getResolvedAt());

        // 5. Verify ticket exists in database
        Ticket dbTicket = ticketRepository.findById(createdTicket.getId()).orElse(null);
        assertNotNull(dbTicket);
        assertEquals(TicketStatus.RESOLVED, dbTicket.getStatus());
    }

    @Test
    void testSLACalculation() {
        // Test CRITICAL priority (2 hours)
        TicketRequest criticalRequest = new TicketRequest();
        criticalRequest.setTitle("Critical Ticket");
        criticalRequest.setDescription("Critical issue");
        criticalRequest.setPriority(TicketPriority.CRITICAL);
        criticalRequest.setCustomerId(testCustomer.getId());

        Ticket criticalTicket = ticketService.createTicket(criticalRequest);

        LocalDateTime expectedDueTime = criticalTicket.getCreatedAt().plusHours(2);
        assertTrue(criticalTicket.getDueTime().isAfter(expectedDueTime.minusMinutes(1)));
        assertTrue(criticalTicket.getDueTime().isBefore(expectedDueTime.plusMinutes(1)));

        // Test MEDIUM priority (24 hours)
        TicketRequest mediumRequest = new TicketRequest();
        mediumRequest.setTitle("Medium Ticket");
        mediumRequest.setDescription("Medium issue");
        mediumRequest.setPriority(TicketPriority.MEDIUM);
        mediumRequest.setCustomerId(testCustomer.getId());

        Ticket mediumTicket = ticketService.createTicket(mediumRequest);

        LocalDateTime expectedMediumDueTime = mediumTicket.getCreatedAt().plusHours(24);
        assertTrue(mediumTicket.getDueTime().isAfter(expectedMediumDueTime.minusMinutes(1)));
        assertTrue(mediumTicket.getDueTime().isBefore(expectedMediumDueTime.plusMinutes(1)));
    }

    @Test
    void testGetTicketsByStatus() {
        // Create multiple tickets with different statuses
        TicketRequest request1 = new TicketRequest();
        request1.setTitle("Open Ticket 1");
        request1.setDescription("Description 1");
        request1.setPriority(TicketPriority.MEDIUM);
        request1.setCustomerId(testCustomer.getId());

        TicketRequest request2 = new TicketRequest();
        request2.setTitle("Open Ticket 2");
        request2.setDescription("Description 2");
        request2.setPriority(TicketPriority.LOW);
        request2.setCustomerId(testCustomer.getId());

        Ticket ticket1 = ticketService.createTicket(request1);
        Ticket ticket2 = ticketService.createTicket(request2);

        // Update one to IN_PROGRESS
        ticketService.updateStatus(ticket1.getId(), TicketStatus.IN_PROGRESS, testAgent.getId());

        // Query by status
        List<Ticket> openTickets = ticketService.getTicketsByStatus(TicketStatus.OPEN);
        List<Ticket> inProgressTickets = ticketService.getTicketsByStatus(TicketStatus.IN_PROGRESS);

        assertEquals(1, openTickets.size());
        assertEquals(1, inProgressTickets.size());
        assertEquals("Open Ticket 2", openTickets.get(0).getTitle());
        assertEquals("Open Ticket 1", inProgressTickets.get(0).getTitle());
    }

    @Test
    void testCannotUpdateClosedTicket() {
        // Create and close a ticket
        TicketRequest request = new TicketRequest();
        request.setTitle("Test Ticket");
        request.setDescription("Description");
        request.setPriority(TicketPriority.MEDIUM);
        request.setCustomerId(testCustomer.getId());

        Ticket ticket = ticketService.createTicket(request);
        ticketService.updateStatus(ticket.getId(), TicketStatus.RESOLVED, testAgent.getId());
        ticketService.updateStatus(ticket.getId(), TicketStatus.CLOSED, testAgent.getId());

        // Try to update closed ticket
        assertThrows(RuntimeException.class,
                () -> ticketService.updateStatus(ticket.getId(), TicketStatus.IN_PROGRESS, testAgent.getId()));
    }
}
