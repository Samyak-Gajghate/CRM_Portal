package com.sscrm.controller.view;

import com.sscrm.entity.FAQ;
import com.sscrm.service.FAQService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/faqs")
@RequiredArgsConstructor
public class FAQViewController {
    
    private final FAQService faqService;
    
    @GetMapping
    public String listFAQs(@RequestParam(required = false) String search, Model model) {
        List<FAQ> faqs;
        if (search != null && !search.isEmpty()) {
            faqs = faqService.searchFAQs(search);
        } else {
            faqs = faqService.getAllFAQs();
        }
        
        model.addAttribute("pageTitle", "Knowledge Base");
        model.addAttribute("faqs", faqs);
        return "faqs/list";
    }
    
    @GetMapping("/create")
    public String createFAQForm(Model model) {
        model.addAttribute("pageTitle", "Create FAQ");
        model.addAttribute("faq", new FAQ());
        return "faqs/create";
    }
    
    @PostMapping
    public String createFAQ(@ModelAttribute FAQ faq, RedirectAttributes redirectAttributes) {
        try {
            faqService.createFAQ(faq);
            redirectAttributes.addFlashAttribute("successMessage", "FAQ created successfully");
            return "redirect:/faqs";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/faqs/create";
        }
    }
}
