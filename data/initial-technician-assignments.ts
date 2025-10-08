import type { TechnicianCategoryAssignments } from "@/services/technician-types"

export const initialTechnicianAssignments: TechnicianCategoryAssignments = {
  hardware: {
    technicians: ["tech-001", "tech-003"],
    subcategories: {
      "computer-not-working": ["tech-001", "tech-003"],
      "printer-issues": ["tech-003"],
      "monitor-problems": ["tech-001"],
    },
  },
  software: {
    technicians: ["tech-002", "tech-004"],
    subcategories: {
      "os-issues": ["tech-002"],
      "application-problems": ["tech-002", "tech-004"],
      "software-installation": ["tech-002", "tech-004"],
    },
  },
  network: {
    technicians: ["tech-001", "tech-003"],
    subcategories: {
      "internet-connection": ["tech-001"],
      "wifi-problems": ["tech-001"],
      "network-drive": ["tech-001", "tech-003"],
    },
  },
  email: {
    technicians: ["tech-003", "tech-004"],
    subcategories: {
      "email-not-working": ["tech-003"],
      "email-setup": ["tech-004"],
      "email-sync": ["tech-004"],
    },
  },
  security: {
    technicians: ["tech-001", "tech-002"],
    subcategories: {
      "virus-malware": ["tech-001", "tech-002"],
      "password-reset": ["tech-002"],
      "security-incident": ["tech-001", "tech-002"],
    },
  },
  access: {
    technicians: ["tech-002", "tech-004"],
    subcategories: {
      "system-access": ["tech-002", "tech-004"],
      "permission-change": ["tech-004"],
      "new-account": ["tech-002", "tech-004"],
    },
  },
}
