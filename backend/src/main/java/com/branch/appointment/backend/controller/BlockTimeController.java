package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.BlockTimeDto;
import com.branch.appointment.backend.service.BlockTimeService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/blockTimes")
public class BlockTimeController {
  private BlockTimeService blockTimeService;

  @GetMapping
  public ResponseEntity<List<BlockTimeDto>> getBlockTimes() {
    return ResponseEntity.status(HttpStatus.OK).body(blockTimeService.getBlockTime());
  }
}
