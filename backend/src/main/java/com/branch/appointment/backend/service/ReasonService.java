package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.ReasonDto;
import com.branch.appointment.backend.repository.ReasonRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ReasonService {

  private final ReasonRepository reasonRepository;

  public List<ReasonDto> getAllReasons() {
    return reasonRepository.findAll()
        .stream()
        .map(reason -> ReasonDto.builder()
            .id(reason.getId())
            .reason(reason.getReason())
            .build())
        .toList();
  }
}

