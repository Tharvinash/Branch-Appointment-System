package com.branch.appointment.backend.controller;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.dto.BayNameDto;
import com.branch.appointment.backend.service.BayService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/bays")
public class BayController {

  private final BayService bayService;

  @GetMapping()
  public ResponseEntity<List<BayDto>> getBays() {
    return ResponseEntity.ok(bayService.getBays());
  }

  @PostMapping()
  public ResponseEntity<BayDto> createBay(@RequestBody BayDto bayDto) {
    BayDto createdBay = bayService.createBay(bayDto);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdBay);
  }

  @GetMapping("/{id}")
  public ResponseEntity<BayDto> getBayById(@PathVariable Long id) {
    return ResponseEntity.ok(bayService.getBayById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<BayDto> updateBay(@PathVariable Long id, @RequestBody BayDto bayDto) {
    return ResponseEntity.ok(bayService.updateBay(id, bayDto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteBay(@PathVariable Long id) {
    bayService.deleteBay(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/names")
  public List<BayNameDto> getBayNames() {
    return bayService.getBayNames();
  }
}