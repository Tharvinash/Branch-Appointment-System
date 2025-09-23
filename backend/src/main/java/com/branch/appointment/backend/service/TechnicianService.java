package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.entity.TechnicianEntity;
import com.branch.appointment.backend.repository.TechnicianRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class TechnicianService {

  private final TechnicianRepository technicianRepository;

  public List<TechnicianDto> getTechnicians() {
    return technicianRepository.findAll()
        .stream()
        .map(this::toDto)
        .toList();
  }

  public TechnicianDto getTechnician(Long id) {
    TechnicianEntity entity = technicianRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Technician not found"));
    return toDto(entity);
  }

  public TechnicianDto createTechnician(TechnicianDto dto) {
    TechnicianEntity entity = new TechnicianEntity();
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    TechnicianEntity saved = technicianRepository.save(entity);
    return toDto(saved);
  }

  public TechnicianDto updateTechnician(Long id, TechnicianDto dto) {
    TechnicianEntity entity = technicianRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Technician not found"));
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    TechnicianEntity updated = technicianRepository.save(entity);
    return toDto(updated);
  }

  public void deleteTechnician(Long id) {
    technicianRepository.deleteById(id);
  }

  private TechnicianDto toDto(TechnicianEntity entity) {
    return TechnicianDto.builder()
        .id(entity.getId())
        .name(entity.getName())
        .status(entity.getStatus())
        .build();
  }
}

