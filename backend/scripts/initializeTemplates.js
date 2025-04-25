const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/template.model');
const Admin = require('../models/admin.model');

dotenv.config({ path: '.env' });

mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// All categories from new marking scheme
const allCategories = [
  'Hackathon', 
  'Coding Competitions', 
  'Open Source', 
  'Research', 
  'Certifications', 
  'NCC_NSS_YRC', 
  'Sports',
  'Workshops', 
  'Student Leadership', 
  'Social Work & Community Impact'
];

// Template definitions for each category
const templates = {
  'Hackathon': {
    'Standard Template': {
      requiredFields: ['eventName', 'date', 'description', 'positionSecured', 'eventScope'],
      optionalFields: ['participationType', 'teamName', 'teamSize', 'eventOrganizer'],
      conditionalFields: {
        'teamName': { dependsOn: 'participationType', showWhen: ['Team'] },
        'teamSize': { dependsOn: 'participationType', showWhen: ['Team'] }
      },
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        allowMultipleCertificates: true,
        maxCertificateSize: 5
      },
      customQuestions: [
        {
          id: 'level',
          text: 'What was the level of the hackathon?',
          type: 'singleChoice',
          required: true,
          options: ['Intra-College', 'Inter-College', 'National', 'International']
        },
        {
          id: 'organizer_type',
          text: 'Who organized the hackathon?',
          type: 'singleChoice',
          required: true,
          options: ['Industry', 'Academic Institution']
        },
        {
          id: 'participation_mode',
          text: 'How did you participate?',
          type: 'singleChoice',
          required: true,
          options: ['Solo Participation', 'Team Participation']
        },
        {
          id: 'outcome',
          text: 'What was your outcome in the hackathon?',
          type: 'singleChoice',
          required: true,
          options: ['Winner (1st)', 'Runner-up (2nd)', '3rd Place', 'Finalist', 'Participant']
        }
      ]
    }
  },
  'Coding Competitions': {
    'Standard Template': {
      requiredFields: ['eventName', 'date', 'description', 'positionSecured'],
      optionalFields: ['eventScope'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5
      },
      customQuestions: [
        {
          id: 'platform',
          text: 'What type of platform hosted the competition?',
          type: 'singleChoice',
          required: true,
          options: ['Top-tier (CodeForces, LeetCode, etc.)', 'Unknown']
        },
        {
          id: 'percentile',
          text: 'What percentile did you achieve?',
          type: 'singleChoice',
          required: true,
          options: ['Top 1%', 'Top 5%', 'Top 10%', 'Participant']
        },
        {
          id: 'region',
          text: 'What was the scope of the competition?',
          type: 'singleChoice',
          required: true,
          options: ['International', 'National']
        }
      ]
    }
  },
  'Open Source': {
    'GitHub Contribution': {
      requiredFields: ['eventName', 'date', 'description', 'githubRepoUrl'],
      optionalFields: [],
      proofConfig: {
        requireCertificateImage: false,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: true
      },
      customQuestions: [
        {
          id: 'repo_forks',
          text: 'How many forks does the repository have?',
          type: 'singleChoice',
          required: true,
          options: ['>1000 forks', '500–1000 forks', 'Less than 500 forks']
        },
        {
          id: 'pr_status',
          text: 'What is the status of your pull request?',
          type: 'singleChoice',
          required: true,
          options: ['Merged', 'Still Open']
        },
        {
          id: 'contribution_type',
          text: 'What type of work did you contribute?',
          type: 'singleChoice',
          required: true,
          options: ['Feature', 'Bug Fix', 'Documentation']
        },
        {
          id: 'lines_changed',
          text: 'Approximately how many lines of code did you contribute?',
          type: 'singleChoice',
          required: false,
          options: ['>500 lines', '100-500 lines', 'Less than 100 lines']
        },
        {
          id: 'pr_count',
          text: 'How many PRs have you contributed to this project?',
          type: 'text',
          required: false
        },
        {
          id: 'contribution_badge',
          text: 'Did you earn any contributor badges?',
          type: 'singleChoice',
          required: false,
          options: ['Hacktoberfest finisher', 'GSoC Contributor', 'None']
        }
      ]
    }
  },
  'Research': {
    'Paper Publication': {
      requiredFields: ['eventName', 'date', 'description'],
      optionalFields: ['publicationLink'],
      proofConfig: {
        requireCertificateImage: false,
        requirePdfProof: true,
        maxPdfSize: 15,
        allowMultipleCertificates: false
      },
      customQuestions: [
        {
          id: 'publisher',
          text: 'Who published your paper?',
          type: 'singleChoice',
          required: true,
          options: ['IEEE/Springer/Elsevier(q1)', 'q2', 'Others']
        },
        {
          id: 'authorship',
          text: 'What was your authorship position?',
          type: 'singleChoice',
          required: true,
          options: ['1st Author', '2nd Author', 'Co-author']
        },
        {
          id: 'paper_type',
          text: 'What type of paper did you publish?',
          type: 'singleChoice',
          required: true,
          options: ['Research', 'Review/Survey']
        },
        {
          id: 'event_type',
          text: 'How was the paper presented?',
          type: 'singleChoice',
          required: true,
          options: ['Conference Presentation', 'Poster Presentation']
        },
        {
          id: 'conference_level',
          text: 'What was the level of the conference?',
          type: 'singleChoice',
          required: true,
          options: ['International', 'National']
        }
      ]
    }
  },
  'Certifications': {
    'Course Certification': {
      requiredFields: ['eventName', 'date', 'description', 'issuer'],
      optionalFields: ['certificateLink'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: false
      },
      customQuestions: [
        {
          id: 'provider',
          text: 'Who is the certification provider?',
          type: 'singleChoice',
          required: true,
          options: ['Stanford/MIT/AWS/Google/Top 500', 'NPTEL', 'Coursera/Udemy', 'Other']
        },
        {
          id: 'project_required',
          text: 'Did the certification require a final project?',
          type: 'singleChoice',
          required: true,
          options: ['Yes', 'No']
        },
        {
          id: 'level',
          text: 'What was the difficulty level of the certification?',
          type: 'singleChoice',
          required: true,
          options: ['Beginner', 'Intermediate', 'Advanced']
        }
      ]
    }
  },
  'NCC_NSS_YRC': {
    'Volunteer Activity': {
      requiredFields: ['eventName', 'date', 'description'],
      optionalFields: ['eventLocation'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: true
      },
      customQuestions: [
        {
          id: 'camps_attended',
          text: 'Which camps have you attended?',
          type: 'singleChoice',
          required: true,
          options: ['RDC/TSC', 'NIC', 'CATC/ATC', 'None']
        },
        {
          id: 'rank',
          text: 'What is your rank?',
          type: 'singleChoice',
          required: false,
          options: ['SUO', 'JUO', 'Other/None']
        },
        {
          id: 'award',
          text: 'Did you receive any special recognition?',
          type: 'singleChoice',
          required: false,
          options: ['Best Cadet/Parade', 'Other Award', 'None']
        },
        {
          id: 'volunteer_hours',
          text: 'How many volunteer hours have you completed?',
          type: 'singleChoice',
          required: true,
          options: ['50+', '100+', '200+', 'Less than 50 hours']
        }
      ]
    }
  },
  'Sports': {
    'Sports Achievement': {
      requiredFields: ['eventName', 'date', 'description', 'positionSecured', 'eventScope'],
      optionalFields: ['sportName', 'eventLocation'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: true
      },
      customQuestions: [
        {
          id: 'competition_level',
          text: 'What was the level of competition?',
          type: 'singleChoice',
          required: true,
          options: ['College', 'Inter-College', 'State', 'National/International']
        },
        {
          id: 'position',
          text: 'What position did you achieve?',
          type: 'singleChoice',
          required: true,
          options: ['Winner', 'Runner-Up', 'Participant']
        },
        {
          id: 'sport_type',
          text: 'Is this an individual or team sport?',
          type: 'singleChoice',
          required: true,
          options: ['Individual Sport', 'Team Sport']
        }
      ]
    }
  },
  'Workshops': {
    'Workshop Participation': {
      requiredFields: ['eventName', 'date', 'description'],
      optionalFields: ['eventLocation', 'eventOrganizer'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: false
      },
      customQuestions: [
        {
          id: 'duration',
          text: 'What was the duration of the workshop?',
          type: 'singleChoice',
          required: true,
          options: ['1 day', '3 day', '>5 full day']
        },
        {
          id: 'role',
          text: 'What was your role in the workshop?',
          type: 'singleChoice',
          required: true,
          options: ['Attendee', 'Organizer']
        },
        {
          id: 'industry_organizer',
          text: 'Was the workshop organized by an industry partner?',
          type: 'singleChoice',
          required: false,
          options: ['Industry (Top 500)', 'No']
        }
      ]
    }
  },
  'Student Leadership': {
    'Leadership Role': {
      requiredFields: ['eventName', 'date', 'description'],
      optionalFields: ['eventLocation', 'role'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: true
      },
      customQuestions: [
        {
          id: 'leadership_position',
          text: 'What leadership position did you hold?',
          type: 'singleChoice',
          required: true,
          options: ['Club President', 'Secretary/Core Team Heads', 'Member']
        },
        {
          id: 'event_size',
          text: 'How many participants were involved?',
          type: 'singleChoice',
          required: true,
          options: ['<100 participants', '100–500', '500+']
        },
        {
          id: 'series_organized',
          text: 'Did you organize a series of events?',
          type: 'singleChoice',
          required: true,
          options: ['Yes (Webinars/Tech Talks/etc)', 'No']
        },
        {
          id: 'event_count',
          text: 'How many events did you organize in the series?',
          type: 'text',
          required: false
        }
      ]
    }
  },
  'Social Work & Community Impact': {
    'Community Service': {
      requiredFields: ['eventName', 'date', 'description'],
      optionalFields: ['eventLocation', 'organizationName'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5,
        allowMultipleCertificates: true
      },
      customQuestions: [
        {
          id: 'activity_type',
          text: 'What type of social work activity was this?',
          type: 'singleChoice',
          required: true,
          options: ['Plantation/Cleanup Drive', 'Education/NGO Teaching', 'Health/Disaster Relief']
        },
        {
          id: 'hours_invested',
          text: 'How many hours did you invest in this activity?',
          type: 'singleChoice',
          required: true,
          options: ['20–50 hrs', '50–100 hrs', '100+ hrs']
        }
      ]
    }
  }
};

// The rest of the function remains unchanged
async function initializeTemplates() {
  try {
    // Find an admin user to set as creator
    const admin = await Admin.findOne();
    
    if (!admin) {
      console.error('No admin found in the database');
      process.exit(1);
    }

    let createdCount = 0;
    let updatedCount = 0;
    
    // Create templates for each category
    for (const category of allCategories) {
      const categoryTemplates = templates[category];
      
      if (!categoryTemplates) {
        console.log(`No templates defined for category: ${category}`);
        continue;
      }
      
      for (const [name, config] of Object.entries(categoryTemplates)) {
        // Check if template already exists
        const existingTemplate = await Template.findOne({ category, name });
        
        if (existingTemplate) {
          // Update existing template
          existingTemplate.config = config;
          existingTemplate.updatedBy = admin._id;
          await existingTemplate.save();
          updatedCount++;
          console.log(`Updated template: ${category} - ${name}`);
        } else {
          // Create new template
          await Template.create({
            category,
            name,
            config,
            createdBy: admin._id,
            updatedBy: admin._id
          });
          createdCount++;
          console.log(`Created template: ${category} - ${name}`);
        }
      }
    }
    
    console.log(`Template initialization complete: Created ${createdCount}, Updated ${updatedCount}`);
  } catch (error) {
    console.error('Error initializing templates:', error);
  } finally {
    mongoose.connection.close();
  }
}

initializeTemplates();