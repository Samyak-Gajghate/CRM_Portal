package com.sscrm.controller.view;

import com.sscrm.entity.Customer;
import com.sscrm.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerViewController {
    
    private final CustomerService customerService;
    
    @GetMapping
    public String listCustomers(@RequestParam(required = false) String search, Model model) {
        List<Customer> customers;
        if (search != null && !search.isEmpty()) {
            customers = customerService.searchCustomersByName(search);
        } else {
            customers = customerService.getAllCustomers();
        }
        
        model.addAttribute("pageTitle", "Customers");
        model.addAttribute("customers", customers);
        return "customers/list";
    }
    
    @GetMapping("/create")
    public String createCustomerForm(Model model) {
        model.addAttribute("pageTitle", "Create Customer");
        model.addAttribute("customer", new Customer());
        return "customers/create";
    }
    
    @PostMapping
    public String createCustomer(@ModelAttribute Customer customer, RedirectAttributes redirectAttributes) {
        try {
            customerService.createCustomer(customer);
            redirectAttributes.addFlashAttribute("successMessage", "Customer created successfully");
            return "redirect:/customers";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/customers/create";
        }
    }
}
