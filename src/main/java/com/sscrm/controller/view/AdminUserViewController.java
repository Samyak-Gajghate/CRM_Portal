package com.sscrm.controller.view;

import com.sscrm.entity.User;
import com.sscrm.entity.UserRole;
import com.sscrm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserViewController {

    private final UserService userService;

    @GetMapping
    public String listUsers(@RequestParam(required = false) String role, Model model) {
        List<User> users;
        if (role != null && !role.isEmpty()) {
            users = userService.getUsersByRole(UserRole.valueOf(role));
        } else {
            users = userService.getAllUsers();
        }

        model.addAttribute("pageTitle", "User Management");
        model.addAttribute("users", users);
        model.addAttribute("roles", UserRole.values());
        return "admin/users/list";
    }

    @GetMapping("/create")
    public String createUserForm(Model model) {
        model.addAttribute("pageTitle", "Create User");
        model.addAttribute("roles", UserRole.values());
        return "admin/users/create";
    }

    @PostMapping("/create")
    public String createUser(@RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam UserRole role,
            RedirectAttributes redirectAttributes) {
        try {
            userService.createUser(username, email, password, role);
            redirectAttributes.addFlashAttribute("successMessage",
                    "User '" + username + "' created successfully");
            return "redirect:/admin/users";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Failed to create user: " + e.getMessage());
            return "redirect:/admin/users/create";
        }
    }

    @GetMapping("/{id}/edit")
    public String editUserForm(@PathVariable Long id, Model model) {
        User user = userService.getUserById(id);
        model.addAttribute("pageTitle", "Edit User");
        model.addAttribute("user", user);
        model.addAttribute("roles", UserRole.values());
        return "admin/users/edit";
    }

    @PostMapping("/{id}/edit")
    public String updateUser(@PathVariable Long id,
            @RequestParam String email,
            @RequestParam UserRole role,
            @RequestParam(defaultValue = "true") Boolean active,
            RedirectAttributes redirectAttributes) {
        try {
            userService.updateUser(id, email, role, active);
            redirectAttributes.addFlashAttribute("successMessage", "User updated successfully");
            return "redirect:/admin/users";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Failed to update user: " + e.getMessage());
            return "redirect:/admin/users/" + id + "/edit";
        }
    }

    @PostMapping("/{id}/toggle-status")
    public String toggleUserStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.toggleUserStatus(id);
            redirectAttributes.addFlashAttribute("successMessage", "User status updated successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/{id}/delete")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.deleteUser(id);
            redirectAttributes.addFlashAttribute("successMessage", "User deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Failed to delete user: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }
}
