package com.sscrm.service;

import com.sscrm.dto.TicketRequest;
import com.sscrm.entity.*;
import com.sscrm.repository.CommentRepository;
import com.sscrm.repository.CustomerRepository;
import com.sscrm.repository.TicketHistoryRepository;
import com.sscrm.repository.TicketRepository;
import com.sscrm.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketHistoryRepository ticketHistoryRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private TicketService ticketService;

    private Customer testCustomer;
    private Ticket testTicket;
    private User testAgent;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setName("Test Customer");
        testCustomer.setEmail("customer@example.com");

        testTicket = new Ticket();
        testTicket.setId(1L);
        testTicket.setTitle("Test Ticket");
        testTicket.setDescription("Test Description");
        testTicket.setPriority(TicketPriority.MEDIUM);
        testTicket.setStatus(TicketStatus.OPEN);
        testTicket.setCustomer(testCustomer);
        testTicket.setCreatedAt(LocalDateTime.now());
        testTicket.setDueTime(LocalDateTime.now().plusHours(24));

        testAgent = new User();
        testAgent.setId(1L);
        testAgent.setUsername("agent1");
        testAgent.setEmail("agent@example.com");
        testAgent.setRole(UserRole.AGENT);
    }

    @Test
    void testCreateTicket_Success() {
        // Arrange
        TicketRequest request = new TicketRequest();
        request.setTitle("New Ticket");
        request.setDescription("New Description");
        request.setPriority(TicketPriority.HIGH);
        request.setCustomerId(1L);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
        doNothing().when(emailService).sendTicketCreatedEmail(any(Ticket.class));

        // Act
        Ticket result = ticketService.createTicket(request);

        // Assert
        assertNotNull(result);
        assertEquals("Test Ticket", result.getTitle());
        assertEquals(TicketStatus.OPEN, result.getStatus());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
        verify(emailService, times(1)).sendTicketCreatedEmail(any(Ticket.class));
    }

    @Test
    void testCreateTicket_CustomerNotFound() {
        // Arrange
        TicketRequest request = new TicketRequest();
        request.setCustomerId(999L);

        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> ticketService.createTicket(request));
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testUpdateStatus_Success() {
        // Arrange
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        doNothing().when(emailService).sendTicketUpdatedEmail(any(Ticket.class), anyString());

        // Act
        Ticket result = ticketService.updateStatus(1L, TicketStatus.IN_PROGRESS, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(TicketStatus.IN_PROGRESS, result.getStatus());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
        verify(emailService, times(1)).sendTicketUpdatedEmail(any(Ticket.class), anyString());
    }

    @Test
    void testUpdateStatus_ClosedTicket() {
        // Arrange
        testTicket.setStatus(TicketStatus.CLOSED);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> ticketService.updateStatus(1L, TicketStatus.IN_PROGRESS, 1L));
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testUpdateStatus_ToResolved_SetsResolvedAt() {
        // Arrange
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        doNothing().when(emailService).sendTicketUpdatedEmail(any(Ticket.class), anyString());

        // Act
        Ticket result = ticketService.updateStatus(1L, TicketStatus.RESOLVED, 1L);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getResolvedAt());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    void testAssignAgent_Success() {
        // Arrange
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
        doNothing().when(emailService).sendTicketAssignedEmail(any(Ticket.class), any(User.class));

        // Act
        Ticket result = ticketService.assignAgent(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(testAgent, result.getAssignedAgent());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
        verify(emailService, times(1)).sendTicketAssignedEmail(any(Ticket.class), any(User.class));
    }

    @Test
    void testAssignAgent_InvalidRole() {
        // Arrange
        testAgent.setRole(UserRole.ADMIN);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testAgent));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> ticketService.assignAgent(1L, 1L));
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void testGetTicketById_Success() {
        // Arrange
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));

        // Act
        Ticket result = ticketService.getTicketById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(ticketRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAllTickets() {
        // Arrange
        List<Ticket> tickets = Arrays.asList(testTicket);
        when(ticketRepository.findAll()).thenReturn(tickets);

        // Act
        List<Ticket> result = ticketService.getAllTickets();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(ticketRepository, times(1)).findAll();
    }

    @Test
    void testGetTicketsByStatus() {
        // Arrange
        List<Ticket> tickets = Arrays.asList(testTicket);
        when(ticketRepository.findByStatus(TicketStatus.OPEN)).thenReturn(tickets);

        // Act
        List<Ticket> result = ticketService.getTicketsByStatus(TicketStatus.OPEN);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(TicketStatus.OPEN, result.get(0).getStatus());
        verify(ticketRepository, times(1)).findByStatus(TicketStatus.OPEN);
    }

    @Test
    void testGetTicketsByAgent() {
        // Arrange
        List<Ticket> tickets = Arrays.asList(testTicket);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(tickets);

        // Act
        List<Ticket> result = ticketService.getTicketsByAgent(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(ticketRepository, times(1)).findByAssignedAgentId(1L);
    }

    @Test
    void testGetTicketHistory() {
        // Arrange
        TicketHistory history = new TicketHistory();
        history.setId(1L);
        history.setTicket(testTicket);
        history.setActionType("TICKET_CREATED");
        history.setNewValue("Ticket created");
        List<TicketHistory> historyList = Arrays.asList(history);
        when(ticketHistoryRepository.findByTicketIdOrderByTimestampDesc(1L)).thenReturn(historyList);

        // Act
        List<TicketHistory> result = ticketService.getTicketHistory(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("TICKET_CREATED", result.get(0).getActionType());
        verify(ticketHistoryRepository, times(1)).findByTicketIdOrderByTimestampDesc(1L);
    }

    @Test
    void testAddComment_Success() {
        // Arrange
        Comment comment = new Comment();
        comment.setId(1L);
        comment.setTicket(testTicket);
        comment.setUser(testAgent);
        comment.setContent("This is a test comment");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(testTicket));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testAgent));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        // Act
        Comment result = ticketService.addComment(1L, "This is a test comment", 1L);

        // Assert
        assertNotNull(result);
        assertEquals("This is a test comment", result.getContent());
        assertEquals(testAgent, result.getUser());
        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void testAddComment_TicketNotFound() {
        // Arrange
        when(ticketRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> ticketService.addComment(999L, "comment", 1L));
        verify(commentRepository, never()).save(any(Comment.class));
    }
}
