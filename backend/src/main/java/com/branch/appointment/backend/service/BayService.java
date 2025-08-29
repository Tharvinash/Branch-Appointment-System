package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.repository.BayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BayService {

  @Autowired
  private BayRepository bayRepository;

  public List<BayDto> getBays() {
    return bayRepository.findAll().stream().map(bays -> new BayDto(
        bays.getId(),
        bays.getBayName(),
        bays.getBayNumber()
    )).toList();
  }
}
