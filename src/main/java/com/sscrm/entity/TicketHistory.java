package com.sscrm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @Column(nullable = false)
    private String actionType;
    
    private String oldValue;
    
    private String newValue;
    
    @ManyToOne
    @JoinColumn(name = "changed_by")
    private User changedBy;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
