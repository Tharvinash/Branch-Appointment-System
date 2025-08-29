package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicianService {
  private TechnicianRepository technicianRepository;

  public List<TechnicianDto> getTechnicianService() {
    return technicianRepository.findAll().stream().map(ts -> new TechnicianDto(
        ts.getId(),
        ts.getName(),
        ts.getStatus()
    )).toList();
  }
}
