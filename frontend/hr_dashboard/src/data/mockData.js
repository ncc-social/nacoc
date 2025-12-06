export const employees = [
    {
        id: 'E001',
        name: 'Alice Johnson',
        role: 'Software Engineer',
        department: 'Engineering',
        email: 'alice.johnson@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        joinDate: '2021-03-15',
        status: 'Active',
        bio: 'Alice is a passionate software engineer with 5 years of experience in full-stack development. She loves solving complex problems and mentoring junior developers.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        personalInfo: {
            dob: '1990-05-15',
            nationalId: 'GHA-123456789-0',
            gender: 'Female',
            ssnit: 'C123456789012',
            staffId: 'ST-001',
            pfNo: 'PF-1001',
            rank: 'Senior Staff',
            designation: 'Senior Software Engineer'
        },
        addressContacts: {
            currentAddress: '123 Tech Lane, Silicon Valley, CA',
            permanentAddress: '456 Hometown Rd, Springfield, IL',
            hometown: 'Springfield',
            region: 'Illinois',
            phone: '+1 (555) 123-4567',
            altPhone: '+1 (555) 987-6543',
            email: 'alice.johnson@example.com',
            emergencyContact: {
                name: 'John Johnson',
                number: '+1 (555) 111-2222',
                relation: 'Spouse'
            }
        },
        jobDetails: {
            acceptanceDate: '2021-03-01',
            assumptionDutyDate: '2021-03-15',
            confirmationDate: '2021-09-15',
            retirementDate: '2050-05-15',
            reportsTo: 'Bob Smith (Product Manager)',
            lastPromotionDate: '2023-01-01'
        },
        workHistory: [
            { department: 'Engineering', from: '2021-03-15', to: 'Present', duration: '2 years, 8 months' },
            { department: 'Internship', from: '2020-06-01', to: '2020-12-31', duration: '6 months' }
        ],
        leaveHistory: [
            { type: 'Sick Leave', from: '2023-10-25', to: '2023-10-27', days: 3 },
            { type: 'Vacation', from: '2022-12-20', to: '2023-01-05', days: 16 }
        ],
        leaveBalance: [
            { type: 'Annual Leave', allocated: 25, used: 16, pending: 0, balance: 9 },
            { type: 'Sick Leave', allocated: 10, used: 3, pending: 0, balance: 7 },
            { type: 'Casual Leave', allocated: 5, used: 0, pending: 0, balance: 5 }
        ],
        trainingHistory: [
            { year: '2023', programme: 'Advanced React Workshop', institution: 'Frontend Masters', venue: 'Online', startDate: '2023-11-15', endDate: '2023-11-17' },
            { year: '2022', programme: 'Agile Methodologies', institution: 'Scrum Alliance', venue: 'New York, NY', startDate: '2022-05-10', endDate: '2022-05-12' }
        ]
    },
    {
        id: 'E002',
        name: 'Bob Smith',
        role: 'Product Manager',
        department: 'Product',
        email: 'bob.smith@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        joinDate: '2020-06-01',
        status: 'Active',
        bio: 'Bob is a strategic product manager who excels at bridging the gap between technical teams and business stakeholders.',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
        personalInfo: { gender: 'Male', rank: 'Manager', dob: '1985-08-20' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    },
    {
        id: 'E003',
        name: 'Charlie Brown',
        role: 'HR Specialist',
        department: 'Human Resources',
        email: 'charlie.brown@example.com',
        phone: '+1 (555) 345-6789',
        location: 'Chicago, IL',
        joinDate: '2019-11-20',
        status: 'Active',
        bio: 'Charlie is dedicated to creating a positive workplace culture and ensuring employee well-being.',
        skills: ['Recruiting', 'Employee Relations', 'HRIS', 'Conflict Resolution'],
        personalInfo: { gender: 'Male', rank: 'Junior Staff', dob: '1995-02-10' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    },
    {
        id: 'E004',
        name: 'Diana Prince',
        role: 'Designer',
        department: 'Design',
        email: 'diana.prince@example.com',
        phone: '+1 (555) 456-7890',
        location: 'Austin, TX',
        joinDate: '2022-01-10',
        status: 'Active',
        bio: 'Diana is a creative designer with a keen eye for aesthetics and user experience. She transforms ideas into beautiful visual interfaces.',
        skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
        personalInfo: { gender: 'Female', rank: 'Senior Staff', dob: '1992-11-05' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    },
    {
        id: 'E005',
        name: 'Evan Wright',
        role: 'DevOps Engineer',
        department: 'Engineering',
        email: 'evan.wright@example.com',
        phone: '+1 (555) 567-8901',
        location: 'Seattle, WA',
        joinDate: '2025-05-05',
        status: 'Onboarding',
        bio: 'Evan is a DevOps enthusiast who focuses on automating deployment pipelines and ensuring system reliability.',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        personalInfo: { gender: 'Male', rank: 'Junior Staff', dob: '1998-07-15' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    },
    {
        id: 'E006',
        name: 'Fiona Gallagher',
        role: 'Marketing Specialist',
        department: 'Marketing',
        email: 'fiona.g@example.com',
        phone: '+1 (555) 678-9012',
        location: 'Boston, MA',
        joinDate: '2025-02-15',
        status: 'Active',
        bio: 'Fiona is a creative marketer with a passion for storytelling and brand building.',
        skills: ['Content Marketing', 'SEO', 'Social Media', 'Copywriting'],
        personalInfo: { gender: 'Female', rank: 'Junior Staff', dob: '1996-04-22' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    },
    {
        id: 'E007',
        name: 'George Miller',
        role: 'Sales Executive',
        department: 'Sales',
        email: 'george.m@example.com',
        phone: '+1 (555) 789-0123',
        location: 'Miami, FL',
        joinDate: '2021-08-01',
        exitDate: '2025-09-30', // Exited this year
        status: 'Exited',
        bio: 'George is a results-driven sales professional with a track record of exceeding targets.',
        skills: ['Sales Strategy', 'Negotiation', 'CRM', 'Lead Generation'],
        personalInfo: { gender: 'Male', rank: 'Senior Staff', dob: '1988-12-12' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    },
    {
        id: 'E008',
        name: 'Hannah Lee',
        role: 'Data Scientist',
        department: 'Data',
        email: 'hannah.l@example.com',
        phone: '+1 (555) 890-1234',
        location: 'Denver, CO',
        joinDate: '2025-11-01', // Joined this year
        status: 'Active',
        bio: 'Hannah loves uncovering insights from data to drive business decisions.',
        skills: ['Python', 'SQL', 'Machine Learning', 'Tableau'],
        personalInfo: { gender: 'Female', rank: 'Senior Staff', dob: '1993-09-09' },
        addressContacts: {}, jobDetails: {}, workHistory: [], leaveHistory: [], leaveBalance: [], trainingHistory: []
    }
];

export const leaves = [
    { id: 'L001', employeeId: 'E001', employeeName: 'Alice Johnson', type: 'Sick Leave', status: 'Pending', date: '2023-10-25' },
    { id: 'L002', employeeId: 'E003', employeeName: 'Charlie Brown', type: 'Vacation', status: 'Approved', date: '2023-11-01' },
];

export const training = [
    {
        id: 'T001',
        title: 'Advanced React Workshop',
        category: 'Technical',
        mode: 'Online',
        totalAttendees: 15,
        institution: 'Frontend Masters',
        venue: 'Zoom',
        funding: 'Corporate',
        startDate: '2023-11-15',
        endDate: '2023-11-17',
        description: 'Deep dive into React hooks, context API, and performance optimization techniques.'
    },
    {
        id: 'T002',
        title: 'Leadership Seminar',
        category: 'Leadership',
        mode: 'In-Person',
        totalAttendees: 8,
        institution: 'Harvard Business School',
        venue: 'Boston, MA',
        funding: 'Departmental',
        startDate: '2023-12-05',
        endDate: '2023-12-06',
        description: 'Strategies for effective team management and organizational leadership.'
    },
    {
        id: 'T003',
        title: 'Cybersecurity Conference',
        category: 'Technical',
        mode: 'Hybrid',
        totalAttendees: 25,
        institution: 'TechSummit',
        venue: 'San Francisco, CA',
        funding: 'Corporate',
        startDate: '2023-10-30',
        endDate: '2023-11-01',
        description: 'Annual conference covering the latest trends and threats in cybersecurity.'
    },
    {
        id: 'T004',
        title: 'Effective Communication',
        category: 'Soft Skills',
        mode: 'In-Person',
        totalAttendees: 20,
        institution: 'Dale Carnegie',
        venue: 'New York, NY',
        funding: 'Departmental',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        description: 'Improving interpersonal communication and public speaking skills.'
    },
    {
        id: 'T005',
        title: 'GDPR Compliance Training',
        category: 'Compliance',
        mode: 'Online',
        totalAttendees: 50,
        institution: 'Internal Legal Team',
        venue: 'LMS',
        funding: 'Corporate',
        startDate: '2024-02-01',
        endDate: '2024-02-01',
        description: 'Mandatory training on data protection and privacy regulations.'
    }
];
