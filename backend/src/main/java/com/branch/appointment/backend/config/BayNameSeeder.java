package com.branch.appointment.backend.config;

import com.branch.appointment.backend.entity.BayNameEntity;
import com.branch.appointment.backend.repository.BayNameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BayNameSeeder implements CommandLineRunner {

  private final BayNameRepository bayNameRepository;

  @Override
  public void run(String... args) {
    if (bayNameRepository.count() == 0) {
      List<String> names = List.of(
          "Surface Preparation (SP)",
          "Spray Booth (SB)",
          "Polishing (PL)",
          "Assembly/Disassembly (A/D)",
          "Panel Beating (PB)",
          "Windscreen (WS)",
          "Mechanical (MEC)"
      );
      names.forEach(name -> bayNameRepository.save(new BayNameEntity(null, name)));
    }
  }
}
