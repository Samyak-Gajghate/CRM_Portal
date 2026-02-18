package com.sscrm.repository;

import com.sscrm.entity.Ticket;
import com.sscrm.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAssignedAgentId(Long agentId);

    List<Ticket> findByCustomerId(Long customerId);

    // For SLA breach detection
    @Query("SELECT t FROM Ticket t WHERE t.status != 'RESOLVED' AND t.status != 'CLOSED' AND t.dueTime < :currentTime")
    List<Ticket> findBreachedTickets(LocalDateTime currentTime);

    // For SLA monitoring - tickets approaching breach
    @Query("SELECT t FROM Ticket t WHERE t.status != 'RESOLVED' AND t.status != 'CLOSED' AND t.dueTime BETWEEN :now AND :threshold ORDER BY t.dueTime ASC")
    List<Ticket> findTicketsApproachingBreach(LocalDateTime now, LocalDateTime threshold);

    // Dashboard queries
    long countByStatus(TicketStatus status);

    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, t.createdAt, t.resolvedAt)) FROM Ticket t WHERE t.status = 'RESOLVED'")
    Double getAverageResolutionTime();
}
