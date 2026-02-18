package com.sscrm.controller;

import com.sscrm.dto.ApiResponse;
import com.sscrm.entity.FAQ;
import com.sscrm.service.FAQService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FAQController {
    
    private final FAQService faqService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<FAQ>> createFAQ(@RequestBody FAQ faq) {
        FAQ created = faqService.createFAQ(faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ created", created));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FAQ>> getFAQ(@PathVariable Long id) {
        try {
            FAQ faq = faqService.getFAQById(id);
            faqService.incrementUsageCount(id);
            return ResponseEntity.ok(ApiResponse.success("FAQ retrieved", faq));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<FAQ>>> getAllFAQs() {
        List<FAQ> faqs = faqService.getAllFAQs();
        return ResponseEntity.ok(ApiResponse.success("FAQs retrieved", faqs));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FAQ>>> searchFAQs(@RequestParam String keyword) {
        List<FAQ> faqs = faqService.searchFAQs(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results", faqs));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<FAQ>>> getFAQsByCategory(@PathVariable String category) {
        List<FAQ> faqs = faqService.getFAQsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("FAQs by category", faqs));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<ApiResponse<FAQ>> updateFAQ(@PathVariable Long id, @RequestBody FAQ faq) {
        try {
            FAQ updated = faqService.updateFAQ(id, faq);
            return ResponseEntity.ok(ApiResponse.success("FAQ updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFAQ(@PathVariable Long id) {
        faqService.deleteFAQ(id);
        return ResponseEntity.ok(ApiResponse.success("FAQ deleted", null));
    }
}
