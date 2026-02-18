package com.sscrm.service;

import com.sscrm.entity.FAQ;
import com.sscrm.repository.FAQRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class FAQService {

    private final FAQRepository faqRepository;

    public FAQ createFAQ(FAQ faq) {
        return faqRepository.save(faq);
    }

    public FAQ getFAQById(Long id) {
        return faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
    }

    public List<FAQ> getAllFAQs() {
        return faqRepository.findAll();
    }

    public List<FAQ> searchFAQs(String keyword) {
        return faqRepository.findByQuestionContainingIgnoreCase(keyword);
    }

    public List<FAQ> getFAQsByCategory(String category) {
        return faqRepository.findByCategory(category);
    }

    public FAQ updateFAQ(Long id, FAQ updatedFAQ) {
        FAQ faq = getFAQById(id);
        faq.setQuestion(updatedFAQ.getQuestion());
        faq.setAnswer(updatedFAQ.getAnswer());
        faq.setCategory(updatedFAQ.getCategory());
        return faqRepository.save(faq);
    }

    public void incrementUsageCount(Long id) {
        FAQ faq = getFAQById(id);
        faq.setUsageCount(faq.getUsageCount() + 1);
        faqRepository.save(faq);
    }

    public void deleteFAQ(Long id) {
        faqRepository.deleteById(id);
    }
}
