package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.CategoryDto;
import com.branch.appointment.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private CategoryRepository categoryRepository;

  public List<CategoryDto> getCategoryService() {
    return categoryRepository.findAll().stream().map(cs -> new CategoryDto(
        cs.getId(),
        cs.getName(),
        cs.getDuration()
    )).toList();
  }
}
