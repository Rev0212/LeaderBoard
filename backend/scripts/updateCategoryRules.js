import axios from 'axios';

const VITE_BASE_URL = 'http://localhost:4000';

// Function to update category rules configuration
async function updateCategoryRulesConfig() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2Y3NmRmOWY4NGE1ZWMxYzBkYjVlN2EiLCJpYXQiOjE3NDQyODI5MjEsImV4cCI6MTc0NDM2OTMyMX0.zqmkHiBkfoLqjKaM4SQt5XyTBFwLKrEbETfc6z9mft4";
  
  if (!token) {
    console.error("❌ Error: Admin token not found. Please log in first.");
    return;
  }

  console.log("🔄 Starting category rules configuration update...");
  
  try {
    // Create hierarchical configuration based on marking scheme
    const newConfiguration = buildCategoryConfiguration();
    
    // Post the new configuration to the backend
    const response = await axios.post(
      `${VITE_BASE_URL}/admin/config/category-rules`,
      { 
        configuration: newConfiguration,
        notes: 'Updated from detailed marking scheme' 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log("✅ Configuration updated successfully!");
      console.log(`📊 Total categories configured: ${Object.keys(newConfiguration).length}`);
      return true;
    } else {
      console.error("❌ Failed to update configuration:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Error updating configuration:", error.response?.data?.message || error.message);
    return false;
  }
}

// Build the category configuration from marking scheme
function buildCategoryConfiguration() {
  const configuration = {};
  
  // HACKATHON
  console.log("📝 Configuring HACKATHON category...");
  configuration.Hackathon = buildHackathonConfig();
  
  // CODING COMPETITIONS
  console.log("📝 Configuring CODING category...");
  configuration.Coding = buildCodingConfig();
  
  // OPEN SOURCE CONTRIBUTION
  console.log("📝 Configuring OPEN SOURCE category...");
  configuration['Open Source'] = buildOpenSourceConfig();
  
  // RESEARCH PAPER
  console.log("📝 Configuring RESEARCH PAPER category...");
  configuration['Research'] = buildResearchConfig();
  
  // CERTIFICATIONS
  console.log("📝 Configuring CERTIFICATIONS category...");
  configuration['Global-Certificates'] = buildCertificationConfig();
  
  // NCC / NSS / YRC
  console.log("📝 Configuring NCC/NSS/YRC category...");
  configuration['NCC-NSS'] = buildNCCConfig();
  
  // SPORTS
  console.log("📝 Configuring SPORTS category...");
  configuration['Sports'] = buildSportsConfig();
  
  // WORKSHOPS
  console.log("📝 Configuring WORKSHOPS category...");
  configuration.Workshop = buildWorkshopConfig();
  
  // STUDENT LEADERSHIP
  console.log("📝 Configuring LEADERSHIP category...");
  configuration['Leadership'] = buildLeadershipConfig();
  
  // SOCIAL WORK & COMMUNITY IMPACT
  console.log("📝 Configuring SOCIAL WORK category...");
  configuration['Social Work'] = buildSocialWorkConfig();
  
  return configuration;
}

// Builder functions for each category

function buildHackathonConfig() {
  const config = {
    "Individual": {
      "International": {
        "Industry Based": {
          "First": 115, // 40 (Winner) + 50 (International) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Second": 105, // 30 (Runner-up) + 50 (International) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Third": 95, // 20 (3rd Place) + 50 (International) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Participated": 75 // 5 (Participant) + 50 (International) + 15 (Industry) + 15 (Solo) - 5 (Participant)
        },
        "College Based": {
          "First": 105, // 40 (Winner) + 50 (International) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Second": 95, // 30 (Runner-up) + 50 (International) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Third": 85, // 20 (3rd) + 50 (International) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Participated": 65 // 5 (Participant) + 50 (International) + 5 (Academic) + 15 (Solo) - 5 (Participant)
        }
      },
      "National": {
        "Industry Based": {
          "First": 95, // 40 (Winner) + 30 (National) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Second": 85, // 30 (Runner-up) + 30 (National) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Third": 75, // 20 (3rd) + 30 (National) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Participated": 55 // 5 (Participant) + 30 (National) + 15 (Industry) + 15 (Solo) - 5 (Participant)
        },
        "College Based": {
          "First": 85, // 40 (Winner) + 30 (National) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Second": 75, // 30 (Runner-up) + 30 (National) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Third": 65, // 20 (3rd) + 30 (National) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Participated": 45 // 5 (Participant) + 30 (National) + 5 (Academic) + 15 (Solo) - 5 (Participant)
        }
      },
      "State": {
        "Industry Based": {
          "First": 85, // 40 (Winner) + 20 (State/Inter-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Second": 75, // 30 (Runner-up) + 20 (State/Inter-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Third": 65, // 20 (3rd) + 20 (State/Inter-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Participated": 45 // 5 (Participant) + 20 (State/Inter-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
        },
        "College Based": {
          "First": 75, // 40 (Winner) + 20 (State/Inter-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Second": 65, // 30 (Runner-up) + 20 (State/Inter-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Third": 55, // 20 (3rd) + 20 (State/Inter-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Participated": 35 // 5 (Participant) + 20 (State/Inter-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
        }
      },
      "College": {
        "Industry Based": {
          "First": 75, // 40 (Winner) + 10 (Intra-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Second": 65, // 30 (Runner-up) + 10 (Intra-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Third": 55, // 20 (3rd) + 10 (Intra-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
          "Participated": 35 // 5 (Participant) + 10 (Intra-College) + 15 (Industry) + 15 (Solo) - 5 (Participant)
        },
        "College Based": {
          "First": 65, // 40 (Winner) + 10 (Intra-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Second": 55, // 30 (Runner-up) + 10 (Intra-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Third": 45, // 20 (3rd) + 10 (Intra-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
          "Participated": 25 // 5 (Participant) + 10 (Intra-College) + 5 (Academic) + 15 (Solo) - 5 (Participant)
        }
      }
    },
    "Team": {
      "International": {
        "Industry Based": {
          "First": 90, // 40 (Winner) + 50 (International) + 15 (Industry) - 15 (Team vs Solo)
          "Second": 80, // 30 (Runner-up) + 50 (International) + 15 (Industry) - 15 (Team vs Solo)
          "Third": 70, // 20 (3rd) + 50 (International) + 15 (Industry) - 15 (Team vs Solo)
          "Participated": 55 // 5 (Participant) + 50 (International) + 15 (Industry) - 15 (Team vs Solo)
        },
        "College Based": {
          "First": 80, // 40 (Winner) + 50 (International) + 5 (Academic) - 15 (Team vs Solo)
          "Second": 70, // 30 (Runner-up) + 50 (International) + 5 (Academic) - 15 (Team vs Solo)
          "Third": 60, // 20 (3rd) + 50 (International) + 5 (Academic) - 15 (Team vs Solo)
          "Participated": 45 // 5 (Participant) + 50 (International) + 5 (Academic) - 15 (Team vs Solo)
        }
      },
      // Similar structure for National, State, and College levels
      "National": {
        "Industry Based": {
          "First": 70, // 40 (Winner) + 30 (National) + 15 (Industry) - 15 (Team vs Solo)
          "Second": 60, // 30 (Runner-up) + 30 (National) + 15 (Industry) - 15 (Team vs Solo)
          "Third": 50, // 20 (3rd) + 30 (National) + 15 (Industry) - 15 (Team vs Solo)
          "Participated": 35 // 5 (Participant) + 30 (National) + 15 (Industry) - 15 (Team vs Solo)
        },
        "College Based": {
          "First": 60, // 40 (Winner) + 30 (National) + 5 (Academic) - 15 (Team vs Solo)
          "Second": 50, // 30 (Runner-up) + 30 (National) + 5 (Academic) - 15 (Team vs Solo)
          "Third": 40, // 20 (3rd) + 30 (National) + 5 (Academic) - 15 (Team vs Solo)
          "Participated": 25 // 5 (Participant) + 30 (National) + 5 (Academic) - 15 (Team vs Solo)
        }
      },
      "State": {
        "Industry Based": {
          "First": 60, // 40 (Winner) + 20 (State) + 15 (Industry) - 15 (Team vs Solo)
          "Second": 50, // 30 (Runner-up) + 20 (State) + 15 (Industry) - 15 (Team vs Solo)
          "Third": 40, // 20 (3rd) + 20 (State) + 15 (Industry) - 15 (Team vs Solo)
          "Participated": 25 // 5 (Participant) + 20 (State) + 15 (Industry) - 15 (Team vs Solo)
        },
        "College Based": {
          "First": 50, // 40 (Winner) + 20 (State) + 5 (Academic) - 15 (Team vs Solo)
          "Second": 40, // 30 (Runner-up) + 20 (State) + 5 (Academic) - 15 (Team vs Solo)
          "Third": 30, // 20 (3rd) + 20 (State) + 5 (Academic) - 15 (Team vs Solo)
          "Participated": 15 // 5 (Participant) + 20 (State) + 5 (Academic) - 15 (Team vs Solo)
        }
      },
      "College": {
        "Industry Based": {
          "First": 50, // 40 (Winner) + 10 (College) + 15 (Industry) - 15 (Team vs Solo)
          "Second": 40, // 30 (Runner-up) + 10 (College) + 15 (Industry) - 15 (Team vs Solo)
          "Third": 30, // 20 (3rd) + 10 (College) + 15 (Industry) - 15 (Team vs Solo)
          "Participated": 15 // 5 (Participant) + 10 (College) + 15 (Industry) - 15 (Team vs Solo)
        },
        "College Based": {
          "First": 40, // 40 (Winner) + 10 (College) + 5 (Academic) - 15 (Team vs Solo)
          "Second": 30, // 30 (Runner-up) + 10 (College) + 5 (Academic) - 15 (Team vs Solo)
          "Third": 20, // 20 (3rd) + 10 (College) + 5 (Academic) - 15 (Team vs Solo)
          "Participated": 5 // 5 (Participant) + 10 (College) + 5 (Academic) - 15 (Team vs Solo)
        }
      }
    }
  };
  
  console.log("✅ Hackathon configuration built successfully");
  return config;
}

function buildCodingConfig() {
  // Since Coding competitions have different attributes (platform, percentile),
  // we'll simplify by creating combinations of the most common attributes
  const config = {
    "Individual": {
      "International": {
        "First": 70, // Top 1% (40) + International (10) + Top-tier platform (20)
        "Second": 60, // Top 5% (30) + International (10) + Top-tier platform (20)
        "Third": 50, // Top 10% (20) + International (10) + Top-tier platform (20)
        "Participated": 35 // Participant (5) + International (10) + Top-tier platform (20)
      },
      "National": {
        "First": 65, // Top 1% (40) + National (5) + Top-tier platform (20)
        "Second": 55, // Top 5% (30) + National (5) + Top-tier platform (20)
        "Third": 45, // Top 10% (20) + National (5) + Top-tier platform (20)
        "Participated": 30 // Participant (5) + National (5) + Top-tier platform (20)
      }
    },
    "Team": {
      "International": {
        "First": 60, // Top 1% (40) + International (10) + Mid-tier platform (10)
        "Second": 50, // Top 5% (30) + International (10) + Mid-tier platform (10)
        "Third": 40, // Top 10% (20) + International (10) + Mid-tier platform (10)
        "Participated": 25 // Participant (5) + International (10) + Mid-tier platform (10)
      },
      "National": {
        "First": 55, // Top 1% (40) + National (5) + Mid-tier platform (10)
        "Second": 45, // Top 5% (30) + National (5) + Mid-tier platform (10)
        "Third": 35, // Top 10% (20) + National (5) + Mid-tier platform (10)
        "Participated": 20 // Participant (5) + National (5) + Mid-tier platform (10)
      }
    }
  };
  
  console.log("✅ Coding competition configuration built successfully");
  return config;
}

function buildOpenSourceConfig() {
  // Open source is typically individual contribution, so we'll focus on different types and tiers
  const config = {
    "Individual": {
      "International": {
        "First": 85, // Merged PR (10) + Feature (15) + >500 lines (10) + GSoC (40) + >1000 forks (30) - Standard participation (20)
        "Second": 55, // Merged PR (10) + Bug Fix (10) + Hacktoberfest (20) + >1000 forks (30) - Standard participation (15)
        "Third": 40, // Merged PR (10) + Documentation (5) + 500-1000 forks (15) + Every 5 PRs (5) + >500 lines (10) - Standard participation (5)
        "Participated": 20 // Open PR (5) + Documentation (5) + 500-1000 forks (15) - Standard participation (5)
      },
      "National": {
        "First": 65, // Similar but lower tier
        "Second": 45,
        "Third": 30,
        "Participated": 15
      }
    }
  };
  
  console.log("✅ Open Source configuration built successfully");
  return config;
}

function buildResearchConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 95, // IEEE (40) + 1st Author (20) + Research (20) + Conference (15) + International (20) - Standard participation (20)
        "Second": 75, // IEEE (40) + Co-author (10) + Research (20) + Conference (15) + International (20) - Standard participation (20)
        "Third": 65, // UGC Listed (25) + 1st Author (20) + Research (20) + Conference (15) + International (20) - Standard participation (35)
        "Participated": 55 // UGC Listed (25) + Co-author (10) + Research (20) + Poster (10) + International (20) - Standard participation (30)
      },
      "National": {
        "First": 75, // IEEE (40) + 1st Author (20) + Research (20) + Conference (15) + National (10) - Standard participation (30)
        "Second": 55, // IEEE (40) + Co-author (10) + Research (20) + Conference (15) + National (10) - Standard participation (40)
        "Third": 45, // UGC Listed (25) + 1st Author (20) + Review (10) + Poster (10) + National (10) - Standard participation (30)
        "Participated": 35 // Others (10) + Co-author (10) + Review (10) + Poster (10) + National (10) - Standard participation (15)
      }
    },
    "Team": {
      "International": {
        "First": 85, // IEEE (40) + Co-author (10) + Research (20) + Conference (15) + International (20) - Standard participation (20)
        "Second": 65, // UGC Listed (25) + Co-author (10) + Research (20) + Conference (15) + International (20) - Standard participation (15)
        "Third": 55, // UGC Listed (25) + Co-author (10) + Review (10) + Conference (15) + International (20) - Standard participation (25)
        "Participated": 45 // Others (10) + Co-author (10) + Review (10) + Poster (10) + International (20) - Standard participation (15)
      },
      "National": {
        "First": 65, // IEEE (40) + Co-author (10) + Research (20) + Conference (15) + National (10) - Standard participation (30)
        "Second": 45, // UGC Listed (25) + Co-author (10) + Research (20) + Conference (15) + National (10) - Standard participation (35)
        "Third": 35, // Others (10) + Co-author (10) + Review (10) + Conference (15) + National (10) - Standard participation (20)
        "Participated": 25 // Others (10) + Co-author (10) + Review (10) + Poster (10) + National (10) - Standard participation (25)
      }
    }
  };
  
  console.log("✅ Research Paper configuration built successfully");
  return config;
}

function buildCertificationConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 65, // Top Provider (20) + >8 weeks (20) + Final Project (10) + Advanced (15)
        "Second": 50, // Top Provider (20) + 4-8 weeks (10) + Final Project (10) + Intermediate (10)
        "Third": 35, // NPTEL (10) + >8 weeks (20) + Beginner (5)
        "Participated": 22 // Coursera/Udemy (2) + >8 weeks (20)
      },
      "National": {
        "First": 55, // Top Provider (20) + >8 weeks (20) + Final Project (10) + Intermediate (10) - 5 for National
        "Second": 40, // Top Provider (20) + 4-8 weeks (10) + Final Project (10) + Beginner (5) - 5 for National
        "Third": 30, // NPTEL (10) + 4-8 weeks (10) + Intermediate (10)
        "Participated": 17 // Coursera/Udemy (2) + 4-8 weeks (10) + Beginner (5)
      }
    }
  };
  
  console.log("✅ Certification configuration built successfully");
  return config;
}

function buildNCCConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 85, // RDC/TSC (30) + SUO (25) + Best Cadet (30)
        "Second": 75, // RDC/TSC (30) + JUO (20) + Best Cadet (30) - 5 for Second
        "Third": 60, // NIC (20) + SUO (25) + 200+ hours (30) - 15 for Third
        "Participated": 50 // CATC (10) + JUO (20) + 200+ hours (30) - 10 for Participated
      },
      "National": {
        "First": 75, // RDC/TSC (30) + SUO (25) + 200+ hours (30) - 10 for National
        "Second": 65, // NIC (20) + SUO (25) + 200+ hours (30) - 10 for National/Second
        "Third": 50, // NIC (20) + JUO (20) + 100+ hours (20) - 10 for National/Third
        "Participated": 40 // CATC (10) + JUO (20) + 100+ hours (20) - 10 for National/Participated
      },
      "State": {
        "First": 65, // NIC (20) + SUO (25) + 100+ hours (20)
        "Second": 55, // CATC (10) + SUO (25) + 100+ hours (20)
        "Third": 45, // CATC (10) + JUO (20) + 100+ hours (20) - 5 for Third
        "Participated": 35 // CATC (10) + JUO (20) + 50+ hours (10) - 5 for Participated
      },
      "College": {
        "First": 55, // CATC (10) + SUO (25) + 100+ hours (20)
        "Second": 45, // CATC (10) + JUO (20) + 100+ hours (20) - 5 for Second
        "Third": 35, // CATC (10) + JUO (20) + 50+ hours (10) - 5 for Third
        "Participated": 25 // CATC (10) + 50+ hours (10) + Best Cadet (30) - 25 for Participated
      }
    }
  };
  
  console.log("✅ NCC/NSS/YRC configuration built successfully");
  return config;
}

function buildSportsConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 90, // National/International (50) + Winner (30) + Individual Sport (10)
        "Second": 80, // National/International (50) + Runner-up (20) + Individual Sport (10)
        "Third": 70, // National/International (50) + Participant (10) + Individual Sport (10)
        "Participated": 60 // National/International (50) + Participant (10)
      },
      "National": {
        "First": 70, // State (30) + Winner (30) + Individual Sport (10)
        "Second": 60, // State (30) + Runner-up (20) + Individual Sport (10)
        "Third": 50, // State (30) + Participant (10) + Individual Sport (10)
        "Participated": 40 // State (30) + Participant (10)
      },
      "State": {
        "First": 60, // Inter-College (20) + Winner (30) + Individual Sport (10)
        "Second": 50, // Inter-College (20) + Runner-up (20) + Individual Sport (10)
        "Third": 40, // Inter-College (20) + Participant (10) + Individual Sport (10)
        "Participated": 30 // Inter-College (20) + Participant (10)
      },
      "College": {
        "First": 50, // College (10) + Winner (30) + Individual Sport (10)
        "Second": 40, // College (10) + Runner-up (20) + Individual Sport (10)
        "Third": 30, // College (10) + Participant (10) + Individual Sport (10)
        "Participated": 20 // College (10) + Participant (10)
      }
    },
    "Team": {
      "International": {
        "First": 85, // National/International (50) + Winner (30) + Team Sport (5)
        "Second": 75, // National/International (50) + Runner-up (20) + Team Sport (5)
        "Third": 65, // National/International (50) + Participant (10) + Team Sport (5)
        "Participated": 55 // National/International (50) + Participant (10) - 5 for Team
      },
      "National": {
        "First": 65, // State (30) + Winner (30) + Team Sport (5)
        "Second": 55, // State (30) + Runner-up (20) + Team Sport (5)
        "Third": 45, // State (30) + Participant (10) + Team Sport (5)
        "Participated": 35 // State (30) + Participant (10) - 5 for Team
      },
      "State": {
        "First": 55, // Inter-College (20) + Winner (30) + Team Sport (5)
        "Second": 45, // Inter-College (20) + Runner-up (20) + Team Sport (5)
        "Third": 35, // Inter-College (20) + Participant (10) + Team Sport (5)
        "Participated": 25 // Inter-College (20) + Participant (10) - 5 for Team
      },
      "College": {
        "First": 45, // College (10) + Winner (30) + Team Sport (5)
        "Second": 35, // College (10) + Runner-up (20) + Team Sport (5)
        "Third": 25, // College (10) + Participant (10) + Team Sport (5)
        "Participated": 15 // College (10) + Participant (10) - 5 for Team
      }
    }
  };
  
  console.log("✅ Sports configuration built successfully");
  return config;
}

function buildWorkshopConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 50, // Conducted Workshop (25) + 2+ days (20) + Industry (10) - 5 for simplification
        "Second": 40, // 2+ days (20) + Industry (10) + Full day (10)
        "Third": 30, // Full day (10) + Industry (10) + <1 day (5) + Industry (10) - 5 for simplification
        "Participated": 20 // <1 day (5) + Industry (10) + <1 day (5)
      },
      "National": {
        "First": 45, // Conducted Workshop (25) + 2+ days (20)
        "Second": 35, // 2+ days (20) + Full day (10) + Industry (10) - 5 for National
        "Third": 25, // Full day (10) + Industry (10) + <1 day (5)
        "Participated": 15 // <1 day (5) + Industry (10)
      },
      "State": {
        "First": 40, // Conducted Workshop (25) + Full day (10) + <1 day (5)
        "Second": 30, // 2+ days (20) + Industry (10)
        "Third": 20, // Full day (10) + Industry (10)
        "Participated": 10 // <1 day (5) + <1 day (5)
      },
      "College": {
        "First": 35, // Conducted Workshop (25) + Full day (10)
        "Second": 25, // 2+ days (20) + <1 day (5)
        "Third": 15, // Full day (10) + <1 day (5)
        "Participated": 5 // <1 day (5)
      }
    }
  };
  
  console.log("✅ Workshop configuration built successfully");
  return config;
}

function buildLeadershipConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 70, // Club President (30) + 100+ participants (20) + Series (20)
        "Second": 60, // Secretary (20) + 100+ participants (20) + Series (20)
        "Third": 50, // Core Team (10) + 100+ participants (20) + Series (20)
        "Participated": 40 // Core Team (10) + 50-100 participants (15) + Series (20) - 5 for Participated
      },
      "National": {
        "First": 60, // Club President (30) + 100+ participants (20) + Series (10)
        "Second": 50, // Secretary (20) + 100+ participants (20) + Series (10)
        "Third": 40, // Core Team (10) + 100+ participants (20) + Series (10)
        "Participated": 30 // Core Team (10) + 50-100 participants (15) + Series (10) - 5 for Participated
      },
      "State": {
        "First": 50, // Club President (30) + 50-100 participants (15) + Series (10) - 5 for State
        "Second": 40, // Secretary (20) + 50-100 participants (15) + Series (10) - 5 for State
        "Third": 30, // Core Team (10) + 50-100 participants (15) + Series (10) - 5 for State
        "Participated": 20 // Core Team (10) + <50 participants (10) + Series (10) - 10 for State/Participated
      },
      "College": {
        "First": 40, // Club President (30) + <50 participants (10)
        "Second": 30, // Secretary (20) + <50 participants (10)
        "Third": 20, // Core Team (10) + <50 participants (10)
        "Participated": 10 // Core Team (10)
      }
    }
  };
  
  console.log("✅ Leadership configuration built successfully");
  return config;
}

function buildSocialWorkConfig() {
  const config = {
    "Individual": {
      "International": {
        "First": 70, // Health/Disaster Relief (20) + 100+ hrs (30) + 20-50 hrs (10) + Education (15) - 5 for simplification
        "Second": 60, // Education/NGO (15) + 100+ hrs (30) + 20-50 hrs (10) + Plantation (10) - 5 for Second
        "Third": 50, // Education/NGO (15) + 50-100 hrs (20) + 20-50 hrs (10) + Plantation (10) - 5 for Third
        "Participated": 40 // Plantation/Cleanup (10) + 50-100 hrs (20) + 20-50 hrs (10)
      },
      "National": {
        "First": 60, // Health/Disaster Relief (20) + 100+ hrs (30) + 20-50 hrs (10)
        "Second": 50, // Education/NGO (15) + 100+ hrs (30) + 20-50 hrs (10) - 5 for Second
        "Third": 40, // Education/NGO (15) + 50-100 hrs (20) + 20-50 hrs (10) - 5 for Third
        "Participated": 30 // Plantation/Cleanup (10) + 50-100 hrs (20)
      },
      "State": {
        "First": 50, // Health/Disaster Relief (20) + 50-100 hrs (20) + 20-50 hrs (10)
        "Second": 40, // Education/NGO (15) + 50-100 hrs (20) + 20-50 hrs (10) - 5 for Second
        "Third": 30, // Education/NGO (15) + 20-50 hrs (10) + Plantation (10) - 5 for Third
        "Participated": 20 // Plantation/Cleanup (10) + 20-50 hrs (10)
      },
      "College": {
        "First": 40, // Health/Disaster Relief (20) + 20-50 hrs (10) + Plantation (10)
        "Second": 30, // Education/NGO (15) + 20-50 hrs (10) + Plantation (10) - 5 for Second
        "Third": 20, // Education/NGO (15) + 20-50 hrs (10) - 5 for Third
        "Participated": 10 // Plantation/Cleanup (10)
      }
    }
  };
  
  console.log("✅ Social Work configuration built successfully");
  return config;
}

// Run the update function
updateCategoryRulesConfig()
  .then(success => {
    if (success) {
      console.log("🎉 All configurations updated successfully!");
    } else {
      console.error("❌ Failed to update configurations. Check the logs above for details.");
    }
  })
  .catch(error => {
    console.error("❌ Fatal error:", error);
  });