package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.BlockTimeDto;
import com.branch.appointment.backend.repository.BlockTimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BlockTimeService {

  private BlockTimeRepository blockTimeRepository;

  public List<BlockTimeDto> getBlockTime() {
    return blockTimeRepository.findAll().stream().map(bt -> new BlockTimeDto(
        bt.getId(),
        bt.getBlockName(),
        bt.getDuration()
    )).toList();

  }
}
