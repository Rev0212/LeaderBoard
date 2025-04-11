const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/template.model');
const Admin = require('../models/admin.model');

dotenv.config({ path: '.env' });

mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// All categories from marking scheme
const allCategories = [
  'Hackathon', 
  'Coding', 
  'Open Source', 
  'Research', 
  'Certifications', 
  'NCC-NSS', 
  'Sports',
  'Workshop', 
  'Leadership', 
  'Social Work'
];

// Template definitions for each category
const templates = {
  'Hackathon': {
    'Standard Template': {
      requiredFields: ['title', 'date', 'description', 'positionSecured', 'eventScope'],
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
          options: ['Solo', 'Team']
        }
      ]
    }
  },
  'Coding': {
    'Standard Template': {
      requiredFields: ['title', 'date', 'description', 'positionSecured'],
      optionalFields: ['eventScope'],
      proofConfig: {
        requireCertificateImage: true,
        requirePdfProof: false,
        maxCertificateSize: 5
      },
      customQuestions: [
        {
          id: 'platform',
          text: 'Which platform was the competition hosted on?',
          type: 'singleChoice',
          required: true,
          options: ['CodeForces', 'AtCoder', 'LeetCode', 'GeeksForGeeks', 'HackerRank', 'Other']
        },
        {
          id: 'contest_type',
          text: 'What type of contest was it?',
          type: 'singleChoice',
          required: false,
          options: ['Timed Contest (e.g., ICPC, Turing Cup)', 'Regular Contest', 'Other']
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
          options: ['International', 'National', 'Regional']
        }
      ]
    }
  },
  'Open Source': {
    'GitHub Contribution': {
      requiredFields: ['title', 'date', 'description', 'githubRepoUrl'],
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
          options: ['More than 1000 forks', '500-1000 forks', 'Less than 500 forks']
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
          text: 'What type of contribution did you make?',
          type: 'singleChoice',
          required: true,
          options: ['Feature', 'Bug Fix', 'Documentation']
        },
        {
          id: 'lines_changed',
          text: 'Approximately how many lines of code did you contribute?',
          type: 'singleChoice',
          required: false,
          options: ['More than 500 lines', '100-500 lines', 'Less than 100 lines']
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
      requiredFields: ['title', 'date', 'description'],
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
          options: ['IEEE/Springer/Elsevier', 'UGC Listed', 'Others']
        },
        {
          id: 'authorship',
          text: 'What was your authorship position?',
          type: 'singleChoice',
          required: true,
          options: ['1st Author', 'Co-author']
        },
        {
          id: 'paper_type',
          text: 'What type of paper did you publish?',
          type: 'singleChoice',
          required: true,
          options: ['Research', 'Review/Survey']
        },
        {
          id: 'presentation_type',
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
      requiredFields: ['title', 'date', 'description', 'issuer'],
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
          options: ['Stanford/MIT/AWS/Google/Top 500 company', 'NPTEL', 'Coursera/Udemy', 'Other']
        },
        {
          id: 'duration',
          text: 'What was the duration of the certification?',
          type: 'singleChoice',
          required: true,
          options: ['Less than 4 weeks', '4-8 weeks', 'More than 8 weeks']
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
  'NCC-NSS': {
    'Volunteer Activity': {
      requiredFields: ['title', 'date', 'description'],
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
          options: ['RDC/TSC', 'NIC', 'CATC, ATC', 'None']
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
          options: ['Best Cadet', 'Best Parade', 'Other Award', 'None']
        },
        {
          id: 'volunteer_hours',
          text: 'How many volunteer hours have you completed?',
          type: 'singleChoice',
          required: true,
          options: ['50+ hours', '100+ hours', '200+ hours', 'Less than 50 hours']
        }
      ]
    }
  },
  'Sports': {
    'Sports Achievement': {
      requiredFields: ['title', 'date', 'description', 'positionSecured', 'eventScope'],
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
          id: 'sport_type',
          text: 'Is this an individual or team sport?',
          type: 'singleChoice',
          required: true,
          options: ['Individual Sport', 'Team Sport']
        }
      ]
    }
  },
  'Workshop': {
    'Workshop Participation': {
      requiredFields: ['title', 'date', 'description'],
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
          options: ['Less than 1 day', '1 full day', '2+ days']
        },
        {
          id: 'role',
          text: 'What was your role in the workshop?',
          type: 'singleChoice',
          required: true,
          options: ['Attendee', 'Conducted Workshop']
        },
        {
          id: 'industry_organizer',
          text: 'Was the workshop organized by an industry partner?',
          type: 'singleChoice',
          required: false,
          options: ['Yes (e.g., Google, Microsoft)', 'No']
        }
      ]
    }
  },
  'Leadership': {
    'Leadership Role': {
      requiredFields: ['title', 'date', 'description'],
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
          options: ['Club President', 'Secretary / Event Lead', 'Member / Core Team']
        },
        {
          id: 'event_size',
          text: 'How many participants were involved?',
          type: 'singleChoice',
          required: true,
          options: ['Less than 50 participants', '50-100 participants', 'More than 100 participants']
        },
        {
          id: 'series_organized',
          text: 'Did you organize a series of events?',
          type: 'singleChoice',
          required: true,
          options: ['Yes', 'No']
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
  'Social Work': {
    'Community Service': {
      requiredFields: ['title', 'date', 'description'],
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
          options: ['Plantation / Cleanup Drive', 'Education / NGO Teaching', 'Health / Disaster Relief']
        },
        {
          id: 'hours_invested',
          text: 'How many hours did you invest in this activity?',
          type: 'singleChoice',
          required: true,
          options: ['20-50 hours', '50-100 hours', '100+ hours']
        }
      ]
    }
  }
};

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