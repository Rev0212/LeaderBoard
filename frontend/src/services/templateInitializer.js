import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get base URL from environment or use default
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

// This service initializes the default templates based on the marking scheme
export const initializeDefaultTemplates = async () => {
  // Check if we've already initialized
  const initialized = localStorage.getItem('templatesInitialized');
  if (initialized) return;
  
  try {
    // First try to get templates from backend
    const token = localStorage.getItem("admin-token");
    const response = await axios.get(
      `${VITE_BASE_URL}/api/admin/config/default-templates`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.success) {
      // Store templates in localStorage
      localStorage.setItem('formFieldTemplates', JSON.stringify(response.data.templates));
      localStorage.setItem('templatesInitialized', 'true');
      return;
    }
  } catch (error) {
    console.log("Could not load templates from API, initializing from defaults");
    initializeDefaultTemplatesLocally();
  }
};

// Fallback function with hardcoded defaults
const initializeDefaultTemplatesLocally = () => {
  const templates = {
    'Hackathon': {
      'Standard Template': {
        requiredFields: ['title', 'date', 'description', 'positionSecured', 'eventScope', 'eventOrganizer'],
        optionalFields: ['participationType', 'teamName', 'teamSize', 'priceMoney'],
        conditionalFields: {
          'teamName': {
            dependsOn: 'participationType',
            showWhen: ['Team']
          },
          'teamSize': {
            dependsOn: 'participationType',
            showWhen: ['Team']
          }
        },
        proofConfig: {
          requireCertificateImage: true,
          requirePdfProof: false,
          allowMultipleCertificates: true,
          maxCertificateSize: 5
        },
        customQuestions: [
          {
            id: 'hackathon_mode',
            text: 'Did you participate individually or as part of a team?',
            type: 'singleChoice',
            required: true,
            options: ['Solo Participation', 'Team Participation']
          }
        ]
      }
    },
    'Open Source': {
      'GitHub Contribution': {
        requiredFields: ['title', 'date', 'description', 'githubRepoUrl'],
        optionalFields: ['prLink', 'contributionType'],
        conditionalFields: {},
        proofConfig: {
          requireCertificateImage: false,
          requirePdfProof: false,
          allowMultipleCertificates: true,
          maxCertificateSize: 5
        },
        customQuestions: [
          {
            id: 'repo_forks',
            text: 'How many forks does the repository have?',
            type: 'singleChoice',
            required: true,
            options: ['More than 1000 forks', '500-1000 forks', 'Less than 500 forks']
          },
          {
            id: 'pr_status',
            text: 'What is the status of your pull request?',
            type: 'singleChoice',
            required: true,
            options: ['Merged', 'Still Open']
          }
        ]
      }
    }
    // Additional categories would be initialized here
  };
  
  localStorage.setItem('formFieldTemplates', JSON.stringify(templates));
  localStorage.setItem('templatesInitialized', 'true');
};

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Initializing templates...");
  initializeDefaultTemplates()
    .then(() => console.log("Templates initialized successfully!"))
    .catch(err => console.error("Error initializing templates:", err));
}