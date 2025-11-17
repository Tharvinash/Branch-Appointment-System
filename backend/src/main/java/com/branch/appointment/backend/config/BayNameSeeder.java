package com.branch.appointment.backend.config;

import com.branch.appointment.backend.entity.BayNameEntity;
import com.branch.appointment.backend.repository.BayNameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BayNameSeeder implements CommandLineRunner {

  private final BayNameRepository bayNameRepository;

  @Override
  public void run(String... args) {
    // Updated bay names in the desired order
    List<String> expectedBayNames = List.of(
        "Surface Preparation (SP)",
        "Spray Booth (SB)",
        "Polishing (PL)",
        "Assembly/Disassembly (A/D)",
        "Panel Beating (PB)",
        "Mechanical (MEC)",
        "Windscreen (WS)",
        "Frame Alligner (FA)",
        "QC"
    );

    // If table is empty, create all bay names
    if (bayNameRepository.count() == 0) {
      expectedBayNames.forEach(name -> bayNameRepository.save(new BayNameEntity(null, name)));
    } else {
      // Update existing bay names and add new ones
      // Map of old names to new names for updates
//      Map<String, String> nameUpdates = Map.of(
//          "Spray Booth (SB)", "Spray Booth (SB) & Colour Matching"
//      );
//
//      // Update existing bay names that need name changes
//      for (Map.Entry<String, String> entry : nameUpdates.entrySet()) {
//        Optional<BayNameEntity> existing = bayNameRepository.findByBayName(entry.getKey());
//        if (existing.isPresent()) {
//          BayNameEntity bayName = existing.get();
//          bayName.setBayName(entry.getValue());
//          bayNameRepository.save(bayName);
//        }
//      }

      // Add new bay names that don't exist
      for (String expectedName : expectedBayNames) {
        Optional<BayNameEntity> existing = bayNameRepository.findByBayName(expectedName);
        if (existing.isEmpty()) {
          bayNameRepository.save(new BayNameEntity(null, expectedName));
        }
      }
    }
  }
}
