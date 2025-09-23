package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.entity.BayEntity;
import com.branch.appointment.backend.mapper.BayMapper;
import com.branch.appointment.backend.repository.BayRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BayService {

  private final BayRepository bayRepository;
  private final BayMapper bayMapper;

  public List<BayDto> getBays() {
    return bayRepository.findAll()
        .stream()
        .map(bayMapper::toDto)
        .toList();
  }

  public BayDto createBay(BayDto bayDto) {
    BayEntity bay = bayMapper.toEntity(bayDto);
    BayEntity savedBay = bayRepository.save(bay);
    return bayMapper.toDto(savedBay);
  }

  public BayDto getBayById(Long id) {
    BayEntity bay = bayRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Bay not found with id: " + id));
    return bayMapper.toDto(bay);
  }

  public BayDto updateBay(Long id, BayDto bayDto) {
    BayEntity existingBay = bayRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Bay not found with id: " + id));
    existingBay.setBayName(bayDto.getName());
    existingBay.setBayNumber(bayDto.getNumber());
    existingBay.setStatus(bayDto.getStatus());

    BayEntity updatedBay = bayRepository.save(existingBay);
    return bayMapper.toDto(updatedBay);
  }

  public void deleteBay(Long id) {
    if (!bayRepository.existsById(id)) {
      throw new RuntimeException("Bay not found with id: " + id);
    }
    bayRepository.deleteById(id);
  }
}

