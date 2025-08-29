package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.CategoryDto;
import com.branch.appointment.backend.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/categories")
public class CategoryController {

  private CategoryService categoryService;

  @GetMapping
  public ResponseEntity<List<CategoryDto>> getCategories() {
    return ResponseEntity.status(HttpStatus.OK).body(categoryService.getCategoryService());
  }
}
