package com.sscrm.dto;

import com.sscrm.entity.TicketPriority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    private String title;
    private String description;
    private TicketPriority priority;
    private Long customerId;
}
